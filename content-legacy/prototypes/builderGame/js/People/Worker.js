function People_Worker(pos)
{
    this.pos = pos;
    this.posW = game.worldToGrid(this.pos);
    this.dir = 0;
    this.speed = 3;
    
    this.state = People_Worker.States.WAITING;
    
    this.path = [];
    this.curJob = null;
    this.jobRequest = null;
}

People_Worker.prototype.AssignJob = function(job)
{
    //try to get path
    this.path = game.peopleManager.GetPath(game.worldToGrid(this.pos), job.block.pos);
    //if there is one, accept it
    if(this.path != null)
    {
        this.curJob = job;
        this.state = People_Worker.States.MOVING;
        return true;
    }
    
    //we are lost / stuck
    this.state = People_Worker.States.LOST;
    return false;
}

People_Worker.prototype.CancelJob = function( job )
{
    if(!this.curJob || this.curJob.id != job.id)
    {
        debugger;
        return;
    }
    
    this.curJob = false;
    this.jobRequest = null;
    this.state = People_Worker.States.WAITING;
    this.path = null;
}
    
People_Worker.prototype.Update = function(timeScale)
{
    //get current block
    this.posW = game.worldToGrid(this.pos);
    
    switch(this.state)
    {
        case People_Worker.States.WAITING:
            //ask for job if havent
            if(null == this.jobRequest)
            {
                this.jobRequest = game.peopleManager.RequestJob( this );
            }
            //TODO wander
            break;
        case People_Worker.States.MOVING:
            //follow path
            if(this.path && this.path.length > 0)
            {
                //travel to job
                //TODO animate properly
                var goal = game.gridToWorld(this.path[0]);
                var a = Math.atan2(goal.y - this.pos.y, goal.x - this.pos.x);

                var deltaA = Math.atan2(Math.sin(a - this.dir), Math.cos(a - this.dir))

                this.dir += deltaA * 0.2 * timeScale;
                this.pos.x += Math.cos(this.dir) * this.speed * timeScale;
                this.pos.y += Math.sin(this.dir) * this.speed * timeScale;

                if(GetDist(this.pos, goal) < BLOCK_SIZE/4)
                    this.path.splice(0, 1);
                else if(this.path.length == 1
                        && GetDist(this.pos, goal) < BLOCK_SIZE * 0.75)
                    this.path.splice(0, 1);
            }
            else if(this.curJob != null)
            {
                this.state = People_Worker.States.WORKING;
            }
            else
            {
                this.state = People_Worker.States.WAITING;
            }
            break;
        case People_Worker.States.WORKING:
            if(game.peopleManager.DoJob(this.curJob) || this.curJob.complete)
            {
                //complete job
                this.curJob = null;
                this.jobRequest = null;
                this.state = People_Worker.States.WAITING;
            }
        case People_Worker.States.LOST:
            //animate lost icon
            break;
            
            
    }
}

People_Worker.States = {
    WAITING : 0,
    MOVING : 1,
    WORKING : 2,
    LOST : 3
};
