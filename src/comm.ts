
namespace cutecom {

    export function init(){
        radiop.init();

        leagueir.onNecReceived(DigitalPin.P16, handlNecIrMessage); 

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



}