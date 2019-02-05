import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.constants import ProcessingAction
from api.models import FacilityList, FacilityListItem
from api.processing import (parse_facility_list_item,
                            geocode_facility_list_item,
                            match_facility_list_item)

ACTIONS = {
    ProcessingAction.PARSE: parse_facility_list_item,
    ProcessingAction.GEOCODE: geocode_facility_list_item,
    ProcessingAction.MATCH: match_facility_list_item,
}


class Command(BaseCommand):
    help = 'Run an action on all items in a facility list. If ' \
           'AWS_BATCH_JOB_ARRAY_INDEX environment variable is set, will ' \
           'process those items whose row_index matches it. Otherwise, will ' \
           'process all items for the given facility list.'

    def add_arguments(self, parser):
        # Create a group of arguments explicitly labeled as required,
        # because by default named arguments are considered optional.
        group = parser.add_argument_group('required arguments')
        group.add_argument('-a', '--action',
                           required=True,
                           help='The processing action to perform. '
                                'One of "parse", "geocode", "match"')
        group.add_argument('-l', '--list-id',
                           required=True,
                           help='The id of the facility list to process.')

    def handle(self, *args, **options):
        action = options['action']
        list_id = options['list_id']

        try:
            if action not in ACTIONS.keys():
                raise ValueError('Invalid action "{}". Must be one of '
                                 '"parse", "geocode", "match".'.format(action))

            process = ACTIONS[action]
            facility_list = FacilityList.objects.get(pk=list_id)

            row_index = os.environ.get('AWS_BATCH_JOB_ARRAY_INDEX')
            if row_index:
                items = FacilityListItem.objects.filter(
                    facility_list=facility_list,
                    row_index=row_index)
            else:
                items = FacilityListItem.objects.filter(
                    facility_list=facility_list)

            with transaction.atomic():
                result = {
                    'success': 0,
                    'failure': 0,
                }

                for item in items:
                    process(item)
                    if item.status == FacilityListItem.ERROR:
                        result['failure'] += 1
                    else:
                        result['success'] += 1
                    item.save()

                if result['success'] > 0:
                    self.stdout.write(
                        self.style.SUCCESS(
                            '{}: {} successes'.format(
                                action, result['success'])))

                if result['failure'] > 0:
                    self.stdout.write(
                        self.style.ERROR(
                            '{}: {} failures'.format(
                                action, result['failure'])))

        except FacilityList.DoesNotExist:
            self.stderr.write('Validation Error: '
                              'No facility list with id {}.'.format(list_id))
        except ValueError as e:
            self.stderr.write('Validation Error: {}'.format(e))
        except CommandError as e:
            self.stderr.write('Error processing batch: {}'.format(e))
