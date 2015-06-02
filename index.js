(function(){
    // Script for NiftyPlayer 1.7, by tvst from varal.org
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
        }
    };

    function niftyplayer(name){
        this.obj = FlashHelper.getMovie(name);

        if (!FlashHelper.movieIsLoaded(this.obj)) return;

        this.play = function () {
            this.obj.TCallLabel('/','play');
        };
        this.pause = function () {
            this.obj.TCallLabel('/','pause');
        };
        this.load = function (url) {
            this.obj.SetVariable('currentSong', url);
            this.obj.TCallLabel('/','load');
        };
        return this;
    }

    /**niftyplayer end**/


	if( "[object HTMLAudioElement]" === ({}).toString.call( window.Audio && new window.Audio ) ){

        Audio.prototype.load = function(path) {
            this.src = path;
        };
        Audio.prototype.setPercent = function(per){
            this.currentTime = this.duration * per;
        }

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
            swfUrl = baseUrl + "swf/niftyplayer.swf";

		//flash承载体模拟Audio
		window.Audio = function (id){
			var div = document.createElement("div");
            id = id || "niftyPlayer";
            div.style.position = "absolute";
			div.style.left = "-20000em"; // 悄悄躲起来不让看见
			div.innerHTML = 
                '<object id="'+id+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="170" height="100" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0">'+
                '    <param name="movie" value="'+swfUrl+'?file=&amp;as=0">'+
                '    <param name="quality" value="high">'+
                '    <param name="bgcolor" value="#FFFFFF">'+
                '    <embed src="'+swfUrl+'?file=&amp;as=0" quality=high bgcolor=#FFFFFF width="170" height="100" name="'+id+'" type="application/x-shockwave-flash" swLiveConnect="true" pluginspage="http://www.macromedia.com/go/getflashplayer">'+
                '    </embed>'+
                '</object>';

            // load方法代替src设置
            div.load = function(path){
                new niftyplayer(id).load(path);
            };
            // 此方法无用, 原flash不支持
            div.setPercent = function(per){
                //TODO
            };
            // play 方法模拟
            div.play = function(){
                new niftyplayer(id).play();
            };
            // pause 方法模拟
            div.pause = function(){
                new niftyplayer(id).pause();
            }
            // 初始化空方法, 省得调用判断
            div.ontimeupdate = function(){};
            div.onload = function(){};
            div.onended = function(){};
            div.duration = 100;     //flash拿不到MP3时长, 姑且用百分比 
            
            var withEnd = false, loaded = false;    // 模拟onended事件需要判断是不是到达结束位置
            setInterval(function(){
                var obj;
                if( obj = new niftyplayer(id).obj ){
                    if( !loaded && ( new niftyplayer(id).load ) ){  // flash加载完成
                        loaded = true;
                        div.onload();
                    }
                    // 156.85是flash的内部进度条总长度, pointer._x 是游标位置, 所以currentTime 只是一个表示百分比的数值
                    div.currentTime = obj.GetVariable("pointer._x") * div.duration / 156.85; 

                    if( div.currentTime === div.duration){
                        if(!withEnd){   // 首次到达结束, 触发
                            withEnd = true;
                            div.onended();
                        }
                    }else{      // 否则 结束位标识 置false
                        withEnd = false;
                        div.ontimeupdate();
                    }
                }
            },200);
            return div;
        };

        window.Audio.flash = true;  // 标记一下, 使用时候可根据此判断 是否支持设置进度 以及获取MP3时长
	}
})();