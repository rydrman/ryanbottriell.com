function Square(pos)
{
    this.pos = pos;
    this.level = -1;
    
    this.neighbours = null;
    
    this.corner = null;
    this.edges = {
        top: null,
        bottom: null,
        left: null,
        right : null
    };
    this.areas = [];
    this.features = [];
    this.objs = [];
}

Square.levels = 3;
