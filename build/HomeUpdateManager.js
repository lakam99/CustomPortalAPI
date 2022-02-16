"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.HomeUpdateManager = void 0;
var ArkamAPICall_1 = require("./ArkamAPICall");
var DBManager_1 = require("./DBManager");
var HomeUpdate_1 = require("./HomeUpdate");
var HomeUpdateManager = /** @class */ (function () {
    function HomeUpdateManager(apiInstance) {
        var _this = this;
        this.dbname = 'home-updates';
        this.expiryCheck = 3600000; //ms
        this.portalAPI = apiInstance;
        try {
            this.cache = DBManager_1.primaryDB.get(this.dbname);
        }
        catch (_a) {
            this.cache = { updates: [] };
            this.writeDB();
        }
        this.account_for_expired_updates();
        this.calls = [
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/home-update', function (req, res) { _this.get_updates_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.post, '/home-update/write', function (req, res) { _this.write_updates_call(req, res); }),
            new ArkamAPICall_1.ArkamAPICall(ArkamAPICall_1.ARKAM_API_METHODS.get, '/home-update/new-template', function (req, res) {
                res.send("\n                <div class=\"col-sm-4\">\n                  <div class=\"accordion\" id='item-x'>\n                    <div class=\"accordion-item\">\n                      <h2 class=\"accordion-header\" id='itemx-h'>\n                          <p class='display-6 text-center'>New Update</p>\n                      </h2>\n                      <div id=\"itemx-b\" class=\"accordion-collapse collapse show\" data-bs-parent=\"#itemx\">\n                        <div class=\"accordion-body text-center\">\n                            &nbsp;\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                ");
            })
        ];
        this.portalAPI.registerAPICalls(this.calls);
        this.expiryAccountant = setInterval(this.account_for_expired_updates, this.expiryCheck);
    }
    HomeUpdateManager.prototype.account_for_expired_updates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var updates, now, del;
            return __generator(this, function (_a) {
                updates = this.get_updates();
                now = new Date().getTime();
                del = [];
                updates.forEach(function (update) {
                    if (new Date(update.expiry_date).getTime() <= now) {
                        del.push(update);
                    }
                });
                del.forEach(function (del_update) {
                    var i = updates.indexOf(del_update);
                    updates.splice(i, 1);
                });
                if (del.length) {
                    this.set_updates(HomeUpdate_1.HomeUpdate.fromArray(updates));
                }
                return [2 /*return*/];
            });
        });
    };
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
            res.sendStatus(200);
        }
        else {
            res.sendStatus(400);
        }
    };
    return HomeUpdateManager;
}());
exports.HomeUpdateManager = HomeUpdateManager;
