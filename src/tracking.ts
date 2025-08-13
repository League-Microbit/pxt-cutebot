namespace cuteBot {

    let _initEvents = true

    /**
    * Judging the Current Status of Tracking Module. 
    * @param state Four states of tracking module
    */
    //% blockId=ringbitcar_tracking block="Tracking state is %state"
    //% weight=50
    //% group="Tracking"
    export function tracking(state: TrackingState): boolean {
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
        let left_tracking = pins.digitalReadPin(DigitalPin.P13);
        let right_tracking = pins.digitalReadPin(DigitalPin.P14);
        if (left_tracking == 0 && right_tracking == 0 && state == 0) {
            return true;
        }
        else if (left_tracking == 1 && right_tracking == 0 && state == 1) {
            return true;
        }
        else if (left_tracking == 0 && right_tracking == 1 && state == 2) {
            return true;
        }
        else if (left_tracking == 1 && right_tracking == 1 && state == 3) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
    * TODO: track one side
    * @param side Line sensor edge 
    * @param state Line sensor status
    */
    //% block="%side line sensor %state"
    //% state.fieldEditor="gridpicker" state.fieldOptions.columns=2
    //% side.fieldEditor="gridpicker" side.fieldOptions.columns=2
    //% weight=45
    //% group="Tracking"
    export function trackSide(side: MbPins, state: MbEvents): boolean {
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone)
        let left_tracking = pins.digitalReadPin(DigitalPin.P13);
        let right_tracking = pins.digitalReadPin(DigitalPin.P14);
        if (side == 113 && state == 2 && left_tracking == 1) {
            return true;
        }
        else if (side == 113 && state == 3 && left_tracking == 0) {
            return true;
        }
        else if (side == 114 && state == 2 && right_tracking == 1) {
            return true;
        }
        else if (side == 114 && state == 3 && right_tracking == 0) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
    * TODO: Runs when line sensor finds or loses.
    */
    //% block="On %sensor| line %event"
    //% sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=2
    //% event.fieldEditor="gridpicker" event.fieldOptions.columns=2
    //% weight=40
    //% group="Tracking"
    export function trackEvent(sensor: MbPins, event: MbEvents, handler: Action) {
        initEvents();
        control.onEvent(<number>sensor, <number>event, handler);
    }

    function initEvents(): void {
        if (_initEvents) {
            pins.setEvents(DigitalPin.P13, PinEventType.Edge);
            pins.setEvents(DigitalPin.P14, PinEventType.Edge);
            _initEvents = false;
        }
    }

}