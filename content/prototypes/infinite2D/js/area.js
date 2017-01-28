//This is an enum which defines area tpes
var AreaType = {};
AreaType.UNDEFINED = -1;
AreaType.EMPTY = 0;
AreaType.FOREST = 1;
AreaType = Object.freeze(AreaType);

//defineds an area within a square
function Area(type)
{
    this.border = [];
    this.type = type;
}

Area.prototype.draw = function(ctx, w, h)
{
    if(this.border.length < 2)
    {
        debugger;
        return;
    }

    ctx.save();
    
    ctx.globalAlpha = 0.8;
    switch(this.type)
    {
        case AreaType.EMPTY:
            ctx.fillStyle = "#444";
            break;
        case AreaType.FOREST:
            ctx.fillStyle = "#00b42f";
            break;
        default:
            ctx.fillStyle = "#222";
    }

    ctx.beginPath();
    ctx.moveTo(this.border[0].x * w, this.border[0].y * h);
    for(var i = 1; i < this.border.length; ++i)
    {
        ctx.lineTo(this.border[i].x * w, this.border[i].y * h);
    }
    ctx.fill();
    
    ctx.restore();

}

function Point(x, y)
{
    this.x = x;
    this.y = y;
}