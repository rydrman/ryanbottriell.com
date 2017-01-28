package com.game  
{
	import com.game.Block;
	import flash.display.MovieClip;
	
	public class Cage extends Block
	{
		var _cage_mc:cage_mc;
		
		public function Cage() 
		{
			_cage_mc = new cage_mc();
			addChild(_cage_mc);
			_block_mc.alpha = 0;
		}
		
		//public override function doAction(blocks:Array):void
		//{
			//MovieClip(this.parent).moveBlock(this.x*32, this.y*32, -1, -1, false,true);
		//}

	}
	
}
