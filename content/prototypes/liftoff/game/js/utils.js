/*

UTILS

this file is for storing basic, global utility functions

*/

//define useful variables
function EMPTY_FUNCTION(){};

function clamp(val, min, max)
{
    return Math.min( max, Math.max(val, min));
}

function map(val, rangeLow, rangeHigh, mapLow, mapHigh)
{
    var perc =  1 - (rangeHigh - val) / (rangeHigh - rangeLow)
    return mapLow + perc * (mapHigh - mapLow);
}

function count(obj)
{
    var count = 0;
    for(var i in obj)
        count++;
    return count;
}

//this function checks if the given object is defined
//object :  object to check
function isDefined( object )
{
    return !(typeof(object) == 'undefined');
}

//returns random value from enum object
function randomEnum( enumerator )
{
    var list = [];
    for(var i in enumerator)
        list.push(i);
    
    return enumerator[ list[Math.floor(Math.random() * list.length)] ];
}

//this function checks that all given objects are defined
//it throws an error if one is not
//params : a key-value list of parameter name and input value
function checkParams( params )
{
    for(var param in params)
    {
        if(!isDefined(params[param]))
        {
            messenger.display( new Message.Error("Parameter '" + param + "' must be defined for this function", "Ensure the function call has the necessary parameters"));
            return false;
        }
    }
    return true;
}


function wrap( value, min, max )
{
    if(max < min) throw new Mesage.Error("Cannot wrap when min > max");
    
    var range = max - min;
    
    if (value < min)
        value += range * Math.floor((Math.abs(value - min) / range) + 1);

    return min + (value - min) % range;
    
}
