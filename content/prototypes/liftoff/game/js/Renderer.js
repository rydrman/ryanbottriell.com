var Renderer = function()
{
    AsyncLoadable.call(this);
    
    this.zoom = 1.0; // TODO - a "Goal" type system like player
    this.viewport = new Rectangle();
    
    this.initialized = false;
    this.canvas;
    this.ctx;
    
    this.pixelRatio = 50;
    this.pixelRatioInv = 1 / this.pixelRatio;
    
    this.backgroundImg = new Image();
    
    this.hoverText = null;
}

Renderer.prototype = new AsyncLoadable();

Renderer.prototype.load = function()
{
    var loader = new AsyncLoader();
    loader.onComplete = this.onLoad;
    loader.onCompleteContext = this.onLoadContext;
    
    loader.addImageCall("assets/StarryBackground-02.png", this.backgroundImg);
    
    loader.runCalls();
}

Renderer.prototype.init = function( canvas )
{
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.initialized = true;
}

Renderer.prototype.render = function( world, player, ship, ui, draggedItem, timer, gameover )
{
    this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    
    //calculate world viewport first
    var center = player.position.clone();
    //var centerPixel = this.worldToPixel2( center );
    var viewportSize = this.pixelToWorld2( new Vector2( this.canvas.width, this.canvas.height ) );
    this.viewport.x = center.x - viewportSize.x * 0.5;
    this.viewport.y = center.y - viewportSize.y * 0.5;
    this.viewport.w = viewportSize.x;
    this.viewport.h = viewportSize.y;
    
    //draw repeating background
    var backSize = new Vector2( this.backgroundImg.width, this.backgroundImg.height );
    var backSizeWorld = this.pixelToWorld2( backSize );
    var offset = new Vector2( this.viewport.x % backSizeWorld.x, this.viewport.y % backSizeWorld.y );
    offset = this.worldToPixel2( offset );
    var x = -(backSize.x + offset.x);
    
    while(x < this.canvas.width)
    {
        var y = -(backSize.y + offset.y);
        while(y < this.canvas.height)
        {
            this.ctx.drawImage(this.backgroundImg, x, y, this.backgroundImg.width, this.backgroundImg.height);
                               
            y += backSize.y;
        }
        x += backSize.x;
    }
    
    if(Settings.debug)
    {
        //debug lines
        var x = 0,
            y = 0;
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        var step = this.worldToPixel( 1 );
        var offsetPixel = this.worldToPixel2( center );
        offsetPixel = new Vector2( offsetPixel.x % step, offsetPixel.y % step );
        offsetPixel.negate();
        this.ctx.beginPath();
        while( x < this.canvas.width + step )
        {
            this.ctx.moveTo( x + offsetPixel.x, 0 );
            this.ctx.lineTo( x + offsetPixel.x, this.canvas.height );
            x += step;
        }
        while( y < this.canvas.height + step )
        {
            this.ctx.moveTo( 0, y + offsetPixel.y );
            this.ctx.lineTo( this.canvas.width, y + offsetPixel.y );
            y += step;
        }
        this.ctx.stroke();
        
        //draw thicker edge lines
        this.ctx.lineWidth = 5;
        var origin = this.project( world.wrapCoords( this.viewport.center, new Vector2( 0, 0 )) );
        this.ctx.beginPath();
        this.ctx.moveTo( 0, origin.y );
        this.ctx.lineTo( this.canvas.width, origin.y );
        this.ctx.moveTo( origin.x, 0 );
        this.ctx.lineTo( origin.x, this.canvas.height );
        this.ctx.stroke();
        
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillText(timer.framerate.toFixed(2), 10, 10);
        
        //player / ship goal
        var goal = (player.inShip) ? this.project(player.ship.goal) : this.project( player.goal );
        this.ctx.fillStyle = "#F00";
        this.ctx.beginPath();
        this.ctx.arc(goal.x, goal.y, 10, 0, Math.PI * 2, false);
        this.ctx.fill();
        
        //debug player position
        this.ctx.fillStyle = "#FFF";
        var pos = player.position.clone();
        this.ctx.fillText("x: " + pos.x.toFixed(2) + ", y: " + pos.y.toFixed(2), 10, 30);
        
        // Player Position
        if (!player.inShip) {
            this.ctx.fillStyle = "#0F0";
            var playerPos = this.project(player.position);
            this.ctx.beginPath();
            this.ctx.arc(playerPos.x, playerPos.y, 10, 0, Math.PI * 2, false);
            this.ctx.fill();
        }
        
    }
    
    this.drawPlanets( world );
    
    
    //drawShips, not player ship
    for(var i in world.ships)
    {
        //TODO
        if(world.ships[i] === player.ship) continue;
        
        this.renderShip( world.ships[i] );
    }
    
    //draw player
    if(!player.ship)
    {
        this.renderPlayer( player );
    }
    
    this.drawItems( world );
    
    //ui and player ship
    var shipDrawn = this.renderUI( ui, player);

    if(!shipDrawn && player.ship)
    {
        this.renderShip( player.ship );
    }
    
    
    // render dragged item
    if (draggedItem != null) {
        this.ctx.drawImage(draggedItem.image,
                           draggedItem.position.x - 25,
                           draggedItem.position.y - 25,
                           50, 50);
    }
    else if (this.hoverText != null)
    {
        this.ctx.font = "20px " + Settings.fontFamily;
        this.ctx.fillText(this.hoverText.text, this.hoverText.position.x, this.hoverText.position.y);
    }
    
    if (gameover)
        this.ctx.drawImage(ui.gameOverImg,
                           ui.gameOver.x * this.canvas.width,
                           ui.gameOver.y * this.canvas.height,
                           ui.gameOver.w * this.canvas.width,
                           ui.gameOver.h * this.canvas.height );
    
}

Renderer.prototype.drawPlanets = function( world )
{
    //draw planets
    this.ctx.fillStyle = "#F00";
    var p, pos, rad, wrapped;
    for(var i in world.planets)
    {
        p = world.planets[i];
        wrapped = world.wrapCoords( this.viewport.center, p.position );
        
        if( this.viewport.distanceTo( wrapped ) > p.radius + this.viewport.w )
            continue;
        
        pos = this.project( wrapped );
        rad = this.worldToPixel( p.radius );
        
        this.ctx.save();
        this.ctx.translate( pos.x, pos.y );
        //draw atmosphere
        if(p.atmosphere)
        {
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.ctx.beginPath();
            this.ctx.arc(0, 0, rad + this.worldToPixel(1), 0, Math.PI * 2, false );
            this.ctx.fill();
        }
        //draw shell
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad, 0, Math.PI * 2, false );
        this.ctx.fill();
        
        this.ctx.restore()
    }
    
    this.ctx.font = "20px " + Settings.fontFamily;
    this.ctx.fillStyle = "#AAA";
    this.ctx.textAlign = 'left';
    this.ctx.fillText("Pro tip: Right click the player to bring up the crafting menu", 10, this.canvas.height - 10);
}
    
Renderer.prototype.drawItems = function( world )
{
    //draw planets
    this.ctx.fillStyle = "#F00";
    var p, pos, rad, wrapped;
    for(var i in world.planets)
    {
        p = world.planets[i];
        wrapped = world.wrapCoords( this.viewport.center, p.position );

        if( this.viewport.distanceTo( wrapped ) > p.radius + this.viewport.w )
            continue;

        pos = this.project( wrapped );
        rad = this.worldToPixel( p.radius );

        this.ctx.save();
        this.ctx.translate( pos.x, pos.y );
        //draw items
        for(var j = p.items.length - 1; j >= 0; --j)
        {
            if(this.zoom < 2 || !p.items[j].image.complete) continue;

            this.ctx.save();
            this.ctx.rotate( p.items[j].planetPosition );
            this.ctx.translate(0, rad + this.worldToPixel(p.items[j].bounds.h * 0.125))
            this.ctx.rotate( Math.PI )
            this.ctx.scale( p.items[j].renderScale, p.items[j].renderScale );

            //debug collider
            if(Settings.debug)
            {
                this.ctx.save();
                //this.ctx.translate( -p.items[i].image.width * 0.5, -p.items[i].image.height * 0.75 ); 
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                //this.ctx.fillRect( ship.bounds.x, ship.bounds.y, ship.bounds.w, ship.bounds.h );
                this.ctx.fillRect( this.worldToPixel( p.items[j].bounds.x ), 
                                   this.worldToPixel( p.items[j].bounds.y ), 
                                   this.worldToPixel( p.items[j].bounds.w ), 
                                   this.worldToPixel( p.items[j].bounds.h ) );
                this.ctx.restore();
            }

            //draw item
            try{
                this.ctx.drawImage( p.items[j].image, -p.items[j].image.width * 0.5, -p.items[j].image.height * 0.5);
            }
            catch(err)
            {
                console.warn("image does not exist: " + p.items[j].image.src);
                p.items[i].image = missingImg;
                p.items[i].imageDone();
            }
            //this.ctx.restore();



            this.ctx.restore();
        }
        this.ctx.restore()
    }
}


Renderer.prototype.renderPlayer = function( player )
{
    if(player.planet)
    {
        //var offset = player.position.clone().sub(player.planet.position);
        //player.rotation = offset.toRotation();
    }
    
    var center = this.project( player.position );
    
    this.ctx.save();
    
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate( player.rotation - Math.PI * 0.5 );
    this.ctx.scale( player.renderScale, player.renderScale );
    
    try{
        this.ctx.drawImage( player.image, 
                        this.worldToPixel( player.bounds.x ),
                        this.worldToPixel( player.bounds.y - player.bounds.h * 0.125 ),
                        this.worldToPixel( player.bounds.w ),
                        this.worldToPixel( player.bounds.h )
                      );
    }
    catch(err){
         this.ctx.drawImage( missingImg, 
                        this.worldToPixel( player.bounds.x ),
                        this.worldToPixel( player.bounds.y ),
                        this.worldToPixel( player.bounds.w ),
                        this.worldToPixel( player.bounds.h )
                      );
    }
    
    this.ctx.restore();
}

Renderer.prototype.renderUI = function( ui, player )
{    
    var ship = player.ship;
    // Draw player / ship stats
    
    this.ctx.fillStyle = "#222";
    this.ctx.fillRect((ui.playerShipStats.oxygen.x - (5/1920))* this.canvas.width,
                       (ui.playerShipStats.oxygen.y - (5/1080))* this.canvas.height,
                       (ui.playerShipStats.oxygen.w + (10/1920))* this.canvas.width,
                       (ui.playerShipStats.oxygen.h + (10/1080)) * this.canvas.height);
    
    this.ctx.drawImage(ui.statHealthEmptyImg,
                       ui.playerShipStats.oxygen.x * this.canvas.width,
                       ui.playerShipStats.oxygen.y * this.canvas.height,
                       ui.playerShipStats.oxygen.w * this.canvas.width,
                       ui.playerShipStats.oxygen.h * this.canvas.height
                      );
    this.ctx.drawImage(ui.statHealthFullImg,
                       0,
                       150 - 150/100*player.oxygen,
                       150,
                       150/100*player.oxygen,
                       ui.playerShipStats.oxygen.x * this.canvas.width,
                       ui.playerShipStats.oxygen.y * this.canvas.height + (ui.playerShipStats.oxygen.h * this.canvas.height)  * (1 - (player.oxygen / 100)),
                       ui.playerShipStats.oxygen.w * this.canvas.width,
                       ui.playerShipStats.oxygen.h * this.canvas.height * (player.oxygen / 100)
                      );
    
    this.ctx.fillRect((ui.playerShipStats.comfort.x - (5/1920))* this.canvas.width,
                       (ui.playerShipStats.comfort.y - (5/1080))* this.canvas.height,
                       (ui.playerShipStats.comfort.w + (10/1920))* this.canvas.width,
                       (ui.playerShipStats.comfort.h + (10/1080)) * this.canvas.height);
    this.ctx.drawImage(ui.statComfortEmptyImg,
                       ui.playerShipStats.comfort.x * this.canvas.width,
                       ui.playerShipStats.comfort.y * this.canvas.height,
                       ui.playerShipStats.comfort.w * this.canvas.width,
                       ui.playerShipStats.comfort.h * this.canvas.height
                      );
    this.ctx.drawImage(ui.statComfortFullImg,
                       0,
                       150 - 150/100*player.comfort,
                       150,
                       150/100*player.comfort,
                       ui.playerShipStats.comfort.x * this.canvas.width,
                       ui.playerShipStats.comfort.y * this.canvas.height + (ui.playerShipStats.comfort.h * this.canvas.height)  * (1 - (player.comfort / 100)),
                       ui.playerShipStats.comfort.w * this.canvas.width,
                       ui.playerShipStats.comfort.h * this.canvas.height * (player.comfort / 100)
                      );
    
    if (ship && player.inShip) {
        this.ctx.fillRect((ui.playerShipStats.damage.x - (5/1920))* this.canvas.width,
                           (ui.playerShipStats.damage.y - (5/1080))* this.canvas.height,
                           (ui.playerShipStats.damage.w + (10/1920))* this.canvas.width,
                           (ui.playerShipStats.damage.h + (10/1080)) * this.canvas.height);
        this.ctx.drawImage(ui.statDamageEmptyImg,
                           ui.playerShipStats.damage.x * this.canvas.width,
                           ui.playerShipStats.damage.y * this.canvas.height,
                           ui.playerShipStats.damage.w * this.canvas.width,
                           ui.playerShipStats.damage.h * this.canvas.height
                          );
        this.ctx.drawImage(ui.statDamageFullImg,
                           0,
                           150 - 150/100*ship.damage,
                           150,
                           150/100*ship.damage,
                           ui.playerShipStats.damage.x * this.canvas.width,
                           ui.playerShipStats.damage.y * this.canvas.height + (ui.playerShipStats.damage.h * this.canvas.height)  * (1 - (ship.damage / 100)),
                           ui.playerShipStats.damage.w * this.canvas.width,
                           ui.playerShipStats.damage.h * this.canvas.height * (ship.damage / 100)
                          );
        
        
        this.ctx.fillRect((ui.playerShipStats.fuel.x - (5/1920))* this.canvas.width,
                           (ui.playerShipStats.fuel.y - (5/1080))* this.canvas.height,
                           (ui.playerShipStats.fuel.w + (10/1920))* this.canvas.width,
                           (ui.playerShipStats.fuel.h + (10/1080)) * this.canvas.height);
        this.ctx.drawImage(ui.statFuelEmptyImg,
                           ui.playerShipStats.fuel.x * this.canvas.width,
                           ui.playerShipStats.fuel.y * this.canvas.height,
                           ui.playerShipStats.fuel.w * this.canvas.width,
                           ui.playerShipStats.fuel.h * this.canvas.height
                          );
        
        this.ctx.drawImage(ui.statFuelFullImg,
                           0,
                           150 - 150/100*ship.fuel,
                           150,
                           150/100*ship.fuel,
                           ui.playerShipStats.fuel.x * this.canvas.width,
                           ui.playerShipStats.fuel.y * this.canvas.height + (ui.playerShipStats.fuel.h * this.canvas.height)  * (1 - (ship.fuel / ship.fuelCapacity)),
                           ui.playerShipStats.fuel.w * this.canvas.width,
                           ui.playerShipStats.fuel.h * this.canvas.height * (ship.fuel / ship.fuelCapacity)
                          );
    }
    
    //draw inventory
    
    //tools and clothes
    this.ctx.drawImage(ui.equipBackImg,
                       ui.playerEquip.background.x * this.canvas.width,
                       ui.playerEquip.background.y * this.canvas.height,
                       ui.playerEquip.background.w * this.canvas.width,
                       ui.playerEquip.background.h * this.canvas.height );
    for(var i in ui.playerEquip.slots)
    {
        if(Settings.debug)
        {
            this.ctx.fillStyle = "#555";
            this.ctx.fillRect(ui.playerEquip.slots[i].x * this.canvas.width,
                              ui.playerEquip.slots[i].y * this.canvas.height,
                              ui.playerEquip.slots[i].w * this.canvas.width,
                              ui.playerEquip.slots[i].h * this.canvas.height);
        }
        if(player[i] && player[i] != null)
        {
            this.ctx.drawImage(player[i].image,
                               ui.playerEquip.slots[i].x * this.canvas.width,
                               ui.playerEquip.slots[i].y * this.canvas.height,
                               ui.playerEquip.slots[i].w * this.canvas.width,
                               ui.playerEquip.slots[i].h * this.canvas.height);
        }
    }
    
    //inventory
    this.ctx.drawImage(ui.playerInventoryImg,
                       ui.playerInv.background.x * this.canvas.width,
                       ui.playerInv.background.y * this.canvas.height,
                       ui.playerInv.background.w * this.canvas.width,
                       ui.playerInv.background.h * this.canvas.height );
    this.ctx.fillStyle = "#555";
    for (var i = 0; i < ui.playerInv.slots.length; i++) {
        this.ctx.fillRect(ui.playerInv.slots[i].x * this.canvas.width,
                          ui.playerInv.slots[i].y * this.canvas.height,
                          ui.playerInv.slots[i].w * this.canvas.width,
                          ui.playerInv.slots[i].h * this.canvas.height);
    }
    var slot = 0;
    this.ctx.fillStyle = "#fff";
    for (var i in player.inventory) {
        this.ctx.drawImage(player.inventory[i].image,
                          ui.playerInv.slots[slot].x * this.canvas.width,
                          ui.playerInv.slots[slot].y * this.canvas.height,
                          ui.playerInv.slots[slot].w * this.canvas.width,
                          ui.playerInv.slots[slot].h * this.canvas.height);
        // Render quantity if above 1
        if (player.inventory[i].quantity > 1) {
            this.ctx.fontSize = (ui.playerInv.fontSize * this.canvas.width).toFixed(2);
            this.ctx.fillText(player.inventory[i].quantity,
                              (ui.playerInv.slots[slot].x * this.canvas.width) + (ui.playerInv.fontTranslate.x * this.canvas.width),
                              (ui.playerInv.slots[slot].y * this.canvas.height) + (ui.playerInv.fontTranslate.y * this.canvas.height));
        }
        
        slot ++;
    }
    
    
    if (ship && player.inShip) {
        this.ctx.drawImage(ui.shipInventoryImg,
                           ui.shipInv.background.x * this.canvas.width,
                           ui.shipInv.background.y * this.canvas.height,
                           ui.shipInv.background.w * this.canvas.width,
                           ui.shipInv.background.h * this.canvas.height );
        this.ctx.fillStyle = "#555";
        for (var i=0; i < ui.shipInv.slots.length; i++) {
            this.ctx.fillRect(ui.shipInv.slots[i].x * this.canvas.width,
                              ui.shipInv.slots[i].y * this.canvas.height,
                              ui.shipInv.slots[i].w * this.canvas.width,
                              ui.shipInv.slots[i].h * this.canvas.height);
        }
        var slot = 0;
        this.ctx.fillStyle = "#fff";
        for (i in ship.inventory) {
            this.ctx.drawImage(ship.inventory[i].image,
                              ui.shipInv.slots[slot].x * this.canvas.width,
                              ui.shipInv.slots[slot].y * this.canvas.height,
                              ui.shipInv.slots[slot].w * this.canvas.width,
                              ui.shipInv.slots[slot].h * this.canvas.height);
            // Render quantity if above 1
            
            if (ship.inventory[i].quantity > 1) {
                this.ctx.fontSize = (ui.shipInv.fontSize * this.canvas.width).toFixed(2);
                this.ctx.fillText(ship.inventory[i].quantity,
                                  (ui.shipInv.slots[slot].x * this.canvas.width) + (ui.shipInv.fontTranslate.x * this.canvas.width),
                                  (ui.shipInv.slots[slot].y * this.canvas.height) + (ui.shipInv.fontTranslate.y * this.canvas.height));
            }
            slot ++;
        }
    }
    
    //draw crafting
    if( ui.craftOpen )
    {
        //draw background square
        this.ctx.drawImage(ui.craftBackImg, 
                           ui.craftingMenu.background.x * this.canvas.width,
                           ui.craftingMenu.background.y * this.canvas.height,
                           ui.craftingMenu.background.w * this.canvas.width,
                           ui.craftingMenu.background.h * this.canvas.height
                          );
        for(var i in Ship.parts)
        {
            //draw top row of menu items
            this.ctx.drawImage(ui.shipIcons[i], 
                               ui.craftingMenu.topRow[i].x * this.canvas.width,
                               ui.craftingMenu.topRow[i].y * this.canvas.height,
                               ui.craftingMenu.topRow[i].w * this.canvas.width,
                               ui.craftingMenu.topRow[i].h * this.canvas.height
                              );
        }
        
        if(Settings.debug)
        {
            //craft are back
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(ui.craftingMenu.recipesArea.x * this.canvas.width,
                               ui.craftingMenu.recipesArea.y * this.canvas.height,
                               ui.craftingMenu.recipesArea.w * this.canvas.width,
                               ui.craftingMenu.recipesArea.h * this.canvas.height
                              );
        }
        
        //recies area
        var recipes = ui.getCraftingOptions();
        
        var x = ui.craftingMenu.recipesArea.x * this.canvas.width, 
            y = ui.craftingMenu.recipesArea.y * this.canvas.height,
            w = ui.craftingMenu.recipesArea.w * this.canvas.width,
            h = ui.craftingMenu.recipesArea.h * this.canvas.height;
        var bw = ui.craftingMenu.recipeBlock.w * this.canvas.width,
            bh = ui.craftingMenu.recipeBlock.h * this.canvas.height;
        var buffer = ui.craftingMenu.recipeBuffer.clone();
        buffer.x *= this.canvas.width;
        buffer.y *= this.canvas.height;
        var curY = y,
            curX = x;
        for(var i in recipes)
        {
            if(Settings.debug)
            {
                //craft are back
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                this.ctx.fillRect(curX, curY, bw, bh);
            }
            
            var item = ui.items[ recipes[i].result ];
            try{
                var scale = Math.min( bh * 0.9 / item.image.height, bw * 0.9 / item.image.width );
                var center = new Vector2(
                    curX + bw * 0.5,
                    curY + bh * 0.5
                );
                var dim = new Vector2(
                    item.image.width * scale,
                    item.image.height * scale
                );
                this.ctx.drawImage( item.image, center.x - dim.x * 0.5, center.y - dim.y * 0.5, dim.x, dim.y );
            }
            catch(err)
            {
                this.ctx.drawImage( missingImg, curX, curY, bw, bh );
            }
            
            curX += (bw + buffer.x);
            if(curX + bw + buffer.x > x + w)
            {
                curX = x;
                curY += (bh + buffer.y);
            }
        }
        
        //details area
        if(Settings.debug)
        {
            //craft are back
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            this.ctx.fillRect(ui.craftingMenu.detailArea.x * this.canvas.width,
                               ui.craftingMenu.detailArea.y * this.canvas.height,
                               ui.craftingMenu.detailArea.w * this.canvas.width,
                               ui.craftingMenu.detailArea.h * this.canvas.height
                              );
        }
        if(ui.recipeSelection != null)
        {
            var x = ui.craftingMenu.detailIcon.x * this.canvas.width,
                y = ui.craftingMenu.detailIcon.y * this.canvas.height,
                bw = ui.craftingMenu.detailIcon.w * this.canvas.width,
                bh = ui.craftingMenu.detailIcon.h * this.canvas.height;
            var item = ui.items[ ui.recipeSelection.result ];
            try{
                var scale = Math.min( bw * 0.9 / item.image.height, bw * 0.9 / item.image.width );
                var center = new Vector2(
                    x + bw * 0.5,
                    y + bh * 0.5
                );
                var dim = new Vector2(
                    item.image.width * scale,
                    item.image.height * scale
                );
                this.ctx.drawImage( item.image, center.x - dim.x * 0.5, center.y - dim.y * 0.5, dim.x, dim.y );
            }
            catch(err)
            {
                this.ctx.drawImage( missingImg, x, y, bw, bh );
            }
            //title
            this.ctx.fillStyle = "#FFF";
            this.ctx.textAlign = 'left';
            var fontSize = ui.craftingMenu.detailFontSize * this.canvas.width;
            this.ctx.font = fontSize.toFixed(2)  + "px " + Settings.fontFamily;
            this.ctx.fillText( item.niceName, 
                              ui.craftingMenu.detailTitle.x * this.canvas.width ,
                              ui.craftingMenu.detailTitle.y * this.canvas.height);
            
            //ingredients
            curX = ui.craftingMenu.detailRequire.x * this.canvas.width;
            curY = ui.craftingMenu.detailRequire.y * this.canvas.height;
            bw = ui.craftingMenu.recipeBlock.w * this.canvas.width;
            bh = ui.craftingMenu.recipeBlock.h * this.canvas.height;
            for(var i in ui.recipeSelection.ingredients)
            {
                var ingredient = ui.items[ i ];
                var center = new Vector2(
                    curX + bw * 0.5,
                    curY + bh * 0.5
                );
                try{
                    var scale = Math.min( bw * 0.9 / ingredient.image.height, bw * 0.9 / ingredient.image.width );
                    var dim = new Vector2(
                        ingredient.image.width * scale,
                        ingredient.image.height * scale
                    );
                    this.ctx.drawImage( ingredient.image, center.x - dim.x * 0.5, center.y - dim.y * 0.5, dim.x, dim.y );
                }
                catch(err)
                {
                    this.ctx.drawImage( missingImg, x, y, bw, bh );
                }
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = (fontSize * 0.75).toFixed(2) + "px " + Settings.fontFamily;
                this.ctx.fillText( ui.recipeSelection.ingredients[i], center.x, curY + bh + 5);
                curX += bw + buffer.x;
            }
            
            //build button
            //back
            this.ctx.fillStyle = "#383838";
            this.ctx.fillRect(ui.craftingMenu.buildButton.x * this.canvas.width,
                               ui.craftingMenu.buildButton.y * this.canvas.height,
                               ui.craftingMenu.buildButton.w * this.canvas.width,
                               ui.craftingMenu.buildButton.h * this.canvas.height
                              );
            //text
            var center = new Vector2(
                ui.craftingMenu.buildButton.x * this.canvas.width + 0.5 * ui.craftingMenu.buildButton.w * this.canvas.width,
                ui.craftingMenu.buildButton.y * this.canvas.height + 0.5 * ui.craftingMenu.buildButton.h * this.canvas.height + 0.6 * fontSize
            );
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = ui.recipeSelection.craftable ? "#FFF" : "#888";
            this.ctx.font = (fontSize * 2).toFixed(2) + "px " + Settings.fontFamily;
            this.ctx.fillText( "BUILD" , center.x, center.y);
        }
    }
    
    //draw ship menu
    if( !ui.shipOpen ) 
        return false;
    
    for(var i in Ship.parts)
    {
        //draw background square
        this.ctx.drawImage(ui.shipIcons[i], 
                           ui.shipMenu[i].x * this.canvas.width,
                           ui.shipMenu[i].y * this.canvas.height,
                           ui.shipMenu[i].w * this.canvas.width,
                           ui.shipMenu[i].h * this.canvas.height
                          );
        
        //draw ship part
        if(null != ship.parts[i])
        {
            var center = ui.shipMenu[i].center;
            //var scale = (ui.shipMenu[i].w * this.canvas.width) / ship.parts[i].image.width;
            this.ctx.save();
            this.ctx.translate( center.x * this.canvas.width, center.y * this.canvas.height );
            this.ctx.scale( ship.renderScale, ship.renderScale );
            if( i == 'cockpit' )
                this.ctx.translate( 0, -ship.parts[i].image.height * 0.25);
            this.ctx.drawImage(ship.parts[i].image,
                               -ship.parts[i].image.width * 0.5,
                               -ship.parts[i].image.height * 0.5);
            this.ctx.restore();
        }
        
        //draw addon slots background
        this.ctx.drawImage(ui.backAddonImg, 
                           ui.addonMenu[i].x * this.canvas.width,
                           ui.addonMenu[i].y * this.canvas.height,
                           ui.addonMenu[i].w * this.canvas.width,
                           ui.addonMenu[i].h * this.canvas.height
                          );
    }
    
    return true;
}

Renderer.prototype.renderShip = function(ship)
{
    ship.construct( this );
    this.ctx.save();
    
    var center = ship.position.clone();
    center = this.project( center );
    
    this.ctx.translate( center.x, center.y );
    this.ctx.rotate( ship.rotation + Math.PI * 0.5 );
    this.ctx.scale( ship.renderScale, ship.renderScale );
    this.ctx.translate( 0, ship.renderHeight * 0.5 );
    
    for(var i in Ship.parts)
    {
        if(ship.parts[i] == null) continue;
        
        this.ctx.drawImage( 
            ship.parts[i].image,
            -ship.parts[i].image.width * 0.5,
            -ship.parts[i].renderY
        );
    }
    this.ctx.restore();
    
    if(Settings.debug)
    {
        this.ctx.save();
        this.ctx.translate( center.x, center.y ); 
        this.ctx.rotate( ship.rotation + Math.PI * 0.5 );
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        //this.ctx.fillRect( ship.bounds.x, ship.bounds.y, ship.bounds.w, ship.bounds.h );
        this.ctx.fillRect( this.worldToPixel( ship.bounds.x ), 
                           this.worldToPixel( ship.bounds.y ), 
                           this.worldToPixel( ship.bounds.w ), 
                           this.worldToPixel( ship.bounds.h ) );
        this.ctx.restore();
    }
    
}

Renderer.prototype.resize = function( w, h )
{
    if(!this.initialized) return;
    
    this.canvas.width = w;
    this.canvas.height = h;
}


Renderer.prototype.worldToPixel = function( worldVal )
{
    return worldVal * this.pixelRatio * this.zoom;
}

Renderer.prototype.pixelToWorld = function( pixelVal )
{
    return pixelVal * this.pixelRatioInv * 1 / this.zoom;
}

Renderer.prototype.worldToPixel2 = function( worldPos )
{
    return worldPos.getMultiplyScalar( this.pixelRatio * this.zoom );
}

Renderer.prototype.pixelToWorld2 = function( pixelPos )
{
    return pixelPos.getMultiplyScalar( this.pixelRatioInv * 1 / this.zoom );
}

Renderer.prototype.unProject = function( screenPos )
{
    var x = map( screenPos.x, 0, this.canvas.width, this.viewport.x, this.viewport.x + this.viewport.w )
    var y = map( screenPos.y, 0, this.canvas.height, this.viewport.y, this.viewport.y + this.viewport.h );
    return new Vector2( x, y );
}

Renderer.prototype.project = function( worldPos )
{
    var x = map( worldPos.x, this.viewport.x, this.viewport.x + this.viewport.w, 0, this.canvas.width  )
    var y = map( worldPos.y, this.viewport.y, this.viewport.y + this.viewport.h, 0, this.canvas.height );
    return new Vector2( x, y );
}

/*Renderer.prototype.wrapWorldCoords = function( worldAbs )
{
    //if it's in viewport, return it
    if( this.viewport.contains( worldAbs ) ) 
        return worldAbs;
    
    var center = this.viewport.center;
    
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
    
    
    options.sort(function(a, b){return a.dist-b.dist});
    return options[0].pos;
    
}*/
