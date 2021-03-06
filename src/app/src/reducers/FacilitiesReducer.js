import { createReducer } from 'redux-act';
import update from 'immutability-helper';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import {
    startFetchFacilities,
    failFetchFacilities,
    completeFetchFacilities,
    resetFacilities,
    startFetchSingleFacility,
    failFetchSingleFacility,
    completeFetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

import { makeFeatureCollectionFromSingleFeature } from '../util/util';

const initialState = Object.freeze({
    facilities: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
    singleFacility: Object.freeze({
        data: null,
        fetching: false,
        error: null,
    }),
});

const handleFetchSingleFacility = (state, payload) => {
    // Check whether retrieving the single facility should also
    // replace the facilities feature collection in cases when
    //
    // - facilities data is null or empty
    // - facilities data has only one feature that is not the single facility
    const shouldReplaceAllFacilities = isNull(state.facilities.data)
        || isEmpty(state.facilities.data)
        || (state.facilities.data.features.length === 1
        && get(state, 'facilities.data.features[0].properties.oar_id', null)
        !== payload.properties.oar_id);

    if (shouldReplaceAllFacilities) {
        return update(state, {
            facilities: {
                data: { $set: makeFeatureCollectionFromSingleFeature(payload) },
            },
            singleFacility: {
                fetching: { $set: false },
                error: { $set: null },
                data: { $set: payload },
            },
        });
    }

    return update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    });
};

export default createReducer({
    [startFetchFacilities]: state => update(state, {
        facilities: {
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchFacilities]: (state, payload) => update(state, {
        facilities: {
            fetching: { $set: false },
            error: { $set: null },
            data: { $set: payload },
        },
    }),
    [resetFacilities]: state => update(state, {
        facilities: { $set: initialState.facilities },
    }),
    [startFetchSingleFacility]: state => update(state, {
        singleFacility: {
            data: { $set: null },
            fetching: { $set: true },
            error: { $set: null },
        },
    }),
    [failFetchSingleFacility]: (state, payload) => update(state, {
        singleFacility: {
            fetching: { $set: false },
            error: { $set: payload },
        },
    }),
    [completeFetchSingleFacility]: handleFetchSingleFacility,
    [resetSingleFacility]: state => update(state, {
        singleFacility: { $set: initialState.singleFacility },
    }),
}, initialState);
