import os

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from django.core.exceptions import PermissionDenied
from django.contrib.auth import (authenticate, login, logout)
from rest_framework import viewsets, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import (ValidationError,
                                       NotFound,
                                       AuthenticationFailed)
from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_auth.views import LoginView, LogoutView

from oar.settings import MAX_UPLOADED_FILE_SIZE_IN_BYTES

from api.constants import CsvHeaderField
from api.models import (FacilityList,
                        FacilityListItem,
                        Organization,
                        User)
from api.processing import parse_csv_line
from api.serializers import FacilityListSerializer, UserSerializer
from api.countries import COUNTRY_CHOICES


@permission_classes((AllowAny,))
class SubmitNewUserForm(CreateAPIView):
    serializer_class = UserSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            pk = serializer.data['id']
            user = User.objects.get(pk=pk)

            Organization.objects.create(
                admin=user,
                name=user.name,
                org_type=user.contributor_type,
            )

            return Response(UserSerializer(user).data)


class LoginToOARClient(LoginView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', None)
        password = request.data.get('password', None)

        if email is None or password is None:
            raise AuthenticationFailed('Email and password are required')

        user = authenticate(email=email, password=password)

        if user is None:
            raise AuthenticationFailed(
                'Unable to login with those credentials')

        login(request, user)

        return Response(UserSerializer(user).data)

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        return Response(UserSerializer(request.user).data)


class LogoutOfOARClient(LogoutView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        logout(request)

        return Response(status=status.HTTP_204_NO_CONTENT)


class APIAuthToken(ObtainAuthToken):
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        try:
            token = Token.objects.get(user=request.user)

            token_data = {
                'token': token.key,
                'created': token.created.isoformat(),
            }

            return Response(token_data)
        except Token.DoesNotExist:
            raise NotFound()

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        token, _ = Token.objects.get_or_create(user=request.user)

        token_data = {
            'token': token.key,
            'created': token.created.isoformat(),
        }

        return Response(token_data)

    def delete(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied

        try:
            token = Token.objects.get(user=request.user)
            token.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Token.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def token_auth_example(request):
    name = request.user.name
    return Response({'name': name})


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_contributors(request):
    response_data = [
        (organization.id, organization.name)
        for organization
        in Organization.objects.all()
    ]
    return Response(response_data)


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_contributor_types(request):
    return Response(Organization.ORG_TYPE_CHOICES)


@api_view(['GET'])
@permission_classes((AllowAny,))
def all_countries(request):
    return Response(COUNTRY_CHOICES)


# TODO: Remove the following URLS once Django versions have been
# implemented. These are here as imitations of the URLS available via
# the legacy Restify API.
@api_view(['GET'])
@permission_classes((AllowAny,))
def get_lists(request):
    return Response({"lists": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_list(request):
    return Response({"temps": []})


@api_view(['GET'])
@permission_classes((AllowAny,))
def confirm_temp(request):
    return Response({"temp": None})


@api_view(['POST'])
@permission_classes((AllowAny,))
def update_source_name(request):
    return Response({"source": None})


@api_view(['GET'])
@permission_classes((AllowAny,))
def total_factories(request):
    return Response({"total": 0})


@api_view(['GET'])
@permission_classes((AllowAny,))
def search_factories(request):
    return Response([])


class FacilityListViewSet(viewsets.ModelViewSet):
    queryset = FacilityList.objects.all()
    serializer_class = FacilityListSerializer
    permission_classes = [IsAuthenticated]

    def _validate_header(self, header):
        if header is None or header == '':
            raise ValidationError('Header cannot be blank.')
        parsed_header = [i.lower() for i in parse_csv_line(header)]
        if CsvHeaderField.COUNTRY not in parsed_header \
           or CsvHeaderField.NAME not in parsed_header \
           or CsvHeaderField.ADDRESS not in parsed_header:
            raise ValidationError(
                'Header must contain {0}, {1}, and {2} fields.'.format(
                    CsvHeaderField.COUNTRY, CsvHeaderField.NAME,
                    CsvHeaderField.ADDRESS))

    @transaction.atomic
    def create(self, request):
        if 'file' not in request.data:
            raise ValidationError('No file specified.')
        csv_file = request.data['file']
        if type(csv_file) is not InMemoryUploadedFile:
            raise ValidationError('File not submitted properly.')
        if csv_file.size > MAX_UPLOADED_FILE_SIZE_IN_BYTES:
            mb = MAX_UPLOADED_FILE_SIZE_IN_BYTES / (1024*1024)
            raise ValidationError(
                'Uploaded file exceeds the maximum size of {:.1f}MB.'.format(
                    mb))
        header = csv_file.readline().decode().rstrip()
        self._validate_header(header)

        try:
            organization = request.user.organization
        except Organization.DoesNotExist:
            raise ValidationError('User organization cannot be None')

        if 'name' in request.data:
            name = request.data['name']
        else:
            name = os.path.splitext(csv_file.name)[0]

        if 'description' in request.data:
            description = request.data['description']
        else:
            description = None

        replaces = None
        if 'replaces' in request.data:
            try:
                replaces = int(request.data['replaces'])
            except ValueError:
                raise ValidationError('"replaces" must be an integer ID.')
            old_list_qs = FacilityList.objects.filter(
                organization=organization, pk=replaces)
            if old_list_qs.count() == 0:
                raise ValidationError(
                    '{0} is not a valid FacilityList ID.'.format(replaces))
            replaces = old_list_qs[0]
            if FacilityList.objects.filter(replaces=replaces).count() > 0:
                raise ValidationError(
                    'FacilityList {0} has already been replaced.'.format(
                        replaces.pk))

        new_list = FacilityList(
            organization=organization,
            name=name,
            description=description,
            file_name=csv_file.name,
            header=header,
            replaces=replaces)
        new_list.save()

        if replaces is not None:
            replaces.is_active = False
            replaces.save()

        for idx, line in enumerate(csv_file):
            new_item = FacilityListItem(
                row_index=idx,
                facility_list=new_list,
                raw_data=line.decode().rstrip()
            )
            new_item.save()

        serializer = self.get_serializer(new_list)
        return Response(serializer.data)

    def list(self, request):
        try:
            organization = request.user.organization
            queryset = FacilityList.objects.filter(organization=organization)
            response_data = self.serializer_class(queryset, many=True).data
            return Response(response_data)
        except Organization.DoesNotExist:
            raise ValidationError('User organization cannot be None')
