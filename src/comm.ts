
namespace cuteBot {


    /**
     * Gets the radio setup information from the IR receiver.
     * @returns A tuple containing the channel and group.
     */
    export function getRadioSetupFromIR() : [number, number] {

        let channel = undefined;
        let group = undefined;

        let timeout = 10000; // timeout in milliseconds
        let maxTime = control.millis() + timeout;

        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
        
        while (true) {
            basic.showIcon(IconNames.Target);
            
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, timeout);

            if( address != 0xD00D){
                serial.writeLine("Bad address from IR");

                if (channel != undefined && maxTime < control.millis()) {
                    cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
                    serial.writeLine("Timeout waiting for IR command");
                    channel = undefined;
                    group = undefined;
                    maxTime = control.millis() + timeout; // reset timeout
                }
                pause(100);
                continue;
            }
            
            serial.writeLine("Received IR command: " + irlib.toHex(command) + " from address: " + address);

            let rcvChannel = (command >> 8) & 0xFF;
            let rcvGroup = command & 0xFF;

            if ( channel === undefined && group === undefined) {
                // Set the initial code, then keep waiting for the confirmation.
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Yellow);
                serial.writeLine("Received initial channel setup: " + rcvChannel + ", " + rcvGroup);
                maxTime = control.millis() + timeout; // reset timeout
                channel = rcvChannel;
                group = rcvGroup;
            } else if (channel != rcvChannel || group != rcvGroup) {
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
                serial.writeLine("Channel or group mismatch: " + channel + ", " + group + " != " + rcvChannel + ", " + rcvGroup);
                basic.showIcon(IconNames.No);
                channel = undefined;
                group = undefined;
            } else {
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);
                serial.writeLine("Radio Channel: " + channel + ", Group: " + group);
                basic.showIcon(IconNames.Yes);
                return [channel, group];
            }
        }

    }



}