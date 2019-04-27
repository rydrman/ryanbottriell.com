var GameTimer = function()
{
    this.lastUpdate = new Date().getTime();
    this.deltaTimeS = 0;
    this.deltaTimeMS = 16;
    this.framerate = 60;
    this.ellapsedMS = 0;
    this.ellapsedS = 0;
    this.subTicks = {};
}

GameTimer.prototype.tick = function()
{
    var now = new Date().getTime();
    this.deltaTimeMS = now - this.lastUpdate;
    if(this.deltaTimeMS == 0) this.deltaTimeMS = 1;
    this.ellapsedMS += this.deltaTimeMS;
    this.deltaTimeS = this.deltaTimeMS * 0.001;
    this.ellapsedS = this.ellapsedMS * 0.001;
    this.lastUpdate = now;
    this.framerate = 0.9 * this.framerate + 0.1 * (1 / this.deltaTimeS);
}

GameTimer.prototype.startSubTick = function( name )
{
    this.subTicks[name] = {
        start: new Date().getTime(),
        end: 0,
        deltaMS: -1,
        deltaS: -1
    };
}

GameTimer.prototype.endSubTick = function( name )
{
    if(!isDefined(this.subTicks[name]))
    {
        this.startSubTick(name);
    }
    this.subTicks[name].end = new Date().getTime();
    this.subTicks[name].deltaMS = this.subTicks[name].end - this.subTicks[name].start;
    this.subTicks[name].deltaS = this.subTicks[name].deltaMS * 0.001;
}