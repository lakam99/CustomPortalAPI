const express = require('express');
var parser = require('body-parser');
const cors = require('cors');
import {ArkamAPICall, ARKAM_API_METHODS} from './ArkamAPICall';
import { HomeUpdateManager } from './HomeUpdateManager';
import { TemplateManager } from './TemplateManager';

export class ArkamPortalAPI {
    api = express();
    port = 6942;
    api_server:any;
    templateManager:TemplateManager;
    homeUpdateManager:HomeUpdateManager;

    constructor() {
        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
        this.api.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
            console.log(req);
            next();
          });

        this.api_server = this.api.listen(this.port, ()=>{
            var host = this.api_server.address().address;
            var port = this.api_server.address().port;

            console.log("Listening at http://%s:%s", host, port);
        });

        this.templateManager = new TemplateManager(this);
        this.homeUpdateManager = new HomeUpdateManager(this);
    }

    registerAPI(new_api:ArkamAPICall) {
        if (new_api.get_method() == ARKAM_API_METHODS.get) {
            this.api.get(new_api.get_name(), new_api.get_callback());
        } else {
            this.api.post(new_api.get_name(), parser.urlencoded({ extended: true }), new_api.get_callback());
        }
    }

    registerAPICalls(calls:Array<ArkamAPICall>) {
        calls.forEach((call)=>{
            this.registerAPI(call);
        })
    }
}

const arkamPortalAPI = new ArkamPortalAPI();