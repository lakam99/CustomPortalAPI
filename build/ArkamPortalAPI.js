"use strict";
exports.__esModule = true;
exports.ArkamPortalAPI = void 0;
var express = require('express');
var parser = require('body-parser');
var path = require('path');
var ntlm = require('express-ntlm');
var ArkamAPICall_1 = require("./ArkamAPICall");
var HomeUpdateManager_1 = require("./HomeUpdateManager");
var ArkamPortalAPI = /** @class */ (function () {
    function ArkamPortalAPI() {
        var _this = this;
        this.api = express();
        this.port = process.env.port || 6942;
        this.api.options('*', function (req, res, next) {
            res = ArkamPortalAPI.setHeaders(res);
            res.sendStatus(200);
        });
        this.api.use(function (req, res, next) {
            res = ArkamPortalAPI.setHeaders(res);
            next();
        });
        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
        this.api.get('/index', function (req, res) { res.sendFile(path.resolve(__dirname + "/../index.html")); });
        this.api.get('/jquery', function (req, res) { res.sendFile(path.resolve(__dirname + "/../jquery-3.6.0.min.js")); });
        this.api.use(ntlm({
            debug: function () {
                var args = Array.prototype.slice.apply(arguments);
                console.log.apply(null, args);
            },
            domain: 'OU=Dev_Users,DC=nserc,DC=ca',
            domaincontroller: 'ldap://DEVDC3.nserc.ca'
        }));
        this.api.use(function (req, res, next) {
            console.log("User: " + res.locals.ntlm.UserName);
            next();
        });
        this.api_server = this.api.listen(this.port, function () {
            var host = _this.api_server.address().address;
            var port = _this.port;
            console.log("Listening at http://%s:%s", host, port);
        });
        //this.templateManager = new TemplateManager(this);
        this.homeUpdateManager = new HomeUpdateManager_1.HomeUpdateManager(this);
    }
    ArkamPortalAPI.setHeaders = function (res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        return res;
    };
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
