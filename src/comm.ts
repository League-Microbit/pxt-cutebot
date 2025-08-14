
namespace cuteBot {


    /**
     * Gets the radio setup information from the IR receiver.
     * @returns A tuple containing the channel and group.
     */
    export function getRadioSetupFromIR() : [number, number] {

        let channel = undefined;
        let group = undefined;

        // Read four conseciutive codes, and get at least two of them 
        // to match. 
        function getTwoCodes() : number {
            while(true){
                basic.showIcon(IconNames.Target);
                cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Red);

                let seen: number[] = [];
            
                for (let i = 0; i < 4; i++) {
                    let [address, command] = leagueir.readNecAddressCommand(DigitalPin.P16, 2000);
                    
                    if(address == leagueir.Address.RadioChannel) {

                        if (seen.some((item) => item === command)) {
                            return command;
                        }
                        seen.push(command)
                        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Yellow);
                    }

                    basic.pause(100);
                    
                }
                basic.showIcon(IconNames.No);
                basic.pause(250);
            }
        }

        let command = getTwoCodes();
        channel = (command >> 8) & 0xFF;
        group = command & 0xFF;

        basic.showIcon(IconNames.Yes);
        cuteBot.colorLight(cuteBot.RGBLights.ALL, cuteBot.Colors.Green);

        return [channel, group];

    }



}