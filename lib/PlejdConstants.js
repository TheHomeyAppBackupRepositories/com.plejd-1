"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlejdDeviceCommands = exports.PlejdDeviceCommand_BrightnessAbsolute = exports.PlejdDeviceCommand_OnOff = exports.PlejdDeviceTraits = exports.PlejdDeviceTrait_Scene = exports.PlejdDeviceTrait_Brightness = exports.PlejdDeviceTrait_OnOff = exports.PlejdDeviceTypes = exports.PlejdDeviceType_Scene = exports.PlejdDeviceType_Outlet = exports.PlejdDeviceType_Light = exports.PlejdApiIntents = exports.PlejdApiIntent_Disconnect = exports.PlejdApiIntent_Execute = exports.PlejdApiIntent_Query = exports.PlejdApiIntent_Sync = exports.PlejdDeviceStore_MarkedAsRemoved = exports.PlejdDeviceStore_ServiceId = exports.PlejdDeviceStore_DeviceData = void 0;
exports.PlejdDeviceStore_DeviceData = 'device_data';
exports.PlejdDeviceStore_ServiceId = 'service_id';
exports.PlejdDeviceStore_MarkedAsRemoved = 'marked_as_removed';
exports.PlejdApiIntent_Sync = 'action.devices.SYNC';
exports.PlejdApiIntent_Query = 'action.devices.QUERY';
exports.PlejdApiIntent_Execute = 'action.devices.EXECUTE';
exports.PlejdApiIntent_Disconnect = 'action.devices.DISCONNECT';
exports.PlejdApiIntents = [
    exports.PlejdApiIntent_Sync,
    exports.PlejdApiIntent_Query,
    exports.PlejdApiIntent_Execute,
    exports.PlejdApiIntent_Disconnect
];
exports.PlejdDeviceType_Light = 'action.devices.types.LIGHT';
exports.PlejdDeviceType_Outlet = 'action.devices.types.OUTLET';
exports.PlejdDeviceType_Scene = 'action.devices.types.SCENE';
exports.PlejdDeviceTypes = [
    exports.PlejdDeviceType_Light,
    exports.PlejdDeviceType_Outlet,
    exports.PlejdDeviceType_Scene,
];
exports.PlejdDeviceTrait_OnOff = 'action.devices.traits.OnOff';
exports.PlejdDeviceTrait_Brightness = 'action.devices.traits.Brightness';
exports.PlejdDeviceTrait_Scene = 'action.devices.traits.Scene';
exports.PlejdDeviceTraits = [
    exports.PlejdDeviceTrait_OnOff,
    exports.PlejdDeviceTrait_Brightness,
    exports.PlejdDeviceTrait_Scene,
];
exports.PlejdDeviceCommand_OnOff = 'action.devices.commands.OnOff';
exports.PlejdDeviceCommand_BrightnessAbsolute = 'action.devices.commands.BrightnessAbsolute';
exports.PlejdDeviceCommands = [
    exports.PlejdDeviceCommand_OnOff,
    exports.PlejdDeviceCommand_BrightnessAbsolute,
];
//# sourceMappingURL=PlejdConstants.js.map