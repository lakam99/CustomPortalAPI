"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailManager = void 0;
const ConfigManager_1 = require("./ConfigManager");
const reusable_1 = require("./reusable");
var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');
exports.EmailManager = {
    transporter: undefined,
    templates: undefined,
    setup: async () => {
        exports.EmailManager.setup_transporter();
        exports.EmailManager.get_templates();
    },
    setup_transporter: async () => {
        var auth = JSON.parse(await (0, reusable_1.runPowershellScript)(path.join(__dirname, '/../getEmailLogon.ps1')));
        var config = await ConfigManager_1.ConfigManager.get('Email-Manager-Config');
        Object.assign(config, { auth });
        exports.EmailManager.transporter = nodemailer.createTransport(config);
    },
    get_template_for(_for) {
        return exports.EmailManager.templates.filter(template => template.for == _for)[0];
    },
    get_templates: async () => {
        exports.EmailManager.templates = JSON.parse(fs.readFileSync(path.join(__dirname, '/../templates/config.json')));
        exports.EmailManager.templates.forEach((template) => {
            Object.keys(template).forEach(async (key) => {
                if (key != 'for')
                    template[key] = fs.readFileSync(path.join(__dirname, template[key]), 'utf8');
            });
        });
    },
    send_email: (to, subject, html, from = 'supportcentral-soutiencentral@nserc-crsng.gc.ca') => {
        return exports.EmailManager.transporter.sendMail({ from, to, subject, html });
    }
};
exports.EmailManager.setup();
