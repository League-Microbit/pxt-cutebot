namespace animate {


    let lastPx: number = 0;
    let lastPy: number = 0;
    /**
     * Displays the joystick position on the LED grid.
     * @param p The joystick payload containing x and y values.
     */
    //% blockId=display_joy_position
    //% block="display joystick position from $p"
    //% group="Control"
    export function displayJoyPosition(p: radiop.JoyPayload): void {
        if(p){
            let [px, py] = pixelPosition(p.x, p.y);
            led.unplot(lastPx, lastPy); // Clear the last position
            led.plot(px, py)
            lastPx = px;
            lastPy = py;
        }
    }

    let animations: Animation[] = [];

    class Animation {
        // aniclass is used to check an animation needs to be explicitly
        // stopped before starting a new one
        public aniclass : string = "None"; 
        protected duration: number;

        constructor() {
          
        }
        
        run() {

        }
        stop(){

        }

    }

    export class AnimateHeadLight extends Animation {
        
        private light: cuteBot.RGBLights;
        private color: cuteBot.Colors;

        constructor(light: cuteBot.RGBLights, color: cuteBot.Colors, duration: number) {
            super();
            this.aniclass = "headlights";
            this.light = light;
            this.color = color;
            this.duration = duration;
        }

        run(){
            cuteBot.colorLight(this.light, this.color);
            basic.pause(this.duration);
        }
        stop(){
            cuteBot.closeheadlights();
        }
    }

    export class MelodyAnimation extends Animation {
        private sound: SoundExpression;

        constructor(sound: SoundExpression) {
            super();
            this.aniclass = "melody";
            this.sound = sound;
        }
        run() {
            music.play(music.builtinPlayableSoundEffect(this.sound),
                        music.PlaybackMode.UntilDone)
        }

    }

    export class ShowIcon extends Animation {
        private icon: number;

        constructor(icon: number, duration: number = 1000) {
            super();
            this.aniclass = "showicon";
            this.icon = icon;
        }
        run() {
            basic.showIcon(this.icon);
            basic.pause(this.duration);
        }
        stop() {
            basic.clearScreen();
        }
    }

    export class ShowImage extends Animation {
        private image: Image;

        constructor(image: Image, duration: number = 1000) {
            super();
            this.aniclass = "showimage";
            this.image = image;
            this.duration = duration;
        }
        run() {
            this.image.showImage(0);
            basic.pause(this.duration);
        }
        stop() {
            basic.clearScreen();
        }
    }

    export class Teminate extends Animation {
        private countdown: number;

        constructor(countdown?: number) {
            super();
            this.aniclass = "terminate";
            this.countdown = countdown || 0;
        }

        run() {
            // This animation does nothing, it just stops the current animation

            if(this.countdown <= 0) {
                animate.clear();
            }
            this.countdown -= 1;
        }
    }


    function makeColor(red: number, green: number, blue: number): number{
        return (green << 16) | (red << 8) | blue;
    }

    export function add(animation: Animation) {
        animations.push(animation);
    }

    export function clear() {
        while (animations.length > 0) {
            const anim: Animation = animations.pop();
            if (anim ) {
                anim.stop();
            }
        }
    }

    /**
     * This function is configured in init() to run in the background. 
     */
    function run(){

        let lastAnimation: Animation = null;
        while(true){
            while (animations.length == 0) {
                basic.pause(100);
            }
            serial.writeLine("" + animations.length + " animations running");

            
            for (let anim of animations) {
                if (lastAnimation && lastAnimation.aniclass !== anim.aniclass) {
                    lastAnimation.stop();
                }
                anim.run();
                lastAnimation = anim;
            }
        }
    }

    export function waitUntilDone() {

        while (animations.length > 0) {
            basic.pause(100);
        }
     
    }

    export function init(){
        control.inBackground(run);

    }

    /**
     * Red lights with an intensity that goes up and down, like throbbing
     */
    export function redThrob() {
        const red = cuteBot.Colors.Red;
        const allLights = cuteBot.RGBLights.ALL;

        init();

        for (let i = 0; i < 255; i+= 8) {
            add(new AnimateHeadLight(allLights, makeColor(red, i, 0), 60));
        }
        for( let i = 255; i >= 0; i-= 8) {
            add(new AnimateHeadLight(allLights, makeColor(red, i, 0), 60));
        }
    }

     /**
      * 4th of July animation
      * Red, white, and blue lights, then an explosion sound, then terminates
      */
     export function julyFourth() {
      
        const allLights = cuteBot.RGBLights.ALL;

        add(new AnimateHeadLight(allLights, cuteBot.Colors.Red, 500));
        add(new AnimateHeadLight(allLights, cuteBot.Colors.White, 500));
        add(new AnimateHeadLight(allLights, cuteBot.Colors.Blue, 500));

        add(new MelodyAnimation(soundExpression.spring));
        
        add(new Teminate());
    }

    /** Alternating yellow and red headlights */
    export function warning() {
        const allLights = cuteBot.RGBLights.ALL;

        add(new AnimateHeadLight(allLights, cuteBot.Colors.Yellow, 500));
        add(new AnimateHeadLight(allLights, cuteBot.Colors.Red, 500));
    }

        
    export function success(countdown?: number) {
        const allLights = cuteBot.RGBLights.ALL;

        add(new AnimateHeadLight(allLights, cuteBot.Colors.Green, 500));
        add(new ShowIcon(IconNames.Yes, 500));
        if (countdown) {
            add(new Teminate(countdown));
        } 

        
    }

}
