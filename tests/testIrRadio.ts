

namespace bottest {
    /* Basic test of recieveing IR radio signals for pairing radio */
    export function testRadioChannelSetupHandler() {
        leagueir.onNecReceived(DigitalPin.P16, function (address: number, command: number) {
            if (address == leagueir.Address.RadioChannel) {
                let channel = (command >> 8) & 0xFF;
                let group = command & 0xFF;
                
                serial.writeLine("Radio Channel: " + channel + ", Group: " + group);
                basic.showIcon(IconNames.Happy);
            } else {
                serial.writeLine("Unknown address: " + address);
                basic.showIcon(IconNames.Sad);
            }
            basic.pause(100);
            basic.clearScreen();
        });
    }

    export function testRadioChannelSetup() {
        while (true) {
            let [channel, group] = cutecom.waitForRadioChannelSetup();
            serial.writeLine("TRCS Channel: " + channel + ", Group: " + group);
            pause(100);
        }
    }

}