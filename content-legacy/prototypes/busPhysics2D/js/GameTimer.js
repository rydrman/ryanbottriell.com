var GameTimer = function()
{
    this.lastUpdate = new Date().getTime();
    this.deltaTimeS = 0;
    this.deltaTimeMS = 16;
    this.framerate = 60;
}

GameTimer.prototype.tick = function()
{
    var now = new Date().getTime();
    this.deltaTimeMS = now - this.lastUpdate;
    this.deltaTimeS = this.deltaTimeMS * 0.001;
    this.lastUpdate = now;
}