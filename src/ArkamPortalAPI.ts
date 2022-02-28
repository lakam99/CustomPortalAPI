const express = require('express');
var parser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
var passport = require('passport');
var session = require('express-session');
var WindowsStrategy = require('passport-windowsauth');
var path = require('path');
var ntlm = require('express-ntlm');

import {ArkamAPICall, ARKAM_API_METHODS} from './ArkamAPICall';
import { HomeUpdateManager } from './HomeUpdateManager';
import { TemplateManager } from './TemplateManager';

export class ArkamPortalAPI {
    api = express();
    port = process.env.port || 6942;
    api_server:any;
    templateManager:TemplateManager;
    homeUpdateManager:HomeUpdateManager;
    secure_api_calls:Array<ArkamAPICall>;
    unsecure_api_call:Array<ArkamAPICall>;

    constructor() {
        this.api.options('*',(req, res,next)=>{
            res.header("Access-Control-Allow-Origin", "http://ottansm2");
            //res.header("Access-Control-Allow-Origin", "http://ottansm3");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            res.sendStatus(200);
        })

        this.api.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://ottansm2");
            //res.header("Access-Control-Allow-Origin", "http://ottansm3");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });

        this.api.use(parser.json());
        this.api.use(parser.urlencoded({ extended: true }));
        /*this.api.use(cookieParser());
        this.api.use(session());
        this.api.use(passport.initialize());
        this.api.use(passport.session())

        passport.use(new WindowsStrategy({
            ldap: {
              url:             'ldap://DEVDC3.nserc.ca',
              base:            'OU=Dev_Users,DC=nserc,DC=ca',
              bindDN:          'scsmAD',
              bindCredentials: 'H0neyd3w'
            }
          },
          (profile, done)=>{
              console.log(profile);
              done(0, profile);
          }));

          passport.serializeUser(function(user, done) {
            done(null, user);
          });
          
          passport.deserializeUser(function(user, done) {
            done(null, user);
          });*/

          this.api.get('/index', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../index.html"))});
          this.api.get('/jquery', (req, res)=>{res.sendFile(path.resolve(__dirname + "/../jquery-3.6.0.min.js"))});

          this.api.use(ntlm({
            debug: function() {
                var args = Array.prototype.slice.apply(arguments);
                console.log.apply(null, args);
            },
            domain: 'OU=Dev_Users,DC=nserc,DC=ca',
            domaincontroller: 'ldap://DEVDC3.nserc.ca',
        
            // use different port (default: 389)
            // domaincontroller: 'ldap://myad.example:3899',
        }));

          /*this.api.options('*',(req,res)=>{
            var sspi = require('node-sspi');
            var sspiObj = new sspi({authoritative:false, offerBasic:true});
            sspiObj.authenticate(req, res, function(err) {
                console.log("Error:" + err);
                res.finished;
            })
            cors({origin: "http://ottansm2", credentials: true, preflightContinue: true})
          });
        
        this.api.use(function(req, res, next){
            res.header("Access-Control-Allow-Origin", "http://ottansm2");
            //res.header("Access-Control-Allow-Origin", "http://ottansm3");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,__requestverificationtoken");
            res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            var sspi = require('node-sspi');
            var sspiObj = new sspi();
            sspiObj.authenticate(req, res, function(err) {
                console.log("Error:" + err);
                res.finished || next();
            })
        });*/

        this.api.use(function(req, res, next) {
            console.log("User: " + res.locals.ntlm);
            next();
        });

        this.api_server = this.api.listen(this.port, ()=>{
            var host = this.api_server.address().address;
            var port = this.port;

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