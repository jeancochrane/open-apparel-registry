import csv
import traceback

from datetime import datetime

from django.contrib.gis.geos import Point

from api.constants import CsvHeaderField, ProcessingAction
from api.models import Facility, FacilityMatch, FacilityListItem
from api.countries import COUNTRY_CODES, COUNTRY_NAMES
from api.geocoding import geocode_address


def parse_csv_line(line):
    return list(csv.reader([line]))[0]


def get_country_code(country):
    # TODO: Handle minor spelling errors in country names
    country = str(country)
    if country.upper() in COUNTRY_NAMES:
        return country.upper()
    elif country.lower() in COUNTRY_CODES:
        return COUNTRY_CODES[country.lower()]
    else:
        raise ValueError(
            'Could not find a country code for "{0}".'.format(country))


def parse_facility_list_item(item):
    started = str(datetime.utcnow())
    if type(item) != FacilityListItem:
        raise ValueError('Argument must be a FacilityListItem')
    if item.status != FacilityListItem.UPLOADED:
        raise ValueError('Items to be parsed must be in the UPLOADED status')
    try:
        fields = [f.lower() for f in parse_csv_line(item.facility_list.header)]
        values = parse_csv_line(item.raw_data)
        if CsvHeaderField.COUNTRY in fields:
            item.country_code = get_country_code(
                values[fields.index(CsvHeaderField.COUNTRY)])
        if CsvHeaderField.NAME in fields:
            item.name = values[fields.index(CsvHeaderField.NAME)]
        if CsvHeaderField.ADDRESS in fields:
            item.address = values[fields.index(CsvHeaderField.ADDRESS)]
        item.status = FacilityListItem.PARSED
        item.processing_results[ProcessingAction.PARSE] = {
            'started_at': started,
            'error': False,
            'finished_at': str(datetime.utcnow()),
        }
    except Exception as e:
        item.status = FacilityListItem.ERROR
        item.processing_results[ProcessingAction.PARSE] = {
            'started_at': started,
            'error': True,
            'message': str(e),
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        }


def geocode_facility_list_item(item):
    started = str(datetime.utcnow())
    if type(item) != FacilityListItem:
        raise ValueError('Argument must be a FacilityListItem')
    if item.status != FacilityListItem.PARSED:
        raise ValueError('Items to be geocoded must be in the PARSED status')
    try:
        data = geocode_address(item.address, item.country_code)
        item.status = FacilityListItem.GEOCODED
        item.geocoded_point = Point(
            data["geocoded_point"]["lng"],
            data["geocoded_point"]["lat"]
        )
        item.geocoded_address = data["geocoded_address"]
        item.processing_results[ProcessingAction.GEOCODE] = {
            'started_at': started,
            'error': False,
            'data': data["full_response"],
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        }
    except Exception as e:
        item.status = FacilityListItem.ERROR
        item.processing_results[ProcessingAction.GEOCODE] = {
            'started_at': started,
            'error': True,
            'message': str(e),
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        }


def match_facility_list_item(item):
    started = str(datetime.utcnow())
    if type(item) != FacilityListItem:
        raise ValueError('Argument must be a FacilityListItem')
    if item.status != FacilityListItem.GEOCODED:
        raise ValueError('Items to be matched must be in the GEOCODED status')
    try:
        matches = Facility.objects.filter(
            country_code=item.country_code, name__iexact=item.name,
            address__iexact=item.geocoded_address)
        if matches.count() == 0:
            facility = Facility(name=item.name, address=item.geocoded_address,
                                country_code=item.country_code,
                                location=item.geocoded_point,
                                created_from=item)
        else:
            facility = matches[0]

        match = FacilityMatch(facility_list_item=item, facility=facility,
                              results={
                                  'version': '0', 'match_type': 'exact'
                              },
                              confidence=1.0,
                              status=FacilityMatch.AUTOMATIC)

        item.status = FacilityListItem.MATCHED
        item.processing_results[ProcessingAction.MATCH] = {
            'started_at': started,
            'error': False,
            'finished_at': str(datetime.utcnow()),
        }
        return facility, match
    except Exception as e:
        item.status = FacilityListItem.ERROR
        item.processing_results[ProcessingAction.MATCH] = {
            'started_at': started,
            'error': True,
            'message': str(e),
            'trace': traceback.format_exc(),
            'finished_at': str(datetime.utcnow()),
        }
        return None, None
