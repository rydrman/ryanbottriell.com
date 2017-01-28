var Generator = function()
{
     AsyncLoadable.call(this);
    
    this.planets = [];
    this.items = [];
    this.loaded = false;
}

Generator.prototype = new AsyncLoadable();

Generator.prototype.load = function()
{
    var self = this;
    var loader = new AsyncLoader();
    loader.onComplete = function(){
        this.loaded = true;
        this.onLoad.call(this.onLoadContext);
    };
    loader.onCompleteContext = this;

    loader.addJSONCall( 'json/planets.json', function(data){
        self.planets = data;
    });
    loader.addJSONCall( 'json/items.json', function(data){
        for(var i in data)
            self.items[data[i].name] = data[i];
    });
    
    loader.runCalls();
}

Generator.prototype.generate = function()
{
    if(!this.loaded)
    {
        messenger.display( new Message.Error("Cannot generate until loaded") );
        return null;
    }
    
    var width = Settings.worldSize.x,
        height= Settings.worldSize.y;
    var world = new World();
    
    world.init( width, height );
    
    for(var i = 0; i < 100; ++i)
    {
        var planet = this.spawnPlanet( world );
        if( planet == null )
            continue;
        
        this.populatePlanet( planet, (i == 0) );
        
        world.planets.push( planet );
    }
    
    return world;
}

Generator.prototype.spawnPlanet = function( world )
{
    //initial stuff
    var rad = Settings.planetMinRad + Math.random() * Settings.planetMaxRad,
        position = new Vector2(
            rad + Math.random() * (Settings.worldSize.x - rad*2),
            rad + Math.random() * (Settings.worldSize.y - rad*2)
        ),
        distSq;

    //pick a type
    var selected = null;
    while( selected == null )
    {
        var prob = Math.random();
        var attempt = this.planets[ Math.floor( Math.random() * this.planets.length ) ];
        if(prob < attempt.probability) 
            selected = attempt;
    }

    //find a position
    var tries = 0,
        accepted = false;
    while(accepted == false && tries < 1000)
    {
        accepted = true;
        for(var j in world.planets)
        {
            distSq = new Vector2().subVectors(position, world.planets[j].position).lengthSqd();
            if(distSq < Math.pow(rad + world.planets[j].radius + 5, 2) )
            {
                accepted = false;
                break;
            }
        }
        if(!accepted)
        {
            position.set(
                rad + Math.random() * (Settings.worldSize.x - rad*2),
                rad + Math.random() * (Settings.worldSize.y - rad*2)
            );
        }
        tries++;
    }

    if(tries >= 1000) 
    {
        console.warn("Planet generation impossible, no acceptable position found");
        return null;
    }

    var planet = new Planet( {
        position: position, 
        radius: rad, 
        type: selected.type,
        color: selected.color
    } );
    return planet
}

Generator.prototype.populatePlanet = function( planet, base )
{
    if( base )
    {
        this.applyBase( planet );
        return;
    }
    
    planet.atmosphere = (Math.random() > 0.4) ? true : false;
    
    var numItems = Math.floor( map(planet.radius, Settings.planetMinRad, Settings.planetMaxRad, 5, 20) );
    
    //find possible resources
    var selectionList = [];
    for(var i in this.items)
    {
        if( !this.items[i].probabilities ) continue;
        if( this.items[i].probabilities[planet.type]
           && this.items[i].probabilities[planet.type] > 0)
            selectionList.push(this.items[i]);
    }
    if(selectionList.length == 0)
    {
        console.warn("no items match planet type: " + planet.type);
        return;
    }
    
    var count = 0;
    while( count < numItems )
    {
        var roll;
        for(var i in selectionList)
        {
            roll = Math.random();
            if(roll < selectionList[i].probabilities[planet.type])
            {
                var selection = selectionList[i];
                
                var item = new BaseObject( selection );
                item.planet = planet;
                
                //place it on the planet
                item.planetPosition = -Math.PI + Math.random() * Math.PI * 2; 
                
                planet.addItem(item);
                
                count++;
            }
        }
        
    }
}

Generator.prototype.applyBase = function(planet)
{
    var toPut = {
        "tree" : 4,
        "ore" : 2,
        "goo" : 2,
        "rooster" : 1,
        "pomnitool" : 1
    };
    
    planet.atmosphere = true;
    
    for(var i in toPut)
    {
        for(var j = 0; j < toPut[i]; j++)
        {
            var item = new BaseObject( this.items[i] );
            item.planet = planet;

            //place it on the planet
            item.planetPosition = -Math.PI + Math.random() * Math.PI * 2; 

            planet.addItem(item);
        }
    }
}