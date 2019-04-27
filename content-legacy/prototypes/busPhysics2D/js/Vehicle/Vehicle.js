var Vehicle = function()
{
    this.mass = 12000;
    this.position = 0;
    this.velocity = 0;
    this.direction = 1; //no change in 2d, unit vector
    this.acceleration = 0.0; //f * m
    
    this.clutch = 1;//0;
    this.accelerator = 0.01;
    this.brake = 0;
    
    this.engine = new Engine();
    this.transmission = new Transmission();
    this.differential = new Differential();
    this.wheels = [];
    
    this.tEngine = 0;
    this.tTransmission = 0;
    this.tDifferential = 0;
    
    this.initalized = false;
}

Vehicle.prototype.Init = function()
{
    if(this.wheels.length < 1) return;
    if(this.mass == 0) return;
    //TODO
    //if(this.centerOfGravity == null) return;
    
    for(var i in this.wheels)
    {
        this.wheels[i].allotedMass = this.mass / this.wheels.length;
        this.wheels[i].UpdateWeight();
        this.wheels[i].UpdateSurfaceArea();
        if(this.wheels[i].driven)
        {
            this.differential.wheels.push(this.wheels[i]);
        }
    }
    
    this.initalized = true;   
}


Vehicle.prototype.Update = function( deltaTimeS )
{
    if(!this.initalized) return;
    
    this.engine.throttle = this.accelerator;
    this.tEngine = this.engine.GetTorque();
    
    this.transmission.clutch = this.clutch;
    this.tTransmission = this.transmission.GetTorque( this.tEngine );
    
    this.tDifferential = this.differential.ApplyToWheels( this.tTransmission );
}