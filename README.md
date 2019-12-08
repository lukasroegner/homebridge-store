# homebridge-store
Store keys and their values via HTTP API.

## Who is it for?

The use case for this plugin is simple: you can store key-value-pairs via HomeKit shortcuts to enable complex automation scenarios. HomeKit shortcuts are supported starting with iOS 13. Use the "download content from URL" action with GET or POST to retrieve and store values.

## Installation

Install the plugin via npm:

```bash
npm install https://github.com/lukasroegner/homebridge-store.git -g
```

## Configuration

```json
{
    "platforms": [
        {
            "platform": "StorePlatform",
            "apiPort": 40809,
            "apiToken": "<YOUR-TOKEN>",
            "storagePath": "<PATH-TO-STORAGE>"
        }
    ]
}
```

**apiPort** (optional): The port that the API (if enabled) runs on. Defaults to `40020`, please change this setting of the port is already in use.

**apiToken**: The token that has to be included in each request of the API. Is required and has no default value.

**storagePath**: The fully qualified path to the directory where your key-value-pairs are stored.

## API

The API can be reached at the specified port on the host of this plugin. 
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>
```

The token has to be specified as value of the `Authorization` header on each request:
```
Authorization: <YOUR-TOKEN>
```

### API - Get value

Use the `/<PROPERTY-NAME>` endpoint to retrieve a single value of a property. The HTTP method has to be `GET`:
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<PROPERTY-NAME>
```

The response is a plain text response or (if you stored it in that way) JSON.

### API - Set value

Use the `/<PROPERTY-NAME>` endpoint to set the value of a property. The HTTP method has to be `POST`:
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<PROPERTY-NAME>
```

The body of the request has to be the value as plain text or JSON.
