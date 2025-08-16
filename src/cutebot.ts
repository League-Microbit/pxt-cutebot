/**
 * Functions to Cutebot by ELECFREAKS Co.,Ltd.
 */
//% weight=5 color=#0fbc11  icon="\uf207" 
//% groups=['Initialization', 'Control', 'Lights', 'Servo', 'Tracking', 'Sonar', 'others']
namespace cuteBot {
    const STM8_ADDRESSS = 0x10
    let IR_Val = 0

    let _joyStickInit = false;

    let uColor1 =  cuteBot.getUniqueColor(1);
    let uColor2 =  cuteBot.getUniqueColor(2);

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

        let [channel, group] = getRadioSetupFromIR();
        serial.writeLine(`Cutebot initializing on channel ${channel}, group ${group}`);

        radiop.init(channel, group);
        radiop.initBeacon(radiop.DeviceClass.CUTEBOT);

        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);
        basic.showIcon(IconNames.Happy);
        basic.pause(200);
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
            let [forwardSpeed, turnSpeed, lw_speed, rw_speed] = cuteBot.getWheelSpeeds(payload.x, payload.y);
            cuteBot.motors(lw_speed, rw_speed);
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
        let id = control.deviceSerialNumber();
        let v = id;
        for (let i = 0; i < scrambles; i++) {
            v = radiop.murmur_32_scramble(v);
        }

        // Using HSV to get a broader range of colors while
        // keeping the brightness and saturation high.

        // Derive HSV components from scrambled value
        let hue = v % 360;                               // 0-359
        let sat = 0.6 + (((v >> 3) & 0x3F) / 0x3F) * 0.4; // 0.6 - 1.0
        let val = 0.7 + (((v >> 9) & 0x1F) / 0x1F) * 0.3; // 0.7 - 1.0

        // HSV -> RGB (0-255)
        let c = val * sat;
        let hp = hue / 60;
        let x = c * (1 - Math.abs((hp % 2) - 1));
        let r1 = 0, g1 = 0, b1 = 0;
        if (hp < 1) { r1 = c; g1 = x; }
        else if (hp < 2) { r1 = x; g1 = c; }
        else if (hp < 3) { g1 = c; b1 = x; }
        else if (hp < 4) { g1 = x; b1 = c; }
        else if (hp < 5) { r1 = x; b1 = c; }
        else { r1 = c; b1 = x; }
        let m = val - c;
        let r = Math.round((r1 + m) * 255) & 0xFF;
        let g = Math.round((g1 + m) * 255) & 0xFF;
        let b = Math.round((b1 + m) * 255) & 0xFF;

        return (r << 16) | (g << 8) | b;
    }

    /**
     * Set the running liughts to the Microbit's unique colors.
     */
    //% block="Set unique running lights"
    //% group="Lights"

    export function setUniqueRunningLights() {
        let strip = neopixel.create(DigitalPin.P15, 2, NeoPixelMode.RGB)
        strip.setPixelColor(0, uColor1)
        strip.setPixelColor(1, uColor2)
        strip.show()
    }

    /**
     * Set the headlights to the Microbit's unique colors.
     */
    //%
    //% block="Set unique headlights"
    //% group="Lights"
    export function setUniqueHeadlights(){
        cuteBot.colorLight(cuteBot.RGBLights.RGB_R, uColor1)
        cuteBot.colorLight(cuteBot.RGBLights.RGB_L, uColor2)
    }

    let isBlinking = false;
    /**
     * Flash the headlights with unique colors.
     * This is useful for identifying a specific device in a group.
     */
    //% block="Flash unique headlights"
    //% group="Lights"
    export function flashUniqueHeadlights(){

        if(isBlinking) return; // Prevent multiple calls
        
        control.inBackground(function() {
            isBlinking = true;
           
            for(let i = 0 ; i < 4; i++){
                cuteBot.closeheadlights()
                basic.pause(250)
                setUniqueHeadlights();
                basic.pause(250);
            }
            isBlinking = false;
        })
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
