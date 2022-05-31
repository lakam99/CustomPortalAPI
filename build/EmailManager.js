"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailManager = void 0;
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
        var auth = await (0, reusable_1.runPowershellScript)(path.join(__dirname, '/../getEmailLogon.ps1'));
        auth = JSON.parse(auth);
        exports.EmailManager.transporter = nodemailer.createTransport({
            host: 'mail.nserc.ca',
            port: 25,
            secure: false,
            auth,
            tls: { secureProtocol: "TLSv1_method", rejectUnauthorized: false }
        });
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
