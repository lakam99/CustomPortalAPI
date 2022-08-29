import { CustomAPICall } from "./CustomAPICall";
import { CustomPortalAPI } from "./CustomPortalAPI";
import { CUSTOM_API_METHODS } from "./CustomAPICall";
import { ServiceManagerInterface } from "./ServiceManagerInterface";

export class SCSMClientInterface {
    private customAPI;
    private scsmInterface:ServiceManagerInterface;

    constructor(customAPI:CustomPortalAPI) {
        this.customAPI = customAPI;
        this.scsmInterface = new ServiceManagerInterface('ottansm1');
        this.customAPI.registerAPI(new CustomAPICall(CUSTOM_API_METHODS.get, '/close-ticket', (req, res) => {
            this.closeTicket(req.query.ticketId).then(()=>{
                res.sendStatus(200);
            });
        }))
    }

    private async closeTicket(ticket_guid:string) {
        return this.scsmInterface.close_ticket(ticket_guid);
    }
}