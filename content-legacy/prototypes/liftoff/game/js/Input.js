//TODO add modifier support
/*

INPUT

this class will handle all necessary user input
this will require an update loop, and will fire events of it's own

*/

var Input = function()
{
    //to store mouse
    this.lastMouse = new Vector2(0, 0);
    
    //initialize key states to false
    this.keyStates = [];
    for(var key in Input.keyCodes)
    {
        this.keyStates[ Input.keyCodes[key] ] = false;
    }
    this.keyStates["mouseLeft"] = false;
    this.keyStates["mouseRight"] = false;
    
    //create empty array of listeners
    this.listeners = {}
    for(var type in Input.eventTypes)
    {
        this.listeners[ Input.eventTypes[type] ] = [];
    }
    
    //setup pointer lock   
    Settings.pointerLocked = false;
    if(Settings.pointerLockAvailible)
    {
        //find proper request function
        canvasWrapper.requestPointerLock = canvasWrapper.requestPointerLock 
                                                || canvasWrapper.mozRequestPointerLock 
                                                || canvasWrapper.webkitRequestPointerLock;
        //find proper cancel function
        canvasWrapper.exitPointerLock = canvasWrapper.exitPointerLock 
                                                || canvasWrapper.mozEitPointerLock 
                                                || canvasWrapper.webkitExitPointerLock;
    }
    
    //vr stuff
    //this.vrCameras = [];
    //this.vrInput = new VRInput();
    //get ready for vr
    //if(Settings.vrSupported)
    //{
    //    this.vrInput.init();
    //}
    
    //create event listeners for window
    this.createEventHandlers();
}

//called internally
//this function creates all necessary event handlers for the input system
Input.prototype.createEventHandlers = function()
{
    var context = this;
    //key events
    window.addEventListener("keydown", function(e){context.onKeyDown.call(context, e)} );
    window.addEventListener("keyup", function(e){context.onKeyUp.call(context, e)} );
    
    //mouse events
    window.addEventListener("mousemove", function(e){context.onMouseMove.call(context, e)} );
    window.addEventListener("mousedown", function(e){context.onMouseDown.call(context, e)} );
    window.addEventListener("mouseup", function(e){context.onMouseUp.call(context, e)} );
    document.addEventListener("pointerlockchange", function(e){context.onPointerLockChange.call(context, e)}, false );
    document.addEventListener("mozpointerlockchange", function(e){context.onPointerLockChange.call(context, e)}, false );
    document.addEventListener("webkitpointerlockchange", function(e){context.onPointerLockChange.call(context, e)}, false );
}

// Adds callback to given event
//eventType : the evemt type enum from Input.eventTypes
//callback : the function to call when the event fires
//context : the context in which to call the callback function 
//keyCode : the key to associate this event for (not required for mouse move)
//modifiers (optional) : an array of modifier key codes (to be down at same time for key combinations)
Input.prototype.addListener = function( eventType, callback, context, keyCode, modifiers )
{
    //create new event object
    var event = {
        callback: callback,
        context: context
    }
    //add key code if necessary
    if(eventType == Input.eventTypes.KEYDOWN
      || eventType == Input.eventTypes.KEYUP
      || eventType == Input.eventTypes.KEYSUST)
    {
        event.keyCode = keyCode;
    }
    //add modifiers
    if(typeof(modifiers) == 'undefined')
    {
        modifiers = [];
    }
    event.modifiers = modifiers;
    
    //push event to proper stack
    this.listeners[eventType].push(event);
}

//this function checks for sustained keys
//needs to be called by an update loop to allow for events to fire
Input.prototype.update = function()
{
    //check for a listener
    var toCheck = this.listeners[Input.eventTypes.KEYSUST];
    for(var i in toCheck)
    {
        if(this.keyStates[ toCheck[i].keyCode ] == true)
        {
            //fire event
            toCheck[i].callback.call(toCheck[i].context);
        }
    }
    toCheck = this.listeners[Input.eventTypes.MOUSESUST_L];
    for(var i in toCheck)
    {
        if(this.keyStates[ "mouseleft" ] == true)
        {
            //fire event
            toCheck[i].callback.call(toCheck[i].context, this.lastMouse);
        }
    }
    toCheck = this.listeners[Input.eventTypes.MOUSESUST_R];
    for(var i in toCheck)
    {
        if(this.keyStates[ "mouseright" ] == true)
        {
            //fire event
            toCheck[i].callback.call(toCheck[i].context, this.lastMouse);
        }
    }
    
    //update vr
    if(Settings.vrEnabled)
    {
        this.updateVRCameras();
    }
}

Input.prototype.onKeyDown = function(e)
{
    if(!e) e = window.Event;
    
    this.keyStates[e.keyCode] = true;
    
    //check for a listener
    var toCall = this.listeners[Input.eventTypes.KEYDOWN];
    for(var i in toCall)
    {
        if(toCall[i].keyCode == e.keyCode)
        {
            //fire event
            if(this.checkModifiers(toCall[i]))
                toCall[i].callback.call(toCall[i].context);
        }
    }
}

Input.prototype.onKeyUp = function(e)
{
    if(!e) e = window.Event;
    
    this.keyStates[e.keyCode] = false;
    
    //check for a listener
    var toCall = this.listeners[Input.eventTypes.KEYUP];
    for(var i in toCall)
    {
        if(toCall[i].keyCode == e.keyCode)
        {
            //fire event
            if(this.checkModifiers(toCall[i]))
                toCall[i].callback.call(toCall[i].context);
        }
    }
}

Input.prototype.onMouseDown = function(e)
{
    if(!e) e = window.Event;
    
    this.keyStates["mouseleft"] = (e.which == 1) ? true : false;
    this.keyStates["mouseright"] =(e.which == 3) ? true : false;
    
    //get new mouse position
    var newMouse = Settings.pointerLocked ? this.lastMouse : this.getMousePos(e);
    
    //check for a listener
    var toCall = (e.which == 1) ? this.listeners[Input.eventTypes.MOUSEDOWN] : this.listeners[Input.eventTypes.RIGHTMOUSEDOWN];
    for(var i in toCall)
    {
        if(this.checkModifiers(toCall[i]))
            toCall[i].callback.call(toCall[i].context, newMouse);
    }
    this.lastMouse = newMouse;
}

Input.prototype.onMouseUp = function(e)
{
    if(!e) e = window.Event;
    
    this.keyStates["mouseleft"] = false;
    this.keyStates["mouseright"] = false;
    
    //get new mouse position
    var newMouse = Settings.pointerLocked ? this.lastMouse : this.getMousePos(e);
    
    //check for a listener
    var toCall = (e.which == 1) ? this.listeners[Input.eventTypes.MOUSEUP] : this.listeners[Input.eventTypes.RIGHTMOUSEUP];
    for(var i in toCall)
    {
        if(this.checkModifiers(toCall[i]))
            toCall[i].callback.call(toCall[i].context, newMouse);
    }
    this.lastMouse = newMouse;
}

Input.prototype.onMouseMove = function(e)
{
    if(!e) e = window.Event;
        
    //get new mouse position
    var mouseDelta = new Vector2();
    var newMouse;
    if(!Settings.pointerLocked)
    {
        newMouse = this.getMousePos(e);
        mouseDelta.subVectors( this.lastMouse, newMouse );
    }
    else
    {
        mouseDelta.x = e.movementX || e.mozMovementX || e.webkitMovementX;
        mouseDelta.y = e.movementY || e.mozMovementY || e.webkitMovementY;
        newMouse = new Vector2();
        newMouse.addVectors(this.lastMouse, mouseDelta);
        
        //limit to screen
        if(newMouse.x < 0) newMouse.x = 0;
        else if(newMouse.x > window.innerWidth) newMouse.x = window.innerWidth;
        if(newMouse.y < 0) newMouse.y = 0;
        else if(newMouse.y > window.innerWidth) newMouse.y = window.innerHeight;
    }
    
    //check for a listener
    //mouse delta first
    var toCall = this.listeners[Input.eventTypes.MOUSEMOVE_DELTA];
    for(var i in toCall)
    {
        if(this.checkModifiers(toCall[i]))
            toCall[i].callback.call(toCall[i].context, mouseDelta);
    }
    //mouse absolute value next
    var toCall = this.listeners[Input.eventTypes.MOUSEMOVE_ABS];
    for(var i in toCall)
    {
        if(this.checkModifiers(toCall[i]))
            toCall[i].callback.call(toCall[i].context, newMouse);
    }
    this.lastMouse = newMouse;
}

Input.prototype.getMousePos = function(e)
{
    return new Vector2((e.clientX || e.pageX) - canvasWrapper.offsetLeft,
                             (e.clientY || e.pageY) - canvasWrapper.offsetTop)
}

Input.prototype.onPointerLockChange = function(e)
{
    //if it has just been locked
    if(document.pointerLockElement === canvasWrapper
       || document.mozPointerLockElement === canvasWrapper
       || document.webkitPointerLockElement === canvasWrapper)
    {
        Settings.pointerLocked = true;
        //call registered event handlers
        var toCall = this.listeners[Input.eventTypes.POINTER_LOCKED];
        for(var i in toCall)
        {
            if(this.checkModifiers(toCall[i]))
                toCall[i].callback.call(toCall[i].context, true);
        }
    }
    else //it was disabled
    {
        Settings.pointerLocked = false;
        //call registered event handlers
        var toCall = this.listeners[Input.eventTypes.POINTER_UNLOCKED];
        for(var i in toCall)
        {
            if(this.checkModifiers(toCall[i]))
                toCall[i].callback.call(toCall[i].context, false);
        }
    }
}

Input.prototype.lockPointer = function()
{
    if(Settings.usePointerLock && Settings.pointerLockAvailible)
    {
        canvasWrapper.requestPointerLock();
    }
}

Input.prototype.releasePointer = function()
{
    if(Settings.usePointerLock && Settings.pointerLockAvailible)
    {
        canvasWrapper.exitPointerLock();
    }
}

Input.prototype.checkModifiers = function(call)
{

    if( !isDefined(call.modifiers) )
        return true;
    
    for(var i in call.modifiers)
    {
        if( !this.keyStates[ call.modifiers[i] ] )
            return false;               
    }

    return true;
}

//fullscreen stuff
Input.prototype.toggleFullscreen = function()
{
    if( !document.fullscreenElement && !document.webkitFullscreenElement )
        this.enterFullscreen();
    else
        this.exitFullscreen();
}
Input.prototype.enterFullscreen = function()
{
    if(document.fullscreenElement == null || document.webkitFullscreenElement == null)
    {
        var floater = $("#canvas-floater")[0];
        if( floater.requestFullscreen ) floater.requestFullscreen();
        else if( floater.webkitRequestFullscreen ) floater.webkitRequestFullscreen();
        
        onResize();
    }
}

Input.prototype.exitFullscreen = function()
{
    if(document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    
    onResize();
}

//VR realated functions
Input.prototype.enableVR = function( camera )
{
    if(!this.vrInput.initialized)
    {
        this.vrInput.init( function(){
            Settings.vrEnabled = true;
            this.registerVRCamera( camera );
        }, this);
    }
    else
    {
        Settings.vrEnabled = true;
        this.registerVRCamera( camera );
    }
}
Input.prototype.registerVRCamera = function( camera )
{
    //camera.matrixAutoUpdate = false;
    this.vrCameras.push(camera);
}

Input.prototype.updateVRCameras = function()
{
    for(var i in this.vrCameras)
    {
        this.vrInput.applyToCamera( this.vrCameras[i] );
    }
}


Input.eventTypes = {
    KEYDOWN : 0,
    KEYUP : 1,
    KEYSUST : 2,
    MOUSEUP : 3,
    MOUSEDOWN : 4,
    MOUSEMOVE_DELTA : 5,
    MOUSEMOVE_ABS : 6,
    POINTER_LOCKED: 7,
    POINTER_UNLOCKED: 8,
    RIGHTMOUSEDOWN: 9,
    RIGHTMOUSEUP: 10,
    MOUSESUST_L: 11,
    MOUSESUST_R: 12,
}

//this object can be used to easily look up key codes
Input.keyCodes = {
    'backspace' : 8,
    'tab' : 9,
    'enter' : 13,
    'esc' : 27,
    'space' : 32,
    
    //modifiers
    'shift' : 16,
    'ctrl' : 17,
    'alt' : 18,
    'caps' : 20,
    
    //arrow keys
    'left' : 37,
    'up' : 38,
    'right' : 39,
    'down' : 40,
    
    //updder numbers
    '0' : 48,
    '1' : 49,
    '2' : 50,
    '3' : 51,
    '4' : 52,
    '5' : 53,
    '6' : 54,
    '7' : 55,
    '8' : 56,
    '9' : 57,
    
    //alphabet
    'a' : 65,
    'b' : 66,
    'c' : 67,
    'd' : 68,
    'e' : 69,
    'f' : 70,
    'g' : 71,
    'h' : 72,
    'i' : 73,
    'j' : 74,
    'k' : 75,
    'l' : 76,
    'm' : 77,
    'n' : 78,
    'o' : 79,
    'p' : 80,
    'q' : 81,
    'r' : 82,
    's' : 83,
    't' : 84,
    'u' : 85,
    'v' : 86,
    'w' : 87,
    'x' : 88,
    'y' : 89,
    'z' : 90,
    
    //punctuations
    'semi' : 186,
    'quote' : 222,
    'comma' : 188,
    'period' : 190,
    'fwdslash' : 191,
    'bracketopen' : 219,
    'bracketclose' : 221,
    'tilde' : 192
    };