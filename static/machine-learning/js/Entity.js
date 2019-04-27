var Entity = function()
{
    //the current goal is a list of up to three
    //items to have in the inventory to maximize
    //the wealth of the player
    this.goal = null;

    this.objective = null;
    
    this.currentLocation = null;
    
    this.grid = [];
    for(var i = 0; i < 5; ++i)
    {
        this.grid[i] = [];
        for(var j = 0; j < 5; ++j)
        {
            this.grid[i][j] = null;
        }
    }
    
    this.inventory = [];
    this.tools = [];
    
    //used to store all discovered locations,
    //their effect on goals,
    //and objects which can be found there
    this.locations = new ObjectList("location");

    //used to store discovered objects,
    //their effect on goals,
    //and locations where they can be found
    this.items = new ObjectList("item");
    this.actions = new ObjectList("action");
    
}

Entity.prototype.makeDecision = function()
{
    //TODO check if we have a goal / obj 
    //that is still valid 
    this.goal = null;
    this.objective = null;
    
    //to store decision stuff
    var objective = null;
    var options = [];
    
    //create indexed array of items
    var itemArray = [];
    for(var i in this.items.list)
        itemArray.push(this.items.list[i]);
    
    //sort by value
    var sortedItems = itemArray.sort( Entity.sortFunction );
    
    //////////////////////////////////////////
    ////        GET MOST VALUABLE         ////
    //////////////////////////////////////////
    
    //get most valuable
    //keep track of best prob/distance metric
    var bestRank = -1;
    var bestInstance = null;
    for(var i in sortedItems)
    {
        var item = sortedItems[i];
        
        if(item.value == null || item.value == 0) continue;
        
        //see if better option than in inventory
        var betterThan = null;
        if(this.inventory.length == 4)
        {
            for(var i in this.inventory)
            { 
                if(this.inventory[i].value < item.value)
                    betterThan = this.inventory[i];
            }

            //if theres space in inventory
            //or something to replace
            if(betterThan == null)
                continue;
        }
        
        ////////////////////////////////////////////
        //    FIRST LOOK FOR EXISTING INSTANCE    //
        
        for(var i in item.instances)
        {
            var dist = Entity.getDistance(this.currentLocation.data.x,
                                          this.currentLocation.data.y,
                                          item.instances[i].data.location.x,
                                          item.instances[i].data.location.y);
            var rank = Entity.itemRank(dist, item.value);
             
            if(rank > bestRank)
            {
                bestRank = rank;
                bestInstance = item.instances[i];
            }
        }
        
        //if we found one sitting around
        //go for it for now
        if(bestInstance != null)
        {
            this.goal = bestInstance;
            break;
        }
        
        //  END FIRST LOOK FOR EXISTING INSTANCE  //
        ////////////////////////////////////////////    
        
        ////////////////////////////////////////////
        //      MAYBE IT REQUIRES AN ACTION       //
        
        var stack = this.resolveRequirementStack( item );
        //if we got -1 then cannot resolve, move on
        if( -1 == stack )
        {
            continue;
        }
        //if something came back
        else if(stack != null)
        {
            this.goal = item;
            this.objective = stack;
            break;
        }
        
        
        //    END MAYBE IT REQUIRES AN ACTION     //
        ////////////////////////////////////////////
        
        ////////////////////////////////////////////
        //         FIND POSSIBLE LOCATIONS        //
        
        var lookFor = item.locationCounter.getBest();
        //if we get something
        if(lookFor != null)
        {
            //look for unseen instances
            //or unvisited locations
            var areUnseen = false;
            var instance = null;
            for(var x in this.grid)
            {
                for(var y in this.grid[x])
                {
                    if(this.grid[x][y] == null)
                    {
                        areUnseen = true;
                    }
                    else if(this.grid[x][y].object.name == lookFor.name && !this.grid[x][y].data.seen)
                    {
                        instance = this.grid[x][y];
                        break;
                    }
                }
                if(instance != null) break;
            }
            
            if(areUnseen || instance != null)
            {
                this.objective = [(null != instance) ? instance : lookFor];
                this.goal = item;
                break;
            }
            
        }
        
        
        //      END FIND POSSIBLE LOCATIONS       //
        ////////////////////////////////////////////
        
    }
    
    //look at local options
    //we want to try anything here that 
    //we haven't tried yet
    var unknownItems = [];
    for( var i in this.currentLocation.data.items)
    {
        var item = this.items.get({name: this.currentLocation.data.items[i]});
        if(item.value != null) continue;
        unknownItems.push(this.items.getInstance(item, this.currentLocation.data));
    }
    //also look at local actions
    var unknownActions = [];
    for( var i in this.currentLocation.data.actions)
    {
        var action = this.actions.get({name: this.currentLocation.data.actions[i]});
        if(action.results != null) continue;
        unknownActions.push(this.actions.getInstance(action, this.currentLocation.data));
    }
    
    this.saySomething(unknownItems, unknownActions, betterThan);
    
    //if no options, pick something up
    //if we can't, suggest exploring
}

Entity.prototype.saySomething = function(unknownItems, unknownActions, betterThan)
{
    //// FIRST TALK ABOUT UNKNOWNS ////
    
    //output unknown items
    if(unknownItems.length == 1)
        outputLine("ENTITY: I don't know what " + unknownItems[0].data.name + " is worth. Might as well find out while we're here (pick it up).");
    else if(unknownItems.length > 1)
    {
        var string = "ENTITY: I don't know what "
        for(var i = 0; i <  unknownItems.length; ++i)
        {
            if(i == unknownItems.length-1)
                string += ", or ";
            else if(i > 0)
                string += ", ";
            string += unknownItems[i].data.name;
        }
        string += " are worth. Might as well find out while we're here (pick them up).";
        outputLine(string);
    }
    //output unknown actions
    if(unknownActions.length == 1)
        outputLine("ENTITY: I don't know what the result of " + unknownActions[0].data.name + " is. Might as well try it while we're here.");
    else if(unknownActions.length > 1)
    {
        var string = "ENTITY: I don't know what the result of "
        for(var i = 0; i <  unknownActions.length; ++i)
        {
            if(i == unknownActions.length-1)
                string += ", or ";
            else if(i > 0)
                string += ", ";
            string += unknownActions[i].data.name;
        }
        string += " is. Might as well try them while we're here.";
        outputLine(string);
    }
    
    //// GOALS/OBJECTIVES ////
    var objGoal = "ENTITY: I think that you should ";
    if(this.goal != null)
    {
        if(this.objective != null)
        {
            //loop objective stack backwards
            for(var i = this.objective.length -1; i >= 0; --i)
            {
                var curr = this.objective[i];
                
                switch( typeof(curr.type) == 'undefined' ? curr.object.type : curr.type )
                {
                    case 'item':
                        if(curr instanceof ObjectInstance)
                            objGoal += "get " + curr.object.name + "(x" + curr.data.location.x + ", y" + curr.data.location.y + ") ";
                        else
                            objGoal += "get " + curr.name + " ";
                        break;
                    case 'action':
                        if(curr instanceof ObjectInstance)
                            objGoal += " " + curr.object.name + "(x" + curr.data.location.x + ", y" + curr.data.location.y + ") ";
                        else
                            objGoal += " " + curr.name + " ";
                        break;
                    case 'location':
                        if(curr instanceof ObjectInstance)
                            objGoal += "go to " + curr.object.name + "(x" + curr.data.x + ", y" + curr.data.y + ") "; 
                        else
                            objGoal += "look for a " + curr.name + " ";
                        break;
                }
                objGoal += "so that you can ";
            }
        }
        var curr = this.goal;
        switch( typeof(curr.type) == 'undefined' ? curr.object.type : curr.type )
        {
            case 'item':
                if(curr instanceof ObjectInstance)
                    objGoal += "get " + curr.object.name + "(x" + curr.data.location.x + ", y" + curr.data.location.y + ") ";
                else
                    objGoal += "look for " + curr.name + " ";
                break;
            case 'action':
                if(curr instanceof ObjectInstance)
                    objGoal += curr.object.name + "(x" + curr.data.location.x + ", y" + curr.data.location.y + ") ";
                else
                    objGoal += "try to " + curr.name + " ";
                break;
            case 'location':
                if(curr instanceof ObjectInstance)
                    objGoal += "go to " + curr.object.name + "(x" + curr.data.x + ", y" + curr.data.y + ") "; 
                else
                    objGoal += "look for a " + curr.name + " ";
                break;
        }
        if(betterThan != null)
            objGoal += "(replace: " + betterThan.name + ") ";
    }
    else
    {
        //look for something to discover
        var undiscovered = false,
            unknowns = false;
        for(var x in this.grid)
        {
            for(var y in this.grid[x])
            {
                if(!undiscovered && 
                   (this.grid[x][y] == null 
                    || (this.grid[x][y].data.seen == false && this.grid[x][y].data.name != 'ocean')))
                {
                    undiscovered = true;
                }
                else if(!undiscovered && !unknowns)
                {
                    for( var i in this.grid[x][y].data.items)
                    {
                        var item = this.items.get({name: this.grid[x][y].data.items[i]});
                        if(item.value != null && this.resolveRequirementStack(item) != -1) continue;
                        unknowns = true;
                    }
                    for( var i in this.grid[x][y].data.actions)
                    {
                        var action = this.actions.get({name: this.grid[x][y].data.actions[i]});
                        if(action.results != null && this.resolveRequirementStack(item) != -1) continue;
                        unknowns = true;
                    }
                }
            }
        }
        if(unknowns)
        {
            objGoal += "keep exploring and discover new things.";
        }
        else if(undiscovered)
        {
            objGoal += "keep exploring and visit all locations.";
        }
        else
        {
            //nothing to be done
            objGoal += "... bask in your riches (no better solution availible)";
        }
    }
    outputLine(objGoal);
}

Entity.prototype.resolveRequirementStack = function( base )
{
    if(base.requires == null && base.recievedFrom.list.length == 0)
    {
        console.log("warning: resolving requirements, base item does not require");
        return null;
    }
    
    var stack = [],
        end = false,
        curr = base;
    while(end == false)
    {
        if(curr.requires != null)
        {
            var requires;
            switch(curr.type)
            {
                case "item":
                    requires = this.items.get({name: curr.requires.name});
                    break;
                case "action":
                    requires = this.items.get({name: curr.requires.name});
                    break;
            }
            //is it in the inventory
            if(requires.type == 'item' && -1 != this.inInventory( requires.name ))
                return stack;
            
            //look for instances
            var bestReqRank = -1;
            var bestReqInstance = null;
            for(var i in requires.instances)
            {
                var dist = Entity.getDistance(this.currentLocation.data.x,
                                              this.currentLocation.data.y,
                                              requires.instances[i].data.location.x,
                                              requires.instances[i].data.location.y);

                var rank = (requires.type == 'item') ? Entity.itemRank(dist, requires.value) : Entity.actionRank(dist);

                if(rank > bestReqRank)
                {
                    bestReqRank = rank;
                    bestReqInstance = requires.instances[i];
                }
            }
            
            if(bestReqInstance != null)
            {
                stack.push(bestReqInstance);
                return stack;
            }
            //if it's an item that requires something
            //we don't need an instance
            else if(curr.type == "item" && curr.requires != null)
            {
                debugger;
                stack.push(requires);
                curr = requires;
                continue;
            }
            else
            {
                //otherwise look for best location option
                var loc = requires.locationCounter.getBest();
                //push item and location
                stack.push(requires);

                //make sure we can still find one
                var undiscovered = false,
                    unseen = false;
                for(var x in this.grid)
                {
                    for(var y in this.grid[x])
                    {
                        if(this.grid[x][y] == null)
                        {
                            undiscovered = true;
                        }
                        else if( loc != null && this.grid[x][y].data.name == loc.name && this.grid[x][y].data.seen == false )
                        {
                            unseen = true;
                        }
                    }
                }
                if(unseen || undiscovered)
                {
                    if(loc != null)
                        stack.push(loc);
                    return stack;
                }
                else // there is no positbility of seeing this item/action... try something else
                {
                    return -1;
                }

            }
        }
        else if(curr.recievedFrom.list.length > 0)
        {
            //find best option or instance
            var best = null,
                bestProb = -1;
            var bestInstance = null,
                bestInstanceScore = -1;
            for(var i in curr.recievedFrom.list)
            {
                var action = this.actions.get({name: curr.recievedFrom.list[i].name});
                
                //compare wtih other options
                var actionRank = (action.probability + action.probabilitySuccess) * 0.5
                if( actionRank > bestProb )
                {
                    bestProb = actionRank;
                    best = action;
                }
                
                //get best instance
                for(var j in action.instances)
                {
                    var dist = Entity.getDistance(this.currentLocation.data.x,
                                                  this.currentLocation.data.y,
                                                  action.instances[j].data.location.x,
                                                  action.instances[j].data.location.y);

                    var rank = Entity.actionRank(dist);
                    
                    if(rank > bestInstanceScore)
                    {
                        bestInstance = action.instances[j];
                        bestInstanceScore = rank;
                    }
                    
                }
                
            }
            if(bestInstance != null)
            {
                stack.push(bestInstance);
                curr = bestInstance.object;
            }
            else if(best != null)
            {
                //otherwise look for best location option
                var loc = best.locationCounter.getBest();
                //push item and location
                stack.push(best);
                if(loc != null)
                {
                    //make sure we can still find one
                    var undiscovered = false;
                    for(var x in this.grid)
                    {
                        for(var y in this.grid[x])
                        {
                            if(this.grid[x][y] == null || (this.grid[x][y].data.name == loc.name && this.grid[x][y].data.seen == false))
                            {
                                undiscovered = true;
                            }
                        }
                    }
                    if(undiscovered)
                    {
                        stack.push(loc);
                        return stack;
                    }
                    else // there is no positbility of seeing this item/action... try something else
                    {
                        return -1;
                    }
                }
            }
            else // there is no positbility of seeing this action... try something else
            {
                return -1;
            }
        }
        else
        {
            return stack;
        }
    }
}

Entity.prototype.bestLocationOption = function( object )
{
}

//type: enumerator for the type of discovery (location, item etc)
//data: varies based on type of discovery, an object containing relevant information
Entity.prototype.onDiscovery = function(type, data)
{
    if(typeof(data.name) == undefined) debugger;
    switch(type)
    {
        //for each case
            //store the data
            //remember its effect
            //look for patterns
            //update current goal
        ///////////////////////////////////////////
        case Entity.types.LOCATION:
            var loc = this.locations.get(data);
            
            console.log("\nLocation discovered: " + data.name);
            console.log(data);
            
            //first we log this specific instance
            //and update the location metrics
            this.locations.foundInstance(data);
            
            break;
        
        ///////////////////////////////////////////
        case Entity.types.ITEM:
            var item = this.items.get(data);
            
            console.log("\nItem discovered: " + data.name);
            console.log(data);
            
            //first we log this specific instance
            //and update the item metrics
            this.items.foundInstance(data);
                
            break;
            
        ///////////////////////////////////////////
        case Entity.types.ACTION:
            var action = this.actions.get(data);
            
            console.log("\nAction discovered: " + data.name);
            console.log(data);
            
            //first we log this specific instance
            //and update the action metrics
            this.actions.foundInstance(data);

            break;
        
        ///////////////////////////////////////////
        default:
            debugger;
            console.log("unknown type");
    }
    //TODO sort?
}

//actionType: enumerator for type of action creating the effect (travel, pickup, etc)
//data: varies based on effect, an object containing relevant info to the event
//flag: for actions which have outcome states (ex boolean for action success)
Entity.prototype.onFeedbackRecieved = function( actionType, data, flag )
{
    if(typeof(data.name) == 'undefined') debugger;
    switch(actionType)
    {
        //for each case
            //update the entry based on effect
            //look for patterns
            //update current goal
            
        case Entity.actionTypes.TRAVEL:
            
            var loc = this.locations.get(data);
            
            //set current location
            if(this.currentLocation == null)
                this.currentLocation = this.locations.getInstance(data, data);
            
            //mark it as seen 
            data.seen = true;
            var instance = this.locations.updateInstance(data, data);
            this.currentLocation = instance;
            
            //see if we wanted to  be here
            if( this.objective != null && this.objective.name == loc.name)
            {
                console.log("I wanted to be here!");
                //TODO respond
            }
            
            //TODO see if we are closer of further from our objective
            
            break;
            
        case Entity.actionTypes.PICKUP:
            
            var item = this.items.get(data);
            
            //update inventory
            //this may need to be an instance
            if(!data.tool)
                this.inventory.push(item);
            else
                this.tools.push(item);
            
            if(this.inventory.length > 3) console.log("inventory greater than 3!!");
            
            //remove instance
            this.items.updateInstance(data);
            this.items.removeInstance(data);
            
            //remove from location instance
            var instance = this.currentLocation.data.items.splice( this.currentLocation.data.items.indexOf(data.name), 1 );
            
            //update value and see if we knew it before
            if(data.value != null && item.value == null)
            {
                item.value = data.value;
                outputLine("ENTITY: I now know that " + data.name + " is worth " + data.value);
            }
            
            //check if we wanted this
            if( this.objective != null && this.objective.name == item.name)
            {
                console.log("ENTITY: I wanted this!");
                //TODO respond
            }
            
            break;
            
        case Entity.actionTypes.DROP:
            
            var item = this.items.get(data);
            
            //remove object from inventory
            var index = this.inventory.indexOf(item);
            if(-1 == index)
            {
                console.log("dropping item that's not in inventory");
                debugger;
            }
            else
                this.inventory.splice(index, 1);
            
            //if flag is true put it into the current location
            if(flag == true)
            {
                //create instance
                this.items.foundInstance(data, true);
                console.log(item);
            }
            break;
            
        case Entity.actionTypes.INTERACT:
            var action = this.actions.get(data);
            
            //update requirements
            var had = action.requires;
            if(data.requires != null)
                action.requires = this.items.get({name: data.requires});
            else
                console.log("action failed but data has no required item listed");
            if(had == null && action.requires != null)
            {
                outputLine("ENTITY: I learned that " + action.name + " requires " + action.requires.name);
                
                //update required by on object
                var required = this.items.get({name: action.requires.name});
                //add to smart list
                required.requiredBy.push(action);
            }
            
            //if failed 
            if(false == flag)
            {
                //see if we didn't have the right item
                //or if the probability failed
                var i = this.inInventory(data.requires)
                
                //not in inventory
                if(i == -1)
                {
                    if(had != null)
                        outputLine("ENTITY: I already knew that " + action.name + " required " + action.requires.name);
                    return;
                }
                
                //log try
                this.actions.complete(data, flag);
            }
            else if(true == flag)
            {
                //log try
                this.actions.complete(data, flag);
                
                //update recieved from
                var resultingItem = this.items.get({name: data.results.name});
                resultingItem.recievedFrom.push(action);
                
                //update action with result
                //not a smart list
                if(action.results == null)
                {
                    action.results = resultingItem;
                    outputLine("ENTITY: I now know that " + action.name + " results in " + resultingItem.name);
                }
                
                //drop it/add new instance to world
                data.results.location = this.currentLocation.data;
                this.items.foundInstance(data.results, true);
                //update current location to ensure it updates
                this.currentLocation.data.items.push(resultingItem.name);
                
                
                //update value and see if we knew it before
                //if(data.results.value != null && resultingItem.value == null)
                //{
                //    resultingItem.value = data.results.value;
                //    outputLine("ENTITY: I now know that " + data.results.name + " is worth " + data.results.value);
                //}
                
                //TODO check if this was our goal
                if(this.objective != null 
                   && this.objective.name == action.name)
                {
                    //TODO
                    console.log("ENTITY: I wanted to do this");
                    debugger;
                }
                if(this.objective != null 
                   && this.objective.name == resultingItem.name)
                {
                    //TODO respond
                    console.log("ENTITY: I wanted this");
                    debugger;
                }
                
                //remove consumed item
                if(data.consume)
                {
                    for(var i in this.inventory)
                    {
                        if(this.inventory[i].name == action.requires.name)
                        {
                            this.inventory.splice(i, 1);
                            break;
                        }
                    }
                }
                //remove action if not repeatable
                if(!data.repeat)
                {
                    //instance
                    this.actions.removeInstance(data);
                    //location
                    this.currentLocation.data.actions.remove(data.name);
                }
            }
            break;
        default:
            debugger;
            console.log("unknown type");
    }
}

Entity.prototype.inInventory = function(name)
{
    for(var i in this.inventory)
    {
        if(this.inventory[i].name == name)
        {
            return i;
        }
    }
    for(var i in this.tools)
    {
        if(this.tools[i].name == name)
        {
            return 'tool';
        }
    }
    return -1;
}

Entity.prototype.getData = function()
{
    return {
        items : this.items.dump(),
        locations : this.locations.dump(),
        actions : this.actions.dump()
    }
}

Entity.prototype.setData = function( data )
{
    this.items.unDump( data.items );
    this.locations.unDump( data.locations );
    this.actions.unDump( data.actions );
}

Entity.types = {
    LOCATION : 0,
    ITEM : 1,
    ACTION : 2
}

Entity.actionTypes = {
    TRAVEL : 0,
    PICKUP : 1,
    DROP : 2,
    INTERACT : 3,
    ACTION_COMPLETE : 4,
    LOCATION_CHANGED : 5
}

Entity.sortFunction = function(a, b)
{
    if(null == b.value && null != a.value) return -1;
    else if(null == a.value && null != b.value) return 1;
    else if(null == a.value && null == b.value) return 0;
    else
        return b.value - a.value; 
}

Entity.getDistance = function(x1, y1, x2, y2)
{
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

Entity.itemRank = function(dist, value)
{
    //TODO tune
    return value * ( 1 - (dist * 0.1) );
}

Entity.actionRank = function(dist)
{
    //TODO
    return 1 - (dist * 0.1);
}
