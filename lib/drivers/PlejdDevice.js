"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homey_oauth2app_1 = require("homey-oauth2app");
const PlejdConstants_1 = require("../PlejdConstants");
class PlejdDevice extends homey_oauth2app_1.OAuth2Device {
    constructor() {
        super(...arguments);
        this.deviceRemoved = false;
    }
    async onOAuth2Init() {
        this.deviceData = this.getStoreValue(PlejdConstants_1.PlejdDeviceStore_DeviceData);
        // Set the device class
        await this.setClass(this.deviceData.type === PlejdConstants_1.PlejdDeviceType_Light ? 'light' : 'socket').catch(this.error);
        if (this.getStoreValue(PlejdConstants_1.PlejdDeviceStore_MarkedAsRemoved)) {
            await this.markAsRemoved().catch(this.error);
            return;
        }
        await this.updateCurrentState().catch(this.error);
        if (this.hasCapability('onoff')) {
            this.registerCapabilityListener('onoff', async (value) => {
                this.log('Update on/off', value);
                await this.oAuth2Client.executeOnOff(this.deviceData, value);
            });
        }
        if (this.hasCapability('dim')) {
            this.registerCapabilityListener('dim', async (value) => {
                this.log('Update dim', value);
                await this.oAuth2Client.executeDim(this.deviceData, Math.round(value * 100));
            });
        }
        await this.updateDeviceSettings().catch(this.error);
        // Request a webhook registration update
        this.getDriver().updateWebhookRegistration().catch(this.error);
    }
    // Needs to be this method, as otherwise the session might be gone
    async onDeleted() {
        await this.getDriver().notifyDeviceRemoved(this, this.deviceRemoved).catch(this.error);
        await super.onDeleted();
    }
    async handleStateReport(states) {
        const state = states[this.deviceData.id];
        if (!state) {
            return;
        }
        this.log('Update state from webhook', state);
        if (!this.getAvailable()) {
            // Let's assume the device has become available again, otherwise we wouldn't have the report
            await this.setAvailable();
        }
        await this.updateCapabilityValues(state.on, state.brightness);
    }
    async markAsRemoved() {
        this.deviceRemoved = true;
        await this.setStoreValue(PlejdConstants_1.PlejdDeviceStore_MarkedAsRemoved, true);
        await this.setUnavailable(this.homey.__('device_removed'));
    }
    async syncDevice(syncResponse) {
        if (!syncResponse) {
            // Load devices when not provided
            syncResponse = await this.oAuth2Client.sync();
        }
        // Find the current device
        const deviceData = syncResponse.devices?.find((d) => d.id === this.deviceData.id);
        if (deviceData && syncResponse.agentUserId) {
            this.deviceData = deviceData;
            await this.setStoreValue(PlejdConstants_1.PlejdDeviceStore_ServiceId, syncResponse.agentUserId);
            await this.setStoreValue(PlejdConstants_1.PlejdDeviceStore_DeviceData, deviceData);
            await this.updateDeviceSettings();
            // Restore availability when not available due to previous exclusion
            if (!this.getAvailable()) {
                await this.updateCurrentState();
            }
        }
        else {
            // The device was not found in the sync response, meaning it has been removed
            await this.setUnavailable(this.homey.__('device_removed'));
        }
        return syncResponse;
    }
    getDriver() {
        return this.driver;
    }
    async updateCapabilityValues(on, brightness) {
        // Update the properties
        if (on !== undefined && this.hasCapability('onoff')) {
            await this.setCapabilityValue('onoff', on);
        }
        if (brightness !== undefined && this.hasCapability('dim')) {
            await this.setCapabilityValue('dim', brightness / 100);
        }
    }
    async updateCurrentState() {
        const response = await this.oAuth2Client.queryDevice(this.deviceData);
        const currentState = response.devices[this.deviceData.id];
        if (!currentState) {
            this.error('Query did not return the requested device data');
            return;
        }
        this.log('Query result', currentState);
        // Update availability of the device
        if (!currentState.online) {
            await this.setUnavailable(this.homey.__('device_offline'));
        }
        else if (!this.getAvailable()) {
            await this.setAvailable();
        }
        // Update the properties
        await this.updateCapabilityValues(currentState.on, currentState.brightness);
    }
    async updateDeviceSettings() {
        // Set device information in settings
        const unknownText = this.homey.__('unknown');
        await this.setSettings({
            model: this.deviceData.deviceInfo?.model ?? unknownText,
            sw_version: this.deviceData.deviceInfo?.swVersion ?? unknownText,
            room_hint: this.deviceData.roomHint ?? unknownText,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(...args) {
        super.log(`[d:${this.deviceData.id}]`, ...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(...args) {
        super.error(`[d:${this.deviceData.id}]`, ...args);
    }
}
exports.default = PlejdDevice;
//# sourceMappingURL=PlejdDevice.js.map