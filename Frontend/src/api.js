const REVERSE_PROXY = false;

export const TUSD_URL = REVERSE_PROXY ? 'http://tusd.synchronous.localhost/files/' : 'http://0.0.0.0:1080/files/';
export const BACKEND_URL = REVERSE_PROXY ? 'api.synchronous.localhost' : 'localhost:8000';

export const USER_LIST_TOPIC = 'user_list';
export const CURRENT_USER_TOPIC = 'current_user';
export const NICKNAME_CHANGE_TOPIC = 'nickname_change';
export const FILE_LIST_TOPIC = 'file_list';
export const FILE_LIST_REQUEST_TOPIC = 'fileListRequest';


export function getUrlFromEndpoint(protocol, endpoint) {
    return protocol + '://' + BACKEND_URL + '/' + endpoint;
}

export function fetchAPI(methodType, endpoint, data=null, token=null) {
    let headers = {
        'Content-Type': 'application/json'
    }
    if (token !== null) {
        headers['Authorization'] = 'Token ' + token.toString()
    }

    let requestOptions = {
        method: methodType,
        headers: headers
    };

    if (data !== null) {
        requestOptions.body = JSON.stringify(data);
    }

    return fetch(getUrlFromEndpoint('http', endpoint), requestOptions)
    .then(async response => {
        let data;

        try {
            data = await response.json()
        } catch (e) {
            throw response.status;
        }

        if (!response.ok) {
            throw JSON.stringify(data);
        }

        return data;
    })
    .catch(error => {
        if (error instanceof Error) {
            return {
                error: true,
                details: error.message
            }
        }

        return {
            error: true,
            details: error
        }
    });
}