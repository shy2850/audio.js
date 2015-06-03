(function(){
    // Script for Player 1.7, by tvst from varal.org
    // Released under the MIT License: http://www.opensource.org/licenses/mit-license.php

    var FlashHelper = {
        movieIsLoaded : function (theMovie)
        {
            if (typeof(theMovie) != "undefined") return theMovie.PercentLoaded() == 100;
            else return
            false;
      },

        getMovie : function (movieName)
        {
        if (navigator.appName.indexOf ("Microsoft") !=-1) return window[movieName];
          else return document[movieName];
        },
        callSWF: function (swf, func, args) {
            try{
                return swf[func].apply(swf, args);
            }catch(e){
                console.log(func);
            }
        }
    };

    function Player(name){
        this.obj = FlashHelper.getMovie(name);

        if (!FlashHelper.movieIsLoaded(this.obj)) return;

        var call = FlashHelper.callSWF;

        this.play = function () {
            call( this.obj, "play2", [] );
        };
        this.pause = function () {
            call( this.obj, "pause", [] );
        };
        this.load = function (url) {
            call( this.obj, "resetSound", [url,5000] );
        };
        this.setVolume = function (volume){
            call( this.obj, "setVolume", [volume] );
        };
        return this;
    }

    /**player end**/


	if( "[object HTMLAudioElement]" === ({}).toString.call( window.Audio && new window.Audio ) ){

        Audio.prototype.load = function(path) {
            this.src = path;
        };
        Audio.prototype.setPercent = function(per){
            this.currentTime = this.duration * per;
        }
        Audio.prototype.setVolume = function(volume){
            this.volume = volume;
        };

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
		var baseUrl = document.scripts[document.scripts.length-1].src.replace("index.js",""),
            swfUrl = baseUrl + "swf/NewsPlayer.swf",
            idIndex = 0;

		//flash承载体模拟Audio
		window.Audio = function (id){
			var div = document.createElement("div");
            id = id || ("NewsPlayer" + idIndex++);
            
            div.style.position = "absolute";
			div.style.left = "-20000em"; // 悄悄躲起来不让看见
			div.innerHTML = 
                '<object id="'+id+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="170" height="100" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0">'+
                '    <param name="movie" value="'+swfUrl+'?dix=Audio.'+id+'.">'+
                '    <param name="quality" value="high">'+
                '    <param name="bgcolor" value="#FFFFFF">'+
                '    <embed src="'+swfUrl+'?dix=Audio.'+id+'." quality=high bgcolor=#FFFFFF width="170" height="100" name="'+id+'" type="application/x-shockwave-flash" swLiveConnect="true" pluginspage="http://www.macromedia.com/go/getflashplayer">'+
                '    </embed>'+
                '</object>';

            // load方法代替src设置
            div.load = function(path){
                new Player(id).load(path);
            };
            // 此方法无用, 原flash不支持
            div.setPercent = function(per){
                FlashHelper.callSWF( new Player(id).obj, "setProgress", [per]);
            };
            // play 方法模拟
            div.play = function(){
                new Player(id).play();
            };
            // pause 方法模拟
            div.pause = function(){
                new Player(id).pause();
            };
            // 音量设置
            div.setVolume = function(volume){
                new Player(id).setVolume(volume);
            };
            // 初始化空方法, 省得调用判断
            div.ontimeupdate = function(){};
            div.onload = function(){};
            div.onended = function(){};

            window.Audio[id] = {
                setProgress: function(args){
                    var spl = (args+"").split(",");
                    div.currentTime = Number(spl[0]) || 0;
                    div.duration = Number(spl[1]) || 0;
                    div.ontimeupdate();
                },
                playEnd: function(){
                    div.onended();
                }
            };
            
            var withEnd = false, loaded = false;    // 模拟onended事件需要判断是不是到达结束位置
            var inter = setInterval(function(){
                var player = new Player(id), obj = player.obj;
                if( obj && player.load ){
                    if( !loaded ){  // flash加载完成
                        loaded = true;
                        div.onload();
                    }
                }
            },200);

            return div;
        };

        window.Audio.flash = true; // 标记一下, 使用时候可根据此判断 是否支持设置进度 以及获取MP3时长
	}
})();