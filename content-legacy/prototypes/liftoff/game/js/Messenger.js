//TODO error logging on server 
//TODO integrate with engine/renderer
/*

MESSANGER

the messenger class is used by the engine to display custom error, warning, and messages

this file also defines the warning, error, messaging types used in our engine/game

create a new error in your script by writing:

throw new Message.Error( params );

or a warning by writing

throw new Message.Warning( params );

or a message by writing

throw new Message.Message( params );

the engine will catch these errors and display them

you can also catch the errors yourself and deal with them if necessary by using
try/catch statements

*/

var Messenger = function()
{
    this.messageStack = [];
    this.currentMessage = null;
    this.currentTimeout = null;
    
    this.browser = (typeof(ENVIRO) != 'undefined')                ? ENVIRO.browser :
                   (typeof(chrome) != 'undefined')                ? 'chrome' :
                   (typeof(document.documentMode) != 'undefined') ? 'ie' :
                   (typeof(InstallTrigger) != 'undefined')        ? 'firefox' :
                   'other';
    
    //create new div and css to display stuff
    this.displayDiv = document.createElement("div");
    var style = this.displayDiv.style;
    style.position = 'fixed';
    style.width = '100%';
    style.maxWidth = "90%";
    style.padding = "15px";
    style.backgroundColor = "rgba(0, 0, 0, 0)";
    style.top = "-" + this.displayDiv.clientHeight + 'px';
    style.left = '5%';
    style.transition = "top 0.5s";
    
    this.messageDiv = document.createElement('div');
    var style = this.messageDiv.style;
    style.width = "80%";
    style.fontFamily = "ui-font, sans-serif";
    style.fontSize = "20px"
    style.fontStyle = 'bold';
    
    this.solutionDiv = document.createElement('div');
    var style = this.solutionDiv.style;
    style.width = "80%";
    style.fontFamily = "ui-font, sans-serif";
    style.fontSize = "18px"
    style.fontStyle = 'italic';
    style.color = "#222";
    
    this.displayDiv.appendChild(this.messageDiv);
    this.displayDiv.appendChild(this.solutionDiv);
    document.getElementsByTagName('body')[0].appendChild(this.displayDiv);
}

//this function is for global error handling
//it allows the last message to be displayed when everything breaks
//this way you can use 'throw new' to break the code and
//still have it shown
Messenger.prototype.catchErr = function(msg, url, line, col, error)
{
    var result = messenger.display.call(messenger, error, url, line, col, msg);
    if(this.browser == 'chrome')
        return !result;
    return result;
}
//this function displays a new Message.Error, Message.Warning, Message.Message
//it should be used for global events and errors that should be displayed to 
//the user but not break the code.
//msg: instance of Message.Error, Message.Warning, or Message.Message
//url: passed only by thrown errors
//line: passed only by thrown errors
//col: passed only by thrown errors
//error: passed only by thrown errors
Messenger.prototype.display = function(msg, url, line, col, error)
{
    //false is an unhandled error
    var result = false;
    
    if(msg instanceof Message.Error
       || msg instanceof Message.Warning
       || msg instanceof Message.Message)
    {
        
        if(typeof(url) != 'undefined')
        {
            url = url.split("/");
            url = url[url.length];
        }
        
        //it's our own error, display it our way
        var same = this.compareToStack(msg);
        if(same != null)
        {
            return true;
        }
        same = this.compareToCurrent(msg);
        if(same != null)
        {
            return true;
        }
        result = this.process(msg, url, line, col);
    }
    return result;
}

Messenger.prototype.compareToStack = function(msg)
{
    for(var i = this.messageStack.length -1; i >= 0; --i)
    {
        if( this.messageStack[i].type == msg.type 
           && this.messageStack[i].message == msg.message
           && this.messageStack[i].solution == msg.solution)
        {
            this.messageStack[i].count ++;
            return this.messageStack[i];
        }
    }
}

Messenger.prototype.compareToCurrent = function(msg)
{
    if(!this.currentMessage) return;
    
    if( this.currentMessage.type == msg.type 
       && this.currentMessage.message == msg.message
       && this.currentMessage.solution == msg.solution)
    {
        this.currentMessage.count ++;
        this.messageDiv.innerHTML = "(" + this.currentMessage.count + ") " + this.currentMessage.message;
    
        if(this.currentTimeout != null)
                window.clearTimeout(this.currentTimeout);

        //create timeout
        var self = this;
        this.currentTimeout = setTimeout(function(){self.displayNextMessage.call(self)}, msg.time);
        
        return this.currentMessage;
    }
}

//this function proceses an incoming message
//to be called only by Messenger.display
Messenger.prototype.process = function(msg, file, line, col)
{
    switch(msg.type)
    {
        case Message.type.ERROR:
            console.log("ERROR (" + (file || "") + ", " + (line || "") + ", " + (col || "") + "): " + msg.message);
            if(isDefined(msg.solution))
                console.log("SOLUTION: " + msg.solution);
            this.messageStack.push(msg);
            if(this.currentMessage == null)
                this.displayNextMessage();
            //debugger;
            break;
        case Message.type.WARNING:
            console.log("WARNING (" + (file || "") + ", " + (line || "") + ", " + (col || "") + "): " + msg.message);
            if(isDefined(msg.solution))
                console.log("SOLUTION: " + msg.solution);
            this.messageStack.push(msg);
            if(this.currentMessage == null)
                this.displayNextMessage();
            break;
        case Message.type.MESSAGE:
            console.log("MESSAGE: " + msg.message);
            this.messageStack.push(msg);
            if(this.currentMessage == null)
                this.displayNextMessage();
            break;
        default:
            return false;
    }
    return true;
}

Messenger.prototype.displayNextMessage = function()
{
    
    if(this.messageStack.length)
    {
        var msg = this.messageStack[0];
        switch(msg.type)
        {
            case Message.type.ERROR:
                this.displayDiv.style.backgroundColor = "#db0c0c";
                break;
            case Message.type.WARNING:
                this.displayDiv.style.backgroundColor = "#eabf0d";
                break;
            case Message.type.MESSAGE:
                this.displayDiv.style.backgroundColor = "#00d8ff";
                break;
            default:
                throw new Error("unknown error type...");
        }
        //set html
        this.messageDiv.innerHTML = (msg.count > 1 ? "(" + msg.count + ") " : "" ) + msg.message;
        this.solutionDiv.innerHTML = msg.solution;
        
        //animate
        this.displayDiv.style.transition = "none";
        this.displayDiv.style.top = "-" + this.displayDiv.clientHeight + 'px';
        this.displayDiv.offsetHeight;
        this.displayDiv.style.transition = "top 0.5s";
        this.displayDiv.style.top = '0px';
        
        //clear timeout
        if(this.currentTimeout != null)
            window.clearTimeout(this.currentTimeout);
        
        //create timeout
        var self = this;
        this.currentTimeout = setTimeout(function(){self.displayNextMessage.call(self)}, msg.time);
        
        //remove from stack
        this.messageStack.splice(0, 1);
        this.currentMessage = msg;
    }
    else
    {
        //move the div out of the way
        this.displayDiv.style.top = "-" + this.displayDiv.clientHeight + 'px';
        this.currentMessage = null;
        this.currentTimeout = null;
    }
}

/////////////////////////////////////
//  Message definitions and types  //
/////////////////////////////////////

var Message = {};
Message.type = {
    "MESSAGE" : 0,
    "WARNING" : 1,
    "ERROR" : 2
};

Message.Error = function( message, solution, timeMS  )
{
    this.type = Message.type.ERROR;
    this.message = message;
    this.solution = solution || "";
    this.time = timeMS || 4000;
    this.count = 1;
}

Message.Warning = function( message, solution, timeMS )
{
    this.type = Message.type.WARNING;
    this.message = message;
    this.solution = solution || "";
    this.time = timeMS || 4000;
    this.count = 1;
}

Message.Message = function( message, solution, timeMS )
{
    this.type = Message.type.MESSAGE;
    this.message = message;
    this.solution = solution || "";
    this.time = timeMS || 4000;
    this.count = 1;
}