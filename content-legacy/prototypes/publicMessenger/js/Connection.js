var Connection = function( path )
{
    this.path = path ? path : new Path();
    this.messages = [];
    this.start = null;
    this.end = null;
}

Connection.prototype.SendMessage = function( msg )
{
    msg.position = 0;
    this.messages.push(msg);
    msg.connection = this;
}

Connection.prototype.Update = function( deltaTimeMS )
{
    var done = []
    for(var i = this.messages.length - 1; i >= 0; --i)
    {
        this.messages[i].position += this.messages[i].speed;
        if(this.messages[i].position > 1)
        {
            //TODO deal with it
            done.push(this.messages[i]);
            this.messages.splice(i, 1);
        }
    }
    return done;
}

Connection.prototype.Render = function()
{
    if(this.path.lines.length == 0) return;
    
    ctx.strokeStyle = "#F99";
    
    //draw path 
    ctx.beginPath();
    ctx.moveTo( this.path.lines[0].a.x, this.path.lines[0].a.y );
    for(var i in this.path.lines)
    {    
        ctx.lineTo( this.path.lines[i].b.x, this.path.lines[i].b.y ); 
    }
    ctx.stroke();
    
    
    //draw messages
    
    for(var i in this.messages)
    {
        var pos = this.path.GetPosition( this.messages[i].position );
        
        var rad;
        if(this.messages[i].message == "Default Message")
        {
            rad = 2;
            ctx.fillStyle = "#F99";
        }
        else
        {
            rad = 5;
            ctx.fillStyle = "#00b1ff";
        }
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, rad, 0, Math.PI * 2, false);
        ctx.fill();
        
    }
}