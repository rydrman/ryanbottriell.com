var Transmission = function()
{
    this.name = "trans1";
    
    this.clutch = 0;
    this.numGears = 4;
    this.ratios = [3.69, 2.02, 1.38, 1.0];
    this.reverseRatio = -6.04;
    this.gear = 1;
}

Transmission.prototype.GetRatio = function()
{
    if(this.gear == -1)
        return this.reverseRatio;
    return this.ratios[this.gear-1];
}

Transmission.prototype.GetTorque = function( tEngine )
{
    return this.GetRatio() * tEngine * this.clutch;
}