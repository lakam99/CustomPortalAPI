import { runPowershellScript } from "./reusable";

var nodemailer = require('nodemailer');
var path = require('path');

export var EmailManager = {
    transporter: undefined,
    auth: undefined,
    setup: async () => {
        var auth = await runPowershellScript(path.join(__dirname, '/../getEmailLogon.ps1'));
        auth = JSON.parse(auth);
        EmailManager.transporter = nodemailer.createTransport({
            host: 'mail.nserc.ca',
            port: 25,
            secure: false,
            auth,
            tls: { secureProtocol: "TLSv1_method", rejectUnauthorized: false }
        })   
    },

    send_email: (to, subject, html, from='supportcentral-soutiencentral@nserc-crsng.gc.ca'):Promise<any> => {
        return EmailManager.transporter.sendMail({from, to, subject, html});
    }
}

EmailManager.setup();