#!/usr/bin/env node

/**
 * Test program for SpeedController class
 * Generates a grid of (x,y) values and tests the wheel speed calculations
 */

const fs = require('fs');
const path = require('path');

// Simple implementation of the map function
function map(input, minIn, maxIn, minOut, maxOut) {
    return (input - minIn) * (maxOut - minOut) / (maxIn - minIn) + minOut;
}

// SpeedController class (simplified for Node.js testing)
class SpeedController {
    constructor(tsInBp = 80, tsOutBp = 60) {
        this.lastSpeed = 0;
        this.tsInBp = tsInBp;
        this.tsOutBp = tsOutBp;
        this.enableSpeedSmoothing = false;
    }

    adjustTurnSpeed(turnSpeed, forwardSpeed) {
        let sign = turnSpeed < 0 ? -1 : 1;
        let absSpeed = Math.abs(turnSpeed);
        
        // for inputs from 0 to 80, scale output from 0 to 60
        // for inputs from 80 to 100, scale output from 60 to 100
        if (absSpeed <= this.tsInBp) {
            absSpeed = map(absSpeed, 0, this.tsInBp, 0, this.tsOutBp);
        } else {
            absSpeed = map(absSpeed, this.tsInBp, 100, this.tsOutBp, 100);
        }

        turnSpeed = sign * absSpeed;

        // Reduce turn speed proportional to forward speed
        // At max forward speed (100), turn speed is reduced to 1/3
        let forwardFactor = Math.abs(forwardSpeed) / 100; // 0 to 1
        let turnReduction = 1 - (forwardFactor * 2 / 3); // 1 to 1/3

        return turnSpeed * turnReduction;
    }

    adjustSpeed(speed) {
        if (this.enableSpeedSmoothing) {
            let diff = speed - this.lastSpeed;
            let aDiff = Math.min(Math.abs(diff), 20);

            let newSpeed = this.lastSpeed + (diff < 0 ? -aDiff : aDiff);
            this.lastSpeed = newSpeed;
            return newSpeed;
        }

        return speed;
    }

    getWheelSpeeds(x, y) {
        // Convert from 0-1023 to -100 to 100
        let forwardSpeed = this.adjustSpeed(map(y - 0, 0, 1023, 0, 200) - 100); // forward/reverse
        let turnSpeed = this.adjustTurnSpeed(map(x - 0, 0, 1023, 200, 0) - 100, forwardSpeed); // left/right

        let lw_speed = forwardSpeed + turnSpeed;
        let rw_speed = forwardSpeed - turnSpeed;

        return [forwardSpeed, turnSpeed, lw_speed, rw_speed];
    }

    setTurnBreakpoints(inputBp, outputBp) {
        this.tsInBp = inputBp;
        this.tsOutBp = outputBp;
    }
}

// Test function
function testSpeedController() {
    console.log('Testing SpeedController...');
    
    const controller = new SpeedController();
    const results = [];
    
    // Generate grid of x,y values from 0 to 1023 (joystick range)
    const step = 51; // Creates a 20x20 grid (1023/51 ≈ 20)
    
    for (let x = 0; x <= 1023; x += step) {
        for (let y = 0; y <= 1023; y += step) {
            const [forwardSpeed, turnSpeed, lw_speed, rw_speed] = controller.getWheelSpeeds(x, y);
            
            results.push({
                x: x,
                y: y,
                lw_speed: lw_speed,
                rw_speed: rw_speed,
                forward_speed: forwardSpeed,
                turn_speed: turnSpeed
            });
        }
    }
    
    return results;
}

// Convert results to CSV
function resultsToCSV(results) {
    const headers = ['x', 'y', 'lw_speed', 'rw_speed', 'forward_speed', 'turn_speed'];
    const csvLines = [headers.join(',')];
    
    results.forEach(result => {
        const line = headers.map(header => result[header]).join(',');
        csvLines.push(line);
    });
    
    return csvLines.join('\n');
}

// Main execution
function main() {
    const results = testSpeedController();
    const csv = resultsToCSV(results);
    
    const outputFile = path.join(__dirname, 'speed_controller_test.csv');
    fs.writeFileSync(outputFile, csv);
    
    console.log(`Generated ${results.length} test points`);
    console.log(`CSV output saved to: ${outputFile}`);
    console.log('Sample data:');
    console.log(results.slice(0, 5));
}

if (require.main === module) {
    main();
}

module.exports = { SpeedController, testSpeedController };
