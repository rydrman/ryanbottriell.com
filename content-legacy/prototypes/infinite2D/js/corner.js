function Corner(type)
{
    this.type = type;
}

Corner.prototype.draw = function(ctx)
{
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
    ctx.arc(0, 0, 3, 0, Math.PI * 2, 0);
    ctx.fill();
}