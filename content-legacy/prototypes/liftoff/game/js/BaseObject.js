var BaseObject = function( item ) 
{
    this.name = item.name;
    this.niceName = item.niceName;
    this.image = new Image();
    
    var self = this;
    
    var loader = new AsyncLoader()
    loader.onComplete = EMPTY_FUNCTION;
    loader.addImageCall( item.img, this.image, function(){self.imageDone()} );
    loader.runCalls();
    
    this.quantity = 1; // stacks
    
    //to know where it is
    //and how to draw it
    this.planet = null;
    this.planetPosition = 0;
    this.position = new Vector2();
    this.rotation = 0;
    
    this.type = item.type ? item.type : "";
    this.actions = item.actions ? item.actions : [""];
    
    this.consume = item.consume ? item.consume : {};
    
    //breakble
    //this.breakable = item.breakable ? true : false;
    this.receivedActions = item.receivedActions ? item.receivedActions : [];
    this.drops = item.drops ? item.drops : [];

    this.bounds = new Rectangle();
    
    this.renderScale = 0.5;
}

BaseObject.prototype.imageDone = function()
{
    this.bounds.x = engine.renderer.pixelToWorld( -this.image.width * 0.5 );
    this.bounds.y = engine.renderer.pixelToWorld( -this.image.height * 0.5 );
    this.bounds.w = engine.renderer.pixelToWorld( this.image.width );
    this.bounds.h = engine.renderer.pixelToWorld( this.image.height );
}

BaseObject.prototype.isInBounds = function( worldPos )
{
    if(this.planet)
    {
        this.position.copy(this.planet.position);
        var offset = new Vector2().fromRotation(this.planetPosition).multiplyScalar(this.planet.radius + this.bounds.h * 0.125);
        this.position.add( offset );
        
        this.rotation = this.planetPosition - Math.PI;
    }
    
    //get offset
    var offset = new Vector2().subVectors( this.position, worldPos );
    
    //convert to local space
    var rot = offset.toRotation();
    rot -= this.rotation;// - Math.PI * 0.5;
    offset.fromRotation( rot, offset.length() / this.renderScale );
    
    if(this.bounds && this.bounds.contains( offset ))
    {
        return true;
    }    
    return false;
}

BaseObject.prototype.init = function() 
{
    
}