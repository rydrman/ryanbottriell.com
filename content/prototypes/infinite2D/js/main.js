var canvas,
    ctx,
    generator,
    activeObjs;

var keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

var player = {
    pos : {x: 25, y:25},
    grid : {x: 0, y:0}
};

function onLoad()
{
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    window.requestAnimationFrame(update);
    
    generator = new Generator();
    
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    
    player.pos.x -= generator.squareSize.x;
    player.grid = generator.playerMoved(player.pos);
    activeObjs = generator.getCurrent(player.pos.x, player.pos.y);
    player.pos.x += generator.squareSize.x;
    player.grid = generator.playerMoved(player.pos);
    activeObjs = generator.getCurrent(player.pos.x, player.pos.y);
}

function update()
{
    window.requestAnimationFrame(update);
    
    // update code here //
    
    //deal with player movement
    if(keys.up)
    {
        player.pos.y -= generator.squareSize.y * 0.04;
        if(player.pos.y < 0)
            player.pos.y += generator.worldSize.h * generator.squareSize.y;
    }
    if(keys.down) 
    {
        player.pos.y += generator.squareSize.y * 0.04;
        if(player.pos.y > generator.worldSize.h * generator.squareSize.y)
            player.pos.y = 0;
    }
    if(keys.left) 
    {
        player.pos.x -= generator.squareSize.x * 0.04;
        if(player.pos.x < 0)
            player.pos.x += generator.worldSize.w * generator.squareSize.x;
    }
    if(keys.right) 
    {
        player.pos.x += generator.squareSize.x * 0.04;
        if(player.pos.x > generator.worldSize.w * generator.squareSize.x)
            player.pos.x = 0;
    }
    player.grid = generator.playerMoved(player.pos);
    
    //get new active object list
    activeObjs = generator.getCurrent(player.pos.x, player.pos.y);
    
    //////////////////////
    
    render();
}

function render()
{
    // render code here //

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw grid
    ctx.save();
    ctx.translate(canvas.width * 0.5 - player.pos.x % generator.squareSize.x, canvas.height * 0.5 - player.pos.y % generator.squareSize.y);
    var gX, gY, sqr;
    for(var x = -Square.levels-1; x < Square.levels+2; ++x)
    {
        //get grid position X
        gX = (player.grid.x + x) % generator.worldSize.w;
        if(gX < 0) gX = generator.worldSize.w + gX;

        for(var y = -Square.levels-1; y < Square.levels+2; ++y)
        {
            
            //get grid position Y
            gY = (player.grid.y + y) % generator.worldSize.w;
            if(gY < 0) gY = generator.worldSize.h + gY;
            
            //if(gX != 0 || gY != 0) continue;
            
            sqr = generator.grid[gX][gY];
            
            ctx.save()
            ctx.translate(x * generator.squareSize.x,
                          y * generator.squareSize.y);

            ctx.fillStyle = "#" + ((sqr.level > 0) ? sqr.level : 0) + "0" + ((sqr.level > 0) ? sqr.level : 0);
            ctx.fillRect(0, 0, generator.squareSize.x, generator.squareSize.y);
            
            //draw corner
            if(sqr.corner !== null)
                sqr.corner.draw(ctx);
            
            //draw edges
            ctx.save();
            ctx.fillStyle = "#FFF";
            //draw top edge
            if(sqr.edges.top !== null)
            {
                sqr.edges.top.draw(ctx, generator.squareSize.x);
            }
            //move down and draw bottom
            ctx.translate(0, generator.squareSize.y);
            if(sqr.edges.bottom !== null)
            {
                sqr.edges.bottom.draw(ctx, generator.squareSize.x);
            }
            //start over rotate for left
            ctx.restore();
            ctx.save();
            ctx.rotate(Math.PI / 2);
            if(sqr.edges.left !== null)
            {
                sqr.edges.left.draw(ctx, generator.squareSize.y);
            }
            //move over and draw right
            ctx.restore();
            ctx.save();
            ctx.translate(generator.squareSize.x, 0);
            ctx.rotate(Math.PI * 0.5);
            if(sqr.edges.right !== null)
            {
                sqr.edges.right.draw(ctx, generator.squareSize.y);
            }
            ctx.restore();
            //end draw edges

            //draw areas
            for(var i in sqr.areas)
            {
                sqr.areas[i].draw(ctx, generator.squareSize.x, generator.squareSize.y);
            }
            //end draw areas
            
            //label square
            ctx.fillStyle = "#555";
            ctx.font = "12px Arial";
            ctx.fillText(gX + " - " + gY, 5, 12);
            ctx.fillText(sqr.level, 5, generator.squareSize.y - 5);
            ctx.restore();                
        }
    }
    ctx.restore();
    
    //draw objects\
    var obj;
    for(var i in activeObjs)
    {
        obj = activeObjs[i];
    }
    
    //player
    ctx.fillStyle = "22c7f6";
    ctx.beginPath();
    ctx.arc(canvas.width * 0.5, canvas.height*0.5, 5, 0, Math.PI * 2, false);
    ctx.fill();
    
    //draw debug strings
    ctx.fillStyle = "#FF3";
    ctx.font = "20px Arial"
    ctx.fillText("world pos x:" + Math.round(player.pos.x), 5, 20);
    ctx.fillText("world pos y:" + Math.round(player.pos.y), 5, 40);
    ctx.fillText("grid pos x:" + generator.currentGridPos.x, 5, 60);
    ctx.fillText("grid pos y:" + generator.currentGridPos.y, 5, 80);
    
    //////////////////////
}

function onKeyDown(e)
{
    switch(e.keyCode)
    {
        case 38: //up
            keys.up = true;
            break;
        case 40: //down
            keys.down = true;
            break;
        case 37: //left
            keys.left = true;
            break;
        case 39: //right
            keys.right = true;
            break;
        default:
            console.log("key " + e.keyCode + " down");
    }
}

function onKeyUp(e)
{
    switch(e.keyCode)
    {
        case 38: //up
            keys.up = false;
            break;
        case 40: //down
            keys.down = false;
            break;
        case 37: //left
            keys.left = false;
            break;
        case 39: //right
            keys.right = false;
            break;
        default:
            console.log("key " + e.keyCode + " up");
    }
}