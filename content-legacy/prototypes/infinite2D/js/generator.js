//TODO
//objects should be grouped with their zones
//zones can go in/out of larger radius and object added to pile


function Generator()
{
    this.objs = [];
    
    //designate world size
    this.worldSize = {w:100, h:100};
    this.squareSize = {x:80, y:60};
    
    //create empty world 
    this.grid = [];
    for(var i = 0; i < this.worldSize.w; ++i)
    {
        this.grid[i] = [];
        
        for(var j = 0; j < this.worldSize.h; ++j)
        {
            this.grid[i][j] = new Square({x:i, y:j});
        }
    }
    
    this.currentGridPos = {x: -1, y: -1};
    this.activeRad = 200;
    this.zoneRad = 400;
    
    //force move for initial loading
    this.playerMoved(player.pos);
}

Generator.prototype.playerMoved = function(newPos)
{
    //find grid pos
    var x = Math.floor( newPos.x / this.squareSize.x );
    var y = Math.floor( newPos.y / this.squareSize.y );
    
    //this loop ensures everything gets loaded up to it's proper level
    //only loops more than once on first load (hopefully)
    var success;
    do
    {
        success = true;
        if(x != this.currentGridPos.x
           || y != this.currentGridPos.y)
        {
            this.currentGridPos.x = (x < 0) ? this.worldSize.w + x : x;
            this.currentGridPos.y = (y < 0) ? this.worldSize.h + y : y;

            //grid has moved
            //do loading
            var gX, gY, dist, sqr;
            for(var i = -Square.levels; i < Square.levels+1; ++i)
            {
                //get grid position X
                gX = (this.currentGridPos.x + i) % this.worldSize.w;
                if(gX < 0) gX = this.worldSize.w + gX;

                for(var j = -Square.levels; j < Square.levels+1; ++j)
                {
                    //get grid position Y
                    gY = (this.currentGridPos.y + j) % this.worldSize.w;
                    if(gY < 0) gY = this.worldSize.h + gY;

                    dist = Math.max(Math.abs(i), Math.abs(j));
                    sqr = this.grid[gX][gY];

                    var result = this.loadToLevel(sqr, Square.levels - dist);
                    if(!result) success = false;
                }
            }  
        }
    }
    while(success == false)
    
    return this.currentGridPos;
}

////////////////////////////////////////////////////////////////////////
//Level 0 - Corner
//Level 1 - Edges
//Level 2 - Areas
//Level 3 - Objects

Generator.prototype.loadToLevel = function(sqr, levelNum)
{
    if(sqr.level < levelNum)
    {
        if(sqr.level == -1)
        {
            this.genCorner(sqr);
            
            //make sure all 4 corners are defined
            if(sqr.neighbours.bottom.level < 0) this.genCorner(sqr.neighbours.bottom);
            if(sqr.neighbours.right.level < 0) this.genCorner(sqr.neighbours.right);
            if(sqr.neighbours.diag.level < 0) this.genCorner(sqr.neighbours.diag);
            
            sqr.level = 0;
            if(levelNum != 0) return false;
        }
        else if(sqr.level == 0)
        {
            this.genEdges(sqr);
            
            sqr.level = 1;
            if(levelNum != 1) return false;
        }
        else if(sqr.level == 1)
        {
            this.createAreas(sqr);
            
            sqr.level = 2;
            //if(levelNum != 2) return false;
        }
        sqr.level = levelNum;
        return true;
    }
    return true;
}

///////////////////////////
//// -- for level 0 -- ////
Generator.prototype.genCorner = function(sqr)
{
    //TODO use noise functions to disperse types
    
    //check for neighbours 
    if(sqr.neighbours === null)
    {
        //collect neightbours
        sqr.neighbours = {};
        sqr.neighbours.top = this.grid[sqr.pos.x][ (sqr.pos.y == 0) ? this.worldSize.h-1 : sqr.pos.y-1 ];
        sqr.neighbours.bottom = this.grid[sqr.pos.x][ (sqr.pos.y == this.worldSize.h-1) ? 0 : sqr.pos.y+1 ];
        sqr.neighbours.left = this.grid[ (sqr.pos.x == 0) ? this.worldSize.w-1 : sqr.pos.x-1 ][ sqr.pos.y ];
        sqr.neighbours.right = this.grid[ (sqr.pos.x == this.worldSize.w-1) ? 0 : sqr.pos.x+1 ][ sqr.pos.y ];
        //diagonal is for bottom right corner info
        sqr.neighbours.diag = this.grid[ (sqr.pos.x == this.worldSize.w-1) ? 0 : sqr.pos.x+1 ][ (sqr.pos.y == this.worldSize.h-1) ? 0 : sqr.pos.y+1 ];
    }
    
    if(sqr.corner === null)
    {
        if(Math.random() < 0.4)
        {
            sqr.corner = new Corner(AreaType.FOREST);
        }
        else
        {
            sqr.corner = new Corner(AreaType.EMPTY);
        }
    }
}

///////////////////////////
//// -- for level 1 -- ////

Generator.prototype.genEdges = function(sqr)
{   
    //look for edges already defined
    for(var dir in sqr.edges)
    {
        if(sqr.edges[dir] === null)
        {
            sqr.edges[dir] = new Edge();
            
            //get ends
            var ends = Edge.ends(sqr, dir);
            
            //they are the same
            if(ends[0].type == ends[1].type)
            {
                //for now just connect them
                sqr.edges[dir].pieces.push(new Piece(0.0, div, ends[0].type));
            }
            else
            {
                //divide at some point
                var div = Math.random();
                sqr.edges[dir].pieces.push(new Piece(0.0, div, ends[0].type));
                sqr.edges[dir].pieces.push(new Piece(div, 1.0, ends[1].type));
            }
            
            //add to neighbour
            sqr.neighbours[dir].edges[Edge.opposite(dir)] = sqr.edges[dir];
        }
    }
}

///////////////////////////
//// -- for level 2 -- ////

Generator.prototype.createAreas = function(sqr)
{
    sqr.areas = [];
    
    //go thorugh edges and create areas
    var piece, area = new Area();
    area.type = AreaType.FOREST;
    for(var i in sqr.edges.top.pieces)
    {
        piece = sqr.edges.top.pieces[i];
        if(piece.type == AreaType.FOREST)
        {
            area.border.push(new Point(piece.start, 0));
            area.border.push(new Point(piece.end, 0));
        }
    }
    for(var i in sqr.edges.right.pieces)
    {
        piece = sqr.edges.right.pieces[i];
        if(piece.type == AreaType.FOREST)
        {
            area.border.push(new Point(1, piece.start));
            area.border.push(new Point(1, piece.end));
        }
    }
    for(var i in sqr.edges.bottom.pieces)
    {
        piece = sqr.edges.bottom.pieces[i];
        if(piece.type == AreaType.FOREST)
        {
            //reverse order cuz we're goin in a circle
            area.border.push(new Point(piece.end, 1));
            area.border.push(new Point(piece.start, 1));
        }
    }
    for(var i in sqr.edges.left.pieces)
    {
        piece = sqr.edges.left.pieces[i];
        if(piece.type == AreaType.FOREST)
        {
            //reverse order cuz we're goin in a circle
            area.border.push(new Point(0, piece.end));
            area.border.push(new Point(0, piece.start));
        }
    }
    if(area.border.length > 0)
        sqr.areas.push(area);
    
    //go through areas and validate the form
}

Generator.prototype.getSquare = function(x, y)
{
    return this.grid[x][y];
}

Generator.prototype.getCurrentSquare = function()
{
    return this.grid[this.currentGridPos.x][this.currentGridPos.y];
}

Generator.prototype.getCurrent = function(posX, posY)
{
    var active = [];
    
    var obj,
        dist,
        activeRadSqrd = this.activeRad * this.activeRad;
    for(var i in this.objs)
    {
        obj = this.objs[i];
        dist = Math.pow(posX - obj.pos.x, 2) + Math.pow(posY - obj.pos.y, 2);
        
        if(dist < activeRadSqrd)
        {
            active.push(obj);
        }
    }
    
    return active;
}
