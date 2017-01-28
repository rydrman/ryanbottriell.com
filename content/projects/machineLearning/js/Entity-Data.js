// This file describes the various types of data that Entity can hold

////////////////////////////////////////////////////
//   EntityObject stores information about objs   //
////////////////////////////////////////////////////

var EntityObject = function(obj, type)
{
    this.type = type;
    this.instances = [];
    this.name = obj.name;
    this.value = null;
    
    this.actions = new SmartList();
    this.items = new SmartList();
    
    this.requires = null;
    this.requiredBy = new SmartList();
    
    this.recievedFrom = new SmartList();
    this.results = null;
    
    this.totalCount = 0; 
    
    this.successCount = 0;
    this.tryCount = 0;
    this.probabilitySuccess = 0;
    this.probability = 0;
    
    this.locationCounter = new LocationCounter();
}

EntityObject.prototype.calcRating = function()
{
}


////////////////////////////////////////////////////
//    Object list tracks object probabilities     //
////////////////////////////////////////////////////

var ObjectList = function(type)
{
    this.type = (typeof(type) == 'undefined') ? "unknown" : type;
    
    this.list = [];
    
    this.totalCount = 0;
}

ObjectList.prototype.foundInstance = function(data, dropping)
{
    if(data instanceof EntityObject) debugger;
    
    dropping = (typeof(dropping) != 'undefined') ? dropping : false;
    
    //get item
    var obj = this.get(data);
    
    //if not dropped by player
    if(!dropping)
    {
        //update probability of being in the world
        //also update other objs in list
        this.totalCount++;
        obj.totalCount++;
        this.updateWorldProbabilities();

        //update probability of being at location
        //only null on initial load
        if(entity.currentLocation != null)
            obj.locationCounter.count( entity.currentLocation.data );
    }
    
    //log instance
    var instance = new ObjectInstance(obj, data);
    obj.instances.push(instance);
    //if it's a location, add it to the grid
    if( typeof(data.location) == 'undefined' && !(data instanceof EntityObject) )
        entity.grid[data.x][data.y] = instance;
    
    console.log("found instance of " + instance.data.name);
    console.log(instance);
    
    //debug
    if(typeof(instance.data.name) == 'undefined') debugger;
    return instance;
}
//gets the instace object for the given data
ObjectList.prototype.getInstance = function(data, location)
{
    var obj = this.get(data);
    for(var i in obj.instances)
    {
        var match = false;
        if( typeof(obj.instances[i].data.location) != 'undefined') //object or action
            match = (obj.instances[i].data.location.x == location.x && obj.instances[i].data.location.y == location.y);
        else //location
            match = (obj.instances[i].data.x == location.x && obj.instances[i].data.y == location.y);
        
        if(match)
        {
            return obj.instances[i];
        }
    }
    console.log("\nget instance defualting to found instance")
    console.log(data);
    return this.foundInstance(data);
}
ObjectList.prototype.removeInstance = function(data, location)
{
    //get item
    var obj = this.get(data);
    
    if(typeof(location) == 'undefined') location = entity.currentLocation.data;
    
    var instance = this.getInstance(data, location);
    
    obj.instances.splice( obj.instances.indexOf(instance), 1);
}
ObjectList.prototype.updateInstance = function(data, location)
{
    //get item
    var obj = this.get(data);
    
    if(typeof(location) == 'undefined') location = entity.currentLocation.data;
    
    var instance = this.getInstance(data, location);
    
    if(instance != null)
    {
        for(var property in data)
        {
            if(data[property] != null)
                instance.data[property] = data[property];
        }
        return instance;
    }
}
ObjectList.prototype.updateWorldProbabilities = function()
{
    for(var i in this.list)
    {
        this.list[i].probability = this.list[i].totalCount / this.totalCount;
    }
}
ObjectList.prototype.namesToList = function(names)
{
    var list = [];
    for(var i in names)
    {
        list[i] = this.get( {name: names[i]} );
    }
    return list;
}
ObjectList.prototype.get = function(obj)
{
    if(typeof(obj.name) == 'undefined')
    {
        throw new Error("Name undefined, check sent data");
    }
    
    if( typeof(this.list[obj.name]) == 'undefined')
    {
        this.list[obj.name] = new EntityObject(obj, this.type);
    }
    
    return this.list[obj.name];
}

ObjectList.prototype.complete = function(obj, success)
{
    //update probability of success
    var item = this.get(obj);
    
    if(success)
        item.successCount++;
    
    item.tryCount++;
    item.probabilitySuccess = item.successCount / item.tryCount;
}
ObjectList.prototype.sort = function( sortFunction )
{
    this.list.sort( sortFunction );
    
    return this.list;
}
ObjectList.prototype.dump = function()
{
    var output = [];
    
    for(var i in this.list)
    {
        var copy = {};
        copy.name = this.list[i].name;
        copy.value = this.list[i].value;
        copy.type = this.type;
        
        copy.actions = this.list[i].actions.dump();
        copy.items = this.list[i].items.dump();

        copy.requires = (this.list[i].requires == null) ? null : this.list[i].requires.name;
        copy.requiredBy = this.list[i].requiredBy.dump();

        copy.recievedFrom = this.list[i].recievedFrom.dump();
        copy.results = (this.list[i].results == null) ? null : this.list[i].results.name;

        copy.totalCount = this.list[i].totalCount;
        
        copy.successCount = this.list[i].successCount;
        copy.tryCount = this.list[i].tryCount;
        copy.probabilitySuccess = this.list[i].probabilitySuccess;
        copy.probability = this.list[i].probability;
        
        copy.locationCounter = this.list[i].locationCounter.dump();
        output.push(copy);
    }
    
    return output;
}
ObjectList.prototype.unDump = function(data)
{
    
    for(var i in data)
    {
        var obj = this.get( {name: data[i].name} );
        
        obj.name = data[i].name;
        obj.value = parseFloat(data[i].value);
        if( isNaN(obj.value) ) obj.value = null;
        obj.type = this.type;
        
        obj.actions.unDump( data[i].actions, entity.actions );
        obj.items.unDump( data[i].items, entity.items );

        obj.requires = (data[i].requires == null) ? null : entity.items.get( {name: data[i].requires} );
        obj.requiredBy.unDump( data[i].requiredBy, entity.actions );

        obj.recievedFrom.unDump( data[i].recievedFrom, entity.actions );
        obj.results = (data[i].results == null) ? null : entity.items.get( {name: data[i].results} );

        obj.totalCount = parseInt(data[i].totalCount);
        
        obj.successCount = parseInt(data[i].successCount);
        obj.tryCount =  parseInt(data[i].tryCount);
        obj.probabilitySuccess =  parseFloat(data[i].probabilitySuccess);
        obj.probability =  parseFloat(data[i].probability);
        
        obj.locationCounter.unDump( data[i].locationCounter, entity.actions ); 
    }
}


////////////////////////////////////////////////////
//      SmartList avoids repetitive entries       //
////////////////////////////////////////////////////
var SmartList = function()
{
    this.list = [];
}
SmartList.prototype.push = function(obj)
{
    if( typeof(this.list[obj.name]) == 'undefined')
        this.list.push(obj)
    else 
        this.list[obj.name] = obj;
}
SmartList.prototype.dump = function()
{
    var list = [];
    for(var i in this.list)
    {
        list.push( (this.list[i] instanceof EntityObject) ? this.list[i].name : this.list[i] );
    }
    return list;
}
SmartList.prototype.unDump = function(names, list)
{
    for(var i in names)
    {
         this.push( list.get( {name: names[i]} ) );
    }
}

////////////////////////////////////////////////////
//       Location counter counts instances        //
////////////////////////////////////////////////////

var LocationCounter = function()
{
    this.counters = {};
}

LocationCounter.prototype.count = function(loc)
{
    var counter = this.get(loc);
    
    counter.count ++;
    
    var total = entity.locations.get(loc).totalCount;
    counter.probability = counter.count / total;
}

LocationCounter.prototype.get = function(loc)
{
    if(typeof(loc.name) == 'undefined') 
    {
        throw new Error("Name undefined, check sent data");
    }
    
    if(!this.counters[loc.name])
    {
        this.counters[loc.name] = {
            name : loc.name,
            count : 0,
            probability : 0
        };
    }
    return this.counters[loc.name];
}
LocationCounter.prototype.getBest = function()
{
    var best = null,
        bestProb = 0;
    for(var i in this.counters)
    {
        if(this.counters[i].probability > bestProb)
        {
            best = this.counters[i].name;
            bestProb = this.counters[i].probability;
        }
    }
    if(best == null)
        return null;
    else
        return entity.locations.get({name: best});
}
LocationCounter.prototype.dump = function()
{
    var out = {};
    for(var i in this.counters)
    {
        out[i] = {};
        out[i].name = this.counters[i].name;
        out[i].count = this.counters[i].count;
        out[i].probability = this.counters[i].probability;
    }
    return out;
}
LocationCounter.prototype.unDump = function( data, locList )
{
    for(var i in data)
    {
        this.counters[i] = {
            name: data[i].name,
            count: data[i].count,
            probability: data[i].probability
        }
    }
}

////////////////////////////////////////////////////
//      Object instance for actualy findings      //
////////////////////////////////////////////////////

var ObjectInstance = function( object, data )
{

    this.data = data;
    this.data.seen = false;
    
    this.object = object;
}


