var tools = {}
    
tools.selector = function(selection, selType) 
{
}

tools.addWall = function(selection, selType) 
{
    var positions = SelectionToArray(selection, selType),
        refreshMin = $.extend(true, {}, positions[0]),
        refreshMax = $.extend(true, {}, positions[positions.length-1]);

    for(var i = 0; i < positions.length; i++)
    {
        var b = game.world[positions[i].x][positions[i].y];
        if(b.obj != OBJ_EMPTY) continue;

        b.obj = jQuery.extend(true, {}, objs.wall);
        b.obj.hp = 0;
        b.obj.built = false;

        var job = new Job(JOB_TYPES.BUILD, b);
        game.peopleManager.PostJob( job );

        //get sprite and check neighbours
        var data, bs = game.getNeighbours(positions[i]);
        bs.push(b);

        for(var j = 0; j < bs.length; j++)
        {
            if(bs[j] == null || bs[j].obj.static) continue;

            data = game.getDynamicSprite(bs[j].pos);

            bs[j].obj.spriteOffsets = [data.i];
            bs[j].obj.rotation = data.r; 

            if(refreshMin.x > bs[j].pos.x)
                refreshMin.x = bs[j].pos.x;
            else if(refreshMax.x <= bs[j].pos.x + bs[j].obj.size.x) 
                refreshMax.x = bs[j].pos.x + bs[j].obj.size.x;
            if(refreshMin.y > bs[j].pos.y) 
                refreshMin.y = bs[j].pos.y;
            else if(refreshMax.y <= bs[j].pos.y + bs[j].obj.size.y) 
                refreshMax.y = bs[j].pos.y + bs[j].obj.size.y;
        }
    }

    game.updateDisplayList(refreshMin, refreshMax);
}

tools.addFoundation = function(selection, selType)
{
    var positions = SelectionToArray(selection, selType),
        refreshMin = $.extend(true, {}, positions[0]),
        refreshMax = $.extend(true, {}, positions[positions.length-1]);

    for(var i = 0; i < positions.length; i++)
    {
        var b = game.world[positions[i].x][positions[i].y];
        if(b.foundation != null) continue;
        b.foundation = {
            hp: 0,
            hpMax : 25,
            built : false,
        };
        var job = new Job(JOB_TYPES.FOUNDATION, b);
        game.peopleManager.PostJob( job );
        if(b.mat == MAT_EMPTY)
            b.mat = mats.unbuiltFoundation;

        if(refreshMin.x > b.pos.x)
            refreshMin.x = b.pos.x;
        else if(refreshMax.x <= b.pos.x + 1) 
            refreshMax.x = b.pos.x + 1;
        if(refreshMin.y > b.pos.y) 
            refreshMin.y = b.pos.y;
        else if(refreshMax.y <= b.pos.y + 1) 
            refreshMax.y = b.pos.y + 1;
    }

    game.updateDisplayList(refreshMin, refreshMax, ["util", "mat"]);
}

tools.addObj = function(selection, selType, params)
{
    var pos = selection.a,
        obj = $.extend(true, {}, objs[params[0]]),
        rot = params[1]; 

    //see if surrounding requirements are met
    if(false && typeof(obj.required) != 'undefined')
    {
        //TODO implement
        var req = {},
            b;

        req.a = new Vec2(pos.x-1, pos.y-1);
        req.b = new Vec2(pos.x + obj.size.x, pos.y + obj.size.y);
        req = SelectionToArray(req, "rect");
        for(var i = 0; i < obj.required.length; i++)
        {
            b = game.world[req[i].x][req[i].y];
            if(b.obj != null
                && obj.required[i] != null
                && obj.required[i] == b.obj.name)
            {
                debugger;
            }
        }
    }

    //set sprites and rotations
    var b, p;
    for(var x = 0; x < obj.size.x; x++)
    {
        for(var y = 0; y < obj.size.y; y++)
        {
            switch(rot)
            {
                case 0: //normal
                    b = game.world[pos.x + x][pos.y + y];
                    break;
                case 1: //switch x, y
                    b = game.world[pos.x + y][pos.y + x];
                    break;
                case 2://upside down
                    b = game.world[pos.x - x][pos.y - y];
                    break;
                case 3://up
                    b = game.world[pos.y - y][pos.x - x];
                    break;
            }
            p = x+y;

            b.obj = new ObjChild(obj.spritesheet, 
                                 obj.sprite + obj.spriteOffsets[p],
                                rot);
        }
    }

    game.updateDisplayList( pos, 
                            new Vec2(pos.x + obj.size.x, pos.y + obj.size.y), 
                            ["obj"]);

    debugger;
}

tools.removeObj = function(selection, selType)
{

    var positions = SelectionToArray(selection, selType),
        refreshMin = $.extend(true, {}, positions[0]),
        refreshMax = $.extend(true, {}, positions[positions.length-1]);

    var pos, b;
    for(var i = 0; i < positions.length; i++)
    {
        pos = positions[i];
        b = game.world[pos.x][pos.y];

        //remove job if applicable
        for(var j = b.jobs.length-1; j >=0; j--)
        {
            if(b.jobs[j].type == JOB_TYPES.BUILD)
            {
                game.peopleManager.RemoveJob(b.jobs[j]);
                b.jobs[j].Cancel();
            }
        }
        b.obj = OBJ_EMPTY;

        var bs = game.getNeighbours( pos );

        for(var j = 0; j < bs.length; j++)
        {
            if(bs[j] == null || bs[j].obj.static) continue;

            data = game.getDynamicSprite(bs[j].pos);

            bs[j].obj.spriteOffsets = [data.i];
            bs[j].obj.rotation = data.r; 

            if(refreshMin.x > bs[j].pos.x)
                refreshMin.x = bs[j].pos.x;
            else if(refreshMax.x <= bs[j].pos.x + 1) 
                refreshMax.x = bs[j].pos.x + 1;
            if(refreshMin.y > bs[j].pos.y) 
                refreshMin.y = bs[j].pos.y;
            else if(refreshMax.y <= bs[j].pos.y + 1) 
                refreshMax.y = bs[j].pos.y + 1;
        }
    }

    game.updateDisplayList( refreshMin, refreshMax );
}

tools.getPath = function( selection, selType )
{
    var path = game.peopleManager.GetPath( selection.a, selection.b );
    debugger;
}



function EMPTY_FUNCTION(){};