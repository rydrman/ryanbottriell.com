package com.game  
{
	import flash.display.MovieClip;
	//import com.game.Block;
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import com.greensock.TweenMax;
	import com.greensock.easing.*;
	import com.game.Block;
	import com.game.Dog;
	import com.game.Cage;
	import flash.utils.getQualifiedClassName;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	
	public class Level extends MovieClip
	{
		public var tips:tips_mc;
		public var bg:background_mc;
		public var blocks:Array = [];
		public var enemies:Array;
		public var cages:Array;
		public var loader:URLLoader;
		public var levelInfo:XML;
		public var winDoor:Door;
		public var pack:int;
		public var levelNum:int;
		public var songOver:Sound;
		public var songUnder:Sound;
		public var win_snd:Sound = new Win_snd();
		public var flip_snd:Sound = new Flip_snd();
		public var sndCh:SoundChannel;
		
		public function Level() 
		{

			songOver = new overworld_mus();
			songUnder = new underworld_mus();
			
			enemies = new Array();
			cages = new Array();
			tips = new tips_mc();
			for(var i=0; i<32 ; i++)
			{
				blocks[i] = [];
			}
			
			for( i = 0; i<32; i++)
			{
				for(var j:int = 0; j<25; j++)
				{
					blocks[i][j] = null;
				}
			}
		}
		
		public function Load(_pack:Number, num:Number):void
		{
			
			pack = _pack; levelNum = num;
			
			//trace(pack, levelNum);
			var fileName:String = new String("Levels/"+ _pack +"_"+ num +".xml");
			trace(fileName);
			loader = new URLLoader(new URLRequest(fileName));
			loader.addEventListener(Event.COMPLETE, XMLLoaded)
			function XMLLoaded(e:Event)
			{
				trace("XML Loaded");
				var levelInfo:XML = new XML(e.target.data);
				
				
				bg = new background_mc();
				bg.x = 512;
				bg.y = 400;
				addChild(bg);
				
				//addChild(song);
				bg.gotoAndStop(_pack);
				if(num == 1 && _pack < 3)
				{
				tips.x = 10;
				tips.y = 10;
				addChild(tips);
				tips.gotoAndStop(_pack);
				}
				winDoor = new Door();
				winDoor.x = 1*32;
				winDoor.y = 14*32;
				addChild(winDoor);
				
				var x:int;
				var y:int;
				for(var i:int = 0; i<levelInfo.blocks.x.length(); i++)
				{
					x = levelInfo.blocks.x[i];
					y = levelInfo.blocks.y[i];

					blocks[x-1][y-1] = new Block();
					addChild(blocks[x-1][y-1]);

					blocks[x-1][y-1].x = (x-1)*32;
					blocks[x-1][y-1].y = (y-1)*32;
				}
				Draw();
				
				for(i = 0; i<levelInfo.enemies.x.length(); i++)
				{
					trace("enemie created");
				
					x = levelInfo.enemies.x[i];
					y = levelInfo.enemies.y[i];

					enemies[i] = new Dog(blocks);
					addChild(enemies[i]);

					enemies[i].x = (x-1)*32;
					enemies[i].y = (y-1)*32;
				}
				
				for(i = 0; i<levelInfo.cages.x.length(); i++)
				{
					trace("cage created");
					
					x = levelInfo.cages.x[i];
					y = levelInfo.cages.y[i]; 

					blocks[x-1][y-1] = new Cage();
					addChild(blocks[x-1][y-1]);

					blocks[x-1][y-1].x = (x-1)*32;
					blocks[x-1][y-1].y = (y-1)*32;
				}
				
			}
			function Draw()
			{
				for(var j:int = 1; j<25; j++)
					for(var i:int = 0; i<32; i++)
					{
						//trace(i, j);
						if(blocks[i][j] != null)
						{
							if(blocks[i][j-1] == null)
							{
								blocks[i][j]._block_mc.gotoAndStop(1+(6*(pack-1)));
							}
							else if (blocks[i][j-2] == null)
							{
								blocks[i][j]._block_mc.gotoAndStop(5+(6*(pack-1)));
							}
							else
							{
								blocks[i][j-1]._block_mc.gotoAndStop(3+(6*(pack-1)));
								blocks[i][j]._block_mc.gotoAndStop(5+(6*(pack-1)));
							}
						}
					}
			}
			if(sndCh)sndCh.stop();
			sndCh = songOver.play(0,9999);
		}
		
		public function doAction(x:Number, y:Number):Number
		{
			
			if(x != 1 && x != 2 && firstBlock(x) != 12)
			{
				blocks[x][y].doAction(blocks);
				for(var i:int = 0; i<24; i++)
					{
						if(blocks[x][i] != null)
						{
							return blocks[x][i].y;
						}
					} return 0;
			}return  firstBlock(x)*32;
		} 
		
		public function moveBlock(x1:int, y1:int, x2:int = -1, y2:int = -1, opposite:Boolean = false):void
		{
			if(x2 != -1 && y2 != -1)
			{
				blocks[x1][y1].x = x2*32;
				blocks[x1][y1].y = y2*32;
				blocks[x2][y2] = blocks[x1][y1];
				removeBlock(x1,y1);
			}
			else if(opposite == true)
			{
				blocks[x2][y2].x = x2*32;
				blocks[x2][y2].y = (15-y1)*32;
				blocks[x1][15-y1] = blocks[x1][y1];
				removeBlock(x1,y1);
			}
		}
		
		public function removeBlock(x:int, y:int):void
		{
			blocks[x][y] = null;
		}
		
		public function firstBlock(rowNum:int):int
		{
			for(var y:int = 0; y<25; y++)
				{
					if(blocks[rowNum][y] != null)
					return y;
				}
				return 13;
		}
		
		public function lastBlock(rowNum:int):int
		{
			for(var y:int = 24; y>0; y--)
				{
					if(blocks[rowNum][y] != null)
					return y;
				}
				return 13;
				
		}
		
		
		public function moveRow(rowNum:int):void
		{
			
				if(blocks[rowNum][11] != null)
				{
					if(getQualifiedClassName(blocks[rowNum][firstBlock(rowNum)]) == "com.game::Cage")
					{
						moveBlock(rowNum,firstBlock(rowNum), rowNum,lastBlock(rowNum)+1);
						return;
					}

					for(y= 24; y>0; y--)
					{
						if(blocks[rowNum][y] != null)
						{
						TweenMax.to(blocks[rowNum][y], 0.1, {y:blocks[rowNum][y].y+32, ease:Linear.easeOut});
						
						blocks[rowNum][y+1] = blocks[rowNum][y];
						blocks[rowNum][y] = null;
						
						//trace(blocks[rowNum][y+1].y)
						}
					}
				
			}
		}
		
		public function win(numPack:int = 0, numLevel:int = 0)
		{
			
			if(numPack == 0)
			{
				if(levelNum<5)
					Load(pack, levelNum+1);
				else if(pack <3)
					Load(pack+1, 1);
			}
			else
			 Load(numPack, numLevel);
			
			
			
			MovieClip(this.parent).player._player_mc.x = 32;
			MovieClip(this.parent).player._player_mc.y = 7*32;
			MovieClip(this.parent).player.quotient = 1;
			
			while(this.numChildren != 0) this.removeChildAt(0);
			for(var i:int = 0; i<32; i++)
			{
				for(var j:int = 0; j<25; j++)
				{
					blocks[i][j] = null;
				}
			}
			
		}
		
		public function isSet(i:int, j:int):Boolean
			{
				if(i == -1 || j == -1)
					return true;
				else if(Block(blocks[i][j]) != null)
					return true;
				else
					return false;
			}
		
		public function Update():void
		{
			for(var i:int = 0; i<enemies.length; i++)
			{
				enemies[i].Update();
			}
		}
		
		public function flip()
		{
			
			flip_snd.play();
			sndCh.stop();
			sndCh = songUnder.play(0, 9999);
			TweenMax.to(bg, 0.7, {rotationX:-180, ease:Linear.easeIn});
			if(tips && MovieClip(this.parent).player.pack ==1 || MovieClip(this.parent).player.pack == 2 && MovieClip(this.parent).player.room == 1)
			tips.gotoAndStop(4);
			var numC:Number = this.numChildren;
			
			for(var i:int = 1; i<numC; i++)
			{

				var obj = this.getChildAt(i);
				if(obj)
				{
					
					trace(getQualifiedClassName(obj));
					if(getQualifiedClassName(obj) == "com.game::Dog")
					{
						obj.quotient = 1;
						obj.flip();
					}
					else if(getQualifiedClassName(obj) == "com.game::Door")
					{
						obj.x = 1024 - obj.width - obj.x;
						obj.y = 800 - obj.y-64;
						obj.getChildAt(0).nextFrame();
					}
					else
					{
						//obj.scaleY *= -1;
						obj.x = 1024 - obj.width - obj.x;
						obj.y = 800 - obj.y;
						obj.getChildAt(0).nextFrame();
					}
					
				}
			}
			MovieClip(this.parent).player.quotient *= -1;
			MovieClip(this.parent).player._player_mc.x = 4*32;
			MovieClip(this.parent).player._player_mc.y = 7*32;
			
			//trace(MovieClip(this.parent).player._player_mc.x);
			//trace(MovieClip(this.parent).player._player_mc.y);
		}
		public function isCage(x:int, y:int):Boolean
		{
			if(getQualifiedClassName(blocks[x][y]) == "com.game::Cage") return true;
			else return false;
		}
		
		public function setFrame(i:int, j:int, num:int)
		{
			trace("changeframe");
			blocks[i][j]._cage_mc.gotoAndStop(num);
		}
	}
	
}
