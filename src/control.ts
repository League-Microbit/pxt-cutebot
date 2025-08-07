
namespace cuteBot {

    // Utility function for mapping values
    export function map(input: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }

    /**
     * SpeedController class to manage wheel speeds based on joystick input. It
     * provides methods to adjust turn speed, smooth speed changes, and convert
     * joystick input to wheel speeds.
     */
    export class SpeedController {
        private lastSpeed: number = 0;
        private tsInBp: number; // Turn speed input breakpoint
        private tsOutBp: number; // Turn speed output breakpoint
        private enableSpeedSmoothing: boolean = false;
  
        /**
         * Constructor for SpeedController
         * The breakpoints define two linear ramps, one below the two 
         * breakpoints and one above. 
         * @param tsInBp Turn speed input breakpoint, default is 80
         * @param tsOutBp Turn speed output breakpoint, default is 60   
         */
        constructor(tsInBp: number = 80, tsOutBp: number = 60) {
            this.tsInBp = tsInBp;
            this.tsOutBp = tsOutBp;
        }

        /**
         * Adjust Turn speed. The default linear turn speed is too fast for useful control
         */
        private adjustTurnSpeed(turnSpeed: number, forwardSpeed: number): number {
            let sign = turnSpeed < 0 ? -1 : 1;
            let absSpeed = Math.abs(turnSpeed);
            
            // for inputs from 0 to 80, scale output from 0 to 60
            // for inputs from 80 to 100, scale output from 60 to 100
            if (absSpeed <= this.tsInBp) {
                absSpeed = map(absSpeed, 0, this.tsInBp, 0, this.tsOutBp);
            } else {
                absSpeed = map(absSpeed, this.tsInBp, 100, this.tsOutBp, 100);
            }

            turnSpeed = sign * absSpeed;

            // Reduce turn speed proportional to forward speed
            // At max forward speed (100), turn speed is reduced to 1/3
            let forwardFactor = Math.abs(forwardSpeed) / 100; // 0 to 1
            let turnReduction = 1 - (forwardFactor * 2 / 3); // 1 to 1/3

            return turnSpeed * turnReduction;
        }

        /**
         * Adjust the speed to avoid very large changes. For each update, the
         * speed should not change more than 20.
         */
        private adjustSpeed(speed: number): number {
            if (this.enableSpeedSmoothing) {
                let diff = speed - this.lastSpeed;
                let aDiff = Math.min(Math.abs(diff), 20);

                let newSpeed = this.lastSpeed + (diff < 0 ? -aDiff : aDiff);
                this.lastSpeed = newSpeed;
                return newSpeed;
            }

            return speed;
        }

        /**
         * Primary interface: convert joystick (x,y) to left and right wheel speeds
         */
        public getWheelSpeeds(x: number, y: number): [number, number, number, number] {
            // Convert from 0-1023 to -100 to 100
            let forwardSpeed = this.adjustSpeed(map(y - 0, 0, 1023, 0, 200) - 100); // forward/reverse
            let turnSpeed = this.adjustTurnSpeed(map(x - 0, 0, 1023, 200, 0) - 100, forwardSpeed); // left/right

            let lw_speed = forwardSpeed + turnSpeed;
            let rw_speed = forwardSpeed - turnSpeed;

            return [forwardSpeed, turnSpeed, lw_speed, rw_speed];
        }

        /**
         * Set turn speed breakpoints
         */
        public setTurnBreakpoints(inputBp: number, outputBp: number): void {
            this.tsInBp = inputBp;
            this.tsOutBp = outputBp;
        }
    }

    // Global instance for backward compatibility
    let speedController = new SpeedController();

    /**
     * Set a new speed controller instance
     * @param controller SpeedController instance to use
     */
    export function setSpeedController(controller: SpeedController): void {
        speedController = controller;
    }

    /**
     * Get the current speed controller instance
     */
    export function getSpeedController(): SpeedController {
        return speedController;
    }

    // Legacy function for backward compatibility
    //% blockId=cutebot_wheel_speeds
    //% block="get wheel speeds from joystick x %x y %y"
    //% x.min=0 x.max=1023
    //% y.min=0 y.max=1023
    //% group="Control"
    export function wheelSpeeds(x: number, y: number): [number, number] {
        let [forwardSpeed, turnSpeed, lw_speed, rw_speed] = speedController.getWheelSpeeds(x, y);
        return [lw_speed, rw_speed];
    }

    /**
     *  Converts joystick x and y values to pixel positions on the LED grid.
    */
    export function pixelPosition(x: number, y: number) : [number, number] {
        let px = map(x - 100, 1023, 0, -2, 2) + 2
        let py = map(y - 100, 1023, 0, -2, 2) + 2
        return [px, py];
    }
}