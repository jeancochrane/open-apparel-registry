/* eslint-env jest */
const {
    makeGetListsURL,
    makeUpdateListURL,
    makeConfirmTempURL,
    makeUpdateSourceNameURL,
    makeUploadTempFacilityURL,
    makeGenerateAPIKeyURL,
    makeAllSourceURL,
    makeAllCountryURL,
    makeTotalFacilityURL,
    makeSearchFacilityByNameAndCountryURL,
    getValueFromEvent,
    getCheckedFromEvent,
} = require('../util/util');

const REACT_APP_API_KEY = 'REACT_APP_API_KEY';

const setEnvironmentVariables = () =>
    Object.assign(
        process.env,
        {
            REACT_APP_API_KEY,
        },
    );

beforeEach(setEnvironmentVariables);

it('creates an API URL for getting lists', () => {
    const uid = 123;
    const expectedMatch = '/getLists/123/?key=REACT_APP_API_KEY';
    expect(makeGetListsURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for updating a list', () => {
    const uid = 123;
    const file = 'file';
    const expectedMatch = '/getList/123/?file_name=file&key=REACT_APP_API_KEY';
    expect(makeUpdateListURL(uid, file)).toEqual(expectedMatch);
});

it('creates an API URL for confirming temp', () => {
    const tempId = 'tempId';
    const expectedMatch = '/confirmTemp/tempId/?key=REACT_APP_API_KEY';
    expect(makeConfirmTempURL(tempId)).toEqual(expectedMatch);
});

it('creates an API URL for updating a source name', () => {
    const uid = 123;
    const expectedMatch = '/updateSourceName/123/?key=REACT_APP_API_KEY';
    expect(makeUpdateSourceNameURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for uploading facilities', () => {
    const uid = 123;
    const expectedMatch = '/uploadTempFactory/123/?key=REACT_APP_API_KEY';
    expect(makeUploadTempFacilityURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for generating an API key', () => {
    const uid = 123;
    const expectedMatch =
        '/generateKey/123/?key=REACT_APP_API_KEY';

    expect(makeGenerateAPIKeyURL(uid)).toEqual(expectedMatch);
});

it('creates an API URL for getting all sources', () => {
    const expectedMatch = '/allsource/';
    expect(makeAllSourceURL()).toEqual(expectedMatch);
});

it('creates an API URL for getting all countries', () => {
    const expectedMatch = '/allcountry/';
    expect(makeAllCountryURL()).toEqual(expectedMatch);
});

it('creates an API URL for getting all facilities', () => {
    const expectedMatch = '/totalFactories/';
    expect(makeTotalFacilityURL()).toEqual(expectedMatch);
});

it('creates an API URL for searching facilities by name, country, and optional contributor', () => {
    const name = 'name';
    const country = 'country';
    const contributor = 'contributor';

    const expectedMatchWithoutContributor =
        '/searchFactoryNameCountry/?name=name&country=country&contributor=';

    expect(makeSearchFacilityByNameAndCountryURL(name, country))
        .toEqual(expectedMatchWithoutContributor);

    const expectedMatchWithContributor =
        '/searchFactoryNameCountry/?name=name&country=country&contributor=contributor';

    expect(makeSearchFacilityByNameAndCountryURL(name, country, contributor))
        .toEqual(expectedMatchWithContributor);
});

it('gets the value from an event on a DOM input', () => {
    const value = 'value';
    const mockEvent = {
        target: {
            value,
        },
    };

    expect(getValueFromEvent(mockEvent)).toEqual(value);
});

it('gets the checked state from an even on a DOM checkbox input', () => {
    const checked = true;
    const mockEvent = {
        target: {
            checked,
        },
    };

    expect(getCheckedFromEvent(mockEvent)).toEqual(true);
});
