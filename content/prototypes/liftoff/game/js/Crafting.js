var Crafting = function() {
    AsyncLoadable.call(this);
    
    this.recipes;
}

Crafting.prototype = new AsyncLoadable();

Crafting.prototype.load = function() {
    var loader = new AsyncLoader(),
        self = this;
    
    loader.onComplete = function() {
        this.onLoad.call(this.onLoadContext);
    };
    loader.onCompleteContext = this;
    
    loader.addJSONCall( 'json/recipes.json', function(data){
        self.recipes = data;
    });
    
    loader.runCalls();
}

Crafting.prototype.update = function(player) {
    // Check player (and ship if applicable) inventories against craftable recipes
    var ship = player.ship;
    // Construct aggregate inventory
    var inventory = this.constructInventory(player, ship);
    
    // Now check against recipes
    
    
    for (var r in this.recipes) {
        for (var ing in this.recipes[r].ingredients) {
            // TODO - check against ship crafting abilities
            var craftable = true,
                visible = true;
            if (inventory.hasOwnProperty(ing)) {
                // check quantity
                if (inventory[ing].quantity < this.recipes[r].ingredients[ing])
                    craftable = false
            } else {
                craftable = false; // we don't have any of the item
            }
        }
        this.recipes[r].craftable = craftable;
        this.recipes[r].visible = visible;
    }
}

Crafting.prototype.getAvailable = function(category)
{

    if(!category) 
    {
        console.warn("no category given to get recipes, empty array returned");
        return [];
    }
    var list = [];
    for(var i in this.recipes)
    {
        if(this.recipes[i].visible && this.recipes[i].category == category)
        {
            list.push( this.recipes[i] );
        }
    }
    return list;
}

Crafting.prototype.constructInventory = function(player, ship) {
    var inventory = {};
    for (var i in player.inventory) {
        inventory[i] = {};
        for (var j in player.inventory[i]) {
            inventory[i][j] = player.inventory[i][j];
        }
                  
    }
    
    if (ship != null) {
        for (var i in ship.inventory) {
            if (inventory.hasOwnProperty(i))
                inventory[i].quantity += ship.inventory[i].quantity;
            else {
                inventory[i] = {};
                inventory[i].quantity = ship.inventory[i].quantity;
            }
        }
    }
    return inventory;
}

Crafting.prototype.craft = function(player, recipe, items) { // generator.items
    var inventory = this.constructInventory(player, player.ship);
    for (var i in recipe.ingredients) {
        var cost = recipe.ingredients[i];
        // Remove from player inventory then ship inventory if not enough
        cost = this.removeFromInventory(cost, i, player);
        
        if (cost > 0 && player.ship != null)
            cost = this.removeFromInventory(cost, i, player.ship);
        
        if (cost > 0) {
            console.log( "ERROR - CRAFTING DID NOT HAVE ENOUGH INGREDIENTS");
        }
    }
    // TODO After all ingredients have been removed, add to an inventory
    // TODO - check that there is inventory space BEFORE making the object?
    console.log("Crafted: " + recipe.result);
    var newItem;
    for (var i in items) {
        if (items[i].name == recipe.result) {
            newItem = new BaseObject(items[i]);
            break;
        }
    }
    if (!player.addToInventory(newItem))
    {
        if( player.ship != null )
            player.ship.addToInventory(newItem);
        else
            console.warn("TODO no space for item!!!");
    }
}
 
Crafting.prototype.removeFromInventory = function(cost, resource, entity) {
    if (entity.inventory.hasOwnProperty(resource)) {
        if (entity.inventory[resource].quantity > cost) {
            entity.inventory[resource].quantity -= cost;
        } else if (entity.inventory[resource].quantity <= cost) {
            cost -= entity.inventory[resource].quantity;
            delete entity.inventory[resource];
        }
    }
    return cost;
}