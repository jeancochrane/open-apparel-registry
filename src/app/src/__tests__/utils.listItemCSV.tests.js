/* eslint-env jest */
const {
    createMatchRowFromListItem,
    formatPotentialMatchData,
    formatDataForCSV,
    csvHeaders,
} = require('../util/util.listItemCSV');

const { facilityMatchStatusChoicesEnum } = require('../util/constants');

it('creates the first few fields for a match row from a list item', () => {
    const listItemWithoutMatchedFacility = {
        row_index: 1,
        status: 'status',
        country_code: 'country_code',
        country_name: 'country_name',
        name: 'name',
        address: 'address',
        matchedFacility: null,
    };

    const expectedListItemWithoutMatchedFacilityMatch = [
        1,
        'status',
        'country_code',
        'country_name',
        'name',
        'address',
        '',
        '',
        '',
    ];

    const rowForListItemWithoutMatchedFacility =
        createMatchRowFromListItem(listItemWithoutMatchedFacility);

    expectedListItemWithoutMatchedFacilityMatch.forEach((field, index) => {
        expect(rowForListItemWithoutMatchedFacility[index]).toBe(field);
    });

    const listItemWithMatchedFacility = {
        row_index: 1,
        status: 'status',
        country_code: 'country_code',
        country_name: 'country_name',
        name: 'name',
        address: 'address',
        matched_facility: {
            oar_id: 'oar_id',
            name: 'oar_name',
            address: 'oar_address',
        },
    };

    const expectedListItemWithMatchedFacilityMatch = [
        1,
        'status',
        'country_code',
        'country_name',
        'name',
        'address',
        'oar_id',
        'oar_name',
        'oar_address',
    ];

    const rowForListItemWithMatchedFacility =
          createMatchRowFromListItem(listItemWithMatchedFacility);

    expectedListItemWithMatchedFacilityMatch.forEach((field, index) => {
        expect(rowForListItemWithMatchedFacility[index]).toBe(field);
    });
});

it('formats a potential match into a list of fields for a CSV row', () => {
    const potentialMatchData = {
        oar_id: 'oar_id',
        name: 'name',
        address: 'address',
        confidence: 'confidence',
        status: 'status',
    };

    const expectedFormattedPotentialMatchData = [
        'oar_id',
        'name',
        'address',
        'confidence',
        'status',
    ];

    formatPotentialMatchData(potentialMatchData).forEach((field, index) => {
        expect(expectedFormattedPotentialMatchData[index]).toBe(field);
    });
});

it('creates a single CSV row for a list item with no matches', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});

it('creates a single CSV row for a list item with one PENDING and one REJECTED match', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [
                {
                    oar_id: 'oar_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.REJECTED,
                },
                {
                    oar_id: 'oar_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            'oar_id',
            'oar_name',
            'oar_address',
            'confidence',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});

it('creates two CSV rows for a list item with two PENDING matches', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: null,
            matches: [
                {
                    oar_id: 'oar_id_one',
                    name: 'oar_name_one',
                    address: 'oar_address_one',
                    confidence: 'confidence_one',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                },
                {
                    oar_id: 'oar_id_two',
                    name: 'oar_name_two',
                    address: 'oar_address_two',
                    confidence: 'confidence_two',
                    status: facilityMatchStatusChoicesEnum.PENDING,
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            'oar_id_one',
            'oar_name_one',
            'oar_address_one',
            'confidence_one',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            '',
            '',
            '',
            'oar_id_two',
            'oar_name_two',
            'oar_address_two',
            'confidence_two',
            facilityMatchStatusChoicesEnum.PENDING,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(3);

    const [headerRow, first, second] = formattedCSVData;
    const [expectedHeaderRow, expectedFirst, expectedSecond] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedFirst.forEach((field, index) => {
        expect(first[index]).toBe(field);
    });

    expectedSecond.forEach((field, index) => {
        expect(second[index]).toBe(field);
    });
});

it('creates a CSV row for a list item with a matched facility', () => {
    const mockListItemData = [
        {
            row_index: 'row_index',
            status: 'status',
            country_code: 'country_code',
            country_name: 'country_name',
            name: 'name',
            address: 'address',
            matched_facility: {
                oar_id: 'oar_id',
                name: 'oar_name',
                address: 'oar_address',
            },
            matches: [
                {
                    oar_id: 'oar_id',
                    name: 'oar_name',
                    address: 'oar_address',
                    confidence: 'confidence',
                    status: facilityMatchStatusChoicesEnum.AUTOMATIC,
                },
            ],
        },
    ];

    const expectedCSVData = [
        csvHeaders,
        [
            'row_index',
            'status',
            'country_code',
            'country_name',
            'name',
            'address',
            'oar_id',
            'oar_name',
            'oar_address',
            'oar_id',
            'oar_name',
            'oar_address',
            'confidence',
            facilityMatchStatusChoicesEnum.AUTOMATIC,
        ],
    ];

    const formattedCSVData = formatDataForCSV(mockListItemData);

    expect(formattedCSVData.length).toBe(formattedCSVData.length);
    expect(formattedCSVData.length).toBe(2);

    const [headerRow, rest] = formattedCSVData;
    const [expectedHeaderRow, expectedRest] = expectedCSVData;

    expectedHeaderRow.forEach((field, index) => {
        expect(headerRow[index]).toBe(field);
    });

    expectedRest.forEach((field, index) => {
        expect(rest[index]).toBe(field);
    });
});
