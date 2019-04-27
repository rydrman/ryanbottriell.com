package com.game
{
	import com.greensock.TweenMax;
	import com.greensock.easing.*;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.display.MovieClip;
	import com.game.UI;
	import com.game.Player;
	import com.game.Level;
	import flash.events.KeyboardEvent;
	import flash.ui.Keyboard;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	public class main extends MovieClip 
	{
		public var ui:UI;
		public var level:Level;
		public var player:Player;
		
		public function main() 
		{
			
			trace("hello");
			ui = new UI();
			addChild(ui);
			ui.x = 0;
			ui.y = 0;
			ui.showUI();
			ui.startButton.addEventListener(MouseEvent.CLICK, onPlayClick);
			
		}
		
		
		public function loadLevel(pack:Number, num:Number)
		{
			level = new Level();
			addChild(level);
			trace("main okay");
			level.Load(pack, num);
		}
		
		public function onPlayClick(e:MouseEvent)
		{
			
			stage.addEventListener(KeyboardEvent.KEY_DOWN, downKey);
			stage.addEventListener(KeyboardEvent.KEY_UP, upKey);
			
			
			TweenMax.to(ui, 1, {alpha:0, ease:Linear.easeOut});
			ui.startButton.removeEventListener(MouseEvent.CLICK, onPlayClick);

			loadLevel(1,1);
			
			player = new Player(level);
			addChild(player);
			
			this.addEventListener(Event.ENTER_FRAME, onFrameEnter);
		}
		
		
		
		public function onFrameEnter(e:Event)
		{
			
			player.Update();
			level.Update();
			//trace("frame");
		}
		
		public function downKey(e:KeyboardEvent)
		{
			player.downKey(e);
			
			
			//level.win();
		}
		
		public function upKey(e:KeyboardEvent)
		{
			player.upKey(e);
		}
	}
	
}
