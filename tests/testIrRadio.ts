

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



    export function testNextNecCode() {
       
        while (true) {
            basic.showIcon(IconNames.Confused);
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);

            let commandHigh = (command >> 8) & 0xFF;
            let commandLow = command & 0xFF;

            serial.writeLine("Address: " + address + ",Command: " + command + "  " + irlib.toHex(commandHigh) + " " + irlib.toHex(commandLow));
            pause(100);
        }

    }
}