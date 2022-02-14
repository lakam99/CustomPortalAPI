"use strict";
exports.__esModule = true;
exports.ArkamPortalAPI = void 0;
var express = require('express');
var parser = require('body-parser');
var cors = require('cors');
var ArkamAPICall_1 = require("./ArkamAPICall");
var HomeUpdateManager_1 = require("./HomeUpdateManager");
var TemplateManager_1 = require("./TemplateManager");
var ArkamPortalAPI = /** @class */ (function () {
    function ArkamPortalAPI() {
        var _this = this;
        this.api = express();
        this.port = 6942;
        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
        this.api.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
            console.log(req);
            next();
        });
        this.api_server = this.api.listen(this.port, function () {
            var host = _this.api_server.address().address;
            var port = _this.api_server.address().port;
            console.log("Listening at http://%s:%s", host, port);
        });
        this.templateManager = new TemplateManager_1.TemplateManager(this);
        this.homeUpdateManager = new HomeUpdateManager_1.HomeUpdateManager(this);
    }
    ArkamPortalAPI.prototype.registerAPI = function (new_api) {
        if (new_api.get_method() == ArkamAPICall_1.ARKAM_API_METHODS.get) {
            this.api.get(new_api.get_name(), new_api.get_callback());
        }
        else {
            this.api.post(new_api.get_name(), parser.urlencoded({ extended: true }), new_api.get_callback());
        }
    };
    ArkamPortalAPI.prototype.registerAPICalls = function (calls) {
        var _this = this;
        calls.forEach(function (call) {
            _this.registerAPI(call);
        });
    };
    return ArkamPortalAPI;
}());
exports.ArkamPortalAPI = ArkamPortalAPI;
var arkamPortalAPI = new ArkamPortalAPI();
