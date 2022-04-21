const express = require('express');
var parser = require('body-parser');
var path = require('path');
var ntlm = require('express-ntlm');
const fs = require('fs');
const https = require('https');

import {ArkamAPICall, ARKAM_API_METHODS} from './ArkamAPICall';
import { HomeUpdateManager } from './HomeUpdateManager';
import { TemplateManager } from './TemplateManager';

export class ArkamPortalAPI {
    api = express();
    port = process.env.port || 5000;
    ldap_path = "/../databases/ldap-control.json";
    certs_path = "/../certs/";
    ldap_options:any;
    api_server:any;
    templateManager:TemplateManager;
    homeUpdateManager:HomeUpdateManager;
    https_key:any;
    https_cert:any;

    constructor() {
        this.api.options('*',(req, res,next)=>{
            res = ArkamPortalAPI.setHeaders(res);
            res.sendStatus(200);
        })

        this.api.use((req, res, next)=> {
            res = ArkamPortalAPI.setHeaders(res);
            next();
        });

        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
    
        this.api.get('/index', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../index.html"))});
        this.api.get('/jquery', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../jquery-3.6.0.min.js"))});
        this.api.get('/homepage-css', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../homepage.css"))});
        this.api.get('/assets/trash.png', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../trash.png"))});
        this.api.get('/assets/trash-open.png', (req,res)=>{res.sendFile(path.resolve(__dirname + "/../trash-open.png"))});

        this.ldap_options = JSON.parse(fs.readFileSync(path.resolve(__dirname + this.ldap_path), 'utf8'));
        this.https_key = fs.readFileSync(path.resolve(__dirname + this.certs_path + 'decrypt-key.key'));
        this.https_cert = fs.readFileSync(path.resolve(__dirname + this.certs_path + 'ottansm1-cert.crt'));

        /*this.api.use(ntlm({
            debug: function() {
                var args = Array.prototype.slice.apply(arguments);
                console.log.apply(null, args);
            },
            domain: this.ldap_options.domain,
            domaincontroller: this.ldap_options.domaincontroller
        }));*/

        this.api.use(function(req, res, next) {
            //console.log("User: " + res.locals.ntlm.UserName);
            next();
        });

        //experimental
        this.api_server = https.createServer({
            key: this.https_key,
            cert: this.https_cert
        }, this.api).listen(this.port, ()=>{
            var host = this.api_server.address().address;
            var port = this.port;

            console.log("Listening at https://%s:%s", host, port);
        });

        //this.templateManager = new TemplateManager(this);
        this.homeUpdateManager = new HomeUpdateManager(this);
    }

    static setHeaders(res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        return res;
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