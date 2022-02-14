import { ArkamAPICall, ARKAM_API_METHODS } from "./ArkamAPICall";
import { ArkamPortalAPI } from "./ArkamPortalAPI";
import { primaryDB } from "./DBManager";
import { HomeUpdate } from "./HomeUpdate";

export class HomeUpdateManager {
    private cache: any;
    private dbname: 'home-updates';
    private portalAPI:ArkamPortalAPI;
    private calls:Array<ArkamAPICall>;

    constructor(apiInstance:ArkamPortalAPI) {
        this.portalAPI = apiInstance;
        try {
            this.cache = primaryDB.get(this.dbname);
        } catch {
            this.cache = {updates: []};
            this.writeDB();
        }

        this.calls = [
            new ArkamAPICall(ARKAM_API_METHODS.get, '/home-update', (req,res)=>{this.get_updates_call(req, res)}),
            new ArkamAPICall(ARKAM_API_METHODS.post, '/home-update/write', (req,res)=>{this.write_updates_call(req, res)}),
            new ArkamAPICall(ARKAM_API_METHODS.get, '/home-update/new-template', (req,res)=>{
                res.send(`
                <div class="col-sm-4">
                  <div class="accordion" id='item-x'>
                    <div class="accordion-item">
                      <h2 class="accordion-header" id='itemx-h'>
                          <p class='display-6 text-center'>New Update</p>
                      </h2>
                      <div id="itemx-b" class="accordion-collapse collapse show" data-bs-parent="#itemx">
                        <div class="accordion-body text-center">
                            &nbsp;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                `);
            })
        ];

        this.portalAPI.registerAPICalls(this.calls);
    }

    writeDB() {
        primaryDB.put(this.dbname, this.cache);
    }

    set_updates(new_updates:Array<HomeUpdate>) {
        this.cache.updates = HomeUpdate.toArray(new_updates);
        this.writeDB();
    } 

    get_updates():Array<any> {
        return this.cache.updates;
    }

    get_updates_call(req,res) {
        res.send(`${JSON.stringify(this.get_updates())}`);
    }

    write_updates_call(req,res) {
        let new_updates = req.body;
        if (new_updates.empty && new_updates.updates == undefined) {
            new_updates.updates = [];
        }
        if (new_updates.updates) {
            this.set_updates(HomeUpdate.fromArray(new_updates.updates));
        } else {
            res.sendStatus(400);
        }
    }
}