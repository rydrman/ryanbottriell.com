var Station = function( name, conIn, conOut )
{
    this.name = name;
    this.in = conIn;
    this.out = conOut;
    
    this.lastMessage = "none";
    this.lastRecievedTime = new Date().getTime();
    this.lastSendTime = new Date().getTime();
    this.lastDefaultTime = new Date().getTime();
    
    this.ellapsedSend= 0;
    this.ellapsedDefault= 0;
    this.ellapsedRecieved = 0;
    
    this.top = 0;
    this.left = 0;
    this.width = 10;
    this.height = 10;
}

Station.prototype.Update = function()
{
    var now = new Date().getTime();
    this.ellapsedSend = now - this.lastSendTime;
    this.ellapsedDefault = now - this.lastDefaultTime;
    this.ellapsedRecieved = now - this.lastRecievedTime;
    
    //TODO send auto messages
    
    if(this.ellapsedDefault > 5000 + (Math.random() - 0.5) * 10000)
    {
        var dest;
        var choose = Math.random();
        if(choose < 0.25)
            dest = 'top';
        else if(choose < 0.5)
            dest = 'middle';
        else if(choose < 0.75)
            dest = 'right';
        else
            dest = 'left';

        var msg = new Message( this.name, "Default Message", dest);
        this.SendMessage(msg);
    }
}

Station.prototype.SendMessage = function(message)
{
    this.out.SendMessage( message );
    if(message.message != "Default Message")
        this.lastSendTime = new Date().getTime();
    else
        this.lastDefaultTime = new Date().getTime();
}

Station.prototype.RecieveMessage = function( message )
{
    this.lastMessage = message.message;
    this.lastRecievedTime = new Date().getTime();
}

Station.prototype.InBounds = function( x, y )
{
    return(   this.left < x && this.left + this.width  > x
           && this.top  < y && this.top  + this.height > y)
}

Station.prototype.Render = function()
{
    //ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    //ctx.fillRect(this.left, this.top, this.width, this.height);
}
