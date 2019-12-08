
const StoreApi = require('./store-api');

/**
 * Initializes a new platform instance for the store plugin.
 * @param log The logging function.
 * @param config The configuration that is passed to the plugin (from the config.json file).
 */
function StorePlatform(log, config) {
    const platform = this;

    // Checks whether a configuration is provided, otherwise the plugin should not be initialized
    if (!config) {
        return;
    }

    // Defines the variables that are used throughout the platform
    platform.log = log;
    platform.config = config;
    platform.accessories = [];

    // Initializes the configuration
    platform.config.apiPort = platform.config.apiPort || 40020;
    platform.config.apiToken = platform.config.apiToken || null;
    platform.config.storagePath = platform.config.storagePath || null;

    // Starts the API
    platform.storeApi = new StoreApi(platform);
}

/**
 * Configures a previously cached accessory.
 * @param accessory The cached accessory.
 */
StorePlatform.prototype.configureAccessory = function (accessory) {}

/**
 * Defines the export of the file.
 */
module.exports = StorePlatform;
