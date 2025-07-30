namespace animate {

    let animations: Animation[] = [];

    class Animation {

        protected duration: number;

        
        run() {

        }

    }

    export class AnimateHeadLight extends Animation {

        private light: cuteBot.RGBLights;
        private color: cuteBot.Colors;

        constructor(light: cuteBot.RGBLights, color: cuteBot.Colors, duration: number) {
            super();
            this.light = light;
            this.color = color;
            this.duration = duration;
        }

        run(){
            cuteBot.colorLight(this.light, this.color);
            basic.pause(this.duration);
            cuteBot.closeheadlights();
        }
    }

    export function add(animation: Animation) {
        animations.push(animation);
    }

    export function clear() {
        animations = [];
    }

    /**
     * This function is configured in init() to run in the background. 
     */
    function run(){

        while (animations.length == 0) {
            basic.pause(100);
        }

        for (let anim of animations) {
            anim.run();
        }
    }

    export function init(){

        control.inBackground(run);

    }


}