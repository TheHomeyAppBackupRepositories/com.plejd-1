"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlejdDriver_1 = __importDefault(require("../../lib/drivers/PlejdDriver"));
const PlejdConstants_1 = require("../../lib/PlejdConstants");
class PlejdLightDriver extends PlejdDriver_1.default {
    filterDevice(device) {
        return device.type === PlejdConstants_1.PlejdDeviceType_Light || device.type === PlejdConstants_1.PlejdDeviceType_Outlet;
    }
}
module.exports = PlejdLightDriver;
//# sourceMappingURL=driver.js.map