import * as PIXI from 'pixi.js';
import * as TWEEN from '@tweenjs/tween.js';
import {Building} from './core/models/Building';
import {APP_SETTINGS} from './config/app-settings.config';
import {BUILDING_CONFIG} from './config/building.config';
import {FLOOR_CONFIG} from './config/floor.config';
import {ElevatorController} from './core/controllers/Elevator.controller';

const app = new PIXI.Application({
    background: APP_SETTINGS.BACKGROUND_COLOR,
    width: BUILDING_CONFIG.WIDTH,
    height: APP_SETTINGS.FLOORS_COUNT * FLOOR_CONFIG.HEIGHT + 100
});

const startBtn = document.getElementById('start-spawn-btn');
const stopBtn = document.getElementById('stop-spawn-btn');


document.body.appendChild(app.view as HTMLCanvasElement);

app.ticker.add(() => {
    TWEEN.update();
});

const building = new Building(
    APP_SETTINGS.FLOORS_COUNT,
    APP_SETTINGS.ELEVATOR_CAPACITY
);

const elevatorController = new ElevatorController(app, building);

startBtn?.addEventListener('click', () => {
    elevatorController.start()
});
stopBtn?.addEventListener('click', () => {
    elevatorController.stopPassengerSpawning();
});

try {
    console.log("Elevator simulation started successfully.");
} catch (error) {
    console.error("Failed to start elevator simulation:", error);
}
