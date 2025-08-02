
namespace cuteBot {

    let joyStickInit = false;

    /**
     * Initializes the cuteBot with default settings and prepares it for operation.
     */
    //% blockId=cuteBot_init block="initialize cuteBot"
    //% weight=1
    //% group="Initialization"
    export function init(){


        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);

        basic.showIcon(IconNames.Confused);
        basic.pause(100);
        let [channel, group] = getRadioSetupFromIR();
        
        serial.writeLine("Initialize radio with Channel: " + channel + ", Group: " + group);
        radiop.init(channel, group);
        radiop.initBeacon("cutebot");
        
        if (!joyStickInit) {
            joyStickInit = true;
            joystickp.onReceive(cutecontrol.control);
        }

        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);
        basic.showIcon(IconNames.Happy);
        basic.pause(2000);
        basic.clearScreen();
        cuteBot.closeheadlights()

    }

    /**
     * Gets the radio setup information from the IR receiver.
     * @returns A tuple containing the channel and group.
     */
    export function getRadioSetupFromIR() : [number, number] {

        let channel = undefined;
        let group = undefined;

        let timeoutCount = 0;

        while (true) {
            basic.showIcon(IconNames.Target);
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);

            if( address == 0){
                //serial.writeLine("Bad address from IR");

                if (timeoutCount > 0) {
                    timeoutCount -= 1;
                } else if (channel != undefined && timeoutCount == 0) {
                    cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
                    serial.writeLine("Timeout waiting for IR command");
                    channel = undefined;
                    group = undefined;
                }
                continue;
                
            }
            

            let rcvChannel = (command >> 8) & 0xFF;
            let rcvGroup = command & 0xFF;

            if ( channel === undefined && group === undefined) {
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Yellow);
                serial.writeLine("Received initial channel setup: " + rcvChannel + ", " + rcvGroup);
                timeoutCount = 5;
                channel = rcvChannel;
                group = rcvGroup;
            } else if (channel != rcvChannel || group != rcvGroup) {
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
                serial.writeLine("Channel or group mismatch: " + channel + ", " + group + " != " + rcvChannel + ", " + rcvGroup);
                basic.showIcon(IconNames.No);
                channel = undefined;
                group = undefined;
            } else {
                serial.writeLine("Radio Channel: " + channel + ", Group: " + group);
                basic.showIcon(IconNames.Yes);
                return [channel, group];
            }
        }

    }



}