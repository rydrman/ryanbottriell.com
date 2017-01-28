//////////////////////////
//      VECTOR 2D       //
//////////////////////////

var Vector2 = function( x, y )
{
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.Length();
}

Vector2.prototype.Set = function( x, y )
{
    this.x = x ? x : this.x;
    this.y = y ? y : this.y;
    this.Length();
}

Vector2.prototype.Length = function()
{
    this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    return this.length;
}

//////////////////////////
//         LINE         //
//////////////////////////

var Line = function( pointA, pointB )
{
    this.a = pointA ? pointA : new Vector2();
    this.b = pointB ? pointB : new Vector2();
    this.Length();
}

Line.prototype.Length = function()
{
    this.length = Math.sqrt( Math.pow(this.a.x - this.b.x, 2) + Math.pow(this.a.y - this.b.y, 2) );
    return this.length;
}

Line.prototype.GetPosition = function( perc )
{
    return new Vector2( this.a.x + (this.b.x - this.a.x) * perc, this.a.y + (this.b.y - this.a.y) * perc );
}

//////////////////////////
//         PATH         //
//////////////////////////

var Path = function( lines )
{
    this.lines = lines ? lines : [];
    this.Length();
}

Path.prototype.Length = function()
{
    this.length = 0;
    for(var i in this.lines)
        this.length += this.lines[i].length;
    
    return this.length;
}

Path.prototype.Add = function( line )
{
    this.lines.push(line);
    this.Length();
}

Path.prototype.GetPosition = function( perc )
{
    var dist = this.length * perc;
    
    var curDist = 0;
    for(var i in this.lines)
    {
        if(curDist + this.lines[i].length > dist)
        {
            var linePerc = (dist - curDist) / this.lines[i].length;
            
            return this.lines[i].GetPosition( linePerc ); 
        }
        
        curDist += this.lines[i].length;
    }
    return null;
}