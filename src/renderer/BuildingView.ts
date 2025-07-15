import {APP_SETTINGS} from '../config/app-settings.config';
import {FloorView} from './FloorView';
import {ElevatorView} from './ElevatorView';
import {BUILDING_CONFIG} from "../config/building.config";
import {FLOOR_CONFIG} from "../config/floor.config";
import {Application, Container, Graphics} from "pixi.js";
import {FloorsViewMap} from "../types/types";
import {PassengerView} from "./PassengerView";
import {IBuilding, IFloor} from "../interfaces/interfaces";

export class BuildingView {
    private readonly _app: Application;
    private readonly _buildingModel: IBuilding;
    private readonly _floorViews: FloorsViewMap = new Map();
    public elevatorView: ElevatorView;
    private readonly _borderGraphics: Graphics;
    private readonly _floorsLayer: Container;

    constructor(app: Application, building: IBuilding) {
        this._app = app;
        this._buildingModel = building;
        this._borderGraphics = new Graphics();

        this._borderGraphics.lineStyle(
            BUILDING_CONFIG.BORDER.THICKNESS,
            BUILDING_CONFIG.BORDER.COLOR);

        this._borderGraphics.drawRect(
            BUILDING_CONFIG.BORDER.ORIGIN_X,
            BUILDING_CONFIG.BORDER.ORIGIN_Y,
            BUILDING_CONFIG.WIDTH,
            FLOOR_CONFIG.HEIGHT * APP_SETTINGS.FLOORS_COUNT);

        this._app.stage.addChildAt(this._borderGraphics, 0);

        this._floorsLayer = new Container();
        this._app.stage.addChildAt(this._floorsLayer, 1);
        this._buildingModel.floors.forEach((floor: IFloor): void => {
            const fv = new FloorView(floor.floorNumber);
            this._floorViews.set(floor.floorNumber, fv);
            this._floorsLayer.addChild(fv.container);
        });

        this.elevatorView = new ElevatorView(
            this._buildingModel.elevator.currentFloor,
            APP_SETTINGS.FLOORS_COUNT,
            FLOOR_CONFIG.HEIGHT
        );
        this._app.stage.addChild(this.elevatorView.elevatorContainer);
    }

    public addPassengerToStage(passengerView: PassengerView): void {
        this._app.stage.addChild(passengerView.passengerContainer);
    }

}

