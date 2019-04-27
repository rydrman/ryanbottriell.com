//instantialtes a copy of the game game 

var Game = function()
{
    //for ui etc.
    this.isMenu = true;
    this.menu = {};
    this.menu.state = MENU_STATES.MAIN;
    this.menu.options = new Array(MENU_STATES.length);
    this.menu.options[MENU_STATES.MAIN] = [
        {name: 'Start Fresh'},
        {name: 'Start w/ Saved Data'},
        {name: 'Start Really Smart'}
    ];
    
    //for game world
    this.objects = [];
    this.grid = [];
    for(var i = 0; i < 5; ++i)
    {
        this.grid[i] = [];
        for(var j = 0; j < 5; ++j)
        {
            this.grid[i][j] = {
                name: 'ocean', 
                discovered: false, 
                img : document.getElementById('ocean'),
                x: i, y: j,
                actions: [],
                items: []
            };
        }
    }
    
    //gameplay stuff
    this.currentLoc = null;
    this.inventory = [];
    this.tools = [];
    
    //start loop
    this.draw();
    
    $.getJSON("php/getWorld.php", function(data){game.setup.call(game, data);});
}

//to be called by the returned json from the server
//populates the client with the generated game
Game.prototype.setup = function(data)
{
    //console.log(data);
    this.objects = data;
    
    //actions
    for(var i in this.objects.actions)
    {
       this.objects.actions[i].requires = this.objects.items[this.objects.actions[i].requires];
       this.objects.actions[i].results = this.objects.items[this.objects.actions[i].results];
       this.objects.actions[i].repeat = (this.objects.actions[i].repeat == "0") ? false : true;
       this.objects.actions[i].consume = (this.objects.actions[i].consume == "0") ? false : true;
       this.objects.actions[i].probability = parseFloat(this.objects.actions[i].probability);
    }
    
    //items
    for(var i in this.objects.items)
    {
        this.objects.items[i].value = parseInt(this.objects.items[i].value);
        this.objects.items[i].tool = (this.objects.items[i].tool == "0") ? false : true;
    }
    
    //populate grid and keep list
    for(var i = 0; i < this.objects.locations.length; ++i)
    {
        var loc = this.objects.locations[i];
        loc.discovered = false;
        loc.visited = false;
        loc.img = document.getElementById(loc.name);
        
        //actions
        for(var j = 0; j < loc.actions.length; ++j)
        {
            loc.actions[j] = $.extend(true, {}, this.objects.actions[loc.actions[j]]);   
            loc.actions[j].location = loc;   
        }
        
        //items
        for(var j = 0; j < loc.items.length; ++j)
        {
            loc.items[j] = $.extend(true, [], this.objects.items[loc.items[j]]);   
            loc.items[j].location = loc;
        }
        
        
        this.grid[loc.x][loc.y] = loc;
    }
    
}

Game.prototype.start = function()
{
    //console.log('start');
    
    //discover first location
    //this.currentLoc = this.grid[0][0];
    //this.currentLoc.discovered = true;
    this.grid[0][0].discovered = true;
    entity.onDiscovery(Entity.types.LOCATION, this.sensorLocation(this.grid[0][0], true, false, false));
    this.moveTo(0, 0);
    entity.makeDecision();
    outputLine("BREAK");
}
        
Game.prototype.commandEntered = function(command)
{
    
    if(command == "i")
    {
        outputLine("");
        var str = "INVENTORY: ";
        for(var i in this.inventory)
        {
            if( i == 0 )
                str += this.inventory[i];
            else
                str += ", " + this.inventory[i];
        }
        outputLine(str);
        return;
    } 
    else if(command == "save")
    {
        var data = entity.getData();
        var json = JSON.stringify(data);
        
        //push it
        $.post("php/saveData.php", {data: json} );
    }
    else if(command == "savebest")
    {
        var data = entity.getData();
        var json = JSON.stringify(data);
        
        //push it
        $.post("php/saveBestData.php", {data: json} );
    }
}

Game.prototype.click = function(e)
{
    if(!e) e = window.Event;
    
    var somethingHappened = false;
    
    //console.log(e);
    
    var x = e.offsetX,
        y = e.offsetY;
    
    //click the menu if necessary
    if(this.isMenu)
    {
        this.menuClick(x, y);
        //entity.makeDecision();
        outputLine("BREAK");
        return;
    }
    
    //otherwise we are in the game
    if(x < 360 && x > 40 && y < 360 && y > 40)
    {
        //we clicked on the grid
        somethingHappened = this.moveTo( Math.floor((x-40) / SPACE_SIZE) , Math.floor((y-40) / SPACE_SIZE) );        
    }
    else if(x > 400)
    {
        //we clicked on the right side
        //check list
        var action = this.clickList(x, y, 400, 75, this.currentLoc.actions);
        
        if(action != null)
        {
            somethingHappened = true;
            
            //do action
            if(typeof(action.requires) != 'undefined')
            {
                //check requirements
                if(-1 == this.inInventory(action.requires.name) && -1 == this.inTools(action.requires.name))
                {
                    outputLine("GAME: You require '" + action.requires.name + "' in order to '" + action.name + "'");
                    entity.onFeedbackRecieved(Entity.actionTypes.INTERACT, this.sensorAction(action, true, false), false);
                    entity.makeDecision();
                    outputLine("BREAK");
                    return;
                }
                
            }
            
            //do action
            if(Math.random() < action.probability)
            {
                outputLine( "GAME: " + action.message_success );
                
                //tell we succeeded
                entity.onFeedbackRecieved(Entity.actionTypes.INTERACT, this.sensorAction(action, true, true), true);
                //get result
                if(typeof(action.results) != 'undefined')
                {
                    var newItem = $.extend(true, {}, this.objects.items[action.results.name]);   
                    newItem.location = this.currentLoc; 
                    this.currentLoc.items.push(newItem);
                }

                //remove
                if(!action.repeat)
                {
                    for(var i in this.currentLoc.actions)
                    {
                        if(this.currentLoc.actions[i].name == action.name)
                        {
                            this.currentLoc.actions.splice( i, 1);
                            break;
                        }
                    }
                }
                
                //consume
                if(action.consume && typeof(action.requires) != 'undefined')
                {
                    for(var i in this.inventory)
                    {
                        if(this.inventory[i].name == action.requires.name)
                        {
                            this.inventory.splice( i, 1);
                            break;
                        }
                    }
                    //entity.onFeedbackRecieved(Entity.actionTypes.DROP, this.sensorItem(this.objects.items[action.requires.name], true));
                }
            }
            else
            {
                outputLine( "GAME: " + action.message_fail );
                //tell entity the action didn't succeed
                entity.onFeedbackRecieved(Entity.actionTypes.INTERACT, this.sensorAction(action, true, false), false);
            }
            
        }
        
        var item = this.clickList(x, y, 400, 50 * this.currentLoc.actions.length + 125, this.currentLoc.items);
        
        if(item != null)
        {
            somethingHappened = true;
            
            if(item.tool)
            {
                outputLine("GAME: You picked up: '" + item.name + "'. Tools do not fill your inventory.");
                this.tools.push(item);
                this.currentLoc.items.splice(this.currentLoc.items.indexOf(item), 1);
                entity.onFeedbackRecieved(Entity.actionTypes.PICKUP, this.sensorItem(item, true));
            }
            else if(this.inventory.length == 4)
            {
                outputLine("GAME: Your inventory is full, to drop something use the command 'drop [item name]'");
            }
            else
            {
                outputLine("GAME: You picked up: '" + item.name + "'");
                this.inventory.push(item);
                this.currentLoc.items.splice(this.currentLoc.items.indexOf(item), 1);
                entity.onFeedbackRecieved(Entity.actionTypes.PICKUP, this.sensorItem(item, true));
            }
            
            
        }
    }
    
    //give entity a chance to think
    if(true == somethingHappened)
    {
        entity.makeDecision();
        outputLine("BREAK");
    }
}

//deals with menu functionality
Game.prototype.menuClick = function(x, y)
{
    if( x > 300 && x < 500)
    {
        var i = Math.floor( (y - (200 - this.menu.options[this.menu.state].length * 0.5 * 50)) / 50);

        if( i < this.menu.options[this.menu.state].length)
        {

            var option = this.menu.options[this.menu.state][i];

            //figure out what to do
            switch(this.menu.state)
            {
                case MENU_STATES.MAIN:
                    switch(option.name)
                    {
                        case 'Start Fresh':
                            this.isMenu = false;
                            this.menu.state = MENU_STATES.NONE;
                            this.start();
                            break;
                        case 'Start w/ Saved Data':
                            this.isMenu = false;
                            this.menu.state = MENU_STATES.NONE;
                            $.get("php/savedData.json", function(data)
                                      {
                                          data = JSON.parse(data);
                                          entity.setData.call(entity, data );
                                          game.start.call(game);
                                      }, 'text');
                            break;
                        case 'Start Really Smart':
                            this.isMenu = false;
                            this.menu.state = MENU_STATES.NONE;
                            $.get("php/bestData.json", function(data)
                                      {
                                          data = JSON.parse(data);
                                          entity.setData.call(entity, data );
                                          game.start.call(game);
                                      }, 'text');
                            break;
                        default:
                            console.log("no logic for menu option '" + option + "' in state '" + this.menu.state + "'");
                    }
                    break;
                default:
                    console.log("no logic for menu state '" + this.menu.state + "'");
            }
        }
    }
}

Game.prototype.inInventory = function(name)
{
    for(var i in this.inventory)
    {
        if(this.inventory[i].name == name)
        {
            return i;
        }
    }
    return -1;
}

Game.prototype.inTools = function(name)
{
    for(var i in this.tools)
    {
        if(this.tools[i].name == name)
        {
            return i;
        }
    }
    return -1;
}

Game.prototype.moveTo = function(posX, posY)
{
    var space = this.grid[posX][posY];
    var somethingHappened = false;
    
    // move first
    //if(space.name != 'ocean')
    //{
    //    this.currentLoc = space;
    //    this.currentLoc.visited = true;
    //    entity.onFeedbackRecieved(Entity.actionTypes.TRAVEL, this.sensorLocation(this.currentLoc, true, true, true));
    //}
    
    //move if adjacent
    var diffX = (this.currentLoc == null) ? 0 : Math.abs(this.currentLoc.x - space.x),
        diffY = (this.currentLoc == null) ? 0 : Math.abs(this.currentLoc.y - space.y);
    if( (diffX == 1 && diffY == 0) || (diffX == 0 && diffY == 1) || this.currentLoc == null )
    {
        somethingHappened = true;
        
        //move and discover
        if(space.name != 'ocean')
        {
            this.currentLoc = space;
            entity.onFeedbackRecieved(Entity.actionTypes.TRAVEL, this.sensorLocation(this.currentLoc, true, true, true));
            
            if(space.visited == false)
            {
                //discover actionas and items
                for(var i in space.actions)
                {
                    entity.onDiscovery(Entity.types.ACTION, this.sensorAction(space.actions[i], false, false));
                }
                for(var i in space.items)
                {
                    entity.onDiscovery(Entity.types.ITEM, this.sensorItem(space.items[i], false));
                }
            }
            
            space.discovered = true;
            space.visited = true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }
    
    //discover all squares around it
    for(var x = posX-1; x <= posX + 1; ++x)
    {
        if(x < 0 || x > 4) continue;
        for(var y = posY-1; y <= posY + 1; ++y)
        {
            if(y < 0 || y > 4) continue;
            
            //discover location
            var loc = this.grid[x][y];
            
            if(!loc.discovered)
            {
                if(loc.name != 'ocean')
                {
                    loc.discovered = true;
                    entity.onDiscovery(Entity.types.LOCATION, this.sensorLocation(loc, true, false, false));
                }
                else
                {
                    this.discoverOceans(x, y);
                }
            }
        }
    }
    return somethingHappened;
}

Game.prototype.draw = function()
{
    
    window.requestAnimationFrame(function(){game.draw.call(game)});
    
    //clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    //label map
    ctx.fillStyle = "#AAA";
    ctx.font = "12px consolas";
    ctx.textAlign = 'center';
    for(var x in this.grid[0])
    {
        ctx.fillText("x" + x, 40 + x * SPACE_SIZE + SPACE_SIZE * 0.5, 30);
    }
    for(var y in this.grid)
    {
        ctx.fillText("y" + y, 25, 40 + y * SPACE_SIZE + SPACE_SIZE * 0.5);
    }
    
    //draw map
    ctx.fillStyle = "#FFF";
    ctx.font = "12px consolas";
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(40, 40);
    for(var y = 0; y < 5; ++y)
    {
        for(var x = 0; x < 5; ++x)
        {
            var space = this.grid[x][y];
            
            if(space === this.currentLoc)
            {
                ctx.strokeStyle = "#13f323";
                ctx.lineWidth = 4;
                ctx.strokeRect(x * SPACE_SIZE + 2, y * SPACE_SIZE + 2, SPACE_SIZE - 4, SPACE_SIZE - 4);
            }
            else
            {
                ctx.strokeStyle = "#FFF";
                ctx.lineWidth = 2;
                ctx.strokeRect(x * SPACE_SIZE + 1, y * SPACE_SIZE + 1, SPACE_SIZE - 2, SPACE_SIZE - 2);
            }
            
            if( space != null )
            {
                //image or name
                if(space.discovered)
                {
                    if(space.img != null)
                    {
                        ctx.drawImage(space.img, x * SPACE_SIZE, y * SPACE_SIZE);
                    }
                    ctx.fillText(this.grid[x][y].name, 32 + x * SPACE_SIZE, 60 + y * SPACE_SIZE);
                    if(space.visited == false)
                    {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                        ctx.fillRect(x * SPACE_SIZE, y * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
                        ctx.fillStyle = "#FFF";
                    }
                }
                else
                {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    ctx.fillRect(x * SPACE_SIZE, y * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
                    ctx.fillStyle = "#FFF";
                    ctx.drawImage(document.getElementById('unknown'), x * SPACE_SIZE, y * SPACE_SIZE);
                }
            }
        }
    }
    ctx.restore();
    
    //draw current score
    var wealth = 0;
    for(var i in this.inventory)
    {
        wealth += this.inventory[i].value;
    }
    ctx.font = "18px consolas";
    ctx.fillStyle = "#AAA";
    ctx.textAlign = 'right';
    ctx.fillText("Current Wealth: " + wealth + " / 100", 790, 28);
    
    //draw current inventory
    var list = "";
    for(var i in this.inventory)
    {
        if(i > 0)
            list += ", ";
        list += this.inventory[i].name;
    }
    ctx.textAlign = 'left';
    ctx.fillText("Inventory: " + list, 10, 390);
    
    
    //draw UI
    //movement
    var img = document.getElementById('arrow');
    ctx.save();
    ctx.translate(580, 200);
    //for(var i = 0; i < 4; ++i)
    //{
    //    ctx.drawImage(img, 130, -32);
    //    ctx.rotate(Math.PI * 0.5);
    //}
    ctx.restore();
    
    if(this.currentLoc != null)
    {
        ctx.fillStyle = "#FFF";
        ctx.font = "20px consolas"
        ctx.textAlign = 'center';
        ctx.fillText("Do:", 580, 60);
        //actions
        if(this.currentLoc != null)
            this.drawList(480, 75, this.currentLoc.actions);
        //items
        ctx.fillText("Pickup:", 580, 50 * this.currentLoc.actions.length + 110);
        if(this.currentLoc != null)
            this.drawList(480, 50 * this.currentLoc.actions.length + 125, this.currentLoc.items);
    }
    
    //menu(s)
    if(this.isMenu)
    {
        //background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        //menu block
        this.drawList(300, 
                      200 - this.menu.options[this.menu.state].length * 0.5 * 50, 
                      this.menu.options[this.menu.state]
                     );
    }
}

Game.prototype.drawList = function(x, y, options)
{
    ctx.save();
    ctx.translate(x, y);
    ctx.font = "22px sans-serif";
    ctx.textAlign = 'center';
    for(var i in options)
    {
        //block
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, i * 50, 200, 40);

        //text
        ctx.fillStyle = "#666";
        ctx.fillText(options[i].name.capitalize(), 100, i * 50 + 28);
    }
    ctx.restore();
}

Game.prototype.clickList = function(mouseX, mouseY, x, y, options)
{
    mouseX -= x;
    mouseY -= y;
    
    var rect = Math.floor(mouseY / 50);
    
    if(rect >= 0 && rect < options.length)
        return options[rect];
    else
        return null;
        
}

Game.prototype.discoverOceans = function(baseX, baseY)
{
    var toCheck = [ this.grid[baseX][baseY] ];

    while(toCheck.length)
    {
        var newCheck = [];
        for(var i in toCheck)
        {
            if(toCheck[i].name == 'ocean' && toCheck[i].discovered == false)
            {
                toCheck[i].discovered = true;
                entity.onDiscovery(Entity.types.LOCATION, toCheck[i]);
                
                //right
                if(toCheck[i].x < 4) newCheck.push( this.grid[ toCheck[i].x + 1 ][ toCheck[i].y ]);
                //bottom
                if(toCheck[i].y < 4) newCheck.push( this.grid[ toCheck[i].x ][ toCheck[i].y + 1 ]);                             
                //left
                if(toCheck[i].x > 0) newCheck.push( this.grid[ toCheck[i].x - 1 ][ toCheck[i].y ]);
                //top
                if(toCheck[i].y > 0) newCheck.push( this.grid[ toCheck[i].x ][ toCheck[i].y - 1 ]);
            }
        }
        toCheck = newCheck;
    }
    outputLine("GAME: You find yourself looking out over a vast ocean");
}

Game.prototype.sensorLocation = function( loc, pos, items, actions )
{
    var sensored = {};
    sensored.name = loc.name;
    sensored.x = (pos) ? loc.x : null;
    sensored.y = (pos) ? loc.y : null;
    
    var itemNames = [];
    for(var i in loc.items)
        itemNames.push(loc.items[i].name);
    sensored.items = (items) ? itemNames : null;
    
    var actionNames = [];
    for(var i in loc.actions)
        actionNames.push(loc.actions[i].name);
    sensored.actions = (actions) ? actionNames : null;
    
    return sensored;
}
Game.prototype.sensorAction = function( action, requires, results )
{
    var sensored = {};
    
    sensored.name = action.name;
    sensored.location = this.sensorLocation(action.location, true);
    sensored.requires = (requires && action.requires) ? action.requires.name : null;
    sensored.results = (results && action.results) ? this.sensorItem(this.objects.items[action.results.name], true) : null;
    sensored.consume = (results) ? action.consume : null;
    sensored.repeat = (results) ? action.repeat : null;
    
    return sensored;
}
Game.prototype.sensorItem = function( item, value )
{
    var sensored = {};
    
    sensored.name = item.name;
    sensored.location = (item.location) ? this.sensorLocation(item.location, true) : null;
    sensored.value = (value) ? item.value : null;
    sensored.tool = item.tool;
    
    return sensored;
}

Game.locations = {
    TOWN : 0,
    RIVER : 1,
    MOUNTAIN : 2,
    FIELDS : 3
};

Game.scores = {
    IS_GOAL : 0.5,
    CONTAINS_ITEM : 0.2,
    SAME_LOCATION : 0.1
}

var MENU_STATES = {
    NONE : -1,
    MAIN : 0,
    PAUSE : 1
};

var SPACE_SIZE = 64;
