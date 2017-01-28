package com.game  
{
	import com.game.Block;
	import flash.display.MovieClip;
	import com.greensock.TweenMax;
	import com.greensock.easing.*;
	import flash.utils.getQualifiedClassName;
	import com.game.Vec;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	
	public class Dog extends Block
	{
		var trap_snd:Sound;
		var _dog_mc:dog_mc;
		var speed:Number;
		var below:Number;
		var comp:Number;
		var trapped:Boolean;
		var fastness:Number;
		var gravity:Number;
		var topSpeed:Number;
		var quotient:Number;
		var size:Vec;
		var blocks:Array= [];
		
		public function Dog(block:Array) 
		{
			trap_snd = new Trap_snd();////////////////////////
			blocks = block;
			size = new Vec(32,32);
			fastness=0;
			quotient = -1;
			gravity=5;
			topSpeed=10;
			trapped = false;
			comp = 0;
			below = -1;
			speed = 4;
			_dog_mc = new dog_mc();
			addChild(_dog_mc);
			removeChild(_block_mc);
			_dog_mc.gotoAndStop(1);
		}
		
		public override function doAction(blocks:Array):void
		{
			if(!trapped)
			MovieClip(this.parent).win(MovieClip(this.parent).pack, MovieClip(this.parent).levelNum);
		}
		
		public function Update():void
		{
			//trace(this.x);
			if(!trapped)
			{
				if(fastness > topSpeed && quotient == 1)
					fastness = topSpeed;
		   		 if (fastness < -topSpeed && quotient == -1)
					fastness = -topSpeed;
				
				this.y += 10* quotient;// fastness * quotient;
				fastness += gravity * quotient;
				
				for(var j:int = 0; j<25; j++)
					{
					for(var i:int =0; i<32; i++)
					{ 
						if(blocks[i][j] != null)
						{
							if(intersects(blocks[i][j]))
							{
								var depth:Vec = getPenetrationDepth(blocks[i][j]);
								if(isCage(blocks[i][j]) && Math.abs(depth.X) > 8 && Math.abs(depth.Y) > Math.abs(depth.X) && quotient == -1)
								{
								trapped= true;
								MovieClip(this.parent).setFrame(i,j,3);
								alpha = 0;
								}
								else
								{

								if(Math.abs(depth.Y) < Math.abs(depth.X))
								{
								this.y += depth.Y;
								}
								//trace("HIT");
								}
							}
						}
					}
			}
				
				if( MovieClip(this.parent).isSet(Math.floor(getX())+1, Math.floor(getY())) 
				   && MovieClip(this.parent).isSet(Math.floor(getX()), Math.floor(getY())))
				{
					  TweenMax.to(this, 0.1, {y:this.y+(32*-below), ease:Linear.easeOut});
				}
				if ( speed == 4)
				{  //if block to right, cage to left,  no block bottom right
					if( MovieClip(this.parent).isSet(getX()+1-(comp), getY())
					  || MovieClip(this.parent).isCage(getX()+1-(comp), getY()))
					{
						//trace("bounce1");
						if(MovieClip(this.parent).isSet(getX()+1-(comp), getY()+1))
						{   
						   speed *= -1;
						   if(MovieClip(this.parent).isCage(getX()+1-(comp),getY()))
						   {
							   if(this.x > (getX()*32 + (32*(comp/2)))+4 )
								trap(getX()+1-(comp), getY());
								else if(_dog_mc.currentFrame == 1+comp)
							   _dog_mc.gotoAndStop(2+comp);
							   else
								_dog_mc.gotoAndStop(1+comp);
						   }
						   else if(_dog_mc.currentFrame == 1+comp)
						   _dog_mc.gotoAndStop(2+comp);
						   else
							_dog_mc.gotoAndStop(1+comp);
						}
						else
						{
							if(comp ==2)
								this.y -= 32;
							else
								this.y += 32;
						}
					}
				}
				if ( speed == -4)
				{//block left, cage to right, no block bottom left
					if( MovieClip(this.parent).isSet(getX(), getY())
					   || MovieClip(this.parent).isCage(getX(), getY()))
					   //|| !MovieClip(this.parent).isSet(getX(), getY()-1))
					{
						//trace("bounce2");
					    
					    if(MovieClip(this.parent).isSet(getX(), getY()+1))
						{
						speed *= -1;
						   if(MovieClip(this.parent).isCage(getX(),getY()))
						   {
								if(this.x < getX()*32 +28)
									trap(getX(), getY());
								else if(_dog_mc.currentFrame == 1+comp)
							   _dog_mc.gotoAndStop(2+comp);
							   else
								_dog_mc.gotoAndStop(1+comp);
						   }
						   else if(_dog_mc.currentFrame == 1+comp)
						   _dog_mc.gotoAndStop(2+comp);
						   else
							_dog_mc.gotoAndStop(1+comp);
						}
						else
						{
							if(comp ==2)
								this.y -= 32;
							else
								this.y += 32;
						}
					}
				}
				this.x += speed;
			}
		}
		
		public function flip():void
		{
			//this.scaleY *= -1;
			//this.scaleX *= -1;
			//gotoAndStop(2);
			comp = 2;
			_dog_mc.gotoAndStop(_dog_mc.currentFrame+2);
			
			this.x = 1024 - this.width - this.x;
			this.y = 800 - this.y;

			
		}
		
		public function getX():Number
		{
			if(comp == 2)
			{
				var i = Math.floor((1024-(this.x))/32);
				//trace("x="+ i);
				return i;
			}
			else
			//trace(Math.floor(this.x/32));
			return Math.floor(this.x/32);
		}
		public function getY():Number
		{
			if(comp == 2)
			{
				var i = Math.floor((800 - (this.y)+32)/32)-1;
				//trace("y="+ i);
				return i;
			}
			else
			//trace(Math.floor(this.y/32));
			return Math.floor(this.y/32);
		}
		
		public function trap(x:int, y:int)
		{
			trap_snd.play();
			trapped = true;
			this.x = x*32-1;
			this.y = y*32;
		}
		
		public function intersects(ent2:Block): Boolean
		{
			if(this.y <= ent2.y + ent2.width && this.x <= ent2.x + ent2.width && this.x + size.X>= ent2.x && this.y + size.Y >= ent2.y) 
			return true;
			else
			return false;
		}
		
		public function getPenetrationDepth( ent2:Block):Vec
		{
			var halfWidthA:Number = size.X /2;
			var halfHeightA:Number = size.Y /2;
			var halfWidthB:Number = ent2.width /2;
			var halfHeightB:Number = ent2.height/2;
			
			var centerA:Vec = new Vec(this.x + halfWidthA, this.y + halfHeightA);
			var centerB:Vec = new Vec(ent2.x + halfWidthB, ent2.y + halfHeightB);
			
			var distanceX:Number = centerA.X - centerB.X;
			var distanceY:Number = centerA.Y - centerB.Y;
			var minDistanceX:Number = halfWidthA + halfWidthB;
			var minDistanceY:Number = halfHeightA + halfHeightB;
			
			if(Math.abs(distanceX)>= minDistanceX || Math.abs(distanceY) >= minDistanceY)
			return new Vec(0,0);
			
			var depthX:Number = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
			var depthY:Number = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
			return new Vec(depthX,depthY);
			
		}
		public function isCage(block:Block):Boolean
		{
			if(getQualifiedClassName(block) == "com.game::Cage") return true;
			else return false;
		}
	}
	
}
