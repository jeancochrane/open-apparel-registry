import get from 'lodash/get';

export function DownloadCSV(data, fileName) {
    const csvData = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    if (window.navigator.msSaveOrOpenBlob) {
        // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(csvData, fileName);
    } else {
        const csvURL = window.URL.createObjectURL(csvData);
        const tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', fileName);
        tempLink.click();
    }
}

export const makeUserLoginURL = () => `${process.env.REACT_APP_API_URL}/user-login/`;
export const makeUserLogoutURL = () => `${process.env.REACT_APP_API_URL}/user-logout/`;

export const makeGetListsURL = uid =>
    `${process.env.REACT_APP_API_URL}/getLists/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUpdateListURL = (uid, filename) =>
    `${process.env.REACT_APP_API_URL}/getList/${uid}/?file_name=${filename}&key=${process.env.REACT_APP_API_KEY}`;

export const makeConfirmTempURL = tempId =>
    `${process.env.REACT_APP_API_URL}/confirmTemp/${tempId}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUpdateSourceNameURL = uid =>
    `${process.env.REACT_APP_API_URL}/updateSourceName/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeUploadTempFacilityURL = uid =>
    `${process.env.REACT_APP_API_URL}/uploadTempFactory/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeGenerateAPIKeyURL = uid =>
    `${process.env.REACT_APP_API_URL}/generateKey/${uid}/?key=${process.env.REACT_APP_API_KEY}`;

export const makeAllSourceURL = () => `${process.env.REACT_APP_API_URL}/allsource/`;
export const makeAllCountryURL = () => `${process.env.REACT_APP_API_URL}/allcountry/`;
export const makeTotalFacilityURL = () => `${process.env.REACT_APP_API_URL}/totalFactories/`;

export const makeSearchFacilityByNameAndCountryURL = (name, country, contributor = null) => {
    const baseURL =
        `${process.env.REACT_APP_API_URL}/searchFactoryNameCountry/?name=${name}&country=${country}&contributor=`;

    return contributor
        ? baseURL.concat(contributor)
        : baseURL;
};

export function logErrorAndDispatchFailure(error, defaultMessage, failureAction) {
    return (dispatch) => {
        const response = get(error, 'response', { data: null, status: null });

        if (!response.status || response.status >= 500) {
            window.console.warn(error);
            return dispatch(failureAction([defaultMessage]));
        }

        if (response.status === 404) {
            window.console.warn(error);
            return dispatch(failureAction(['Not found']));
        }

        const errorMessages = (() => {
            if (!response || !response.data) {
                return [defaultMessage];
            }

            // For signin-error
            if (response.data.non_field_errors) {
                return response.data.non_field_errors;
            }

            return response.data;
        })();

        window.console.warn(errorMessages);
        return dispatch(failureAction(errorMessages));
    };
}

export const getValueFromEvent = ({ target: { value } }) => value;

export const getCheckedFromEvent = ({ target: { checked } }) => checked;
