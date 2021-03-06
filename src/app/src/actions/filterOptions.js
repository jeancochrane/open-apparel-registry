import { createAction } from 'redux-act';

import csrfRequest from '../util/csrfRequest';

import {
    logErrorAndDispatchFailure,
    makeGetContributorsURL,
    makeGetContributorTypesURL,
    makeGetCountriesURL,
    mapDjangoChoiceTuplesToSelectOptions,
} from '../util/util';

export const startFetchContributorOptions = createAction('START_FETCH_CONTRIBUTOR_OPTIONS');
export const failFetchContributorOptions = createAction('FAIL_FETCH_CONTRIBUTOR_OPTIONS');
export const completeFetchContributorOptions =
    createAction('COMPLETE_FETCH_CONTRIBUTOR_OPTIONS');

export const startFetchContributorTypeOptions =
    createAction('START_FETCH_CONTRIBUTOR_TYPE_OPTIONS');
export const failFetchContributorTypeOptions =
    createAction('FAIL_FETCH_CONTRIBUTOR_TYPE_OPTIONS');
export const completeFetchContributorTypeOptions =
    createAction('COMPLETE_FETCH_CONTRIBUTOR_TYPE_OPTIONS');

export const startFetchCountryOptions = createAction('START_FETCH_COUNTRY_OPTIONS');
export const failFetchCountryOptions = createAction('FAIL_FETCH_COUNTRY_OPTIONS');
export const completeFetchCountryOptions = createAction('COMPLETE_FETCH_COUNTRY_OPTIONS');

export const resetFilterOptions = createAction('RESET_FILTER_OPTIONS');

export function fetchContributorOptions() {
    return (dispatch) => {
        dispatch(startFetchContributorOptions());

        return csrfRequest
            .get(makeGetContributorsURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchContributorOptions(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching contributor options',
                failFetchContributorOptions,
            )));
    };
}

export function fetchContributorTypeOptions() {
    return (dispatch) => {
        dispatch(startFetchContributorTypeOptions());

        return csrfRequest
            .get(makeGetContributorTypesURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchContributorTypeOptions(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching contributor type options',
                failFetchContributorTypeOptions,
            )));
    };
}

export function fetchCountryOptions() {
    return (dispatch) => {
        dispatch(startFetchCountryOptions());

        return csrfRequest
            .get(makeGetCountriesURL())
            .then(({ data }) => mapDjangoChoiceTuplesToSelectOptions(data))
            .then(data => dispatch(completeFetchCountryOptions(data)))
            .catch(err => dispatch(logErrorAndDispatchFailure(
                err,
                'An error prevented fetching country options',
                failFetchCountryOptions,
            )));
    };
}

export function fetchAllFilterOptions() {
    return (dispatch) => {
        dispatch(fetchContributorOptions());
        dispatch(fetchContributorTypeOptions());
        dispatch(fetchCountryOptions());
    };
}
