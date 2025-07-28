
namespace cutecom {

    export function init(){

        let [channel, group] = waitForRadioChannelSetup(-1);
        radiop.init(channel, group);

        //leagueir.onNecReceived(DigitalPin.P16, handlNecIrMessage); 

    }

    /* Top level handler for NEC IR messages */
    function handlNecIrMessage(address: number, command: number) {
        if (address == leagueir.Address.RadioChannel) {
            let channel = (command >> 8) & 0xFF;
            let group = command & 0xFF;
            serial.writeLine("Radio Channel: " + channel + ", Group: " + group);  
            radiop.setChannel(channel);
            radiop.setGroup(group); 
            basic.showIcon(IconNames.Triangle);         
        }
    }

    /**
     * Waits for a radio channel setup message from the IR port and returns the
     * channel and group.
     * @param timeout The maximum time to wait for the message in milliseconds.
     * @returns A tuple containing the channel and group.
     */
    //%
    export function waitForRadioChannelSetup(timeout?: number) : [number, number] {

        if (timeout === undefined) {
            timeout = 5000; // Default timeout of 2 seconds
        }

        let forever = false; 
        if ( timeout < 0 ) {
            timeout = 1000; 
            forever = true;
        }

        while(true){
            negotiate.radioIcon.showImage(0)
            let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, timeout);


            if (address == leagueir.Address.RadioChannel) {
                let channel = (command >> 8) & 0xFF;
                let group = command & 0xFF;
                serial.writeLine("Address: " + address + ", Command: " + command);
                serial.writeLine("Radio Channel: " + channel + ", Group: " + group);
                basic.clearScreen();
                return [channel, group];
            } else {
                serial.writeLine("Received address: " + address + ", command: " + command);
            }

            if (!forever) {
                return [0, 0]; // Return default values if no valid message received
            }
        }

    }

}