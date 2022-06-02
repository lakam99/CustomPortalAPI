"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
var fs = require('fs');
var path = require('path');
exports.ConfigManager = (function () {
    var configs = '/../configs/config.json';
    var configs_o = JSON.parse(fs.readFileSync(path.join(__dirname, configs), 'utf8'));
    configs_o.forEach((config) => {
        let loaded_config = new Promise((resolve) => {
            try {
                resolve(JSON.parse(fs.readFileSync(path.join(__dirname, config.path), 'utf8')));
            }
            catch (e) {
                console.error(e);
            }
        });
        Object.assign(config, { loaded_config });
    });
    var get = function get(config_name) {
        let config = configs_o.filter((config) => config.name == config_name)[0];
        return config.loaded_config;
    };
    return { get };
})();
