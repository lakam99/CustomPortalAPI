"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCSMClientInterface = void 0;
const CustomAPICall_1 = require("./CustomAPICall");
const CustomAPICall_2 = require("./CustomAPICall");
const ServiceManagerInterface_1 = require("./ServiceManagerInterface");
class SCSMClientInterface {
    constructor(customAPI) {
        this.customAPI = customAPI;
        this.scsmInterface = new ServiceManagerInterface_1.ServiceManagerInterface('ottansm1');
        this.customAPI.registerAPI(new CustomAPICall_1.CustomAPICall(CustomAPICall_2.CUSTOM_API_METHODS.get, '/close-ticket', (req, res) => {
            this.closeTicket(req.query.ticketId).then(() => {
                res.sendStatus(200);
            });
        }));
    }
    async closeTicket(ticket_guid) {
        return this.scsmInterface.close_ticket(ticket_guid);
    }
}
exports.SCSMClientInterface = SCSMClientInterface;
