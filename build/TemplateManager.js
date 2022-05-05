"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateManager = void 0;
const DBManager_1 = require("./DBManager");
const ArkamAPICall_1 = require("./ArkamAPICall");
class TemplateManager {
    constructor(apiInstance) {
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
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/template', (req, res) => { this.get_template_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.post, '/template/write', (req, res) => { this.write_template_call(req, res); })
        ];
        this.portalAPI.registerAPICalls(this.calls);
    }
    writeDB() {
        DBManager_1.primaryDB.put(this.dbname, this.cache);
    }
    get_template_call(req, res) {
        let username = req.query.username;
        if (username) {
            try {
                res.send(`${JSON.stringify(this.get_user_template(username))}`);
            }
            catch (_a) {
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(400);
        }
    }
    write_template_call(req, res) {
        let username = req.body.username;
        let template = req.body.template;
        if (username && template) {
            this.write_user_template(username, template);
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    }
    get_user_template(username) {
        return this.cache.templateData[username];
    }
    write_user_template(username, html_template) {
        this.cache.templateData[username] = {};
        this.cache.templateData[username] = {
            Id: username, Name: username, Subject: "", Description: "Your custom template",
            Content: html_template, ContentIE: html_template
        };
        this.writeDB();
    }
}
exports.TemplateManager = TemplateManager;
