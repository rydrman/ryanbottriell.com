var UI = function(canvas) 
{
   AsyncLoadable.call(this);
    
    this.shipOpen = false;
    this.craftOpen = false;
    
    this.gameOver = new Rectangle( 560/1920, 240/1080, 800/1920, 600/1920);
    
    //placements
    this.shipMenu = {
        //cockpit
        cockpit : new Rectangle( 50 / 1920, 50 / 1080, 147 / 1920, 153 / 1080),
        //engineering
        engineering : new Rectangle( 50 / 1920, 210 / 1080, 147 / 1920, 153 / 1080),
        //science
        science : new Rectangle( 50 / 1920, 367 / 1080, 147 / 1920, 153 / 1080),
        //cargo
        cargo : new Rectangle( 50 / 1920, 524 / 1080, 147 / 1920, 153 / 1080),
        //engine
        engine: new Rectangle( 50 / 1920, 680 / 1080, 147 / 1920, 153 / 1080)
    }
    
    this.addonMenu = {
        //cockpit
        cockpit : new Rectangle( 246 / 1920, 50 / 1080, 330 / 1920, 150 / 1080),
        //engineering
        engineering : new Rectangle( 246 / 1920, 210 / 1080, 330 / 1920, 150 / 1080),
        //science
        science : new Rectangle( 246 / 1920, 367 / 1080, 330 / 1920, 150 / 1080),
        //cargo
        cargo : new Rectangle( 246 / 1920, 524 / 1080, 330 / 1920, 150 / 1080),
        //engine
        engine: new Rectangle( 246 / 1920, 680 / 1080, 330 / 1920, 150 / 1080)
    }
    
    this.craftingMenu = {
        background: new Rectangle( 835 / 1920, 50 / 1080, 1035 / 1920, 791 / 1080),
        topRow: {
            cockpit : new Rectangle( 945 / 1920, 75 / 1080, 147 / 1920, 153 / 1080),
            engineering : new Rectangle( 1105 / 1920, 75 / 1080, 147 / 1920, 153 / 1080),
            science : new Rectangle( 1265 / 1920, 75 / 1080, 147 / 1920, 153 / 1080),
            cargo : new Rectangle( 1425 / 1920, 75 / 1080, 147 / 1920, 153 / 1080),
            engine: new Rectangle( 1585 / 1920, 75 / 1080, 147 / 1920, 153 / 1080)
        },
        recipesArea: new Rectangle( 935 / 1920, 250 / 1080, 800 / 1920, 350 / 1080),
        recipeBlock: new Rectangle(0, 0, 75 / 1920, 75 / 1080 ),
        recipeBuffer: new Vector2(5 / 1920, 5 / 1080),
        
        detailArea: new Rectangle( 935 / 1920, 625 / 1080, 800 / 1920, 150 / 1080),
        detailIcon: new Rectangle( 935 / 1920, 625 / 1080, 150 / 1920, 150 / 1080),
        detailTitle: new Vector2( 1100 / 1920, 650 / 1080 ),
        detailFontSize: 25 / 1920,
        detailRequire: new Vector2( 1100 / 1920, 660 / 1080 ),
        
        buildButton: new Rectangle( 1575 / 1920, 675 / 1080, 145 / 1920, 60 / 1080)
    };
    
    this.playerShipStats = {
        damage: new Rectangle( 1670 / 1920, 843 / 1080, 92 / 1920, 92 / 1080),
        oxygen: new Rectangle( 1800 / 1920, 843 / 1080, 92 / 1920, 92 / 1080),
        fuel: new Rectangle( 1670 / 1920, 956 / 1080, 92 / 1920, 92 / 1080),
        comfort: new Rectangle( 1800 / 1920, 956 / 1080, 92 / 1920, 92 / 1080),
    }
    
    
    this.playerEquip = {
        background: new Rectangle( 1010 / 1920, 870 / 1080, 230 / 1920, 154 / 1080),
        slots: {
            tool: new Rectangle( 1170 / 1920, 952 / 1080, 70 / 1920, 70 / 1080),
            helmet: new Rectangle( 1087 / 1920, 870 / 1080, 70 / 1920, 70 / 1080),
            suit: new Rectangle( 1087 / 1920, 952 / 1080, 70 / 1920, 70 / 1080),
            weapon: new Rectangle( 1007 / 1920, 952 / 1080, 70 / 1920, 70 / 1080),
        },
        fontSize: 12/1920,
        fontTranslate: {x: 60/1920, y: 65 / 1080}
    }
    
    this.playerInv = {
        background: new Rectangle( 1315 / 1920, 870 / 1080, 223 / 1920, 150 / 1080),
        slots: [
            new Rectangle( 1350 / 1920, 870 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 1450 / 1920, 870 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 1350 / 1920, 945 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 1450 / 1920, 945 / 1080, 70 / 1920, 70 / 1080)
        ],
        fontSize: 12/1920,
        fontTranslate: {x: 60/1920, y: 65 / 1080}
    }
    this.shipInv = {
        background: new Rectangle( 50 / 1920, 870 / 1080, 532 / 1920, 171 / 1080),
        slots: [
            new Rectangle( 70 / 1920, 880 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 170 / 1920, 880 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 270 / 1920, 880 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 370 / 1920, 880 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 470 / 1920, 880 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 70 / 1920, 955 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 170 / 1920, 955 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 270 / 1920, 955 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 370 / 1920, 955 / 1080, 70 / 1920, 70 / 1080),
            new Rectangle( 470 / 1920, 955 / 1080, 70 / 1920, 70 / 1080)
        ],
        fontSize: 12/1920,
        fontTranslate: {x: 60/1920, y: 65 / 1080}
    }
    
    //imgaes
    this.backAddonImg = new Image();
    
    this.craftBackImg = new Image();
    this.equipBackImg = new Image();
    this.playerInventoryImg = new Image();
    this.shipInventoryImg = new Image();
    
	this.statDamageEmptyImg = new Image();
    this.statDamageFullImg = new Image();
    this.statComfortEmptyImg = new Image();
    this.statComfortFullImg = new Image();
    this.statFuelEmptyImg = new Image();
    this.statFuelFullImg = new Image();
    this.statHealthEmptyImg = new Image();
    this.statHealthFullImg = new Image();    this.shipIcons = {
        cockpit : new Image(),
        engineering : new Image(),
        science : new Image(),
        cargo : new Image(),
        engine: new Image()
    }
    
    this.gameOverImg = new Image();
    
    //menu varables
    this.craftSelection = null;
    this.recipeSelection = null;
    
    this.items = {};
    
    this.loaded = false;
}

UI.prototype = new AsyncLoadable();

UI.prototype.load = function()
{
    var self = this;
    var loader = new AsyncLoader();
    loader.onComplete = function(){
        this.loaded = true;
        this.onLoad.call(this.onLoadContext);
    };
    loader.onCompleteContext = this;
    
    loader.addImageCall('assets/GameOver-01.png', this.gameOverImg);
    
    //loader.addImageCall('assets/menu/menu_item_bg_sm.png', this.backSquareImg);
    loader.addImageCall('assets/menu/menu_item_bg_lg.png', this.backAddonImg);
    
    loader.addImageCall('assets/menu/menu_window.png', this.craftBackImg);
    
    loader.addImageCall('assets/menu/menu_player_inventory-01.png', this.playerInventoryImg);
    loader.addImageCall('assets/menu/menu_item_bg_med.png', this.shipInventoryImg);

    loader.addImageCall('assets/menu/uiCockpit.png', this.shipIcons.cockpit);
    loader.addImageCall('assets/menu/uiEngineering.png', this.shipIcons.engineering);
    loader.addImageCall('assets/menu/uiScience.png', this.shipIcons.science);
    loader.addImageCall('assets/menu/uiCargo.png', this.shipIcons.cargo);
    loader.addImageCall('assets/menu/uiEngine.png', this.shipIcons.engine);
    
    loader.addImageCall('assets/menu/menu_player_equipment-01.png', this.equipBackImg);
    
    // Player stats
    loader.addImageCall('assets/icons/armour.png', this.statDamageEmptyImg);
    loader.addImageCall('assets/icons/armour_full.png', this.statDamageFullImg);
    loader.addImageCall('assets/icons/comfort.png', this.statComfortEmptyImg);
    loader.addImageCall('assets/icons/comfort_full.png', this.statComfortFullImg);
    loader.addImageCall('assets/icons/fuel.png', this.statFuelEmptyImg);
    loader.addImageCall('assets/icons/fuel_full.png', this.statFuelFullImg);
    loader.addImageCall('assets/icons/health.png', this.statHealthEmptyImg);
    loader.addImageCall('assets/icons/health_full.png', this.statHealthFullImg);    

    loader.addJSONCall('json/items.json', function(data){
        for(var i in data)
        {
            self.items[ data[i].name ] = data[i];
            self.items[ data[i].name ].image = new Image();
            self.items[ data[i].name ].image.src = data[i].img;
        }
    });
    
    loader.runCalls();
}

UI.prototype.init = function(crafting) 
{
    this.crafting = crafting;
}

UI.prototype.sample = function( mousePosCanvas, player, act )
{
    var relativePos = new Vector2( mousePosCanvas.x / Settings.renderWidth,
                                   mousePosCanvas.y / Settings.renderHeight );
    
    
    if(this.craftOpen)
    {
        //background
        if(!act && this.craftingMenu.background.contains(relativePos))
            return true;
        
        //check top buttons
        for(var i in this.craftingMenu.topRow)
        {
            if(this.craftingMenu.topRow[i].contains(relativePos))
            {
                this.craftSelection = i;
                console.log("UI craft selection: " + i);
                this.recipeSelection = null;
                return true;
            }
        }
        
        //check recipes
        var recipes = this.getCraftingOptions();
        
        var curY = this.craftingMenu.recipesArea.y,
            curX = this.craftingMenu.recipesArea.x;
        for(var i in recipes)
        {
            var rect = new Rectangle(
                curX, curY,
                this.craftingMenu.recipeBlock.w,
                this.craftingMenu.recipeBlock.h
            );
            
            if(rect.contains(relativePos))
            {
                console.log("select recipe: ", recipes[i]);
                this.recipeSelection = recipes[i];
            }

            curX += (this.craftingMenu.recipeBlock.w + this.craftingMenu.recipeBuffer.x);
            if(curX + this.craftingMenu.recipeBlock.w + this.craftingMenu.recipeBuffer.x > 
               this.craftingMenu.recipesArea.x + this.craftingMenu.recipesArea.w)
            {
                curX = this.craftingMenu.recipesArea.x;
                curY += (this.craftingMenu.recipeBlock.h + this.craftingMenu.recipeBuffer.y);
            }
        }
        
        //check build button
        if(this.craftingMenu.buildButton.contains( relativePos ))
        {
            if(null != this.recipeSelection && this.recipeSelection.craftable)
                this.crafting.craft( player, this.recipeSelection, this.items )
        }
        
        //check background
        if(this.craftingMenu.background.contains(relativePos))
            return true;
    }
    
    // Check against all UI elements
    if(this.shipOpen)
    {
        for (var i in this.shipMenu) 
        {
            if (this.shipMenu[i].contains(relativePos))
                return {name: i}
        }
        for (var i in this.playerShipStats) 
        {
             if (this.playerShipStats[i].contains(relativePos))
                 return {name: this.playerShipStats[i]};
        }
    }
    
    if (this.playerInv.background.contains(relativePos)) 
    {
        // check all slots
        var slot = null;
        for (var i=0; i < this.playerInv.slots.length; i++) {
            if (this.playerInv.slots[i].contains(relativePos)) {
                slot = i;
            }
        }
        return { name: "playerInv", slotNo: slot};
    }
    if (this.shipInv.background.contains(relativePos)) 
    {
        // check all slots
        var slot = null;
        for (var i=0; i < this.shipInv.slots.length; i++) {
            if (this.shipInv.slots[i].contains(relativePos)) {
                slot = i;
            }
        }
        return { name: "shipInv", slotNo: slot};
    }
    
    if(act)
    {
        this.shipOpen = false;
        this.craftOpen = false;
        this.currentShip = null;
    }
    return false;
    
}

UI.prototype.getCraftingOptions = function()
{
    if(this.craftSelection == null || ! this.crafting) return [];
    
    return this.crafting.getAvailable( this.craftSelection );
}

UI.prototype.openShip = function( ship )
{
    this.shipOpen = true;
    this.openCrafting();
    this.currentShip = ship;
}

UI.prototype.openCrafting = function()
{
    this.craftOpen = true;
}

UI.prototype.resize = function(width, height) 
{
    this.playerInventory = new Rectangle(200, height - 70, 400, 70);
    
}