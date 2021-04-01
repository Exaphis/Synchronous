const REVERSE_PROXY = window.location.hostname === 'synchronous.localhost';

export const TUSD_URL = REVERSE_PROXY ? 'http://tusd.synchronous.localhost/files/' : 'http://0.0.0.0:1080/files/';
export const BACKEND_URL = REVERSE_PROXY ? 'api.synchronous.localhost' : 'localhost:8000';
export const ETHERPAD_URL = 'etherpad.synchronous.localhost';

// pubsub topics used for communication within the frontend
export const PUBSUB_TOPIC = {
    FILE_LIST_REQUEST_TOPIC: 'fileListRequest'
}

export const APP_TYPE = {
    TEMPLATE: 0,
    PAD: 1,
    FILE_SHARE: 2
};

// possible type parameters of websocket messages sent by client
export const CLIENT_MSG_TYPE = {
    ACTIVITY: 'activity',
    NICKNAME_CHANGE: 'nicknameChange',
    FILE_LIST_REQUEST: 'fileListRequest'
};

// possible type parameters of websocket messages sent by server
// usable as pubsub-js topics for subscriptions
export const SERVER_MSG_TYPE = {
    USER_LIST: 'user_list',
    CURRENT_USER: 'current_user',
    NICKNAME_CHANGE: 'nickname_change',
    FILE_LIST: 'file_list',
};


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