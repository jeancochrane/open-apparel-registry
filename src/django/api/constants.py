class CsvHeaderField:
    COUNTRY = 'country'
    NAME = 'name'
    ADDRESS = 'address'


class ProcessingAction:
    PARSE = 'parse'
    GEOCODE = 'geocode'
    MATCH = 'match'
    SUBMIT_JOB = 'submitjob'


class FacilitiesQueryParams:
    NAME = 'name'
    CONTRIBUTORS = 'contributors'
    CONTRIBUTOR_TYPES = 'contributor_types'
    COUNTRIES = 'countries'
