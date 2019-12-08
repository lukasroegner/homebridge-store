
const http = require('http');
const url = require('url');
const storage = require('node-persist');

/**
 * Represents the API.
 * @param platform The StoreApi instance.
 */
function StoreApi(platform) {
    const api = this;

    // Sets the platform
    api.platform = platform;

    // Checks if all required information is provided
    if (!api.platform.config.apiPort) {
        api.platform.log('No API port provided.');
        return;
    }
    if (!api.platform.config.apiToken) {
        api.platform.log('No API token provided.');
        return;
    }
    if (!api.platform.config.storagePath) {
        api.platform.log('No storage path provided.');
        return;
    }

    // Initializes the storage
    storage.init({ dir: api.platform.config.storagePath });

    // Starts the server
    try {
        http.createServer(function (request, response) {
            const payload = [];

            // Subscribes for events of the request
            request.on('error', function () {
                api.platform.log('API - Error received.');
            }).on('data', function (chunk) {
                payload.push(chunk);
            }).on('end', function () {

                // Subscribes to errors when sending the response
                response.on('error', function () {
                    api.platform.log('API - Error sending the response.');
                });

                // Validates the token
                if (!request.headers['authorization']) {
                    api.platform.log('Authorization header missing.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }
                if (request.headers['authorization'] !== api.platform.config.apiToken) {
                    api.platform.log('Token invalid.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }

                // Validates the proprety name
                const propertyName = api.getPropertyName(request.url);
                if (!propertyName) {
                    api.platform.log('No property name found.');
                    response.statusCode = 404;
                    response.end();
                    return;
                }
            
                // Validates the body
                let body = null;
                if (payload && payload.length > 0) {
                    body = Buffer.concat(payload).toString();
                }
                
                // Performs the action based on the property name and method
                switch (request.method) {
                    case 'GET':
                        api.handleGet(propertyName, response);
                        return;
                        
                    case 'POST':
                        api.handlePost(propertyName, body, response);
                        return;
                }

                api.platform.log('No action matched.');
                response.statusCode = 404;
                response.end();
            });
        }).listen(api.platform.config.apiPort, "0.0.0.0");
        api.platform.log('API started.');
    } catch (e) {
        api.platform.log('API could not be started: ' + JSON.stringify(e));
    }
}

/**
 * Handles requests to GET /{propertyName}.
 * @param propertyName The property name.
 * @param response The response object.
 */
StoreApi.prototype.handleGet = function (propertyName, response) {
    const api = this;
    
    // Writes the response
    storage.getItem(propertyName).then(function(value) {
        if (typeof value === 'object') {
            response.setHeader('Content-Type', 'application/json');
            response.write(JSON.stringify(value));
        } else {
            response.setHeader('Content-Type', 'text/plain');
            response.write(typeof value === 'undefined' ? 'null' : value.toString());
        }
        response.statusCode = 200;
        response.end();
    }, function() {
        api.platform.log('Error while retrieving value.');
        response.statusCode = 400;
        response.end();
    });
}

/**
 * Handles requests to POST /{propertyName}.
 * @param propertyName The property name.
 * @param body The body of the request.
 * @param response The response object.
 */
StoreApi.prototype.handlePost = function (propertyName, body, response) {
    const api = this;

    // Writes the response
    storage.setItem(propertyName, body.trim().startsWith('{') ? JSON.parse(body) : body).then(function() {
        response.statusCode = 200;
        response.end();
    }, function() {
        api.platform.log('Error while setting value.');
        response.statusCode = 400;
        response.end();
    });
}

/**
 * Gets the property name from the URL.
 * @param uri The uri of the request.
 * @returns Returns the property name.
 */
StoreApi.prototype.getPropertyName = function (uri) {

    // Parses the request path
    const uriParts = url.parse(uri);

    // Checks if the URL matches the property name
    uriMatch = /\/(.+)/g.exec(uriParts.pathname);
    if (uriMatch && uriMatch.length === 2) {
        return decodeURI(uriMatch[1]);
    }

    // Returns null as no property name found
    return null;
}

/**
 * Defines the export of the file.
 */
module.exports = StoreApi;
