function getUrlFromEndpoint(protocol, endpoint) {
    return protocol + '://localhost:8000/' + endpoint;
}

function fetchAPI(methodType, endpoint, data=null, token=null) {
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

export {getUrlFromEndpoint, fetchAPI};
