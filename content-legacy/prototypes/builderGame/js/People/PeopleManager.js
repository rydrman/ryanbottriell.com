var PeopleManager = function()
{
    this.people = [];
    this.jobs = [];
    this.jobRequests = [];
    this.requestCounter = 0;
    this.pathCounter = 0;
    
    this.timeScale = 1;
}
    
PeopleManager.prototype.Init = function()
{
    this.people.push(new People_Worker(new Vec2(10, 10 )));
    this.people.push(new People_Worker(new Vec2(10, 100)));
    this.people.push(new People_Worker(new Vec2(10, 200)));
    this.people.push(new People_Worker(new Vec2(10, 300)));
}
    
PeopleManager.prototype.Update = function(deltaMS, deltaS)
{
    this.timeScale = deltaMS / MS;

    //update people
    for(var i = this.people.length-1; i >= 0; i--)
    {
        this.people[i].Update(this.timeScale);
    }
    //update jobs
    var jb;
    jobLoop:
    for(var i = 0; i < this.jobs.length; i++)
    {
         jb = this.jobs[i];

        //fill requests if can
        for(var j = this.jobRequests.length - 1; j >= 0; j--)
        {
            //match-make
            var accepted = this.jobRequests[j].person.AssignJob( jb );
            if(accepted == true)
            {
                jb.assignee = this.jobRequests[j].person;
                //remove request
                this.jobRequests.splice(j, 1);
                //remove from availible jobs
                this.jobs.splice(i, 1);
                i--;
                continue jobLoop;
            }
        }
    }
}
    
PeopleManager.prototype.Draw = function(ctx)
{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //draw people
    var p;
    for(var i = this.people.length-1; i >= 0; i--)
    {
        p = this.people[i];
        ctx.save();
        ctx.translate(p.pos.x, p.pos.y);
        ctx.rotate(p.dir);
        
        switch(this.people[i].state)
        {
            case People_Worker.States.LOST:
                ctx.fillStyle = "#d33333";
                break;
            case People_Worker.States.WORKING:
                ctx.fillStyle = "#d1ff56";
                break;
            case People_Worker.States.MOVING:
                ctx.fillStyle = "#2dcfff";
                break;
            default:
                ctx.fillStyle = "#FFF";
                break;
        }
        ctx.strokeStyle = "#000";

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, 0);
        ctx.arc(0, 0, 20, 0, TWO_PI, false);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
    
PeopleManager.prototype.PostJob = function( job )
{
    if( !(job instanceof Job))
        debugger;
    //add to array
    this.jobs.push(job);
}

PeopleManager.prototype.RemoveJob = function( job )
{
    if( !(job instanceof Job))
        debugger;
    
    //remove from array
    var index = this.jobs.indexOf(job);
    
    if(-1 == index) return;
    
    this.jobs.splice(index, 1);
}

PeopleManager.prototype.RequestJob = function(person)
{
    var id = this.requestCounter++;
    this.jobRequests.push(
        {
            id: id,
            person: person
        }
    );
    return id;
}
PeopleManager.prototype.DoJob = function(job)
{
    var b = job.block,
        jobComplete = false;
    switch(job.type)
    {
        case JOB_TYPES.FOUNDATION :
            //check foundation
            if(b.foundation != null)
            {
                b.foundation.hp += this.timeScale * 0.5;

                if(b.foundation.hp >= b.foundation.hpMax) 
                {
                    //mark foundation
                    b.foundation.hp = b.foundation.hpMax;
                    b.foundation.built = true;
                    //mark material
                    b.mat = mats.concrete;
                    b.jobs.splice(b.jobs.indexOf(job), 1);
                    jobComplete = true;
                }
                game.updateDisplayList( 
                                        b.pos, 
                                        new Vec2(b.pos.x+1, b.pos.y+1), 
                                        ["mat", "util"]
                                       );;
            }
        case JOB_TYPES.BUILD :
            //check obj
            if(b.obj != OBJ_EMPTY)
            {
                b.obj.hp += this.timeScale * 0.5;

                if(b.obj.hp > b.obj.hpMax)
                {
                    b.obj.hp = b.obj.hpMax;
                    b.obj.built = true;
                    b.jobs.splice(b.jobs.indexOf(job), 1);
                    jobComplete = true;
                }
                game.updateDisplayList(
                                        b.pos, 
                                        new Vec2(b.pos.x + b.obj.size.x, b.pos.y + b.obj.size.y), 
                                        ["obj"]
                                       );
            }
            break;
    }
    job.complete = jobComplete;
    return jobComplete;
}
    
PeopleManager.prototype.GetPath = function(pos1, pos2)
{
    var pNum = ++game.peopleManager.pathCounter;
    var w = game.world;

    //current
    var c = w[pos1.x][pos1.y];
    //goal
    var goal = w[pos2.x][pos2.y];
    //to check
    var o = [];

    //mark first as checked
    c.fh = 0;
    c.lp = pNum;
    c.p = null;
    c.c = true;

    var blocks, b, cst, sm, cstAdd = 0;
    pathLoop:
    while(true)
    {
        //get blocks to check
        blocks = [];
        for (var x = c.pos.x - 1; x < c.pos.x + 2; x++)
        {
            for(var y = c.pos.y - 1; y < c.pos.y + 2; y++)
            {
                if(x == goal.pos.x && y == goal.pos.y)
                {
                    //stop if its goal
                    b = w[x][y];
                    b.p = c;
                    break pathLoop;
                }
                else if(x >= 0
                   && x < game.world.length
                   && y >= 0 
                   && y < game.world[0].length
                   && w[x][y].obj == OBJ_EMPTY)
                {
                    blocks.push(w[x][y]);   
                }
                else
                {
                    blocks.push(null);
                }
            }
        }
        //remove corners if necessary
        if(blocks[1] == null)
        {
            blocks[0] = null;
            blocks[2] = null;
        }
        if(blocks[3] == null)
        {
            blocks[0] = null;
            blocks[6] = null;
        }
        if(blocks[5] == null)
        {
            blocks[2] = null;
            blocks[8] = null;
        }
        if(blocks[7] == null)
        {
            blocks[6] = null;
            blocks[8] = null;
        }

        //chek them
        for(var i = 0; i < blocks.length; i++)
        {
            if(blocks[i] == null) continue;

            b = blocks[i];
            cst = this.GetCost(b.pos.x, b.pos.y, b, goal);

            //if cost has gone up, add more
            if(cst.f > c.f)
            {
                cstAdd += 20;
                cst.f += cstAdd;
                cst.h += cstAdd;
            }
            else
                cstAdd = 0;

            //if hasen't been opened yet
            if(b.lp < pNum)
            {
                b.c = false;
                b.lp = pNum;
                b.p = c;
                b.g = cst.g;
                b.h = cst.h;
                b.f = cst.f;
                b.fh = b.g + c.fh;
                o.push(b);
                console.log("open: " + b.pos.x + ", " + b.pos.y);
            }
            //or see if shorter path home
            else if(!b.c && c.p != null && b.fh < c.p.fh)
            {
                //TODO not doing it's job
                //should remove _/\_ paths
                c.p = b;
                b.c = true;
                o.splice(o.indexOf(b), 1);
            }
            //or check to see if better parent
            else if(!b.c && cst.g < b.g)
            {
                b.p = c;
                b.g = cst.g;
                b.h = cst.h;
                b.f = cst.f;
            }
        }

        //find best option
        if(o.length == 0)
        {
            //debugger;
            return null;
            //deal with this : no path
        }
        sm = {f: Number.MAX_VALUE};
        for(var i = 0; i < o.length; i++)
        {
            if(o[i].f < sm.f)
                sm = o[i];
        }
        //move squares
        o.splice(o.indexOf(sm), 1);
        c = sm;
        c.c = true;
    }
    //path found, return nodes
    var path = [];
    c = b;
    while(true)
    {
        path.push(c.pos);
        c = c.p;
        if(c == null)
            return path.reverse();
    }

}
PeopleManager.prototype.GetCost = function(x, y, b1, b2)
{
    var g = (x == 1 || y == 1) ? 10 : 14;
    var h = (Math.abs(b1.pos.x - b2.pos.x) + Math.abs(b1.pos.y - b2.pos.y)) * 10;
    return {g: g, h: h, f: g+h};
}