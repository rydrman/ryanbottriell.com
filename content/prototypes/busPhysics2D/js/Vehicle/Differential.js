var Differential = function()
{
    this.locked = false;
    
    this.ratio = 3.7;
    
    this.wheels = [];
}

//TODO per wheel
Differential.prototype.GetTorque = function( tTransmission )
{
    return tTransmission * this.ratio;
}

Differential.prototype.ApplyToWheels = function( tTransmission )
{
    var tOut = this.GetTorque( tTransmission );
    
    for(var i in this.wheels)
    {
        this.wheels[i].torque = tOut / this.wheels.length;
    }
    
    return tOut;
}