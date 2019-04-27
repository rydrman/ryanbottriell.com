function glManager(){
    this.gl = null;
}

glManager.prototype.init = function( canvasID )
{
    ///////////////////////////////////////////
    //  Initialize webGL and canvas context  //
    ///////////////////////////////////////////
    
    canvas = document.getElementById(canvasID)
    
    this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    
    if(!this.gl)
    {
        console.log("could not initialize webGL context");
        return false;
    }
    else
    {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        console.log("webGL context initialized successfully");
        return true;
    }
    
    ///////////////////////////////
    //  compile default shaders  //
    ///////////////////////////////
}

//type is 'vert' or 'frag'
glManager.prototype.compileShader = function(source, type)
{
    if(type == 'vert') type = this.gl.VERTEX_SHADER;
    else type = this.gl.FRAGMENT_SHADER;
    
    var newShader = this.gl.createShader(type);
    this.gl.shaderSource(newShader, source);
    this.gl.compileShader(newShader);
    
    //check to see if it succeeded
    status = this.gl.getShaderParameter(newShader, gl.COMPILE_STATUS);
    if(!status)
    {
        console.log(this.gl.getShaderInfoLog(shader));
        return null;
    }
    return newShader;
}

glManager.prototype.linkProgram = function(vert, frag)
{
    var newProgram = gl.createProgram();
    this.gl.attachShader(nerwProgram, vert);
    this.gl.attachShader(newProgram, frag);
    this.gl.linkProgram(newProgram);
    
    status = this.gl.getProgramParameter(newProgram, gl.LINK_STATUS);
    if(!status)
    {
        console.log(gl.getProgramInfoLog(newProgram));
        return null;
    }
    return newProgram;
}

//var aPosition = gl.getAttribLocation(program, 'aPosition');
//var uFragColor = gl.getUniformLocation(program, 'uFragColor');