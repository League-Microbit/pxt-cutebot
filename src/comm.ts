
namespace cutecom {

    export function init(){

        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);
        basic.showIcon(IconNames.Confused);
        basic.pause(100);
        let [channel, group] = getRadioSetupFromIR();
        
        serial.writeLine("Initialize radio with Channel: " + channel + ", Group: " + group);
        radiop.init(channel, group);

        negotiate.init("cutebot");
        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);
        basic.pause(500);
        cuteBot.closeheadlights();
    }

    /**
     * Gets the radio setup information from the IR receiver.
     * @returns A tuple containing the channel and group.
     */
    export function getRadioSetupFromIR() : [number, number] {

        let channel = undefined;
        let group = undefined;

        while (true) {
            basic.showIcon(IconNames.Target);
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);

            if( address == 0){0
                serial.writeLine("Bad address from IR");
                continue;
            }

            let rcvChannel = (command >> 8) & 0xFF;
            let rcvGroup = command & 0xFF;

            if ( channel === undefined && group === undefined) {
                serial.writeLine("Received initial channel setup: " + rcvChannel + ", " + rcvGroup);
                channel = rcvChannel;
                group = rcvGroup;
            } else if (channel != rcvChannel || group != rcvGroup) {
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