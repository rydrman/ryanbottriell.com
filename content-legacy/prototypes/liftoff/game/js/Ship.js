var Ship = function() {
    // Position
    Player.call(this);

    this.speed = 5; //units per second - 1 unit = 50px
    
    // Variables
    this.damage = 100;
    this.fuel = 100;
    
    this.fuelCapacity = 100;
    
    this.inventorySize = 10;
    
    // parts
    this.parts = {
        engine : null,
        cargo : null,
        science : null,
        engineering : null,
        cockpit : null
    }
    
    this.inMenu = false;
    this.landed = true;
    this.landing = true;;
    
    this.renderScale = 0.35;
    this.renderHeight = 0;
    this.renderWidth = 0;
}
Ship.prototype = new Player();

Ship.prototype.init = function(timer) 
{
    this.timer = timer; // avoid parent class here
    // delete oxygen?
    
    this.timer.startSubTick("damageTick");
    this.timer.startSubTick("fuelTick");
    
    
    //debug throw in some cardboard stuff
    //this.parts.cockpit = new BaseObject( engine.generator.items.bcockpit );
    //this.parts.cargo = new BaseObject( engine.generator.items.bcargobay );
    //this.parts.engine = new BaseObject( engine.generator.items.bthrusters );
}

Ship.prototype.update = function(timer, player) {
    Player.prototype.updateMovement.call(this, timer);
    
    this.timer.endSubTick("damageTick");
    if (this.timer.subTicks["damageTick"].deltaS > 1 && player.comfort == 0) {
        this.damage = Math.max(0, this.damage -1);
        this.timer.startSubTick("damageTick");
    }
    this.timer.endSubTick("fuelTick");
    if (this.timer.subTicks["fuelTick"].deltaS > 2 && this == player.ship) {
        this.fuel = Math.max(0, this.fuel -1);
        this.timer.startSubTick("fuelTick");
    }
}

Ship.prototype.isInBounds = function( pos ) 
{
    //get offset
    var offset = new Vector2().subVectors( this.position, pos );
    
    //convert to local space
    var rot = offset.toRotation();
    rot -= this.rotation;// - Math.PI * 0.5;
    offset.fromRotation( rot, offset.length() );
    
    if(this.bounds && this.bounds.contains( offset ))
    {
        return true;
    }    
    return false;
}

Ship.prototype.launch = function() {
    // Can only happen if the ship has both a cockpit and an engine
    if (this.parts.engine == null || this.parts.cockpit == null)
        return;
    
    // Basically - set the goal vector to outside the gravitational influence
    // Also, move the position slightly along that vector to prevent immediate crashing
    this.goal.copy(this.force.clone().negate().multiplyScalar(50).add(this.position));
    this.position.add(this.goal.clone().sub( this.position).normalize());
    this.landed = false;
    this.landing = false;
}

Ship.prototype.takeDamage = function(amount) {
    this.damage -= amount;
    
    // TODO Check 0 condition
}

Ship.prototype.wrapValues = function( bounds )
{
    //position
    this.position.x = wrap( this.position.x, bounds.x, bounds.x + bounds.w );
    this.position.y = wrap( this.position.y, bounds.y, bounds.y + bounds.h );
    
    //goal
    this.goal.x = wrap( this.goal.x, bounds.x, bounds.x + bounds.w );
    this.goal.y = wrap( this.goal.y, bounds.y, bounds.y + bounds.h );}

Ship.prototype.hasPiece = function(name)
 {
    // TODO
    return true;
}

Ship.prototype.construct = function( renderer )
{
    this.renderHeight = 0;
    this.renderWidth = Number.MAX_VALUE;
    for(var i in this.parts)
    {
        if(this.parts[i] == null) continue;
        
        this.renderHeight += this.parts[i].image.height - 22;
        this.renderWidth = Math.min( this.renderWidth, this.parts[i].image.width );
        this.parts[i].renderY = this.renderHeight;
        
    }
    
    this.bounds = new Rectangle(
        -renderer.pixelToWorld( this.renderWidth * this.renderScale ) * 0.5,
        -renderer.pixelToWorld( this.renderHeight * this.renderScale ) * 0.5,
        renderer.pixelToWorld( this.renderWidth * this.renderScale ),
        renderer.pixelToWorld( this.renderHeight * this.renderScale )
    );
}

Ship.parts = {
    engine : 'engine',
    cargo : 'cargo',
    science : 'science',
    engineering : 'engineering',
    cockpit : 'cockpit'
}