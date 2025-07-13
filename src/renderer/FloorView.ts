import * as PIXI from 'pixi.js';
import {APP_SETTINGS} from '../config/app-settings.config';
import {ELEVATOR_CONFIG} from '../config/elevator.config';
import {FLOOR_CONFIG} from "../config/floor.config";
import {BUILDING_CONFIG} from "../config/building.config";

export class FloorView {
    public readonly floorNumber: number;
    public readonly container: PIXI.Container;
    private readonly _corridorLine: PIXI.Graphics = new PIXI.Graphics();
    private readonly _floorLine: PIXI.Graphics = new PIXI.Graphics();
    private readonly _floorLabel: PIXI.Text;

    constructor(floorNumber: number) {
        this.floorNumber = floorNumber;
        this.container = new PIXI.Container();

        const offset_Y = (APP_SETTINGS.FLOORS_COUNT - 1 - floorNumber) * FLOOR_CONFIG.HEIGHT;
        this.container.position.set(0, offset_Y);

        // corridor
        this._corridorLine.lineStyle(FLOOR_CONFIG.LINE.THICKNESS, FLOOR_CONFIG.LINE.COLOR);
        const corridorStartX = ELEVATOR_CONFIG.WIDTH + FLOOR_CONFIG.LINE.CORRIDOR_OFFSET_X;
        this._corridorLine.moveTo(corridorStartX, 0);
        this._corridorLine.lineTo(BUILDING_CONFIG.WIDTH, 0);
        this.container.addChild(this._corridorLine);

        // floor
        this._floorLine.lineStyle(FLOOR_CONFIG.LINE.THICKNESS, FLOOR_CONFIG.LINE.COLOR);
        const floorStartX = corridorStartX;
        const floorY = FLOOR_CONFIG.HEIGHT;
        this._floorLine.moveTo(floorStartX, floorY);
        this._floorLine.lineTo(BUILDING_CONFIG.WIDTH, floorY);
        this.container.addChild(this._floorLine);

        // label
        this._floorLabel = new PIXI.Text(`Level ${floorNumber + 1}`, {
            fontSize: FLOOR_CONFIG.LABEL.FONT_SIZE,
            fill: FLOOR_CONFIG.LABEL.COLOR
        });
        this._floorLabel.anchor.set(
            FLOOR_CONFIG.LABEL.ANCHOR_X,
            FLOOR_CONFIG.LABEL.ANCHOR_Y
        );
        this._floorLabel.position.set(
            BUILDING_CONFIG.WIDTH - FLOOR_CONFIG.LABEL.OFFSET_FROM_RIGHT,
            FLOOR_CONFIG.LABEL.OFFSET_Y
        );
        this.container.addChild(this._floorLabel);
    }
}


