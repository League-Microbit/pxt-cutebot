


serial.writeLine('== PXT Cutebot System Test ==')
basic.pause(500)
cuteBot.setUniqueHeadlights()
cuteBot.setUniqueRunningLights()
cuteBot.init()


radiop.onReceiveJoystickMessage(function (payload) {
    if (payload.buttonPressed(radiop.JoystickButton.C)) {
        cuteBot.colorLight(cuteBot.RGBLights.ALL, 0xff0000)
    } else if (payload.buttonPressed(radiop.JoystickButton.D)) {
        cuteBot.colorLight(cuteBot.RGBLights.ALL, 0x00ff00)
        cuteBot.openGripper()
    } else if (payload.buttonPressed(radiop.JoystickButton.E)) {
        cuteBot.colorLight(cuteBot.RGBLights.ALL, 0xffff00)
        cuteBot.closeGripper()
    } else if (payload.buttonPressed(radiop.JoystickButton.F)) {
        cuteBot.colorLight(cuteBot.RGBLights.ALL, 0x0000ff)
    } else if (payload.buttonPressed(radiop.JoystickButton.Logo)) {
        cuteBot.flashUniqueHeadlights()
    } else {
        cuteBot.setUniqueHeadlights()
    }
    cuteBot.controlMotors(payload)
})



input.onGesture(Gesture.SixG, function () {
    const bs = new radiop.BotStatePayload();
    bs.setIcon(IconNames.Cow);
    bs.setOctaveNote(4, 10); // A 440
    bs.duration = 50; // ~500ms
    bs.send();	
})

