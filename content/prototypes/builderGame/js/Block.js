//Default sizes
var BLOCK_SIZE = 64,
    SPRITE_SIZE = 64;

var Block = function(pos, mat, obj, parent)
{
    this.pos = pos;
    
    this.utilities = [];
    
    this.foundation = null;
    
    if(!mat) mat = MAT_EMPTY;
    this.mat = mat;
    
    if(!obj) obj = OBJ_EMPTY
    this.obj = obj;
    
    this.roof = null;
    
    if(!parent) parent = null;
    this.parent = parent;
    
    this.jobs = [];
    
    //used by pathing algorithm
    this.lp = 0;
    this.fh = 0
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.p = null;
    this.c = false;
}

//  Define Default and child Obj
var OBJ_EMPTY = null;

var ObjChild = function(spritesheet, sprite, rotation)
{
    return {
        type: "child",
        spritesheet: spritesheet,
        sprite: sprite,
        rotation: rotation
    };
}

//  Define Default Material
var MAT_EMPTY = {
    spritesheet: "materials",
    sprite: 0
}

///////////////////////////////////////////////
// function to access sprite sheet location  //
///////////////////////////////////////////////

function enumToSpriteSheet(num)
{
    return Math.log(num) / Math.log(2);
}