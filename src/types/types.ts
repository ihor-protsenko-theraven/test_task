import {PassengerView} from "../renderer/PassengerView";
import {FloorView} from "../renderer/FloorView";

export type PassengersQueueMap = Map<number, PassengerView[]>;
export type PassengerViewMap = Map<number, PassengerView>;
export type FloorsViewMap = Map<number, FloorView>;
export type TimeoutMap = Map<number, ReturnType<typeof setTimeout>>;
