import { SmartHomeHub } from './core/SmartHomeHub';
import { TurnOnCommand } from './commands/TurnOnCommand';

// Example usage of the Smart Home System
const hub = SmartHomeHub.getInstance();

// Add devices
hub.addDevice('light', 'light1', 'Living Room Light');
hub.addDevice('thermostat', 'therm1', 'Living Room Thermostat');
hub.addDevice('doorlock', 'lock1', 'Front Door Lock');

// Turn on the light
const livingRoomLight = hub.getDevice('light1');
if (livingRoomLight) {
    const turnOnLightCommand = new TurnOnCommand(livingRoomLight);
    hub.executeCommand(turnOnLightCommand);
    console.log('Living Room Light turned on');
}

// Set thermostat temperature
const livingRoomThermostat = hub.getDevice('therm1');
if (livingRoomThermostat && 'setTemperature' in livingRoomThermostat) {
    (livingRoomThermostat as any).setTemperature(22);
    console.log('Living Room Thermostat set to 22°C');
}

// Lock the front door
const frontDoorLock = hub.getDevice('lock1');
if (frontDoorLock && 'lock' in frontDoorLock) {
    (frontDoorLock as any).lock();
    console.log('Front Door locked');
}

console.log('Smart Home System initialized and running!');  