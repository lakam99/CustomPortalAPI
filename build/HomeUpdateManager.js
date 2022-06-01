"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeUpdateManager = void 0;
const CustomAPICall_1 = require("./CustomAPICall");
const DBManager_1 = require("./DBManager");
const HomeUpdate_1 = require("./HomeUpdate");
const AuthenticatedUser_1 = require("./AuthenticatedUser");
var path = require('path');
class HomeUpdateManager {
    constructor(apiInstance) {
        this.dbname = 'home-updates';
        this.expiryCheck = 3600000; //ms
        this.portalAPI = apiInstance;
        try {
            this.cache = DBManager_1.primaryDB.get(this.dbname);
        }
        catch {
            this.cache = { updates: [] };
            this.writeDB();
        }
        this.account_for_expired_updates();
        this.registerAuthenticatedUsers();
        this.portalAPI.registerAPICalls(this.getAPICalls());
        this.expiryAccountant = setInterval(() => { this.account_for_expired_updates(); }, this.expiryCheck);
    }
    registerAuthenticatedUsers() {
        DBManager_1.primaryDB.readCache(path.resolve(__dirname + AuthenticatedUser_1.authUsersPath)).then((cache) => {
            let auth_users = JSON.parse(cache);
            if (auth_users.HomeUpdates && Array.isArray(auth_users.HomeUpdates)) {
                this.authenticatedUsers = auth_users.HomeUpdates;
            }
            else {
                throw "Unable to retrieve authenticated Home Updates users.";
            }
        });
    }
    is_user_authenticated(req_user) {
        return true;
        let users = this.authenticatedUsers;
        for (var i = 0; i < users.length; i++) {
            if (req_user.DomainName.toLowerCase() == users[i].domain.toLowerCase()
                && req_user.UserName.toLowerCase() == users[i].username.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    getAPICalls() {
        return [
            new CustomAPICall_1.CustomAPICall(CustomAPICall_1.CUSTOM_API_METHODS.get, '/home-update', (req, res) => { this.get_updates_call(req, res); }),
            new CustomAPICall_1.CustomAPICall(CustomAPICall_1.CUSTOM_API_METHODS.post, '/home-update/write', (req, res) => { this.write_updates_call(req, res); }),
            new CustomAPICall_1.CustomAPICall(CustomAPICall_1.CUSTOM_API_METHODS.get, '/auth-users', (req, res) => { res.sendFile(path.resolve(__dirname + "/../databases/auth-users.json")); }),
            new CustomAPICall_1.CustomAPICall(CustomAPICall_1.CUSTOM_API_METHODS.get, '/home-update/new-template', (req, res) => {
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
    }
    async account_for_expired_updates() {
        let updates = this.get_updates();
        let now = new Date().getTime();
        let del = [];
        updates.forEach((update) => {
            if (new Date(update.expiry_date).getTime() <= now) {
                del.push(update);
            }
        });
        del.forEach((del_update) => {
            let i = updates.indexOf(del_update);
            updates.splice(i, 1);
        });
        if (del.length) {
            this.set_updates(HomeUpdate_1.HomeUpdate.fromArray(updates));
        }
    }
    writeDB() {
        DBManager_1.primaryDB.put(this.dbname, this.cache);
    }
    set_updates(new_updates) {
        this.cache.updates = HomeUpdate_1.HomeUpdate.toArray(new_updates);
        this.writeDB();
    }
    get_updates() {
        return this.cache.updates;
    }
    get_updates_call(req, res) {
        res.send(`${JSON.stringify(this.get_updates())}`);
    }
    write_updates_call(req, res) {
        if (!this.is_user_authenticated(req.ntlm)) {
            res.sendStatus(401);
        }
        else {
            let new_updates = req.body;
            if (new_updates.empty && new_updates.updates == undefined) {
                new_updates.updates = [];
            }
            if (new_updates.updates) {
                this.set_updates(HomeUpdate_1.HomeUpdate.fromArray(new_updates.updates));
                res.sendStatus(200);
            }
            else {
                res.sendStatus(400);
            }
        }
    }
}
exports.HomeUpdateManager = HomeUpdateManager;
