function MachLearnApp() {
    this.glm = null;
    this.gl = null;
}

MachLearnApp.prototype.init = function( glManager )
{
    this.glm = glManager;
    this.gl = glManager.gl;
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

MachLearnApp.prototype.update = function()
{
}

MachLearnApp.prototype.render = function()
{
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}