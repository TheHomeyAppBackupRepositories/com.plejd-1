"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const homey_log_1 = require("homey-log");
const homey_oauth2app_1 = require("homey-oauth2app");
const source_map_support_1 = __importDefault(require("source-map-support"));
source_map_support_1.default.install();
class PlejdApp extends homey_oauth2app_1.OAuth2App {
    async onOAuth2Init() {
        try {
            await super.onOAuth2Init();
            this.homeyLog = new homey_log_1.Log({ homey: this.homey });
            this.log('Plejd has been initialized');
        }
        catch (e) {
            this.log('Plejd failed to initialize');
            this.error(e);
        }
    }
}
PlejdApp.OAUTH2_CLIENT = require('./lib/PlejdApi');
PlejdApp.OAUTH2_DEBUG = homey_1.default.env.DEBUG === '1';
module.exports = PlejdApp;
//# sourceMappingURL=app.js.map