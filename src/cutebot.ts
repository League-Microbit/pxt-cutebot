/**
 * Functions to Cutebot by ELECFREAKS Co.,Ltd.
 */
//% weight=5 color=#0fbc11  icon="\uf207" 
//% groups=['Initialization', 'Control', 'Lights', 'Servo', 'Tracking', 'Sonar', 'others']
namespace cuteBot {
    const STM8_ADDRESSS = 0x10
    let IR_Val = 0
    let _initEvents = true
    let _joyStickInit = false;

    /**
    * Unit of Ultrasound Module
    */
    export enum SonarUnit {
        //% block="cm"
        Centimeters,
        //% block="inches"
        Inches
    }
    /**
    * Select the motor on the left or right
    */
    export enum MotorsList {
        //% blockId="M1" block="M1"
        M1 = 0,
        //% blockId="M2" block="M2"
        M2 = 1
    }
    /**
    * Select the servo on the S1 or S2
    */
    export enum ServoList {
        //% block="S1"
        S1 = 0,
        //% block="S2"
        S2 = 1
    }
    /**
    * Select the RGBLights on the left or right
    */
    export enum RGBLights {
        //% blockId="Right_RGB" block="Right_RGB"
        RGB_L = 1,
        //% blockId="Left_RGB" block="Left_RGB"
        RGB_R = 0,
        //% blockId="ALL" block="ALL"
        ALL = 3
    }
    /**
    * Status List of Tracking Modules
    */
    export enum TrackingState {
        //% block="● ●" enumval=0
        L_R_line,

        //% block="◌ ●" enumval=1
        L_unline_R_line,

        //% block="● ◌" enumval=2
        L_line_R_unline,

        //% block="◌ ◌" enumval=3
        L_R_unline
    }
    export enum Direction {
        //% block="Forward" enumval=0
        forward,
        //% block="Backward" enumval=1
        backward,
        //% block="Left" enumval=2
        left,
        //% block="Right" enumval=3
        right
    }
    /**
    * Line Sensor events  MICROBIT_PIN_EVT_RISE
    */
    export enum MbEvents {
        //% block="Found" 
        FindLine = DAL.MICROBIT_PIN_EVT_FALL,
        //% block="Lost" 
        LoseLine = DAL.MICROBIT_PIN_EVT_RISE
    }
    /**
     * Pins used to generate events
     */
    export enum MbPins {
        //% block="Left" 
        Left = DAL.MICROBIT_ID_IO_P13,
        //% block="Right" 
        Right = DAL.MICROBIT_ID_IO_P14
    }

    export enum Colors {
        Red = 0xFF0000,
        Green = 0x00FF00,
        Blue = 0x0000FF,
        Yellow = 0xFFFF00,
        Cyan = 0x00FFFF,
        Magenta = 0xFF00FF,
        White = 0xFFFFFF,
        Black = 0x000000
    }

    /**
    * Initializes the cuteBot with default settings and prepares it for operation.
    */
    //% blockId=cuteBot_init block="initialize cuteBot"
    //% weight=1
    //% group="Initialization"
    export function init() {


        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);

        basic.showIcon(IconNames.Confused);
        basic.pause(100);
        let [channel, group] = getRadioSetupFromIR();

        serial.writeLine("Initialize radio with Channel: " + channel + ", Group: " + group);
        radiop.init(channel, group);
        radiop.initBeacon("cutebot");

        // A default handler that does nothing. The upstream
        // handler will still set lastJoyPayload so we can still 
        // control motors and get buttons. 
        //radiop.onReceiveJoystickMessage(function (p: radiop.JoyPayload) {
        //    serial.writeLine("XXX " + p.str)
        //});
        
        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);
        basic.showIcon(IconNames.Happy);
        basic.pause(2000);
        basic.clearScreen();
        cuteBot.closeheadlights()

    }

    /**
     * Setup default motor control
     */
    //% blockId=cuteBot_defaultMotors block="set default motor control"
    //% group="Initialization"
    export function defaultMotors() {
        if (!_joyStickInit) {
            _joyStickInit = true;
            radiop.onReceiveJoystickMessage(function (p: radiop.JoyPayload) {
                cuteBot.controlMotors(p);
                cuteBot.displayJoyPosition(p);
            });
        }
    }

    /**
     * Default control function for the motors from Joystick messages.
     * @param p Joystick payload, defaults to last received payload if not provided
     */
    //% blockId=control_motors
    //% block="control motors with joystick message $p"
    //% group="Control"
    export function controlMotors(p?: radiop.JoyPayload): void {
        const payload = p || radiop.lastJoyPayload;
        if (payload) {
            let [lw_speed, rw_speed] = wheelSpeeds(payload.x, payload.y);
            cuteBot.motors(lw_speed, rw_speed)
        }
    }


    /**
     * Get the last received joystick payload
     */
    //% blockId=get_last_joy_payload
    //% block="last joystick message"
    //% group="Control"
    export function getLastJoyPayload(): radiop.JoyPayload {
        return radiop.lastJoyPayload;
    }



    let lastPx: number = 0;
    let lastPy: number = 0;
    /**
     * Displays the joystick position on the LED grid.
     * @param p The joystick payload containing x and y values.
     */
    //% blockId=display_joy_position
    //% block="display joystick position from $p"
    //% group="Control"
    export function displayJoyPosition(p: radiop.JoyPayload): void {
        if(p){
            let [px, py] = pixelPosition(p.x, p.y);
            led.unplot(lastPx, lastPy); // Clear the last position
            led.plot(px, py)
            lastPx = px;
            lastPy = py;
        }
    }

    /**
     * TODO: Set the speed of left and right wheels. 
     * @param lspeed Left wheel speed 
     * @param rspeed Right wheel speed
     */
    //% blockId=MotorRun block="Set left wheel speed %lspeed\\% |right wheel speed %rspeed\\%"
    //% lspeed.min=-100 lspeed.max=100
    //% rspeed.min=-100 rspeed.max=100
    //% group="Motors"
    export function motors(lspeed: number = 50, rspeed: number = 50): void {
        let buf = pins.createBuffer(4);
        if (lspeed > 100) {
            lspeed = 100;
        } else if (lspeed < -100) {
            lspeed = -100;
        }
        if (rspeed > 100) {
            rspeed = 100;
        } else if (rspeed < -100) {
            rspeed = -100;
        }
        if (lspeed > 0) {
            buf[0] = 0x01;    //左右轮 0x01左轮  0x02右轮
            buf[1] = 0x02;		//正反转0x02前进  0x01后退
            buf[2] = lspeed;	//速度
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);  //写入左轮
        }
        else {
            buf[0] = 0x01;
            buf[1] = 0x01;
            buf[2] = lspeed * -1;
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);  //写入左轮
        }
        if (rspeed > 0) {
            buf[0] = 0x02;
            buf[1] = 0x02;
            buf[2] = rspeed;
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);  //写入左轮
        }
        else {
            buf[0] = 0x02;
            buf[1] = 0x01;
            buf[2] = rspeed * -1;
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);  //写入左轮
        }

    }
    /**
    * TODO: Full speed operation lasts for 10 seconds,speed is 100.
    * @param dir Driving direction
    * @param speed Running speed
    * @param time Travel time
    */
    //% blockId=cutebot_move_time block="Go %dir at speed%speed\\% for %time seconds"
 
    //% group="Motors"
    export function moveTime(dir: Direction, speed: number, time: number): void {
        if (dir == 0) {
            motors(speed, speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 1) {
            motors(-speed, -speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 2) {
            motors(-speed, speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
        if (dir == 3) {
            motors(speed, -speed);
            basic.pause(time * 1000)
            motors(0, 0)
        }
    }
    /**
    * TODO: full speed move forward,speed is 100.
    */
    //% blockId=cutebot_forward block="Go straight at full speed"

    //% group="Motors"
    export function forward(): void {
        // Add code here
        let buf = pins.createBuffer(4);
        buf[0] = 0x01;
        buf[1] = 0x02;
        buf[2] = 80;
        buf[3] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        buf[0] = 0x02;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
    }


    /**
    * TODO: full speed move back,speed is -100.
    */
    //% blockId=cutebot_back block="Reverse at full speed"

    //% group="Motors"
    export function backforward(): void {
        // Add code here
        let buf = pins.createBuffer(4);
        buf[0] = 0x01;
        buf[1] = 0x01;
        buf[2] = 80;
        buf[3] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        buf[0] = 0x02;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);

    }
    /**
    * TODO: full speed turnleft.
    */
    //% blockId=cutebot_left block="Turn left at full speed"

    //% group="Motors"
    export function turnleft(): void {
        // Add code here
        let buf = pins.createBuffer(4);
        buf[0] = 0x02;
        buf[1] = 0x02;
        buf[2] = 80;
        buf[3] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        buf[0] = 0x01;
        buf[2] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
    }
    /**
    * TODO: full speed turnright.
    */
    //% blockId=cutebot_right block="Turn right at full speed"

    //% group="Motors"
    export function turnright(): void {
        // Add code here
        let buf = pins.createBuffer(4);
        buf[0] = 0x01;
        buf[1] = 0x02;
        buf[2] = 80;
        buf[3] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        buf[0] = 0x02;
        buf[2] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
    }
    /**
    * TODO: stopcar
    */
    //% blockId=cutebot_stopcar block="Stop car immediately"
    //% weight=70
    //% group="Motors"
    export function stopcar(): void {
        motors(0, 0)
    }


    /**
    * TODO: Set LED headlights.
    */
    //% block="Set LED headlights %light color $color"
    //% color.shadow="colorNumberPicker"
    //% group="Lights"

    export function colorLight(light: RGBLights, color: number) {
        let r: number, g: number, b: number = 0
        r = color >> 16
        g = (color >> 8) & 0xFF
        b = color & 0xFF
        singleheadlights(light, r, g, b)
    }
    /**
    * TODO: Select a headlights and set the RGB color.
    * @param R R color value of RGB color
    * @param G G color value of RGB color
    * @param B B color value of RGB color
    */
    //% inlineInputMode=inline
    //% blockId=RGB block="Set LED headlights %light color R:%r G:%g B:%b"
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% group="Lights"
    export function singleheadlights(light: RGBLights, r: number, g: number, b: number): void {
        let buf = pins.createBuffer(4);
        if (light == 3) {
            buf[0] = 0x04;
            buf[1] = r;
            buf[2] = g * 0.38;
            buf[3] = b;
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
            buf[0] = 0x08;
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        }
        else {
            if (light == 0) {
                buf[0] = 0x04;
            }
            if (light == 1) {
                buf[0] = 0x08;
            }
            buf[1] = r;
            buf[2] = g;
            buf[3] = b;
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        }

    }
    /**
    * Close all headlights.
    */
    //% inlineInputMode=inline
    //% block="Turn off all LED headlights"
    //% group="Lights"
    export function closeheadlights(): void {
        let buf = pins.createBuffer(4);
        buf[0] = 0x04;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = 0;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        buf[0] = 0x08;
        pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
    }


    /**
     * Get a unique color based on the device serial number
     * @param scrambles Number of times to scramble the id, defaults to 1
     * 
     */
    //% block="Get unique color with $scrambles scrambles of device Id"
    //% scrambles.min=1 scrambles.max=10  scrambles.defl=1
    //% group="Lights"
    export function getUniqueColor(scrambles: number = 1): number {
        let machineId = control.deviceSerialNumber();

        let scrambledId = machineId;
        for (; scrambles > 0; scrambles--) {
            scrambledId = radiop.murmur_32_scramble(scrambledId);
        }

        let r = (scrambledId & 0xFF0000) >> 16;
        let g = (scrambledId & 0x00FF00) >> 8;
        let b = (scrambledId & 0x0000FF);

        return (r << 16) | (g << 8) | b; // 0xRRGGBB format
    }

    /**
     * Set the running liughts to the Microbit's unique colors.
     */
    //% block="Set unique running lights"
    //% group="Lights"

    export function setUniqueRunningLights() {
        let strip = neopixel.create(DigitalPin.P15, 2, NeoPixelMode.RGB)
        strip.setPixelColor(0, cuteBot.getUniqueColor(1))
        strip.setPixelColor(1, cuteBot.getUniqueColor(2))
        strip.show()
    }

    /**
     * Set the headlights to the Microbit's unique colors.
     */
    //%
    //% block="Set unique headlights"
    //% group="Lights"
    export function setUniqueHeadlights(){
        cuteBot.colorLight(cuteBot.RGBLights.RGB_R, cuteBot.getUniqueColor(1))
        cuteBot.colorLight(cuteBot.RGBLights.RGB_L, cuteBot.getUniqueColor(2))
    }

    /**
     * Flash the headlights with unique colors.
     * This is useful for identifying a specific device in a group.
     */
    //% block="Flash unique headlights"
    //% group="Lights"
    export function flashUniqueHeadlights(){
        control.inBackground(function() {
            for(let i = 0 ; i < 4; i++){
                cuteBot.closeheadlights()
                basic.pause(250)
                setUniqueHeadlights();
                basic.pause(250);
            }
        })
    }



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

    /**
    * Cars can extend the ultrasonic function to prevent collisions and other functions.. 
    * @param Sonarunit two states of ultrasonic module
    */
    //% blockId=ultrasonic block="HC-SR04 Sonar unit %unit"
    //% weight=35
    //% group="Sonar"
    export function ultrasonic(unit: SonarUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(DigitalPin.P8, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P8, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P8, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P8, 0);
        // read pulse
        const d = pins.pulseIn(DigitalPin.P12, PulseValue.High, maxCmDistance * 50);
        switch (unit) {
            case SonarUnit.Centimeters:
                return Math.floor(d * 34 / 2 / 1000);
            case SonarUnit.Inches:
                return Math.floor(d * 34 / 2 / 1000 * 0.3937);
            default:
                return d;
        }
    }
    /**
     * TODO: Set the angle of servo. 
     * @param Servo ServoList 
     * @param angle angle of servo
     */
    //% blockId=cutebot_servo block="Set servo %servo angle to %angle °"
    //% angle.shadow="protractorPicker"
    //% group="Servo"
    //% weight=30
    export function setServo(Servo: ServoList, angle: number = 180): void {
        let buf = pins.createBuffer(4);
        if (Servo == ServoList.S1) {
            buf[0] = 0x05;
            buf[1] = angle;
            buf[2] = 0;
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        }
        else {
            buf[0] = 0x06;
            buf[1] = angle;
            buf[2] = 0;
            buf[3] = 0;			//补位
            pins.i2cWriteBuffer(STM8_ADDRESSS, buf);
        }

    }


    /**
     * Open the gripper of the robot, which must be on port S1
     * @returns void
     */
    //% blockId=cutebot_servo_open block="Open gripper"
    //% group="Servo"
    //%
    export function openGripper(): void {
        cuteBot.setServo(cuteBot.ServoList.S1, 30)
    }

    /**
     * Close the gripper of the robot, which must be on port S1
     * @returns void
     */
    //% blockId=cutebot_servo_close  block="Close gripper"
    //% group="Servo"
    //%
    export function closeGripper(): void {
        cuteBot.setServo(cuteBot.ServoList.S1, 70)
    }



}
