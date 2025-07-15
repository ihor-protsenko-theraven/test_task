import * as PIXI from 'pixi.js';
import * as TWEEN from '@tweenjs/tween.js';
import {Building} from './core/models/Building';
import {APP_SETTINGS} from './config/app-settings.config';
import {BUILDING_CONFIG} from './config/building.config';
import {FLOOR_CONFIG} from './config/floor.config';
import {ElevatorController} from './core/controllers/Elevator.controller';
import {BuildingView} from './renderer/BuildingView';
import {PassengerFlowController} from './core/controllers/PassengerFlow.controller';
import {SpawnerController} from './core/controllers/Spawner.controller';

const app = new PIXI.Application({
    background: APP_SETTINGS.BACKGROUND_COLOR,
    width: BUILDING_CONFIG.WIDTH,
    height: APP_SETTINGS.FLOORS_COUNT * FLOOR_CONFIG.HEIGHT + 100
});

document.body.appendChild(app.view as HTMLCanvasElement);

const building = new Building(APP_SETTINGS.FLOORS_COUNT, APP_SETTINGS.ELEVATOR_CAPACITY);
const buildingView = new BuildingView(app, building);
const passengerFlowController = new PassengerFlowController(building, buildingView);
const spawnerController = new SpawnerController(building);

const elevatorController = new ElevatorController(
    app,
    building,
    buildingView,
    passengerFlowController,
    spawnerController
);

app.ticker.add((): void => {
    TWEEN.update();
});

const startBtn: HTMLElement | null = document.getElementById('startSpawn');
const stopBtn: HTMLElement | null = document.getElementById('stopSpawn');

if (startBtn) {
    startBtn.onclick = () => {
        elevatorController.startSimulation()
            .then(() => console.log('Starting simulation =)'));
    };
}

if (stopBtn) {
    stopBtn.onclick = () => {
        console.log('Stopping simulation =(');
        elevatorController.stopSimulation();
    };
}
