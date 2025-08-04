
namespace cuteBot {


    let lastSpeed = 0;

    function map(input:number, minIn:number, maxIn:number, minOut:number, maxOut:number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }


    /**
     * Adjust Turn speed. The default linear turn speed is too fast for useful control
     * */
    export function adjustTurnSpeed(turnSpeed: number, forwardSpeed: number): number {
        
        let sign = turnSpeed < 0 ? -1 : 1;
        let absSpeed = Math.abs(turnSpeed);
        
        // for inputs from 0 to 85, scale output from 0 to 60
        // for inputs from 85 to 100, scale output from 60 to 100
        if (absSpeed <= 80) {
            absSpeed = map(absSpeed, 0, 85, 0, 60);
        } else {
            absSpeed = map(absSpeed, 85, 100, 60, 100);
        }

        turnSpeed =  sign * absSpeed;

        // Now adjust the turn speed so it is less sensitive at 
        // faster forward wheel
        // Reduce turn speed proportional to forward speed
        // At max forward speed (100), turn speed is reduced to 1/3
        let forwardFactor = Math.abs(forwardSpeed) / 100; // 0 to 1
        let turnReduction = 1 - (forwardFactor * 2 / 3); // 1 to 1/3

        return turnSpeed * turnReduction;

    }

    // Now adjust the turn speed so it is less sensitive at 
    // faster forward wheel
    export function adjustTurnForForward(turnSpeed: number, forwardSpeed: number): number {
        // Reduce turn speed proportional to forward speed
        // At max forward speed (100), turn speed is reduced to 1/3
        let forwardFactor = Math.abs(forwardSpeed) / 100; // 0 to 1
        let turnReduction = 1 - (forwardFactor * 2/3); // 1 to 1/3
        
        return turnSpeed * turnReduction;
    }

    /**
     * Adjust the speed to avoid very large changes. For each update, the speed should not change more than 20.
     */
    export function adjustSpeed(speed: number): number {

        if (false) {
            let diff = speed - lastSpeed;
            let aDiff = Math.min(Math.abs(diff), 20);

            let newSpeed = lastSpeed + (diff < 0 ? -aDiff : aDiff);
            lastSpeed = newSpeed;
            return newSpeed;
        }

        return speed;
    }

    export function wheelSpeeds(x: number, y: number) : [number, number] {

        // Convert from 0-1023 to -100 to 100
        let forwardSpeed = adjustSpeed(map(y - 0, 0, 1023, 0, 200) - 100) // forward/reverse
        let turnSpeed = adjustTurnSpeed(map(x - 0, 0, 1023, 200, 0) - 100, forwardSpeed) // left/right

        let lw_speed = forwardSpeed + turnSpeed
        let rw_speed = forwardSpeed - turnSpeed

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