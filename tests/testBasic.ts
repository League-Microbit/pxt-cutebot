

namespace bottest {
    export function testBasic(){

        basic.showLeds(`
            . . . # .
            # . # . #
            # . # . #
            # . # . #
            . # . . .
            `)
            
        basic.forever(function () {
            cuteBot.motors(30, 90)
            basic.pause(1500)
            cuteBot.motors(90, 30)
            basic.pause(1500)
        })

    }

    export function testInit(){
        cuteBot.init();
        basic.showIcon(IconNames.Happy);
    }

    export function testAnimate(){
        
        const allLights = cuteBot.RGBLights.ALL;
        const red = cuteBot.Colors.Red;
        const green = cuteBot.Colors.Green;
        const blue = cuteBot.Colors.Blue;


        animate.init();


        animate.add(new animate.AnimateHeadLight(allLights, red, 500));
        animate.add(new animate.AnimateHeadLight(allLights, green, 500));
        animate.add(new animate.AnimateHeadLight(allLights, blue, 500));
        serial.writeLine("Added animations");

        basic.pause(4000);

        animate.clear();
        animate.redThrob();

        basic.pause(4000);
        animate.clear();

        animate.julyFourth()
        
        animate.waitUntilDone();

        animate.success(4);



        basic.pause(10000);

    }
}