import { STATUS_CODES } from 'http';

function getQueryParams(request) {

}

function respondJSON(response, data, statusCode = 200, statusText = STATUS_CODES[statusCode], otherHeaders = {}) {
    const jsonHeaders = { 'Content-Type': 'application/json' };
    const jsonData = JSON.stringify(data);
    const headers = { ...otherHeaders, ...jsonHeaders };
    response.setHeaders(headers).writeHead(statusCode, statusText);
    res.end(jsonData);
}

module.exports = {
    respondJSON,
};
