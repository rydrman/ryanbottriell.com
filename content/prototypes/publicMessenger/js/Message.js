var Message = function( origin, message, destination )
{
    this.origin = origin;
    this.destination = destination;
    this.message = message;
    
    this.position = 0;
    this.connection = null;
    
    //this.speed = 0.002 + Math.random() * 0.006;
    this.speed = 0.005;
}

Message.prototype.GetPosition = function()
{
    if(!this.connection) return null;
    
    return this.connection.GetPosition( this.position );
}