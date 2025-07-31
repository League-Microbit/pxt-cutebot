
namespace cutecontrol {

    let lastPx: number = 0;
    let lastPy: number = 0;

    let lastSpeed = 0;

    function map(input:number, minIn:number, maxIn:number, minOut:number, maxOut:number): number {
        return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
    }


    /**
     * Adjust Turn speed. The default linear turn speed is too fast for useful control
     * */
    export function adjustTurnSpeed(speed: number): number {
        
        let sign = speed < 0 ? -1 : 1;
        let absSpeed = Math.abs(speed);
        
        // for inputs from 0 to 80, scale output from 0 to 50
        // for inputs from 80 to 100, scale output from 50 to 100
        if (absSpeed <= 80) {
            absSpeed = map(absSpeed, 0, 80, 0, 50);
        } else {
            absSpeed = map(absSpeed, 80, 100, 50, 100);
        }

        return sign * absSpeed;
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
        y = map(y - 0, 0, 1023, 0, 200) - 100 // forward/reverse
        x = map(x - 0, 0, 1023, 200, 0) - 100 // left/right

        y = adjustSpeed(y); // Adjust forward/reverse speed
        x = adjustTurnSpeed(x); // Adjust turn speed


        let lw_speed = y + x
        let rw_speed = y - x

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

    export function control(p: joystickp.JoyPayload) : void  {

        let [lw_speed, rw_speed] = wheelSpeeds(p.x, p.y);
        cuteBot.motors(lw_speed, rw_speed)

        let [px, py] = pixelPosition(p.x, p.y);
        led.unplot(lastPx, lastPy); // Clear the last position
        led.plot(px, py)
        lastPx = px;
        lastPy = py;

        // Log the control values
        serial.writeLine(`Control: x=${p.x}, y=${p.y}, lw_speed=${lw_speed}, rw_speed=${rw_speed}, px=${px}, py=${py}`);

    }
}