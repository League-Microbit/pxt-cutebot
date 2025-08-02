cuteBot.init()
basic.forever(function () {
    basic.pause(1000)
    cuteBot.openGripper()
    basic.pause(1000)
    cuteBot.closeGripper()
})
