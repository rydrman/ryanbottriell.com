package com.game
{
	import flash.display.MovieClip;
	import flash.events.MouseEvent;
	
	public class UI extends MovieClip
	{
		public var uInterface:mainMenu_mc;
		public var startButton:startButton_mc;
		
		public function UI()
		{
			uInterface = new mainMenu_mc;
			startButton = new startButton_mc;
			startButton.buttonMode = true;
			trace("UI created");
		}
		
		public function showUI()
		{
			
			addChild(uInterface);
			addChild(startButton);
		}
		

	}
	
}
