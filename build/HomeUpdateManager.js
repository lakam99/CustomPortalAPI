"use strict";
exports.__esModule = true;
exports.HomeUpdateManager = void 0;
var ArkamAPICall_1 = require("./ArkamAPICall");
var DBManager_1 = require("./DBManager");
var HomeUpdate_1 = require("./HomeUpdate");
var HomeUpdateManager = /** @class */ (function () {
    function HomeUpdateManager(apiInstance) {
        var _this = this;
        this.portalAPI = apiInstance;
        try {
            this.cache = DBManager_1.primaryDB.get(this.dbname);
        }
        catch (_a) {
            this.cache = { updates: [] };
            this.writeDB();
        }
        this.calls = [
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/home-update', function (req, res) { _this.get_updates_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.post, '/home-update/write', function (req, res) { _this.write_updates_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/home-update/new-template', function (req, res) {
                res.send("\n                <div class=\"col-sm-4\">\n                  <div class=\"accordion\" id='item-x'>\n                    <div class=\"accordion-item\">\n                      <h2 class=\"accordion-header\" id='itemx-h'>\n                          <p class='display-6 text-center'>New Update</p>\n                      </h2>\n                      <div id=\"itemx-b\" class=\"accordion-collapse collapse show\" data-bs-parent=\"#itemx\">\n                        <div class=\"accordion-body text-center\">\n                            &nbsp;\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                ");
            })
        ];
        this.portalAPI.registerAPICalls(this.calls);
    }
    HomeUpdateManager.prototype.writeDB = function () {
        DBManager_1.primaryDB.put(this.dbname, this.cache);
    };
    HomeUpdateManager.prototype.set_updates = function (new_updates) {
        this.cache.updates = HomeUpdate_1.HomeUpdate.toArray(new_updates);
        this.writeDB();
    };
    HomeUpdateManager.prototype.get_updates = function () {
        return this.cache.updates;
    };
    HomeUpdateManager.prototype.get_updates_call = function (req, res) {
        res.send("".concat(JSON.stringify(this.get_updates())));
    };
    HomeUpdateManager.prototype.write_updates_call = function (req, res) {
        var new_updates = req.body;
        if (new_updates.empty && new_updates.updates == undefined) {
            new_updates.updates = [];
        }
        if (new_updates.updates) {
            this.set_updates(HomeUpdate_1.HomeUpdate.fromArray(new_updates.updates));
        }
        else {
            res.sendStatus(400);
        }
    };
    return HomeUpdateManager;
}());
exports.HomeUpdateManager = HomeUpdateManager;
