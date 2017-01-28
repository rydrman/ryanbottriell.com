var Planet = function( options )
{
    this.radius = options.radius ? options.radius : 1;
    this.position = options.position ? new Vector2().copy(options.position) : new Vector2();
    this.type = options.type ? options.type : "grassy";
    this.color = options.color ? options.color : "#FFF";
    
    this.items = [];
}

Planet.prototype.addItem = function( item )
{
    // update position
    item.position = item.position.fromRotation(item.planetPosition, this.radius);
    item.planet = this;
    
    // add to array
    this.items.push( item );
}

Planet.prototype.removeItem = function( item )
{
    var index = this.items.indexOf( item );
    
    if(index == -1)
    {
        messenger.display( new Message.Warning("cannot remove item from planet, it does not exist on the planet") );
        return;
    }
    
    this.items.splice(index, 1);
}
