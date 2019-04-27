package com.game 
{
	import flash.display.MovieClip;
	//import com.game.Level;
	import com.game.Block;
	
	public class Block extends MovieClip
	{
		public var _block_mc:block_mc;
		
		public function Block()
		{
			_block_mc = new block_mc;
			addChild(_block_mc);
		}
		
		public function doAction(blocks:Array):void
		{
			MovieClip(this.parent).moveRow(this.x/32);
		}
		
	}
	
}
