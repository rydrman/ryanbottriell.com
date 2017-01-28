var initialized = false;
var loaded = false;
window.onload = Initialize;
window.onresize = OnWindowResize;

//timing vars
var MS = 16;
var sessionStarted;
var lastUpdate = new Date();
var fps = 0;

//Math
var TWO_PI = Math.PI * 2;

function Initialize()
{
    //setup game and ui
    this.game = new BuilderGame();
    this.ui = new BuilderUI();;
    
    //prep json loading
    window.loadedJSONs = 0;
    window.numJSONs = 3;
    
    //load material and data lists
    $.getJSON("assets/objectList.json", function(list){ 
                            window.objs = list; 
                            jsonLoaded();
                            });
    $.getJSON("assets/materialList.json", function(list){ 
                            window.mats = list;
                            jsonLoaded();
                            });
    $.getJSON("assets/uiButtons.json", function(data){ 
                            window.ui.menu = data;
                            jsonLoaded();
                            });

    initialized = true;
    OnWindowResize();
}

function jsonLoaded()
{
    window.loadedJSONs++;
    
    if(window.loadedJSONs == window.numJSONs)
    {
         //get ready for loading
        window.numAssets = 0;
        window.loadedAssets = 0;
     
        //request asset list for loading
        $.getJSON("assets/assetList.json", LoadAssets);
    }
}

function LoadAssets(data)
{
    if(!data) debugger;
    
    //loop folders
    for(var folder in data)
    {
        window[folder] = {};
        for(var name in data[folder])
        {
            window.numAssets++;
            window[folder][name] = new Image();
            window[folder][name].onload = assetLoaded;
            window[folder][name].src = "assets/" + folder + "/" + data[folder][name];
        }
    }
}
function assetLoaded()
{
    window.loadedAssets++;
    
    if(window.loadedAssets == window.numAssets)
        Begin();
}

function Begin()
{
    //initialize game and ui
    game.Init(100, 100);
    ui.Init();
    
    //create input events
    addEventListener("mousedown", OnMouseDown);
    addEventListener("mousemove", OnMouseMove);
    addEventListener("mouseup", OnMouseUp);
    addEventListener("mousewheel", OnMouseWheel);
    
    //set time vars
    sessionStarted = new Date();
    lastUpdate = new Date();
    
    loaded = true;
    
    window.requestAnimationFrame( Update );
}

function OnMouseDown(e)
{
    if(!e) e = window.event;
    
    if (!e.which && e.button) 
    {
        // Left
        if (e.button & 1) e.which = 1;
        // Middle
        else if (e.button & 4) e.which = 2;
        // Right
        else if (e.button & 2) e.which = 3;
    }
    if(ui.OnMouseDown(e.clientX, e.clientY, e.which))
        game.OnMouseDown(e.clientX, e.clientY, e.which);
    
    e.preventDefault();
}
function OnMouseMove(e)
{
    if(!e) e = window.event;
    
    ui.OnMouseMove(e.clientX, e.clientY);
    game.OnMouseMove(e.clientX, e.clientY);
}
function OnMouseUp(e)
{
    if(!e) e = window.event;
    
    ui.OnMouseUp(e.clientX, e.clientY);
    game.OnMouseUp(e.clientX, e.clientY);
}
function OnMouseWheel(e)
{
    if(!e) e = window.event;
    if(!e.wheelDelta) e.wheelDelta = -e.detail;
    
    if(ui.OnMouseWheel(e.wheelDelta))
        game.OnMouseWheel(e.wheelDelta);
    
    e.preventDefault();
}

function OnWindowResize()
{
    if(!initialized)
        return;
    
    //resize canvases to fit window
    game.canvas.width = ui.canvas.width = parseInt($(game.canvas).css("width"));
    game.canvas.height = ui.canvas.height = parseInt($(game.canvas).css("height"));
    
    game.OnWindowResize(1, 1); //FIXME
    ui.OnWindowResize(1, 1); //FIXME
}

function Update()
{
    window.requestAnimationFrame( Update );
    
    //calculate time vars
    var deltaTimeMS = new Date().getTime() - lastUpdate.getTime();
    var deltaTimeS = deltaTimeMS * 0.001;
    lastUpdate = new Date();
    
    //average fps with previous value
    fps = Math.round(1 / (deltaTimeMS / 1000) * 10) / 10;
    
    if(loaded)
    {
        ui.Update(deltaTimeMS, deltaTimeS);
        game.Update(deltaTimeMS, deltaTimeS);
    }
    
    Draw();
}

function Draw()
{
    if(loaded)
    {
        game.Draw();
        ui.Draw();
    }
}

var vect2 = function(x, y)
{
    if(!x) x = 0;
    if(!y) y = 0;
    
    return {x: x, y: y};
}

var line = function(a, b)
{
    return{
        a: a,
        b: b
    };
}

var rect = function (x, y, w, h)
{
    return {
        x: x,
        y: y,
        w: w,
        h: h
    };
}

var inRect = function(x, y, rect)
{
    if(x >= rect.x
       && x < rect.x + rect.w
       && y >= rect.y
       && y < rect.y + rect.h)
        return true;
    else return false;
}

function GetDist(pos1, pos2)
{
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}