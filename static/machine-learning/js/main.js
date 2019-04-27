var currentState = 0;

var entity, 
    game,
    entityGoal;

var canvas, ctx;

function onLoad()
{
    
    //init canvas
    canvas = $("#canvas")[0];
    canvas.width = 800;
    canvas.height = 400;
    ctx = canvas.getContext('2d');
    
    //create learner
    entity = new Entity();
    game = new Game();
        
    //setup event for command entered
    $("#text-in").keypress( function(e)
                           { if(e.which == 13) cammandEntered(); } );
    //event for click
    $("#canvas").click(function(e){game.click.call(game, e)});
    
    //output welcome message
    outputLine("<span style='color:#6AF'>WELCOIME TO ENTITY v1.0</span>");
    outputLine("");
    outputLine("The goal of this game is to gather wealth. Every item you collect gives you wealth.");
    outputLine("You can only have four items in your inventory that aren't tools.");
    outputLine("");
    outputLine("<span style='color:#6AF'>CONTROLS:</span>");
    outputLine("-> Click on adjacent squares to travel");
    outputLine("-> Actions in each location can be performed by selecting them on the right");
    outputLine("-> Items in each location can be picked-up by selecting them");
    outputLine("-> To drop something from your inventory, use the command 'drop [item name]'");
    outputLine("-> Use the command 'save' to save entity's current memory to the server.");
    outputLine("BREAK");

}

//outputs given text as line in console
function outputLine(text)
{
    //replace rules
    text = text.replace("ENTITY:", "<span style='color:#FF3'>ENTITY:</span>");
    text = text.replace("ERROR:", "<span style='color:#F00'>ERROR:</span>");
    text = text.replace("GAME:", "<span style='color:#6AF'>GAME:</span>");
    text = text.replace("BREAK", "<span style='color:#444'></br><----------------------------------------------------------------------></br></span>");
    
    var html = $("#output").html();
    html += text + "<br/>";
    $("#output").html( html );
    $("#output")[0].scrollTop = $("#output")[0].scrollHeight;
    
}

//called when user presses enter key in input box
function cammandEntered()
{
    runCommand( $("#text-in").val() );
    $("#text-in").val("");
}

//called when a command comes in
function runCommand(command)
{
    console.log("run command: " + command);
    
    if(command.split(" ")[0] == "drop")
    {
        var name = command.slice(5);
        
        for(var i in game.inventory)
        {
            if(game.inventory[i].name == name)
            {
                game.currentLoc.items.push(game.inventory[i]);
                outputLine("GAME: dropped " + game.inventory[i].name);
                entity.onFeedbackRecieved(Entity.actionTypes.DROP, game.sensorItem(game.inventory[i], false), true);
                game.inventory.splice(i, 1);
                return;
            }
        }
        outputLine("ERROR: could not find '" + name + "' in your inventory");
    }
    else 
        game.commandEntered(command);
}

String.prototype.capitalize = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}
