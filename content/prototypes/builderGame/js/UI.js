var BuilderUI = function()
{
    this.menu = {};
    this.canvas = $("#ui-canvas")[0];
    this.ctx = this.canvas.getContext("2d");
    
    this.mousePos = new Vec2();
    this.mouseDownPos = new Vec2();
    this.mouseDown = false;
    this.curTool = EMPTY_FUNCTION;
    this.selType = "single";
    
    //drawing
    this.fontSize = 16;
    this.frameRequested = true;
}
    
BuilderUI.prototype.Init = function()
{
    //add default data to menu items
    for(var cat in this.menu)
    {
        this.menu[cat].open = false;
    }

    this.OnWindowResize(1, 1);
}

BuilderUI.prototype.OnMouseDown = function(x, y, button)
{
    this.mousePos.x = x;
    this.mousePos.y = y;
    this.mouseDownPos.x = x;
    this.mouseDownPos.y = y;

    switch(button)
    {
        case 1: //left
            if(this.curHover != null)
            {
                this.closeAll();
                if(typeof(this.curHover.open) != 'undefined')
                {
                    this.curHover.open = !this.curHover.open;
                }
                else
                {
                    this.curTool = tools[this.curHover.func];
                    this.selType = this.curHover.sel;
                    this.params = this.curHover.params;

                    if(typeof(this.curHover.layer) != 'undefined')
                        game.curOverlay = this.curHover.layer;
                    else
                        game.curOverlay = null;
                }
                return false;
            }
            else
            {
                this.closeAll();
                return true;
            }
            break;
        case 2: //middle
            break;
        case 3: //right
            alert("right");
    }

    this.mouseDown = true;

    return true;
}
BuilderUI.prototype.OnMouseMove = function(x, y)
{
    this.mousePos.x = x;
    this.mousePos.y = y;

    var item = this.getItem(x, y);

    if(this.selecting)
    {
    }
    else if(this.curHover == null && item != null)
    {
        $('body').css('cursor', 'pointer');
        this.curHover = item;
    }
    else if(this.curHover != null && item == null)
    {
        $('body').css('cursor', 'default');
        this.curHover = item;
    }

    if(!this.mouseDown) return;
}
BuilderUI.prototype.OnMouseUp = function(x, y)
{
    this.mousePos.x = x;
    this.mousePos.y = y;

    this.mouseDown = false;

    if(this.curHover != null)
    {
        this.curHover = null;
        return false;
    }

    return true;
}
BuilderUI.prototype.OnMouseWheel = function(delta)
{
    if(delta < 0) //down
    {
    }
    else //up
    {
    }    

    return true;
}
BuilderUI.prototype.OnWindowResize = function (deltaX, deltaY)
{
    this.fontSize = 16;

    //size menu items
    var i = 0;
    for(var cat in this.menu)
    {
        if(cat == 'rect' || cat == 'open') continue;
        this.menu[cat].rect = rect(0, 50 + i * this.fontSize * 2, 70, this.fontSize * 1.5);

        //items
        var i2 = i;
        for(var item in this.menu[cat])
        {
            if(item == 'rect') continue;
            this.menu[cat][item].rect = rect(80, 50 + i2 * this.fontSize * 2, 80, this.fontSize * 1.5);
            i2++;
        }

        i++;
    }
}

BuilderUI.prototype.Update = function()
{
}
BuilderUI.prototype.Draw = function()
{
    if(!this.frameRequested) return;

    //clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //draw fps
    this.ctx.font = "small-caps " + this.fontSize + 'px main-ui';
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#FF0"
    this.ctx.fillText("FPS: " + fps, 10, 20);

    //draw buttons
    var i = 0;
    this.ctx.font = "small-caps " + this.fontSize + 'px main-ui';

    var c, li;
    for(var cat in this.menu)
    {
        c = this.menu[cat];

        //rect
        if(c.open)
            this.ctx.globalAlpha = 1;
        else
            this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = "rgba(24, 212, 252, 0.5)";
        this.ctx.strokeStyle = "rgb(0, 228, 255)";
        this.ctx.beginPath();
        this.ctx.rect(c.rect.x, c.rect.y, c.rect.w, c.rect.h);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;

        //word
        this.ctx.fillStyle = "#FFF";
        this.ctx.textAlign = "right";
        this.ctx.fillText(cat, c.rect.w - 5, c.rect.y + c.rect.h * 0.75);
        i++

        //draw items
        if(c.open)
        {
            var it, i2 = 0;
            for(var item in this.menu[cat])
            {
                if(item == 'rect' || item == 'open') continue;

                it = this.menu[cat][item];
                //rect
                this.ctx.fillStyle = "rgba(24, 212, 252, 0.5)";
                this.ctx.strokeStyle = "rgb(0, 228, 255)";
                this.ctx.beginPath();
                this.ctx.rect(it.rect.x, it.rect.y, it.rect.w, it.rect.h);
                this.ctx.fill();
                this.ctx.stroke();

                //word
                this.ctx.fillStyle = "#FFF";
                this.ctx.textAlign = "center";
                this.ctx.fillText(item, it.rect.x + it.rect.w/2, it.rect.y + it.rect.h * 0.75);
            }
        }
    }

    //this.frameRequested = false;
}

BuilderUI.prototype.getItem = function (x, y)
{
    for(var cat in this.menu)
    {
        c = this.menu[cat];

        if(inRect(x, y, c.rect))
        {
           return c;
        }
        else if(c.open)
        {
            for(var item in c)
            {
                if(item == 'rect' || item == 'open') 
                    continue;
                else if(inRect(x, y, c[item].rect))
                        return c[item];
            }
        }
    }
    return null;
}

BuilderUI.prototype.closeAll = function()
{
    for(var cat in this.menu)
    {
        this.menu[cat].open = false;
    }
}
