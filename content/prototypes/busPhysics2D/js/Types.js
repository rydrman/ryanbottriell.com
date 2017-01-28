//////////////////////////
//      VECTOR 2D       //
//////////////////////////

var Vector2 = function( x, y )
{
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.lengthInvalid = true;
    this.Length();
}

Vector2.prototype.Set = function( x, y )
{
    this.x = x ? x : this.x;
    this.y = y ? y : this.y;
    this.lengthInvalid = true;
}

Vector2.prototype.Copy = function( vec )
{
    this.x = vec.x;
    this.y = vec.y;
}

Vector2.prototype.Add = function( vector )
{
    this.x += vector.x;
    this.y += vector.y;
}

Vector2.prototype.Sub = function( vector )
{
    this.x -= vector.x;
    this.y -= vector.y;
}

Vector2.prototype.MultScalar = function( value )
{
    this.x *= value;
    this.y *= value;
}

Vector2.prototype.GetMultScalar = function( value )
{
    return new Vector2(this.x * value, this.y * value);
}

Vector2.prototype.Normalize = function( len )
{
    len = (this.lengthInvalid) ? this.Length() : this.length;
    this.x /= len;
    this.y /= len;
}


Vector2.prototype.Length = function()
{
    if(this.lengthInvalid)
    {
        this.length = Math.sqrt( this.LengthSqd() );
        this.lengthInvalid = false;
    }
    return this.length;
}

Vector2.prototype.LengthSqd = function( value )
{
    return this.x * this.x + this.y * this.y;
}

Vector2.prototype.Limit = function( max, min )
{
    var len = this.Length();
    if(len > max)
    {
        this.normalize( len );
        this.multScalar( max );
    }
    else if(len < min)
    {
        this.normalize( len );
        this.multScalar( min );
    }
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