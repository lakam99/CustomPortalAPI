import { runPowershellScript } from "./reusable";

var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');

export var EmailManager = {
    transporter: undefined,
    templates: undefined,
    setup: async () => {
        EmailManager.setup_transporter();
        EmailManager.get_templates();
    },

    setup_transporter: async () => {
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

    get_template_for(_for:string) {
        return EmailManager.templates.filter(template=>template.for==_for)[0];
    },

    get_templates: async () => {
        EmailManager.templates = JSON.parse(fs.readFileSync(path.join(__dirname, '/../templates/config.json')));
        EmailManager.templates.forEach((template)=>{
            Object.keys(template).forEach(async (key)=>{
                if (key != 'for') template[key] = fs.readFileSync(path.join(__dirname, template[key]), 'utf8');
            })
        })
    },

    send_email: (to, subject, html, from='supportcentral-soutiencentral@nserc-crsng.gc.ca'):Promise<any> => {
        return EmailManager.transporter.sendMail({from, to, subject, html});
    }
}

EmailManager.setup();