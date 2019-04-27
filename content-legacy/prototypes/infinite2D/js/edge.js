function Edge()
{
    this.pieces = [];
}

Edge.prototype.draw = function(ctx, len)
{
    var p;
    for(var i = 0; i < this.pieces.length; ++i)
    {
        p = this.pieces[i];
        switch(p.type)
        {
            case AreaType.EMPTY:
                ctx.strokeStyle = "#444";
                break;
            case AreaType.FOREST:
                ctx.strokeStyle = "#00b42f";
                break;
            default:
                ctx.strokeStyle = "#222";
        }
        
        ctx.beginPath();
        ctx.moveTo(p.start * len, 0);
        ctx.lineTo(p.end * len, 0);
        ctx.stroke();
    }
}

//useful iteration function for edges
Edge.opposite = function(dir)
{
    switch(dir)
    {
        case "top": return "bottom";
        case "bottom": return "top";
        case "left" : return "right";
        case "right": return "left";
        default: 
            alert("cannot get opposite: '" + dir + "' is not a valid direction");
    }
}
Edge.next = function(dir)
{
    switch(dir)
    {
        case "top": return "right";
        case "right": return "bottom";
        case "bottom" : return "left";
        case "left": return "top";
        default: 
            alert("cannot get next: '" + dir + "' is not a valid direction");
    }
}
Edge.prev = function(dir)
{
    switch(dir)
    {
        case "top": return "left";
        case "left": return "bottom";
        case "bottom" : return "right";
        case "right": return "top";
        default: 
            alert("cannot get previous: '" + dir + "' is not a valid direction");
    }
}
Edge.ends = function(sqr, dir)
{
    switch(dir)
    {
        case "top": return [sqr.corner, sqr.neighbours.right.corner];
        case "left": return [sqr.corner, sqr.neighbours.bottom.corner];
        case "right" : return [sqr.neighbours.right.corner, sqr.neighbours.diag.corner];
        case "bottom": return [sqr.neighbours.bottom.corner, sqr.neighbours.diag.corner];
        default: 
            alert("cannot get ends: '" + dir + "' is not a valid direction");
    }
}

//defines a piece of an edge
function Piece(start, end, type)
{
    this.start = start;
    this.end = end;
    this.type = type;
}

