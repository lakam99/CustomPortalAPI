"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailManager = void 0;
const reusable_1 = require("./reusable");
var nodemailer = require('nodemailer');
var path = require('path');
exports.EmailManager = {
    transporter: undefined,
    auth: undefined,
    setup: async () => {
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
    send_email: (to, subject, html, from = 'supportcentral-soutiencentral@nserc-crsng.gc.ca') => {
        return exports.EmailManager.transporter.sendMail({ from, to, subject, html });
    }
};
exports.EmailManager.setup();
