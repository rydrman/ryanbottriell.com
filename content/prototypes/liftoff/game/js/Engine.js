var Engine = function()
{
    //usefull stuff
    this.timer;
    this.input;
    this.generator;
    this.crafting;
    
    //classes
    this.renderer;
    this.player;
    //this.ship;
    this.world;
    this.ui;
    
    // misc
    this.mouseLTarget;
    
    this.gameover = false;
}

Engine.prototype.init = function()
{
    //usefull stuff
    this.timer = new GameTimer();
    this.input= new Input();
    this.generator = new Generator();
    this.crafting = new Crafting();
    
    this.draggedItem = null;
    
    //classes
    this.renderer = new Renderer();
    this.player = new Player();
    
    //TODO get to inventory
    this.ui = new UI();

    //load everythign that needs loading
    var loader = new AsyncLoader()
    loader.onCompleteContext = this;
    loader.onComplete = this.begin;
    
    loader.addClassCall( this.renderer );
    loader.addClassCall( this.generator );
    loader.addClassCall( this.crafting );
    loader.addClassCall( this.ui );
    
    loader.runCalls();
}

Engine.prototype.begin = function()
{
    //get world 
    this.world = this.generator.generate();
    
    //initialize stuff
    this.renderer.init( canvas );
    this.player.init( this.timer );
    this.ui.init(this.crafting);
    
    //DEBUG create a ship
    //this.player.ship = new Ship();
    //this.player.inShip = true;
    //this.player.ship.init( this.timer );
    //this.world.ships.push(this.player.ship);
    
    //place player near planet
    var basePlanet = this.world.getInitialPlanet();
    this.player.position.set( basePlanet.position.x, basePlanet.position.y + basePlanet.radius + 0.2 );
    this.player.goal.copy(this.player.position);
    //set zoom
    this.renderer.zoom = (this.player.inShip) ? 1.0 : 2.5;
    
    
    //set 
    this.input.addListener( Input.eventTypes.MOUSEDOWN, this.onMouseDown, this );
    this.input.addListener(Input.eventTypes.RIGHTMOUSEDOWN, this.onRMouseDown, this);
    this.input.addListener( Input.eventTypes.MOUSESUST_L, this.onMouseSustainedL, this );
    
    this.input.addListener(Input.eventTypes.MOUSEMOVE_ABS, this.onMouseMove, this);
    
    this.input.addListener(Input.eventTypes.MOUSEUP, this.onMouseUp, this);
    
    onResize();
    window.requestAnimationFrame( this.frameCallback );
}

Engine.prototype.onMouseDown = function( mousePos )
{
    this.timer.startSubTick("mouseDown_L");
    var worldPos = this.renderer.unProject( mousePos );
    
    var checkUI = false;
    if ((this.ui.craftOpen || this.ui.shipOpen))
        checkUI = true;
    var uiResult = this.ui.sample(mousePos, this.player, true);
    if (checkUI && !uiResult)
        return;
    
    //try ui first, then ship / player, then world
    var result = this.world.sample( worldPos );
    if (uiResult) 
    {
        console.log ("UI ELEMENT CLICKED");
        this.mouseLTarget = "ui";
        if (uiResult.name == "playerInv") {
            if (uiResult.slotNo != null && this.draggedItem == null) { // pick it up
                this.draggedItem = this.player.getInventoryByIndex(uiResult.slotNo);
                // remove it from inventory
                if (this.draggedItem) {
                    this.draggedItem.position = mousePos;
                    delete this.player.inventory[this.draggedItem.name];
                }
            }
        } else if (uiResult.name == "shipInv" && this.player.inShip) {
            if (uiResult.slotNo != null && this.draggedItem == null) { // pick it up
                this.draggedItem = this.player.ship.getInventoryByIndex(uiResult.slotNo);
                // remove it from inventory
                if (this.draggedItem) {
                    this.draggedItem.position = mousePos;
                    delete this.player.ship.inventory[this.draggedItem.name];
                }
            }
        }
        
    } 
    else if (result) 
    {
        //console.log("World Element Clicked");
        if(result instanceof Ship)
        {
            if (this.player.position.clone().sub(result.position).length() < 1) 
            {
                this.player.toggleShipStatus(result);
                this.renderer.zoom = (this.player.inShip) ? 1.0 : 2.5;
            }
        }
        else if(result instanceof Planet)
        {
            //console.log("planet clicked");
        }
        else if( result instanceof BaseObject )
        {
            //console.log("item clicked", result);
            //item on a planet
            this.mouseLTarget = "world";
            // check if player is close enough to pick up object
            if (this.player.position.clone().sub(result.position).length() < 0.4)
            {
                //is it a breakable?
                switch( result.type )
                {
                    case "breakable":
                        
                        if(null == this.player.tool) break;
                        
                        for( var i in this.player.tool.actions)
                        {
                            if(-1 == result.receivedActions.indexOf( this.player.tool.actions[i] )) break;
                        }
                        
                        result.planet.removeItem( result );
                        
                        for(var i in result.drops)
                        {
                            for( var j = 0; j < result.drops[i]; j++)
                            {
                                var newItem = new BaseObject( this.ui.items[ i ] );
                                newItem.planetPosition = -0.1 + Math.random() * 0.1 + result.planetPosition;
                                result.planet.addItem( newItem );
                            }
                        }     
                        result.planet = null;
                        break;
                    default:
                        if (this.player.addToInventory(result))
                        {
                            result.planet.removeItem(result);
                            result.planet = null;
                        }
                        break;
                }
            }
            else
            {
                this.player.goal.copy(result.position)
            }
        }
    } 
    //else if (this.player.isInBounds(worldPos)) 
    //{
    //    this.ui.openCrafting( );
    //} 
    else if (this.player.inShip) 
    { // Update player / ship position
        this.mouseLTarget = "player";
        if (this.player.ship.landed)
            this.player.ship.launch();
        else
            this.player.ship.goal.copy(worldPos);
    } else 
    {
        this.mouseLTarget = "player";
        this.player.goal.copy( worldPos );
    }
}

Engine.prototype.onRMouseDown = function( mousePos) 
{
    var worldPos = this.renderer.unProject( mousePos );
    
    //Check UI elements first
    var uiResult = this.ui.sample(mousePos, this.player, true);

    var result = this.world.sample( worldPos );
    if (uiResult) 
    {
        // if item is consumable, consume it
        if (uiResult.name == "playerInv" && uiResult.slotNo != null) {
            var item = this.player.getInventoryByIndex(uiResult.slotNo);
            for (stat in item.consume) {
                if (stat == "fuel" || stat == "damage") {
                    if  (this.player.ship == null)
                        continue;
                    else
                        this.player.ship[stat] += item.consume[stat];
                } else {
                    this.player[stat] += item.consume[stat];
                }
            }
            // reduce quantity / remove
            if (item.quantity > 1)
                item.quantity --;
            else
                delete this.player.inventory[item.name];
        } else if (uiResult.name == "shipInv" && uiResult.slotNo != null && this.player.ship != null) {
            var item = this.player.ship.getInventoryByIndex(uiResult.slotNo);
            for (stat in item.consume) {
                if (stat == "fuel" || stat == "damage") {
                    this.player.ship[stat] += item.consume[stat];
                } else {
                    this.player[stat] += item.consume[stat]
                }
            }
            // reduce quantity / remove
            if (item.quantity > 1)
                item.quantity --;
            else
                delete this.player.ship.inventory[item.name];
        }
    }
    else if (this.player.isInBounds(worldPos)) 
    {
        //open crafting menu
        this.ui.openCrafting( );
    } 
    else if (result) 
    {
        if(result instanceof Ship)
        {
            if (this.player.inShip) 
            {
                if(this.player.ship === result)
                {
                    this.crafting.update(this.player);
                    this.ui.openShip( result );
                }
            }
            
        }
        else if( result instanceof Planet )
        {
            if (this.player.ship != null) {
                this.player.ship.landing = true;
                // set ship goal to be the planet
                this.player.ship.goal.copy(result.position);
            }
        }
    } 

}

Engine.prototype.onMouseMove = function(mousePos) 
{
    this.timer.startSubTick("mouseMove");
    
    var worldPos = this.renderer.unProject( mousePos );

    var uiSample = this.ui.sample( mousePos, this.player, false);
    var wSample = this.world.sample( worldPos );

    if( false != uiSample )
    {
        //TODO ui sample
        this.renderer.hoverText = null;
    }
    else if(null != wSample)
    {
        //console.log( wSample );
        if(wSample instanceof BaseObject)
        {
            this.renderer.hoverText = {
                position : mousePos,
                text : wSample.niceName
            };
        }
    }
    else 
    {
        this.renderer.hoverText = null;
    }
}

Engine.prototype.onMouseSustainedL = function(mousePos) {
    // Don't fire sustained right away - give a few milliseconds in case it's a click
    
    this.timer.endSubTick("mouseDown_L");
    if (this.timer.subTicks["mouseDown_L"].deltaMS > 150) {
        var worldPos = this.renderer.unProject( mousePos );

        //TODO try ui first, then ship / player, then world
        //var uiResult = this.ui.sample(mousePos, this.player);
        var result = this.world.sample( worldPos );
        if (this.draggedItem) {
                this.draggedItem.position = mousePos;
        } else if (/*uiResult &&*/ this.mouseLTarget == "ui") {
            //console.log ("UI ELEMENT SUSTAINED");
        }
        /*if (this.ship.isInBounds(worldPos)) {
            // Open Ship Menu
        } */
        else if(result instanceof Ship)
        {
        }
        else if(result instanceof Planet)
        {
        }
        else if(result instanceof BaseObject && this.mouseLTarget == "world") 
        {
            // check if player is close enough to pick up object
            // TODO - timer subtick
            switch( result.type )
            {
                case "breakable":

                    if(null == this.player.tool) break;
                    
                    for( var i in this.player.tool.actions)
                    {
                        if(-1 == result.receivedActions.indexOf( this.player.tool.actions[i] )) break;
                    }

                    result.planet.removeItem( result );

                    for(var i in result.drops)
                    {
                        for( var j = 0; j < result.drops[i]; j++)
                        {
                            var newItem = new BaseObject( this.ui.items[ i ] );
                            newItem.planetPosition = -0.1 + Math.random() * 0.1 + result.planetPosition;
                            result.planet.addItem( newItem );
                        }
                    }     
                    result.planet = null;
                    break;
                default:
                    if (this.player.addToInventory(result))
                    {
                        result.planet.removeItem(result);
                        result.planet = null;
                    }
                    break;
            }
        } 
        if (this.player.inShip && this.mouseLTarget == "player") { // Update player / ship position
            this.player.ship.goal.copy(worldPos);
        } else if (this.mouseLTarget == "player") {
            this.player.goal.copy( worldPos );
        }
    }
}

Engine.prototype.onMouseUp = function(mousePos) {
    // Get target if we need to
    if (this.draggedItem != null) {
        var uiResult = this.ui.sample(mousePos, this.player, false);
        if (uiResult.name == "playerInv") {
            if (this.player.addToInventory(this.draggedItem))
                this.draggedItem = null;
        } else if (uiResult.name == "shipInv") {
            if (this.player.ship.addToInventory(this.draggedItem))
                this.draggedItem = null;
        } else if (uiResult.name == this.draggedItem.type) { // if target is a ship ui
            this.player.ship.parts[this.draggedItem.type] = this.draggedItem;
            this.draggedItem = null;
        } else {
            // drop in world
            // make new planet position
            var types = ["cockpit", "cargo", "engine", "science", "engineering"];
            if (types.indexOf(this.draggedItem.type) > -1 ) {
                var newShip = new Ship();
                newShip.init(this.timer);
                newShip.position = this.player.position.clone();
                newShip.force.add(this.world.getGravity( newShip.position ));
                newShip.parts[this.draggedItem.type] = this.draggedItem;
                this.world.ships.push(newShip);
            } else if (this.player.planet != null) {
                this.draggedItem.planetPosition = this.player.planetPosition - (Math.PI /2);
                this.player.planet.addItem(this.draggedItem);
            } else {
                this.world.items.push(this.draggedItem);
            }
            this.draggedItem = null;
        }
    }
}

Engine.prototype.frameCallback = function()
{
    engine.update.call(engine);
}

Engine.prototype.update = function()
{
    this.timer.tick();
    this.input.update();
    
	this.crafting.update(this.player);
    // Check Game Over Condition
    if (this.player.oxygen <= 0) {
        this.gameOver = true;
        // render gameover screen
        
        this.input.addListener( Input.eventTypes.MOUSEDOWN, function() {location.reload()}, this );
        //window.requestAnimationFrame( this.frameCallback );
    }
    
    
    //update world
    this.world.update( this.timer, this.player );
    
    // Check mousemove timer for hovers
    this.timer.endSubTick("mouseMove");
    if (this.timer.subTicks["mouseMove"].deltaS > 1) 
    {
        //console.log("TODO: Hover Action on screen!");
        // Follow same pattern - sample ui, then ship / player, then world 
    }

    this.player.update( this.timer );
    if (!this.player.inShip) 
    {
        // Player / planet collision
        var gravity = this.world.getGravity( this.player.position );
        //this.player.force.add(gravity)
        
        var closest = this.world.getClosestPlanet( this.player.position );
        
        var checkDist = false;
        for (var p in this.world.planets) 
        {
            var planet = this.world.planets[p];
            var distance = planet.position.clone().sub(this.player.position).length();
            if (distance < planet.radius + 0.4) // TODO: Change to fit ship size
            { 
                // Player is on the surface - controls should behave
                checkDist = false; // don't want the force to continue acting
                
                this.player.planet = planet;
                
                // Set player position to exactly radius + 0.5 along that vector
                this.player.position.copy(planet.position.clone().add(planet.position.clone().sub(this.player.position).negate().normalize().multiplyScalar(planet.radius + 0.3)));
                // set player goal to be 0.5 along its current vector
                this.player.goal.copy(planet.position.clone().add(planet.position.clone().sub(this.player.goal).negate().normalize().multiplyScalar(planet.radius + 0.3)));
                break;
            } 
            else{
                this.player.planet = null;
            }
            /*else if (distance < 5 + planet.radius) 
            {
                // add gravity force to the movement
                //this.player.force = planet.position.clone().sub(this.player.position).normalize().multiplyScalar(0.1);
                console.log("GRAVITY on Player");
                checkDist = true;
                break;
            }*/
        }
        if (!checkDist) {
            this.player.force = new Vector2();
        }
    }
    
    //wrap if necessary
    var obj = this.player.inShip ? this.player.ship : this.player;
    if(!this.world.bounds.contains(obj.position))
    {
        obj.wrapValues( this.world.bounds );
    }
    
    //other class updates
    
    this.renderer.render( this.world, this.player, this.ship, this.ui, this.draggedItem, this.timer, this.gameOver );
    
    window.requestAnimationFrame( this.frameCallback );
}

Engine.prototype.resize = function( w, h )
{
    if( isDefined(this.renderer) )
    {
        this.renderer.resize( w, h );
        this.ui.resize(w, h);
    }
}