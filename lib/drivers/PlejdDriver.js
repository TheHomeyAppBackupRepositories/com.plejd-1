"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const homey_oauth2app_1 = require("homey-oauth2app");
const PlejdConstants_1 = require("../PlejdConstants");
class PlejdDriver extends homey_oauth2app_1.OAuth2Driver {
    async onOAuth2Init() {
        await super.onOAuth2Init();
        // Execute sync on driver start, which will wait until all device are ready
        this.refreshDeviceData().catch(this.error);
    }
    getDevices() {
        return super.getDevices();
    }
    async notifyDeviceRemoved(device, wasRemoved) {
        const deviceId = device.getStoreValue(PlejdConstants_1.PlejdDeviceStore_DeviceData).id;
        this.log('Device removed', deviceId);
        if (wasRemoved) {
            // There is no need to continue if the device was already removed on the Plejd side
            return;
        }
        const devicesLeft = this.getDevices().some((d) => d.getStoreValue(PlejdConstants_1.PlejdDeviceStore_DeviceData).id !== deviceId);
        if (devicesLeft) {
            // Schedule update for the webhook registration
            this.updateWebhookRegistration().catch(this.error);
            return;
        }
        // Notify the API about all devices being removed
        this.log('All devices removed');
        await device.oAuth2Client.disconnect().catch(this.error);
    }
    async onPairListDevices({ oAuth2Client }) {
        try {
            const response = await oAuth2Client.sync();
            const agentUserId = response.agentUserId;
            const devices = response.devices;
            if (devices !== undefined && agentUserId) {
                this.log('Plejd devices found!', devices.length);
                return devices
                    .filter(this.filterDevice)
                    .map(device => this.convertDevice(agentUserId, device));
            }
            this.error('No devices returned by API', response);
            return [];
        }
        catch (e) {
            this.error(e);
            return [];
        }
    }
    async updateWebhookRegistration() {
        // Start registration in a couple of seconds to prevent hammering during start
        if (this.webhookTimeout) {
            this.homey.clearTimeout(this.webhookTimeout);
        }
        this.webhookTimeout = this.homey.setTimeout(() => {
            this.registerWebhook().catch(this.error);
            delete this.webhookTimeout;
        }, 1000);
    }
    convertDevice(serviceId, device) {
        const capabilities = [];
        if (device.traits.includes(PlejdConstants_1.PlejdDeviceTrait_OnOff)) {
            capabilities.push('onoff');
        }
        if (device.traits.includes(PlejdConstants_1.PlejdDeviceTrait_Brightness)) {
            capabilities.push('dim');
        }
        const result = {
            name: device.name.name,
            data: {
                id: device.id,
            },
            store: {
                [PlejdConstants_1.PlejdDeviceStore_ServiceId]: serviceId,
                [PlejdConstants_1.PlejdDeviceStore_DeviceData]: device,
            },
            icon: device.type + '.svg',
            capabilities,
        };
        this.log('Plejd device', result);
        return result;
    }
    async onWebhookMessage(message) {
        if (!message.body) {
            return;
        }
        if (message.body.reportState) {
            this.log('Webhook reportState received', message.body.reportState);
            const states = message.body.reportState.payload.devices.states;
            this.getDevices().forEach((d) => d.handleStateReport(states).catch(this.error));
        }
        if (message.body.requestSync) {
            this.log('Webhook requestSync received');
            this.refreshDeviceData().catch(this.error);
        }
        if (message.body.requestDelete) {
            this.log('Webhook requestDelete received');
            this.getDevices().forEach((d) => d.markAsRemoved().catch(this.error));
        }
    }
    async refreshDeviceData() {
        const devices = this.getDevices();
        if (devices.length === 0) {
            // No devices found
            return;
        }
        // Wait for all devices to be ready
        await Promise.all(devices.map((d) => d.ready()));
        // Update the data
        let deviceData = undefined;
        for (const device of devices) {
            deviceData = await device.syncDevice(deviceData);
        }
    }
    async registerWebhook() {
        const serviceIds = [
            ...new Set(this.getDevices()
                .map((d) => d.getStoreValue(PlejdConstants_1.PlejdDeviceStore_ServiceId))
                .filter((id) => id)),
        ];
        if (serviceIds.length === 0) {
            this.log('No identifiers for webhook registration found');
            return;
        }
        // Unregister existing hook
        await this.unregisterWebhook().catch(this.error);
        // Register the new hook
        this.webhook = await this.homey.cloud.createWebhook(homey_1.default.env.WEBHOOK_ID, homey_1.default.env.WEBHOOK_SECRET, {
            $keys: serviceIds,
        }).catch(this.error);
        if (this.webhook) {
            this.webhook.on('message', async (d) => await this.onWebhookMessage(d));
            this.log('Webhook registered', serviceIds);
        }
        else {
            this.log('Webhook registration failed');
        }
    }
    async unregisterWebhook() {
        if (!this.webhook) {
            return;
        }
        this.log('Unregistering existing webhook');
        await this.webhook.unregister().catch(this.error);
        delete this.webhook;
    }
}
exports.default = PlejdDriver;
//# sourceMappingURL=PlejdDriver.js.map