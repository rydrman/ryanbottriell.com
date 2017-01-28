//TODO add modifier support
/*

INPUT

this class will handle all necessary user input
this will require an update loop, and will fire events of it's own

*/

var Input = function()
{
    //to store mouse
    this.lastMouse = new Vector2();

    //initialize key states to false
    this.keyStates = [];
    for(var key in Input.keyCodes)
    {
        this.keyStates[ Input.keyCodes[key] ] = false;
    }

    //create empty array of listeners
    this.listeners = {}
    for(var type in Input.eventTypes)
    {
        this.listeners[ Input.eventTypes[type] ] = [];
    }


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

    //update vr
    if(ENVIRO.vrEnabled)
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

    //get new mouse position
    var newMouse = ENVIRO.pointerLocked ? this.lastMouse : this.getMousePos(e);

    //check for a listener
    var toCall = this.listeners[Input.eventTypes.MOUSEDOWN];
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

    //get new mouse position
    var newMouse = ENVIRO.pointerLocked ? this.lastMouse : this.getMousePos(e);

    //check for a listener
    var toCall = this.listeners[Input.eventTypes.MOUSEUP];
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

    newMouse = this.getMousePos(e);
    mouseDelta.Copy( this.lastMouse );
    mouseDelta.Sub( newMouse );

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
    return new Vector2((e.clientX || e.pageX) - canvas.offsetLeft,
                       (e.clientY || e.pageY) - canvas.offsetTop)
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

Input.eventTypes = {
    KEYDOWN : 0,
    KEYUP : 1,
    KEYSUST : 2,
    MOUSEUP : 3,
    MOUSEDOWN : 4,
    MOUSEMOVE_DELTA : 5,
    MOUSEMOVE_ABS : 6,
    POINTER_LOCKED: 7,
    POINTER_UNLOCKED: 8
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