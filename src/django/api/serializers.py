from rest_framework.serializers import (CharField, ModelSerializer)
from rest_auth.models import TokenModel
from api.models import User


class UserSerializer(ModelSerializer):
    password = CharField(write_only=True)

    class Meta:
        model = User
        exclude = ()


class TokenSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = TokenModel
        fields = ('key', 'user')
