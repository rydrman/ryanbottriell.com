var TWO_PI = Math.PI * 2;

var Vec2 = function(x, y)
{
    this.x = (!x) ? 0 : x;
    this.y = (!y) ? 0 : y;
}

var Line = function(a, b)
{
    this.a = a;
    this.b = b;
}

var Rect = function (x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

var Utils = {};
Utils.inRect = function(x, y, rect)
{
    if(x >= rect.x
       && x < rect.x + rect.w
       && y >= rect.y
       && y < rect.y + rect.h)
        return true;
    else return false;
}

Utils.getDist = function(pos1, pos2)
{
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

function SelectionToArray(sel, type)
{
    if(type == "single")
        return [sel.a];
    
    //get proper setup
    var x1 = (sel.a.x < sel.b.x) ? sel.a.x : sel.b.x;
    var x2 = (sel.a.x > sel.b.x) ? sel.a.x : sel.b.x;
    var y1 = (sel.a.y < sel.b.y) ? sel.a.y : sel.b.y;
    var y2 = (sel.a.y > sel.b.y) ? sel.a.y : sel.b.y;
    
    var ps = [];
    for (var x = x1; x <= x2; x++)
    {
        for(var y = y1; y <= y2; y++)
        {
            if((x == x1 || x == x2
              || y == y1 || y == y2
              || type == "block")
              &&
               (x >= 0
               && x < game.world.length
               && y >=0 
               && y < game.world[0].length))
                ps.push(new Vec2(x, y));
        }
    }
    return ps;
};