import { primaryDB } from './DBManager';
import { ArkamAPICall, ARKAM_API_METHODS } from './ArkamAPICall';
import { ArkamPortalAPI } from './ArkamPortalAPI';

export class TemplateManager {
    cache:any;
    dbname="templates";
    calls:Array<ArkamAPICall>;
    private portalAPI:ArkamPortalAPI;

    constructor(apiInstance:ArkamPortalAPI) {
        this.portalAPI = apiInstance;
        try {
            this.cache = primaryDB.get(this.dbname);
        } catch {
            this.cache = {templateData: {}};
            this.writeDB();
        }

        this.calls = [
            new ArkamAPICall(ARKAM_API_METHODS.get,'/template', (req,res)=>{this.get_template_call(req,res)}),
            new ArkamAPICall(ARKAM_API_METHODS.post, '/template/write', (req,res)=>{this.write_template_call(req,res)})
        ]

        this.portalAPI.registerAPICalls(this.calls);
    }

    private writeDB() {
        primaryDB.put(this.dbname, this.cache);
    }

    private get_template_call(req, res) {
        let username = req.query.username;
        if (username) {
            try {
                res.send(`${JSON.stringify(this.get_user_template(username))}`);
            } catch {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(400);
        }
    }

    private write_template_call(req, res) {
        let username = req.body.username;
        let template = req.body.template;
        if (username && template) {
            this.write_user_template(username, template);
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    }

    private get_user_template(username) {
        return this.cache.templateData[username];
    }

    private write_user_template(username, html_template) {
        this.cache.templateData[username] = {};
        this.cache.templateData[username] = {
            Id: username, Name: username, Subject: "", Description: "Your custom template",
            Content: html_template, ContentIE: html_template
        };
        this.writeDB();
    }
}