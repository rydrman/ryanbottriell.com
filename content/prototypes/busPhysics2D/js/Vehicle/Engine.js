var Engine = function()
{
    this.name = "DD 8v71";
    
    this.throttle = 0.01;
    
    this.RPM = 600;
    
    this. torqueMap = {
        500 : 949.0,
        750 : 1003.3,
        1000 : 1023.6,
        1250 : 1043.9,
        1500 : 1023.6,
        1750 : 1003.3,
        2000 : 949.0
    };
}

Engine.prototype.GetRPM = function()
{
    
}

Engine.prototype.GetTorque = function()
{
    return this.throttle * this.TorqueLookup() * 0.7; //assumed efficiency
}

Engine.prototype.TorqueLookup = function()
{
    var lastRPM = 0,
        lastT = 0;
    for(var i in this.torqueMap)
    {
        var curRPM = parseInt(i);
        if( curRPM > this.rpm )
        {
            var pos = (this.rpm - lastRPM) / ( curRPM - lastRPM );
            return lastT + (this.torqueMap[i] - lastT) * pos;
        }
        lastRPM = curRPM;
        lastT = this.torqueMap[i];
    }
    return lastT;
}