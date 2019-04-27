var VehicleManager = function( ctx )
{
    this.ctx = ctx;
    this.timer = new GameTimer();
    
    this.bus = new Vehicle();
    this.bus.wheels.push(new Wheel(true));
    this.bus.wheels.push(new Wheel(true));
    this.bus.wheels.push(new Wheel(true));
    this.bus.wheels.push(new Wheel(true));
    this.bus.wheels.push(new Wheel());
    this.bus.wheels.push(new Wheel());
    this.bus.wheels.push(new Wheel());
    this.bus.wheels.push(new Wheel());
    
    this.bus.Init();
    
    return;
    
    this.mass = 12000;
    this.position = 0;
    this.velocity = 0;
    this.direction = 1; //no change in 2d
    this.acceleration = 0; //f * m
    
    this.clutch = 0;
    this.accelerator = 0;
    this.brake = 0;
    
    this.engineRPM = 1500;
    this.engineTorque = 1003; //newton meters
    
    this.currentGear = 1;
    this.numGears = 4;
    this.gearRatios = { 0: -6.04, 1: 3.69, 2: 2.02, 3: 1.38, 4: 1.0};
    
    this.diffRatio = 3.7; //stock MC-9?
    
    this.wheelRad = 0.5715; //R24.5
    this.wheelCirc = TWO_PI * this.wheelRad;
    
    this.fDrive = 0; //direction * torque * gear ratio * diff ratio * efficiency / wheel radius
    //these should equal out around 100 kph ?
    this.fDrag = 0; //coeff * v * |v|
    this.fRoll = 0; //coeff * vel
    this.fBrake = 0;
    this.fNet = 0;
    
    this.wheels = [
        new Wheel(1.5, 500),
        new Wheel(3, 500),
        new Wheel(10.5, 500)
    ];
}

VehicleManager.prototype.Update = function()
{
    this.timer.tick();
    
    this.bus.Update( this.timer.deltaTimeS );
    return;
    
    if( input.keyStates[ Input.keyCodes.up ] )
    {
        this.accelerator += 0.05;
        if(this.accelerator > 1) this.accelerator = 1;
    }
    else
    {
        this.accelerator = 0.01;
    }
    
    if( input.keyStates[ Input.keyCodes.down ] )
    {
        this.brake += 0.05;
        if(this.brake > 1) this.brake = 1;
    }
    else
    {
        this.brake = 0;
    }
    
    //TODO calculate engine torque
    this.engineTorque = this.torqueLookup(this.engineRPM) * this.accelerator;
    
    
    this.fDrive = this.clutch * this.direction * this.engineTorque * this.gearRatios[this.currentGear] * this.diffRatio * 0.7 / this.wheelRad;
    
    var cDrag = (0.5 * 0.9 * 7.5 * 1.29);
    this.fDrag = cDrag * this.velocity * this.velocity; //.5 * coeff friction, area, density, v2
    
    this.fRoll = 30 * cDrag * this.velocity; //.5 * coeff friction, area, density, v2
    
    this.fBrake = this.brake * 30000 * this.direction;
    
    this.fNet = this.fDrive - this.fDrag - this.fRoll - this.fBrake;
    
    this.acceleration = this.fNet / this.mass;
    this.velocity = this.velocity + this.acceleration * this.timer.deltaTimeS;
    this.position += this.velocity * this.timer.deltaTimeS;
    
    //backwards for RPM
    var rotPerSecWheel = this.velocity / this.wheelCirc;
    var rotPerSecCrank = rotPerSecWheel * this.gearRatios[this.currentGear] * this.diffRatio;
    var newRPM = rotPerSecCrank * 60;
    
    //tire rot
    for(var i in this.wheels)
    {
        this.wheels[i].rotation = ((this.position % this.wheelCirc) / this.wheelCirc) * TWO_PI;
    }
    
    if(newRPM > 1500)
    {
        if( this.currentGear < this.numGears -1 )
        {
            this.currentGear ++;
        }
        else if(newRPM > 2200)
        {
            newRPM = 2200;
        }
    }
    else if (newRPM < 1000 && this.currentGear > 1)
    {
        this.currentGear --;
    }
    else if(newRPM < 600)
    {
        if(this.brake > 0.5)
        {
            this.clutch = 0;
            newRPM = 600;
        }
        else{
            this.clutch += 1 * this.timer.deltaTimeS;
            if(this.clutch > 1) this.clutch = 1;
            newRPM = 600;
        }
    }
    else{
        this.clutch = 1;
    }
    
    
    this.engineRPM = newRPM;
    
}

VehicleManager.prototype.Render = function()
{
    
    this.ctx.fillStyle = "#FFF";
    
    //engine
    var y = 2,
        x = 20;
    this.ctx.fillText("ENGINE: ", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Throttle: " + this.bus.engine.throttle.toFixed(2), x, 10 * y++);
    this.ctx.fillText("RMP: " + this.bus.engine.RPM.toFixed(2), x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Torque Out: " + this.bus.tEngine.toFixed(2), x, 10 * y++);
    
    //transmission
    y = 2;
    x = 120;
    this.ctx.fillText("TRANSMISSION: ", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Clutch: " + this.bus.transmission.clutch.toFixed(2), x, 10 * y++);
    this.ctx.fillText("Gear: " + this.bus.transmission.gear + " -> " + this.bus.transmission.GetRatio(), x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Torque Out: " + this.bus.tTransmission.toFixed(2), x, 10 * y++);
    
    //diff
    y = 2;
    x = 220;
    this.ctx.fillText("DIFFERENTIAL: ", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Ratio: " + this.bus.differential.ratio, x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Torque Out: " + this.bus.tDifferential.toFixed(2), x, 10 * y++);
    
    //wheel
    y = 2;
    x = 320;
    this.ctx.fillText("DRIVE WHEEL: ", x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Torque In: " + this.bus.wheels[0].torque.toFixed(2), x, 10 * y++);
    this.ctx.fillText("Weight: " + this.bus.wheels[0].weight.toFixed(2), x, 10 * y++);
    this.ctx.fillText("Area: " + this.bus.wheels[0].area.toFixed(4), x, 10 * y++);
    this.ctx.fillText("", x, 10 * y++);
    this.ctx.fillText("Torque Out: " + this.bus.wheels[0].torque.toFixed(2), x, 10 * y++);
    
    
    //this.ctx.fillText(this.timer.framerate, 20, 10 * pos++);
//    this.ctx.fillText("Gas: " + roundTo2(this.accelerator), 20, 10 * pos++);
//    this.ctx.fillText("Brake: " + roundTo2(this.brake), 20, 10 * pos++);
//    this.ctx.fillText("Clutch: " + roundTo2(this.clutch), 20, 10 * pos++);
//    this.ctx.fillText("", 20, 10 * pos++);
//    this.ctx.fillText("Gear: " + this.currentGear, 20, 10 * pos++);
//    this.ctx.fillText("Ratio: " + this.gearRatios[this.currentGear], 20, 10 * pos++);
//    this.ctx.fillText("Engine RPM: " + roundTo2(this.engineRPM), 20, 10 * pos++);
    
//    this.ctx.fillText("", 20, 10 * pos++);
//    this.ctx.fillText("F Drive: " + roundTo2(this.fDrive), 20, 10 * pos++);
//    this.ctx.fillText("F Drag: " + roundTo2(this.fDrag), 20, 10 * pos++);
//    this.ctx.fillText("F Roll: " + roundTo2(this.fRoll), 20, 10 * pos++);
//    this.ctx.fillText("F Brake: " + roundTo2(this.fBrake), 20, 10 * pos++);
//    this.ctx.fillText("", 20, 10 * pos++);
//    this.ctx.fillText("F Net: " + roundTo2(this.fNet), 20, 10 * pos++);
//    this.ctx.fillText("", 20, 10 * pos++);
//    this.ctx.fillText("Acceleration: " + roundTo2(this.acceleration), 20, 10 * pos++);
//    this.ctx.fillText("velocity: " + roundTo2(this.velocity), 20, 10 * pos++);
//    this.ctx.fillText("speed KPH: " + roundTo2(this.velocity * 3.6), 20, 10 * pos++);
//    this.ctx.fillText("position: " + roundTo2(this.position), 20, 10 * pos++);
    
    return;
    
    this.ctx.save();
    this.ctx.translate(0, 300);
    
    //ground
    var offset = -(this.position) % 2;
    for(var i = 0; i <= 1 + canvas.width / meterToPixel(1); i++)
    {
        this.ctx.fillStyle = (i%2) ? "#111" : "#222";
        this.ctx.fillRect( meterToPixel(i + offset), meterToPixel(3.6), 50, 150);
    }
    
    
    //bus
    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(100, 0, meterToPixel(12.19), meterToPixel(3.35));
    //wheels
    for(var i in this.wheels)
    {
        this.ctx.save();
        this.ctx.translate(100 + meterToPixel(this.wheels[i].position.x), meterToPixel(3.15));
        this.ctx.rotate(this.wheels[i].rotation);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(meterToPixel(this.wheelRad), 0); 
        this.ctx.arc(0, 0, meterToPixel(this.wheelRad), 0, TWO_PI, false); 
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    this.ctx.restore();
}

VehicleManager.prototype.torqueLookup = function( rpm )
{
    var torqueMap = 
        {
            500 : 949.0,
            750 : 1003.3,
            1000 : 1023.6,
            1250 : 1043.9,
            1500 : 1023.6,
            1750 : 1003.3,
            2000 : 949.0
        }
    
    var lastRPM = 0,
        lastT = 0;
    for(var i in torqueMap)
    {
        var curRPM = parseInt(i);
        if( curRPM > rpm )
        {
            var pos = (rpm - lastRPM) / ( curRPM - lastRPM );
            return lastT + (torqueMap[i] - lastT) * pos;
        }
        lastRPM = curRPM;
        lastT = torqueMap[i];
    }
    return lastT;
}

function roundTo2(number)
{
    number *= 100;
    number = Math.floor(number);
    number *= 0.01;
    return number;
}

var TWO_PI = Math.PI * 2;

var meterToPixel = function( meter )
{
    return meter * 50;
}
            