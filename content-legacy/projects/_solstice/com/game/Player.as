package com.game
{
    import com.greensock.TweenMax;
	import com.greensock.easing.*;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.display.MovieClip;
	import flash.display.DisplayObject;
	import com.game.UI;
	import com.game.Player;
	import com.game.Vec;
	import com.game.Level;
	import com.game.Block;
	import com.game.Cage;
	import flash.events.KeyboardEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;	
	import flash.ui.Keyboard;
	import flashx.textLayout.formats.Float;
	import flash.geom.Rectangle;
	import flash.utils.getTimer;
	import flash.display.Sprite;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	
	public class Player extends MovieClip
	{
		var win_snd:Sound = new Win_snd();
		var jump_snd:Sound = new Jump_snd();
		var dead_snd:Sound = new Dead_snd();
		var pound_snd:Sound = new Pound_snd();
		var _player_mc:player_mc;
		var vel:Vec;
		var accel:Number;
		var accele:Vec;
		var deccel:Number;
		var jumpTime:Number;
		var onPlat:Boolean;
		var topSpeed:Number;
		var jump:Number;
		var grav:Number;
		var wantedMove:Vec;
		var pos:Vec;
		var wantedPos:Vec;
		var bounds:Rectangle;
		var wantedBounds:Rectangle;
		var facing:String;
		var _previousTime:Number;
		var deltaTime:Number;
		var deltaTimeSquaredDividedByTwo:Number;
		var isLeft:Boolean;
		var isRight:Boolean;
		var isJump:Boolean;
		var level:Level;
		var size:Vec;
		var isPound:Boolean;
		var block:Block;
		var isNext:Boolean;
		
		var lastFacing:String;
		var speed:Number;
		var gravity:Number;
		var pounded:Boolean;
		var quotient:Number;
		var pack:Number;
		var room:Number;
		var packSize:Number;
		
		public function Player(lev:Level) : void  
		{
			isNext=false;
			block = new Block();
			level = lev;
			_player_mc = new player_mc();
			addChild(_player_mc);
			size = new Vec(26,48);
			_previousTime = 0;
			deltaTime = 0;
			vel = new Vec(0,0);
			accel = 2;
			deccel = 1.5;
			accele = new Vec(0,0);
			jumpTime = 0;
			onPlat = false;
			
			jump = -5.69;
			grav = 0.28;
			wantedMove = new Vec(0,0);
			pos = new Vec(32,10*32);
			wantedPos = new Vec(32,9*32);
			bounds = new Rectangle(0,0,0,0);
			wantedBounds = new Rectangle(0,0,0,0);
			isPound = false;
			
			//wantedPos = new Vec(0,0);
			quotient = 1;
			speed= 0;
			gravity = 5;
			topSpeed = 10;
			pounded = false;
			lastFacing = "right";
			pack = 1;
			room = 1;
			packSize =5;
			
			_player_mc.x = 32;
			_player_mc.y = 320;
			
		}
		
		public function Update() : void 
		{
			if(_player_mc.y > 14*32)
			{
				if(quotient == 1)
			    level.flip();
				else
				{
				level.win(pack,room);
				dead_snd.play();
				}
				
			}
			
			if(intersects(_player_mc, Block(level.winDoor)) && quotient == -1)
			{
				if(room == packSize)
				{
					pack++;
					room = 1;
				}
				else
				room++;
				win_snd.play();
				level.win(pack,room);
			}
			
			if(speed > topSpeed && quotient == 1)
			speed = topSpeed;
		    if (speed < -topSpeed && quotient == -1)
			speed = -topSpeed;
			if(!onPlat && isPound && quotient == 1)
				{
					if(!pounded)
					{
					_player_mc.y = level.doAction(Math.round(_player_mc.x/32),13) - size.Y;
					_player_mc.x = level.blocks[Math.round(_player_mc.x/32)][13].x + 1;
					speed =0;
					pound_snd.play();
					}
					pounded = true;

					isPound = false;

				}
			_player_mc.y += speed * quotient;
			speed += gravity * quotient;
			
			
			for(var h:int = 0; j<level.enemies.length; j++)
			{
						if(level.enemies[h] != null)
						{
							if(intersects(_player_mc, level.enemies[h]))
							{
								if(!level.enemies[h].trapped)
								{
								level.win(pack,room);
								dead_snd.play();
								}
							}
						}
					
			}
			
			onPlat = false;
			for(var j:int = 0; j<25; j++)
			{
					for(var i:int =0; i<32; i++)
					{ 
						if(level.blocks[i][j] != null)
						{
							if(intersects(_player_mc, level.blocks[i][j]))
							{
								var depth:Vec = getPenetrationDepth(_player_mc, level.blocks[i][j]);
								if(Math.abs(depth.Y) < Math.abs(depth.X))
								{
								_player_mc.y += depth.Y;
								pounded=false;
								onPlat = true;
								}
							}
						}
					}
			}
			
			
			if(isRight)
			{
				if(quotient == 1)
				{
					if(!level.isSet(Math.round(_player_mc.x/32) + 1, Math.ceil((_player_mc.y+15)/32)))
					{
						//if(facing !="left")
							_player_mc.x += 32;
							
							
					}
				}
				else
				{
					if(!level.isSet(31 - (Math.round(_player_mc.x/32) + 1), 25 - Math.ceil((_player_mc.y+15)/32)))
					{
						//if(facing !="left")
							_player_mc.x += 32;
							
					}
				}
			facing = "right";
			isRight = false;
			}
			
			if(isLeft)
			{
				if(quotient == 1)
				{
					if(!level.isSet(Math.round(_player_mc.x/32) - 1,  Math.ceil((_player_mc.y+15)/32)))
					{
						//if(facing !="left")
							_player_mc.x -= 32;
					}
				}
				else
				{
					if(!level.isSet(31 - (Math.round(_player_mc.x/32) - 1), 25 - Math.ceil((_player_mc.y+15)/32)))
					{
						//if(facing !="left")
							_player_mc.x -= 32;
					}
				}
			
			facing = "left"
			isLeft = false;
			}
			
			if(isJump && onPlat)
			{
				speed = -27 * quotient;
				jump_snd.play();

			isJump = false;
			}
			
			if(isNext)
			{ 
				level.win(pack,room);
				dead_snd.play();
			isNext = false;
			}
			
			
				
			if(facing == "left")
			{
				if(onPlat)
			   _player_mc.gotoAndStop(2);
			   else
			   _player_mc.gotoAndStop(4);
								   

			}
			else if (facing == "right")
			{
				if(onPlat)
			  _player_mc.gotoAndPlay(1);
			  else
			  _player_mc.gotoAndStop(3);
					
			}
			//trace("PACK = " + pack);
			//trace("ROOM = " + room);
			//trace("lAST: "+facing);
						//trace("current : " +lastFacing);
			
						
	    }
		
		public function intersects(ent1:player_mc, ent2:Block): Boolean
		{
			if(ent1.y <= ent2.y + ent2.width && ent1.x <= ent2.x + ent2.width && ent1.x + size.X>= ent2.x && ent1.y + size.Y >= ent2.y) 
			return true;
			else
			return false;
		}
		
		public function getPenetrationDepth(ent1:player_mc, ent2:Block):Vec
		{
			var halfWidthA:Number = size.X /2;
			var halfHeightA:Number = size.Y /2;
			var halfWidthB:Number = ent2.width /2;
			var halfHeightB:Number = ent2.height/2;
			
			var centerA:Vec = new Vec(ent1.x + halfWidthA, ent1.y + halfHeightA);
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
		
		function downKey(event:KeyboardEvent): void {
				 if(event.keyCode==39){
				 isRight=true}
				 if(event.keyCode==37){
				 isLeft=true}
				 if(event.keyCode==38){
				 isJump=true}
				  if(event.keyCode==32){
				 isPound=true}
				  if(event.keyCode==82){
				 isNext=true}

	   }
	   function upKey(event:KeyboardEvent): void {
				 if(event.keyCode==39){
				 isRight=false}
				 if(event.keyCode==37){
				 isLeft=false}
				 if(event.keyCode==38){
				 isJump=false}
				 if(event.keyCode==32){
				 isPound=false}
				 if(event.keyCode==82){
				 isNext=false}

		}   
	}
}
