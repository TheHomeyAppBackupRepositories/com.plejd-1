"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const homey_oauth2app_1 = require("homey-oauth2app");
const nanoid_1 = require("nanoid");
const promise_queue_1 = __importDefault(require("promise-queue"));
const PlejdConstants_1 = require("./PlejdConstants");
class PlejdApiImpl extends homey_oauth2app_1.OAuth2Client {
    constructor() {
        super(...arguments);
        this.requestQueue = new promise_queue_1.default(1, Infinity);
    }
    async onShouldRefreshToken(args) {
        return args.status === 401 || args.status === 403;
    }
    async sync() {
        return this.executeRequest(PlejdConstants_1.PlejdApiIntent_Sync);
    }
    async queryDevice(device) {
        return this.executeRequest(PlejdConstants_1.PlejdApiIntent_Query, {
            devices: [this.convertDevice(device)],
        });
    }
    async executeDim(device, brightness) {
        return this.execute(device, {
            command: PlejdConstants_1.PlejdDeviceCommand_BrightnessAbsolute,
            params: {
                brightness,
            },
        });
    }
    async executeOnOff(device, on) {
        return this.execute(device, {
            command: PlejdConstants_1.PlejdDeviceCommand_OnOff,
            params: {
                on,
            },
        });
    }
    async execute(device, execution) {
        await this.executeRequest(PlejdConstants_1.PlejdApiIntent_Execute, {
            commands: [{
                    devices: [this.convertDevice(device)],
                    execution: [execution],
                }],
        });
    }
    async disconnect() {
        await this.executeRequest(PlejdConstants_1.PlejdApiIntent_Disconnect);
    }
    async executeRequest(intent, payload) {
        const input = {
            intent: intent,
        };
        if (payload !== undefined) {
            input.payload = payload;
        }
        const response = await this.requestQueue
            .add(() => this.post({
            path: '',
            json: {
                requestId: (0, nanoid_1.nanoid)(),
                inputs: [input],
            },
        }));
        return response.payload;
    }
    convertDevice(device) {
        return {
            id: device.id,
            customData: device.customData,
        };
    }
}
PlejdApiImpl.BASE_URL = homey_1.default.env.AUTH_BASE_URL;
PlejdApiImpl.API_URL = `${homey_1.default.env.API_URL}/homey/v1/intent`;
PlejdApiImpl.TOKEN_URL = `${PlejdApiImpl.BASE_URL}/token/oauth2`;
PlejdApiImpl.AUTHORIZATION_URL = `${PlejdApiImpl.BASE_URL}/authorize-client`;
PlejdApiImpl.SCOPES = ['homey'];
module.exports = PlejdApiImpl;
//# sourceMappingURL=PlejdApi.js.map