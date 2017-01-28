var canvas,
    ctx,
    messenger,
    input;

function onLoad()
{
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    window.requestAnimationFrame(update);
    
    input = new Input();
    app = new VehicleManager( ctx );
}

function update()
{
    window.requestAnimationFrame(update);
    
    // update code here //
    
    app.Update();
    
    //////////////////////
    
    render();
}

function render()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // render code here //
    
    app.Render();
    
    //////////////////////
}
