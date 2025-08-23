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
// Cutebot Receiver
// 
// This program receives Joystick message from the Joystick transmitter and
// 
// controls the robot.

serial.writeLine('== Cutebot Main ==')
cuteBot.setUniqueHeadlights()
cuteBot.setUniqueRunningLights()
cuteBot.init()

// Send BotStatus with giraffe+middle C on A, cow+A440 on B (local device only)
input.onButtonPressed(Button.A, function () {
    const bs = new radiop.BotStatePayload();
    bs.setIcon(IconNames.Giraffe);
    bs.setOctaveNote(4, 1); // Middle C
    bs.duration = 50; // ~500ms
    bs.send();
});

input.onButtonPressed(Button.B, function () {
    const bs = new radiop.BotStatePayload();
    bs.setIcon(IconNames.Cow);
    bs.setOctaveNote(4, 10); // A 440
    bs.duration = 50;
    bs.send();
});
