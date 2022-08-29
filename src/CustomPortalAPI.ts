const express = require('express');
var parser = require('body-parser');
var path = require('path');
var ntlm = require('express-ntlm');
const fs = require('fs');
const https = require('https');
const WebSockets = require('ws');

import {CustomAPICall, CUSTOM_API_METHODS} from './CustomAPICall';
import { HomeUpdateManager } from './HomeUpdateManager';
import { SocketManager } from './SocketManager';
import { TemplateManager } from './TemplateManager';
import { SCSMClientInterface } from './SCSMClientInterface';

export class CustomPortalAPI {
    api = express();
    port = process.env.port || 5000;
    ldap_path = "/../databases/ldap-control.json";
    certs_path = "/../certs/";
    ldap_options:any;
    api_server:any;
    websocket_server:any;
    websocket:any;
    templateManager:TemplateManager;
    homeUpdateManager:HomeUpdateManager;
    socketManager:SocketManager;
    https_key:any;
    https_cert:any;
    scsmClient:SCSMClientInterface;

    constructor() {
        this.ldap_options = JSON.parse(fs.readFileSync(path.resolve(__dirname + this.ldap_path), 'utf8'));
        this.https_key = fs.readFileSync(path.resolve(__dirname + this.certs_path + 'decrypt-key.key'));
        this.https_cert = fs.readFileSync(path.resolve(__dirname + this.certs_path + 'ottansm1-cert.crt'));
        this.init_api_server();
        this.init_websocket_server();
    }

    private init_websocket_server() {
        this.websocket_server = https.createServer({
            key: this.https_key,
            cert:this.https_cert
        }, this.api);

        this.websocket = new WebSockets.Server({server:this.websocket_server});
        this.socketManager = new SocketManager(this.websocket);
        
        this.websocket_server.listen('8181', ()=>{
            console.log("Websocket server started...");
        })
    }

    private init_api_server() {
        this.api.options('*',(req, res,next)=>{
            res = CustomPortalAPI.setHeaders(res);
            res.sendStatus(200);
        });

        this.api.use((req, res, next)=> {
            res = CustomPortalAPI.setHeaders(res);
            next();
        });

        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
        this.api.use(express.static(path.join(__dirname, '/../assets/')));

        this.api.get('/index', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../index.html"))});
        this.api.get('/jquery', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../jquery-3.6.0.min.js"))});
        this.api.get('/homepage-css', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../homepage.css"))});
        this.api.get('/assets/trash.png', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../trash.png"))});
        this.api.get('/assets/trash-open.png', (req,res)=>{res.sendFile(path.resolve(__dirname + "/../trash-open.png"))});

        this.api_server = https.createServer({
            key: this.https_key,
            cert: this.https_cert
        }, this.api).listen(this.port, ()=>{
            var host = this.api_server.address().address;
            var port = this.port;

            console.log("Listening at https://%s:%s", host, port);
        });

        this.homeUpdateManager = new HomeUpdateManager(this);
        this.scsmClient = new SCSMClientInterface(this);
    }

    static setHeaders(res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.header("Access-Control-Allow-Credentials", "true");
        return res;
    }

    registerAPI(new_api:CustomAPICall) {
        if (new_api.get_method() == CUSTOM_API_METHODS.get) {
            this.api.get(new_api.get_name(), new_api.get_callback());
        } else {
            this.api.post(new_api.get_name(), parser.urlencoded({ extended: true }), new_api.get_callback());
        }
    }

    registerAPICalls(calls:Array<CustomAPICall>) {
        calls.forEach((call)=>{
            this.registerAPI(call);
        })
    }
}

const arkamPortalAPI = new CustomPortalAPI();