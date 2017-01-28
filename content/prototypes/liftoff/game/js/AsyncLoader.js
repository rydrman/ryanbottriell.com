/*

ASYNC LOADER

This object handles multiple async calls and fires an event when they are completed.

*/

var AsyncLoader = function()
{
    this.onComplete = function(){messenger.display( new Message.Warning( "async loading complete, but no callback function defined" ) )};
    this.onCompleteContext = window;
    
    this.numberOfCalls = 0;
    this.numberReturned = 0;
    this.calls = [];
}

//tells the loader to run all of the stacked calls
//calls onComplete funtion whem done
AsyncLoader.prototype.runCalls = function()
{
    if(this.calls.length == 0)
    {
        this.onComplete.call(this.onCompleteContext);
    }
    
    this.numberOfCalls = this.calls.length;
    var self = this;
    
    for(var i = 0; i < this.numberOfCalls; ++i)
    {
        var call = this.calls[i];
        
        if(call instanceof AsyncCall)
        {
            $.ajax(call.path, call.options);
        }
        else if(call instanceof AsyncImageCall)
        {
            call.image.onload = call.onload;
            call.image.onerror = call.onLoad;
            call.image.src = call.path;
        }
        else if(call instanceof AsyncObjectCall)
        {
            if( !isDefined(call.object.onLoad) )
            {
                messenger.display( new Message.Error("cannot load object async, no onLoad callback defined", "define an onLoad variable to be called when object finishes loading") );
                this.numberReturned ++;
                continue;
            }
            else if( !isDefined(call.object.load) )
            {
                messenger.display( new Message.Error("cannot load object async, no load function present", "create a load function on the object") );
                this.numberReturned ++;
                continue;
            }
            call.object.onLoad = call.onload;
            call.object.load.call(call.object);
            
            //define perc update if available
            if( isDefined(call.object.percChange) && isDefined(call.percChange) )
            {
                call.object.percChange = function(data){call.percChange(call.object, data)};
            }
        }
        else 
            debugger;
    }
}

//calls for a JSON file
AsyncLoader.prototype.addJSONCall = function(filePath, callback)
{
    checkParams({filePath : filePath});
    if(!isDefined(callback))
        callback = EMPTY_FUNCTION;
    
    var index = this.calls.length;
    var self = this;
    this.calls.push( new AsyncCall(
        index,
        filePath,
        {
            context: this, 
            complete: function(data){
                var obj = null;
                try{
                    obj = JSON.parse(data.responseText);
                }
                catch(err){
                    console.warn('JSON did not parse: ', err);
                }
                self.callback(index, obj);
            },
            dataType: 'text'
        },
        callback
    ) );
}

//calls for a text file
AsyncLoader.prototype.addTextCall = function(filePath, callback)
{
    checkParams({filePath : filePath});
    if(!isDefined(callback))
        callback = EMPTY_FUNCTION;
    
    var index = this.calls.length;
    var self = this;
    this.calls.push( new AsyncCall(
        index,
        filePath,
        {context:this, complete: function(data){
            self.callback(index, data.responseText)
        }, dataType: 'text'},
        callback
    ) );
}

//this function will lpad an image as an async call
//filepath : the image filepath
//image : the image object in which to load the file
//callback (optional) : the function to call when this object loads
AsyncLoader.prototype.addImageCall = function(filePath, image, callback)
{
    checkParams({filePath : filePath, image : image});
    if(!isDefined(callback))
        callback = EMPTY_FUNCTION;
    
    var self = this;
    var index = this.calls.length;
    this.calls.push( new AsyncImageCall(
        index,
        filePath,
        image,
        function(){self.callback(index, image)},
        callback
    ) );
}

//this fnction allows the async loader to interface with
//javascript classes which require loading
//object : the javascript object to load
//callback (optional) : the function to call when this object loads
//perChange (optional) : this function is called when the amount loaded changes
//** the object must have a load function to call
//** and a onLoad callback property
//** and an onLoadContext property
AsyncLoader.prototype.addClassCall = function( object, callback, percChange )
{
    checkParams({object : object});
    if(!isDefined(callback))
        callback = EMPTY_FUNCTION;
    
    var index = this.calls.length;
    var self = this;
    this.calls.push( new AsyncObjectCall(
        index,
        object,
        function(data){self.callback(index, data)},
        callback,
        percChange
    ) );
}

AsyncLoader.prototype.callback = function( index, data )
{
    //console.log(index);
    this.calls[index].callback.call(window, data);
    this.numberReturned++;
    
    if(this.numberReturned == this.numberOfCalls)
    {
        this.onComplete.call(this.onCompleteContext);
        this.calls = [];
        this.numberOfCalls = 0;
        this.numberReturned = 0;
    }
}

var AsyncCall = function(index, path, options, callback)
{
    this.index = index;
    this.path = path;
    this.options = options;
    this.callback = callback;
}

var AsyncImageCall = function(index, path, image, onload, callback)
{
    this.index = index;
    this.path = path;
    this.image = image;
    this.onload = onload;
    this.callback = callback;
}

var AsyncObjectCall = function(index, object, onload, callback, percChange)
{
    this.index = index;
    this.object = object;
    this.onload = onload;
    this.percChange = percChange;
    this.callback = callback;
}

var AsyncLoadable = function()
{
    this.onLoad = EMPTY_FUNCTION;
    this.onLoadContext = window;
}
AsyncLoadable.prototype.load = function()
{
    this.onLoad.call(this.onLoadContext);
}