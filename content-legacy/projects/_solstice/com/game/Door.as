package  com.game
{
	import com.game.Block;
	import flash.display.MovieClip;
	
	public class Door extends Block
	{
		var _door:door_mc;

		public function Door() 
		{
			_door = new door_mc;
			addChild(_door);
			removeChild(_block_mc);
		}
		
		public override function doAction(blocks:Array):void
		{
			MovieClip(this.parent).win();
		}

	}
	
}
