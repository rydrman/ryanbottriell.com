var MallMessenger = function( ctx )
{
    this.ctx = ctx;
    
    this.imgBackground = document.getElementById("background-image");
    this.imgOverlay = document.getElementById("overlay-image");
    
    this.stationInfoDiv = document.getElementById("station-info");
    this.stationInfoDiv.name = document.getElementById("station-info-name");
    this.stationInfoDiv.msg = document.getElementById("station-info-msg");
    this.stationInfoDiv.sendTime = document.getElementById("station-info-sendTime");
    this.stationInfoDiv.recieveTime = document.getElementById("station-info-recieveTime");
    this.destSelector = document.getElementById("message-destination");
    this.selectedStation = null;
    
    this.connections = [];
    this.stations = [];
    
    //top out
    var con1 = new Path();
    con1.Add( new Line( new Vector2(380, 40),  new Vector2(510, 40) ) );
    con1.Add( new Line( new Vector2(510, 50),  new Vector2(510, 200) ) );
    con1.Add( new Line( new Vector2(510, 200), new Vector2(530, 200) ) );
    con1.Add( new Line( new Vector2(530, 200), new Vector2(530, 350) ) );
    con1.Add( new Line( new Vector2(530, 350), new Vector2(400, 350) ) );
    con1 = new Connection( con1 );
    this.connections.push( con1 );
    
    //top in
    var con2 = new Path();
    con2.Add( new Line( new Vector2(390, 400), new Vector2(390, 250) ) );
    con2.Add( new Line( new Vector2(400, 250), new Vector2(500, 250) ) );
    con2.Add( new Line( new Vector2(500, 250), new Vector2(500, 50) ) );
    con2.Add( new Line( new Vector2(500, 50),  new Vector2(380, 50) ) );
    con2 = new Connection( con2 );
    this.connections.push( con2 );
    
    //middle in
    var con3 = new Path();
    con3.Add( new Line( new Vector2(400, 360), new Vector2(540, 360) ) );
    con3.Add( new Line( new Vector2(540, 360), new Vector2(540, 250) ) );
    con3.Add( new Line( new Vector2(540, 250), new Vector2(755, 250) ) );
    con3 = new Connection( con3 );
    this.connections.push( con3 );
    
    //middle out
    var con4 = new Path();
    con4.Add( new Line( new Vector2(755, 260), new Vector2(560, 260) ) );
    con4.Add( new Line( new Vector2(560, 260), new Vector2(560, 370) ) );
    con4.Add( new Line( new Vector2(560, 370), new Vector2(400, 370) ) );
    con4 = new Connection( con4 );
    this.connections.push( con4 );
    
    //right in
    var con5 = new Path();
    con5.Add( new Line( new Vector2(400, 380), new Vector2(540, 380) ) );
    con5.Add( new Line( new Vector2(540, 380), new Vector2(540, 510) ) );
    con5.Add( new Line( new Vector2(540, 510), new Vector2(755, 510) ) );
    con5.Add( new Line( new Vector2(755, 510), new Vector2(755, 530) ) );
    con5 = new Connection( con5 );
    this.connections.push( con5 );
    
    //right out
    var con6 = new Path();
    con6.Add( new Line( new Vector2(755, 530), new Vector2(700, 530) ) );
    con6.Add( new Line( new Vector2(700, 530), new Vector2(700, 550) ) );
    con6.Add( new Line( new Vector2(700, 550), new Vector2(500, 550) ) );
    con6.Add( new Line( new Vector2(500, 550), new Vector2(500, 450) ) );
    con6.Add( new Line( new Vector2(500, 450), new Vector2(400, 450) ) );
    con6.Add( new Line( new Vector2(400, 450), new Vector2(400, 400) ) );
    con6 = new Connection( con6 );
    this.connections.push( con6 );
    
    //left in
    var con7 = new Path();
    con7.Add( new Line( new Vector2(390, 400), new Vector2(390, 510) ) );
    con7.Add( new Line( new Vector2(390, 510), new Vector2(200, 510) ) );
    con7.Add( new Line( new Vector2(200, 510), new Vector2(200, 540) ) );
    con7.Add( new Line( new Vector2(200, 540), new Vector2(40, 540) ) );
    con7 = new Connection( con7 )
    this.connections.push( con7 );
    
    //left out
    var con8 = new Path();
    con8.Add( new Line( new Vector2(40, 530), new Vector2(150, 530) ) );
    con8.Add( new Line( new Vector2(150, 530), new Vector2(150, 500) ) );
    con8.Add( new Line( new Vector2(150, 500), new Vector2(380, 500) ) );
    con8.Add( new Line( new Vector2(380, 500), new Vector2(380, 390) ) );
    con8 = new Connection( con8 );
    this.connections.push( con8 );
    
    var top = new Station('top', con2, con1 );
    top.top = 18;
    top.left = 345;
    top.width = top.height = 50;
    
    var middle = new Station('middle', con3, con4 );
    middle.top = 227;
    middle.left = 745;
    middle.width = middle.height = 50;
    
    var right = new Station('right', con5, con6 );
    right.top = 517;
    right.left = 742;
    right.width = right.height = 50;
    
    var left = new Station('left', con7, con8 );
    left.top = 505;
    left.left = 8;
    left.width = left.height = 50;
    
    this.stations['top'] = top;
    this.stations['middle'] = middle;
    this.stations['right'] = right;
    this.stations['left'] = left;
}

MallMessenger.prototype.Update = function()
{
    for(var i in this.connections)
    {
        var done = this.connections[i].Update();
        
        //pass messages
        for(var i in done)
        {
            var lastCon = this.stations[done[i].destination].in;
            
            if(lastCon == done[i].connection)
            {
                if(done[i].message == "Default Message") continue;
                
                //message arrived
                var station = this.stations[done[i].destination];
                station.RecieveMessage( done[i] );
                
                if(this.selectedStation == station)
                {
                    this.stationInfoDiv.msg.innerHTML = station.lastMessage;
                }
            }
            else
            {
                lastCon.SendMessage(done[i]);
            }
        }
    }
    
    for(var i in this.stations)
    {
        this.stations[i].Update();
        
        if(this.stations[i] == this.selectedStation)
        {
            this.stationInfoDiv.sendTime.innerHTML = Math.floor(this.stations[i].ellapsedSend * 0.001) + "s";
            this.stationInfoDiv.recieveTime.innerHTML = Math.floor(this.stations[i].ellapsedRecieved * 0.001) + "s";
        }
    }
}

MallMessenger.prototype.Render = function()
{
    this.ctx.drawImage(this.imgBackground, 0, 0);
    
    for(var i in this.connections)
    {
        this.connections[i].Render();
    }
    
    this.ctx.drawImage(this.imgOverlay, 0, 0);
    
    for(var i in this.stations)
    {
        this.stations[i].Render();
    }
}

MallMessenger.prototype.SendMessage = function()
{
    if(!this.selectedStation) return;
    
    var text = document.getElementById("message-input").value;
    var dest = this.destSelector.value;
    
    var message = new Message( this.selectedStation.name, text, dest );
    
    this.selectedStation.out.SendMessage( message );
    
    
    
}

MallMessenger.prototype.OnMouseDown = function(x, y)
{
    for(var i in this.stations)
    {
        if(this.stations[i].InBounds(x, y))
        {
            this.selectedStation = this.stations[i];
            this.stationInfoDiv.name.innerHTML = this.stations[i].name;
            this.stationInfoDiv.msg.innerHTML = this.stations[i].lastMessage;
            this.stationInfoDiv.style.display = "block";
            
            this.stationInfoDiv.style.left = (canvas.offsetLeft + 25) + "px";
            this.stationInfoDiv.style.top = (canvas.offsetTop + 25) + "px";
            //this.stationInfoDiv.style.left = (canvas.offsetLeft + this.selectedStation.left - 75) + "px";
            //this.stationInfoDiv.style.top = (canvas.offsetTop + this.selectedStation.top + this.selectedStation.height) + "px";
            //this.stations[i].SendMessage("HI");
        }
    }
}