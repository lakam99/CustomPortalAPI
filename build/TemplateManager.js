"use strict";
exports.__esModule = true;
exports.TemplateManager = void 0;
var DBManager_1 = require("./DBManager");
var ArkamAPICall_1 = require("./ArkamAPICall");
var TemplateManager = /** @class */ (function () {
    function TemplateManager(apiInstance) {
        var _this = this;
        this.dbname = "templates";
        this.portalAPI = apiInstance;
        try {
            this.cache = DBManager_1.primaryDB.get(this.dbname);
        }
        catch (_a) {
            this.cache = { templateData: {} };
            this.writeDB();
        }
        this.calls = [
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/template', function (req, res) { _this.get_template_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.post, '/template/write', function (req, res) { _this.write_template_call(req, res); })
        ];
        this.portalAPI.registerAPICalls(this.calls);
    }
    TemplateManager.prototype.writeDB = function () {
        DBManager_1.primaryDB.put(this.dbname, this.cache);
    };
    TemplateManager.prototype.get_template_call = function (req, res) {
        var username = req.query.username;
        if (username) {
            try {
                res.send("".concat(JSON.stringify(this.get_user_template(username))));
            }
            catch (_a) {
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(400);
        }
    };
    TemplateManager.prototype.write_template_call = function (req, res) {
        var username = req.body.username;
        var template = req.body.template;
        if (username && template) {
            this.write_user_template(username, template);
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    };
    TemplateManager.prototype.get_user_template = function (username) {
        return this.cache.templateData[username];
    };
    TemplateManager.prototype.write_user_template = function (username, html_template) {
        this.cache.templateData[username] = {};
        this.cache.templateData[username] = {
            Id: username, Name: username, Subject: "", Description: "Your custom template",
            Content: html_template, ContentIE: html_template
        };
        this.writeDB();
    };
    return TemplateManager;
}());
exports.TemplateManager = TemplateManager;
