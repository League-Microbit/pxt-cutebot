
namespace cuteBot {

    let _lastSpeed = 0;



    // Utility function for mapping values
    export function map(input: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }


    /** Convert joystick (x,y) (0..1023) to forward, turn, left wheel, right wheel speeds (-100..100) */
    export function getWheelSpeeds(x: number, y: number): [number, number, number, number] {
        let forwardSpeed = cuteBot.map(y, 0, 1023, 0, 200) - 100;
        let turnSpeed = cuteBot.map(x, 0, 1023, 200, 0) - 100;

        let turnReduction  = cuteBot.map( Math.abs(forwardSpeed), 0, 100, 1/3, 1/6);

        turnSpeed = turnSpeed * turnReduction;

        let lw_speed = forwardSpeed + turnSpeed;
        let rw_speed = forwardSpeed - turnSpeed;

        return [forwardSpeed, turnSpeed, lw_speed, rw_speed];
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