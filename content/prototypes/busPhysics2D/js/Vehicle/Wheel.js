var Wheel = function( driven )
{
    this.driven = (driven) ? true : false;
    
    this.rad = 0.5715; //R22.5
    this.width = 0.282; //282 mm * 4 tires
    this.psi = 110; //for dueli
    this.kpa = 0;
    this.area = 0;
    this.circ = Math.PI * 2 * this.rad;
    
    this.torque = 0;
    
    this.rotation = 0;
    
    this.allotedMass = 0;
    this.weight = 0;
}

Wheel.prototype.UpdateWeight = function()
{
    this.weight = this.allotedMass * 9.8067; 
}

Wheel.prototype.UpdateSurfaceArea = function()
{
    //psi to pa
    this.kpa = this.psi * 6.89475729;
    //one pascal is 1 newton per meter^2
    this.area = this.weight / (this.kpa * 1000);
}

