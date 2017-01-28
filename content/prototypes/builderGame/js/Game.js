var BuilderGame = function()
{
    this.world;
    this.peopleManager;
    this.canvas = $("#game-canvas")[0];
    this.ctx = this.canvas.getContext("2d");
    this.objCanvas, this.objCTX;
    this.matCanvas, this.matCTX;
    this.selection = null;
    
    this.mousePosS = new Vec2();
    this.mousePosW = new Vec2();
    this.mousePosG = new Vec2();
    this.mouseDown = false;
    this.mouseDownPosS = new Vec2();
    this.mouseDownPosW = new Vec2();
    this.mouseDownPosG = new Vec2();
    
    //drawing
    this.canvases = {};
    this.contexts = [];
    this.offset = new Vec2();
    this.dragOffset = new Vec2();
    this.zoomFactor = 0.75;
    this.MAX_ZOOM = 1.0;
    this.MIN_ZOOM = 0.2;
    this.curOverlay = null;
}
    
BuilderGame.prototype.Init = function(w, h)
{
    this.world = [];
    this.peopleManager = new PeopleManager();

    //create display list canvases for mat and objs
    this.canvases.obj = document.createElement('canvas');
    this.canvases.mat = document.createElement('canvas');
    this.canvases.util = document.createElement('canvas');
    this.canvases.ai = document.createElement('canvas');
    //set dimension and create ctx
    for(var name in this.canvases)
    {
        this.canvases[name].width = 64 * w;
        this.canvases[name].height = 64 * h;
        //get contexts for drawing
        this.contexts[name] = this.canvases[name].getContext('2d');
    }

    for(var x = 0; x < w; x++)
    {
        this.world[x] = [];
        for(var y = 0; y < h; y++)
        {
            this.world[x][y] = new Block(new Vec2(x, y));
        }
    }

    this.updateDisplayList(new Vec2(), new Vec2(w, h));
    this.peopleManager.Init();
}

//region Mouse Events

BuilderGame.prototype.OnMouseDown = function(x, y, button)
{
    this.updateMousePos(x, y);
    this.mouseDownPosS.x = x;
    this.mouseDownPosS.y = y;
    this.mouseDownPosW = this.canvasToWorld(this.mouseDownPosS);
    this.mouseDownPosG = this.worldToGrid(this.mouseDownPosW);

    switch(button)
    {
        case 1: //left
            if(this.isInWorld(this.mousePosG))
                this.selection = {a: this.mousePosG, b: this.mouseDownPosG};          
            break;
        case 2: //middle
            this.dragging = true;
            break;
        case 3: //right
            alert("right");
    }

    this.mouseDown = true;
}
BuilderGame.prototype.OnMouseMove = function(x, y)
{
    this.updateMousePos(x, y);

    if(!this.mouseDown) 
        return;
    else if(this.selection != null)
    {
        this.selection.b = this.mousePosG;
    }
    else if(this.dragging)
    {
        this.dragOffset.x = x - this.mouseDownPosS.x;
        this.dragOffset.y = y - this.mouseDownPosS.y;
    }
}
BuilderGame.prototype.OnMouseUp = function(x, y)
{
    this.updateMousePos(x, y);

    //place object(s) if necessary
    if(this.selection != null)
    {
        ui.curTool(this.selection, ui.selType, ui.params);
    }   

    //deal with drag
    this.offset.x += this.dragOffset.x;
    this.offset.y += this.dragOffset.y;
    this.dragOffset = new Vec2();

    this.dragging = false;
    this.mouseDown = false;
    this.selection = null;
}
BuilderGame.prototype.OnMouseWheel = function(delta)
{
    var origZoom = this.zoomFactor;

    if(delta < 0) //out
    {
        //affect zoom
        this.zoomFactor *= 0.9;
        if(this.zoomFactor < this.MIN_ZOOM) this.zoomFactor = this.MIN_ZOOM;
    }
    else //in
    {
        this.zoomFactor *= 1.1;
        if(this.zoomFactor > this.MAX_ZOOM) this.zoomFactor = this.MAX_ZOOM;
    }    
    //fix for mouse position
    this.offset.x += (this.canvasToWorld(this.mousePosS).x - this.mousePosW.x) * this.zoomFactor;
    this.offset.y += (this.canvasToWorld(this.mousePosS).y - this.mousePosW.y) * this.zoomFactor;
    //update mouse position
    this.mousePosW = this.canvasToWorld(this.mousePosS);
    this.mousePosG = this.worldToGrid(this.mousePosW);
}

//endregion

BuilderGame.prototype.OnWindowResize = function (deltaX, deltaY)
{
}

BuilderGame.prototype.Update = function(ms)
{
    this.peopleManager.Update(ms);
}
BuilderGame.prototype.Draw = function()
{
    //clear canvas
    this.ctx.fillStyle = "#495664";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //fill background
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(this.mouseX - 5, this.mouseY -5, 10, 10); 

    //draw world
    this.ctx.save();
    this.ctx.scale(this.zoomFactor, this.zoomFactor);
    this.ctx.translate((this.offset.x + this.dragOffset.x) / this.zoomFactor,
                       (this.offset.y + this.dragOffset.y) / this.zoomFactor);

    //draw material canvas
    this.ctx.drawImage(this.canvases.mat, 0, 0);

    //draw object canvas
    this.ctx.drawImage(this.canvases.obj, 0, 0);

    //if applicable, draw active canvas
    if(this.curOverlay != null)
    {
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.canvases[this.curOverlay], 0, 0);
        this.ctx.globalAlpha = 1;
    }

    //draw ai canvas
    this.peopleManager.Draw(this.contexts["ai"]);
    this.ctx.drawImage(this.canvases["ai"], 0, 0);

    //highlight selection
    if(this.selection != null)
    {
        var positions = SelectionToArray(this.selection, ui.selType);

        for(var i = 0; i < positions.length; i++)
        {
            if(positions[i].x >= 0 
               && positions[i].x < this.world.length
               && positions[i].y >= 0 
               && positions[i].y < this.world[0].length)
            {
                if(this.world[positions[i].x][positions[i].y].obj != null)
                    this.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
                else
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                this.ctx.fillRect(64 * positions[i].x,
                                    64 * positions[i].y,
                                    64, 64);
            }
        }
    }

    this.ctx.restore();
}

BuilderGame.prototype.placeObj = function(pos, obj)
{

}

BuilderGame.prototype.updateDisplayList = function(vecS, vecE, names)
{
    //if no names, update default
    if(typeof(names) == 'undefined')
    {
        names = ["mat", "obj"];
    }

    var name;
    for(var n = 0; n < names.length; n++)
    {
        name = names[n];

        //clear what needs to be cleared
        this.contexts[name].clearRect(vecS.x * 64, 
                              vecS.y * 64,
                              (vecE.x - vecS.x) * 64,
                              (vecE.y - vecS.y) * 64
                             );

        //draw what needs to be drawn
        var b, mat, obj;
        for(var x = vecS.x; x < vecE.x; x++)
        {
            for(var y = vecS.y; y < vecE.y; y++)
            {
                b = this.world[x][y];

                switch(name)
                {
                    case "mat":
                        //draw materials to matCanvas
                        this.contexts[name].drawImage(window.images[b.mat.spritesheet],
                                           64 * (b.mat.sprite % 16), 64 * Math.floor(b.mat.sprite/16), 64, 64,
                                           x * 64, y * 64, 64, 64);
                        break;
                    case "obj":
                        //draw objects to objCanvas

                        if(b.obj == OBJ_EMPTY) break;

                        //draw listed sprite
                        this.contexts[name].save();
                        this.contexts[name].translate((x + 0.5) * 64, (y + 0.5) * 64);
                        this.contexts[name].rotate(b.obj.rotation);
                        
                        //TODO
                        var i = b.obj.sprite + b.obj.spriteOffsets[0];
                        
                        //if not built, draw semi transparent and filling
                        if(!b.obj.built)
                        {
                            this.contexts[name].globalAlpha = 0.4;
                            
                            this.contexts[name].drawImage(
                                window.images[b.obj.spritesheet],
                                64 * (i % 16), 
                                64 * Math.floor(i/16), 
                                BLOCK_SIZE, BLOCK_SIZE,
                                -32, 
                                -32, 
                                BLOCK_SIZE, BLOCK_SIZE);
                            
                            //then draw filling over top
                            
                            this.contexts[name].globalAlpha = 1;
                            var perc = b.obj.hp / b.obj.hpMax;
                            var size = perc * BLOCK_SIZE;
                            
                            this.contexts[name].drawImage(
                                window.images[b.obj.spritesheet],
                                64 * (i % 16), 
                                64 * Math.floor(i/16), 
                                BLOCK_SIZE, size,
                                -32, 
                                -32, 
                                BLOCK_SIZE, size);
                            
                        }
                        //or just draw it
                        else
                        {
                            this.contexts[name].drawImage(
                                window.images[b.obj.spritesheet],
                                64 * (i % 16), 
                                64 * Math.floor(i/16), 
                                64, 64,
                                -32, 
                                -32, 
                                64, 64);
                        }

                        this.contexts[name].restore();

                        break;
                    case "util":
                        if(b.foundation != null)
                        {
                            var sprite = (!b.foundation.built) ? 6 : 7;
                            this.contexts[name].drawImage(
                                    window.images["objects"],
                                    64 * sprite, 
                                    64 * 0, 
                                    64, 64,
                                    64 * x, 
                                    64 * y, 
                                    64, 64);
                        }
                        break;
                }
            }
        }
    }
}

BuilderGame.prototype.getNeighbours = function(pos)
{
    var list = [null, null, null, null];

    //check right
    if(pos.x < this.world.length-1
       && this.world[pos.x+1][pos.y].obj != null)
        list[0] = this.world[pos.x+1][pos.y];
    //bottom
    if(pos.y < this.world[0].length-1
      && this.world[pos.x][pos.y+1].obj != null)
        list[1] = this.world[pos.x][pos.y+1];
    //left
    if(pos.x > 0 
      && this.world[pos.x-1][pos.y].obj != null)
        list[2] = this.world[pos.x-1][pos.y];
    //top
    if(pos.y > 0 
       && this.world[pos.x][pos.y-1].obj != null)
        list[3] = this.world[pos.x][pos.y-1];

    return list;
}

BuilderGame.prototype.getDynamicSprite = function(pos)
{
    var list = [false, false, false, false];

    //TODO also check for dynamic type (wall vs other)

    //check right
    if(pos.x < this.world.length-1
       && this.world[pos.x+1][pos.y].obj != null)
        list[0] = !this.world[pos.x+1][pos.y].obj.static;
    //bottom
    if(pos.y < this.world[0].length-1
      && this.world[pos.x][pos.y+1].obj != null)
        list[1] = !this.world[pos.x][pos.y+1].obj.static;
    //left
    if(pos.x > 0 
      && this.world[pos.x-1][pos.y].obj != null)
        list[2] = !this.world[pos.x-1][pos.y].obj.static;
    //top
    if(pos.y > 0 
       && this.world[pos.x][pos.y-1].obj != null)
        list[3] = !this.world[pos.x][pos.y-1].obj.static;

    var count = 0;
    var pos = [];
    for(var i = 0; i < 4; i++)
    {
        if(list[i])
        {
            count++;
            pos.push(i);
        }
    }

    //rotation becomes first found position except corner, and 3
    //3 must be checked
    if(count == 3)
    {
        if(pos[1] - pos[0] == 2) 
            pos[0] = pos[1];
        else if(pos[2] - pos[1] == 2) 
            pos[0] = pos[2];
    }

    //push for 3 and 4
    if(count > 2) count++;
    //decide mid or corner
    if(count == 2 && pos[1] - pos[0] != 2) 
    {
        count = 3;
        //chech rotation
        if(pos[0] == 0 && pos[1] != 1)
            pos[0] = pos[1];
    }
    //check zer0
    if(count == 0) pos[0] = 0;

    return {
        i: count,
        r: pos[0] * Math.PI/2
    };
}

BuilderGame.prototype.updateMousePos = function(x, y)
{
    this.mousePosS.x = x;
    this.mousePosS.y = y;
    this.mousePosW = this.canvasToWorld(this.mousePosS);
    this.mousePosG = this.worldToGrid(this.mousePosW);
}
BuilderGame.prototype.canvasToWorld = function(vect)
{
    return {
        x: (vect.x - this.offset.x - this.dragOffset.x) / this.zoomFactor,
        y: (vect.y - this.offset.y - this.dragOffset.y) / this.zoomFactor
    }
}
BuilderGame.prototype.worldToCanvas = function(vect)
{
    return {
        x: (vect.x * this.zoomFactor) + this.offset.x ,
        y: (vect.y * this.zoomFactor) + this.offset.y
    }
}
BuilderGame.prototype.worldToGrid = function(vect)
{
    return {
        x: Math.floor(vect.x / 64),
        y: Math.floor(vect.y / 64)
    };
}
BuilderGame.prototype.gridToWorld = function(vect)
{
    return {
        x: vect.x * 64 + (64/2),
        y: vect.y * 64 + (64/2)
    };
}
BuilderGame.prototype.isInWorld = function(vect)
{
    if(vect.x >= 0
       && vect.x < this.world.length
       && vect.y >= 0
       && vect.y < this.world[0].length)
        return true;
    return false;
}
