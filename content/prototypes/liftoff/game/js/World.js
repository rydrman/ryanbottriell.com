var World = function()
{
    this.width;
    this.height;
    
    this.ships = [];
    
    this.items = [];
    
    this.planets = [];
}

World.prototype.init = function( width, height ) 
{
    this.width = width;
    this.height = height;
    
    this.bounds = new Rectangle(0, 0, width, height);
}

World.prototype.getInitialPlanet = function()
{
    return this.planets[0];
}

World.prototype.update = function( timer, player )
{
    var s;
    for(var i in this.ships)
    {
        s = this.ships[i];
        // Check collisions between ship and planets
        if (!s.landed) 
        {
            s.update(timer, player);
            
            s.force = this.getGravity( s.position );
            
            var p, dist, wrapped, offset, force = new Vector2();
            for(var j in this.planets)
            {
                p = this.planets[j];
                wrapped = this.wrapCoords( s.position, p.position );
                offset = wrapped.clone().sub(s.position);

                dist = offset.length();
                if (dist < p.radius + 0.5) 
                { 
                    s.landed = true;
                    if (s.landing) {
                        console.log("Successful Landing!");
                    } 
                    else 
                    {
                        console.log("CRASH");
                        s.takeDamage(40); // TODO - MAKE NOT HARDCODE
                    }
                } 
            }
        }
    }
}

World.prototype.getGravity = function( position )
{
    var p, dist, wrapped, offset, force = new Vector2();
    for(var i in this.planets)
    {
        p = this.planets[i];
        wrapped = this.wrapCoords( position, p.position );
        offset = wrapped.clone().sub(position);
        
        var distanceSq = offset.lengthSqd();
        if (distanceSq < Math.pow(10 + p.radius, 2)) 
        {
            // add gravity force to the movement
            var gravity = offset.normalize().multiplyScalar(0.1); // FIXME this in an arbitrary number
            //map gravity scale based on distance
            var gravityScale =  map( distanceSq, Math.pow(p.radius, 2), Math.pow(p.radius + 10, 2), 1, 0);
            gravityScale = clamp(gravityScale, 0, 1);
            gravity.multiplyScalar( gravityScale );

            force.add(gravity);
        }
    }
    return force;
}

World.prototype.getClosestPlanet = function( position )
{
    var minDistSq = Number.MAX_VALUE,
        planet,
        p, distSq, wrapped;
    for(var i in this.planets)
    {
        p = this.planets[i];
        wrapped = this.wrapCoords( position, p.position );
        var distSq = wrapped.clone().sub(position).lengthSqd();
        if (distSq < minDistSq) 
        {
            minDistSq = distSq;
            planet = p;
        }
    }
    
    return {
        planet: planet,
        distance: Math.sqrt( minDistSq )
    };
}

World.prototype.sample = function( worldPos )
{
    //check ship
    for(var i in this.ships)
    {
        if(this.ships[i].isInBounds( worldPos ) )
           return this.ships[i];
    }
    
    
    //TODO parse other options
    for (var i=0; i < this.planets.length; i++) 
    {
        // general distance check
        var wrappedPos = this.wrapCoords( this.planets[i].position, worldPos );
        if (wrappedPos.clone().sub(this.planets[i].position).length() < this.planets[i].radius + 1)
        {
            //clicked planet
            for (var j=0; j < this.planets[i].items.length; j++) 
            {
                var item = this.planets[i].items[j];
                if( this.planets[i].items[j].isInBounds( worldPos ) )
                    return item;
            }
            //no object, return planet if within inner radius
            if (worldPos.clone().sub(this.planets[i].position).length() < this.planets[i].radius)
                return this.planets[i];
        }
    }
    
    return null; // debug
    
    return {
        position: worldPos
    };
}

World.prototype.wrapCoords = function( center, worldAbs )
{
    //check if it's close to edge
    var buffer = 40;
    var centerWrap = (   (center.x < buffer || center.x > Settings.worldSize.x - buffer)
                      && (center.y < buffer || center.y > Settings.worldSize.y - buffer) );
    var posWrap =    (   (worldAbs.x < buffer || worldAbs.x > Settings.worldSize.x - buffer)
                      && (worldAbs.y < buffer || worldAbs.y > Settings.worldSize.y - buffer) );
    
    if(!(centerWrap && posWrap)) return worldAbs;
    
    //var center = this.viewport.center;
    
    var options = [];
    
    //try normal
    var norm = worldAbs.clone();
    options.push({
        pos : norm.clone(),
        dist : norm.sub( center ).lengthSqd()
    });
    //try top
    var top = worldAbs.clone();
    top.y -= Settings.worldSize.y;
    options.push({
        pos : top.clone(),
        dist : top.sub( center ).lengthSqd()
    });
    //try left
    var left = worldAbs.clone();
    left.x -= Settings.worldSize.x;
    options.push({
        pos : left.clone(),
        dist : left.sub( center ).lengthSqd()
    });
    //try bottom
    var bottom = worldAbs.clone();
    bottom.y += Settings.worldSize.y;
    options.push({
        pos : bottom.clone(),
        dist : bottom.sub( center ).lengthSqd()
    });
    //try right
    var right = worldAbs.clone();
    right.x += Settings.worldSize.x;
    options.push({
        pos : right.clone(),
        dist : right.sub( center ).lengthSqd()
    });
    //try both
    var bothNeg = worldAbs.clone();
    bothNeg.x -= Settings.worldSize.x;
    bothNeg.y -= Settings.worldSize.y;
    options.push({
        pos : bothNeg.clone(),
        dist : bothNeg.sub( center ).lengthSqd()
    });
    var bothPos = worldAbs.clone();
    bothPos.x += Settings.worldSize.x;
    bothPos.y += Settings.worldSize.y;
    options.push({
        pos : bothPos.clone(),
        dist : bothPos.sub( center ).lengthSqd()
    });
    
    //sub add
    var subAdd = worldAbs.clone();
    subAdd.x -= Settings.worldSize.x;
    subAdd.y += Settings.worldSize.y;
    options.push({
        pos : subAdd.clone(),
        dist : subAdd.sub( center ).lengthSqd()
    });
    //addsub
    var addSub = worldAbs.clone();
    addSub.x += Settings.worldSize.x;
    addSub.y -= Settings.worldSize.y;
    options.push({
        pos : addSub.clone(),
        dist : addSub.sub( center ).lengthSqd()
    });
    
    /*//try normal
    var norm = worldAbs.clone();
    options.push({
        pos : norm,
        dist : this.viewport.distanceTo( norm )
    });
    //try top
    var top = worldAbs.clone();
    top.y -= Settings.worldSize.y;
    options.push({
        pos : top,
        dist : this.viewport.distanceTo( top )
    });
    //try left
    var left = worldAbs.clone();
    left.x -= Settings.worldSize.x;
    options.push({
        pos : left,
        dist : this.viewport.distanceTo( left )
    });
    //try bottom
    var bottom = worldAbs.clone();
    bottom.y += Settings.worldSize.y;
    options.push({
        pos : bottom,
        dist : this.viewport.distanceTo( bottom )
    });
    //try right
    var right = worldAbs.clone();
    right.x += Settings.worldSize.x;
    options.push({
        pos : right,
        dist : this.viewport.distanceTo( right )
    });
    //try both
    var bothNeg = worldAbs.clone();
    bothNeg.x -= Settings.worldSize.x;
    bothNeg.y -= Settings.worldSize.y;
    options.push({
        pos : bothNeg,
        dist : this.viewport.distanceTo( bothNeg )
    });
    var bothPos = worldAbs.clone();
    bothPos.x += Settings.worldSize.x;
    bothPos.y += Settings.worldSize.y;
    options.push({
        pos : bothPos,
        dist : this.viewport.distanceTo( bothPos )
    });*/
    
    options.sort(function(a, b){return a.dist-b.dist});
    return options[0].pos;
    
}
