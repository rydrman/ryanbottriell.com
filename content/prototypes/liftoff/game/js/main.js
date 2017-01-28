//create new engine for game
var engine = new Engine();

//html stuff
var canvas,
    canvasWrapper;

//utils
var messenger;

var missingImg = new Image();
missingImg.src = "assets/missing.png";

function onLoad()
{
    canvas = $("#game-canvas")[0];
    canvasWrapper = $("#canvas-wrapper")[0];
    
    messenger = new Messenger();
    
    //resize event
    window.onresize = onResize;
    
    //store width and height in environment
    Settings.canvasWidth = parseInt($(canvasWrapper).css("width"));
    Settings.canvasHeight = parseInt($(canvasWrapper).css("height"));
    
    //open debug div if necessary
    if(Settings.debug)
    {
        $("#debug-output").css("height", "50px");
        $("#canvas-floater").css("height", "calc(100% - 50px)");
    }
    else
    {
        $("#debug-output").css("height", "0px");
        $("#canvas-floater").css("height", "100%");
    }
    
    //get things going
    engine.init();
    
    onResize();
    
}

function onResize(e)
{
    if(!e) e = window.Event;
    
    var wrapperJQ = $(canvasWrapper);
    
    var floaterWidth = parseInt($("#canvas-floater").css("width")),
        floaterHeight = parseInt($("#canvas-floater").css("height"));
    
    //find best fit for 16:9
    var fitW = floaterWidth / Settings.aspectW,
        fitH = floaterHeight / Settings.aspectH;
    
    var w, h, l, t;
    if(fitW > fitH)
    {
        //we have bars on the right and left   
        h = floaterHeight;
        w = Settings.aspectW * fitH;
        l = Math.floor(0.5 * (floaterWidth - Settings.aspectW * fitH));
        t = 0;
    }
    else
    {
        //bars on the top and bottom
        h = Settings.aspectH * fitW;
        w = floaterWidth;
        l = 0;
        t = Math.floor(0.5 * (floaterHeight - Settings.aspectH * fitW));
    }
    
    if( isDefined(engine) )
        engine.resize( w, h );
    
    wrapperJQ.css( "height",  h + "px");
    wrapperJQ.css( "width",  w + "px");
    wrapperJQ.css( "left",  l + "px");
    wrapperJQ.css( "top",  t + "px");
    
    //TODO render width should be a seperate user setting...
    Settings.canvasWidth = Settings.renderWidth = parseInt(wrapperJQ.css("width"));
    Settings.canvasHeight = Settings.renderHeight = parseInt(wrapperJQ.css("height"));
    Settings.renderScale = Settings.renderWidth / 1920;
}
