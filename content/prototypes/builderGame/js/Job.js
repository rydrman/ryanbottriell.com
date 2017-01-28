var Job = function(type, block)
{
    this.id = nextJobID++;
    
    this.complete = false;
    this.cancelled = false;
    
    this.type = type,
    this.block = block,
    this.assignee = null;
    
    this.attempts = [];

    //add job to block
    block.jobs.push(this);
}

Job.prototype.Cancel = function()
{
    this.cancelled = true;
    if(this.assignee != null)
    {
        this.assignee.CancelJob(this);
    }
    if(this.block)
    {
        this.block.jobs.splice(this.block.jobs.indexOf(this), 1);
    }
}

//////////////////////
// Define Job Types //
//////////////////////

var nextJobID = 0;
var JOB_TYPES = {
    FOUNDATION : 0,
    BUILD : 1,
    REMOVE : 2,
    CLEAN : 3,
    RUN : 4,
}