(function(){
	if( "[object HTMLAudioElement]" === ({}).toString.call( window.Audio && new window.Audio ) ){
		return ;
	}else{
		var ver, SF = 'ShockwaveFlash';
        try { //检测IE的flash支持情况
            ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
        } catch (ex) {} 
        if (!ver) {
            return alert( "need flash or Audio support!!" );
        }

        //支持情况下，拿到相对的flash路径
		var swfUrl = document.scripts[document.scripts.length-1].src.replace("index.js","swf/audio.swf");


		//flash承载体模拟Audio
		window.Audio = function (){
			var div = document.createElement("div");

			div.style.display = "none";
			div.innerHTML = '<object width="1" height="1" data="'+swfUrl+'" type="application/x-shockwave-flash"><param name="flashvars" value="dix=Audio.MusicBox."></object>';

			var swf = div.children[0];
			
			alert( swf.setVolume ); 
			
			Audio.MusicBox = {
				resetSound: function(){}
			};

			div.play = function(){};
			


			return div;
		};

	}
})();