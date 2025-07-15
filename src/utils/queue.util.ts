import {APP_SETTINGS} from '../config/app-settings.config';
import {FLOOR_CONFIG} from '../config/floor.config';
import {PASSENGER_SETTINGS} from '../config/passenger.config';

export function getQueuePosition(floor: number, index: number): { targetX: number; targetY: number } {
    const y: number = (APP_SETTINGS.FLOORS_COUNT - 1 - floor) * FLOOR_CONFIG.HEIGHT + PASSENGER_SETTINGS.PASSENGER_Y_OFFSET;
    const x: number = PASSENGER_SETTINGS.QUEUE.START_X + index * (PASSENGER_SETTINGS.PASSENGER_WIDTH + PASSENGER_SETTINGS.QUEUE.SPACING);
    return {targetX: x, targetY: y};
}
