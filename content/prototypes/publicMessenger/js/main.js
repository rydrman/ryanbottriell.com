var canvas,
    ctx,
    messenger;

function onLoad()
{
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    window.requestAnimationFrame(update);
    
    messenger = new MallMessenger( ctx );
    
    document.getElementById("message-submit").onclick = onSendClick;
    
    canvas.onmousedown = onMouseDown;
}

function update()
{
    window.requestAnimationFrame(update);
    
    // update code here //
    
    messenger.Update();
    
    //////////////////////
    
    render();
}

function render()
{
    // render code here //
    
    messenger.Render();
    
    //////////////////////
}

function onMouseDown( e )
{
    if(!e) e = window.Event;
    
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;
    
    messenger.OnMouseDown(x, y);
}

function onSendClick()
{
    messenger.SendMessage();
}