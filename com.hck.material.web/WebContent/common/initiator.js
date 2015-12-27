(function(){
	var style = document.createElement("style");
	style.id="hideBodyCss";
	style.setAttribute("type", "text/css");
	var cssCode = "body {visibility:hidden;}";
	if(style.styleSheet){
		style.styleSheet.cssText = cssCode;
	}else{style.appendChild(
		document.createTextNode(cssCode));
	}
	document.getElementsByTagName("head")[0].appendChild(style);
})();
//body {display:none;} --> {visibility:hidden;}  //F587485 by yangwenyi 2014.8.23 
var EcpCookie = {
    addCookie: function(name,value,expiresHours){
		var cookieString=name+"="+escape(value);
		if(expiresHours>0){
			var date=new Date();
			date.setTime(date.getTime()+expiresHours*3600*1000);
			cookieString=cookieString+"; expires="+date.toGMTString();
		}
		document.cookie=cookieString;
	},
	getCookie: function(name){
		var strCookie=document.cookie;
		var arrCookie=strCookie.split("; ");
		for(var i=0;i<arrCookie.length;i++){
			var arr=arrCookie[i].split("=");
			if(arr[0]==name)return arr[1];
		}
		return null;
	},
	deleteCookie: function(name){
		var date=new Date();
		date.setTime(date.getTime()-10000);
		document.cookie=name+"=v; expires="+date.toGMTString();
	}
};
var EcpMobileBrowser = {
	versions:function(){
		var u = navigator.userAgent, app = navigator.appVersion;
		return {
			/*IE内核*/
			trident: u.indexOf('Trident') > -1, 
			/*opera内核 */
			presto: u.indexOf('Presto') > -1,
			/*苹果、谷歌内核 */
			webKit: u.indexOf('AppleWebKit') > -1,
			/*火狐内核 */ 
			gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
			/*是否为移动终端 */
			mobile: !!u.match(/AppleWebKit.*Mobile.*/),
			/*||!!u.match(/AppleWebKit/),*/ /*ios终端*/
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
			/*android终端或者uc浏览器*/
			android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
			/*是否为iPhone或者QQHD浏览器 */
			iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1,
			/*是否iPad*/
			iPad: u.indexOf('iPad') > -1, 
			/*是否web应该程序，没有头部与底部*/
			webApp: u.indexOf('Safari') == -1
		};
	}(),
	language:(navigator.browserLanguage || navigator.language).toLowerCase()
};

/**
* 远光Gris平台3.0版本 http://www.ygsoft.com/
* 
* Web平台全局初始化器第二版
* 
* 变更版本：
* wuhuating@ygsoft.com 2013-8-12  创建
* yangwenyi@ygsoft.com 2014-9-25  几乎重写：
* 支持模块加载,统一了http与file两种模式
* （不需要为了file模式单独定义脚本文件了），压缩模式、非压缩模式、文件模式都支持模块化加载。
* 
*/
SLICE = Array.prototype.slice;

// 将window复制给thisWindow
window.thisWindow = window;
//页面开始时间 by yangwenyi 2014.8.13
if( !window.timeAtStartLoadPage && window.parent === window.self ){ //只有独立窗口才建立时间基准
	window.timeAtStartLoadPage = +new Date();
}
/**
 * 调试函数，非压缩模式下会启动
 * @global
 * @example 
 * func : function() {
 *  	...
 *  	window.breakpoint();
 *  	...
 *  }
 */
window.breakpoint = function (){
	if(!$.ecp.isvrLd()){
		debugger
	}
}
/**
 * 因为这里占用了onload,用户代码中不得再使用onload，可用afterLoad代替
 * yangwenyi  2014-11-2
 */
window.onload=function(){  window.documentcompletes=true; }
//EcpVersion 在执行了extender.js后将变成$.ecp,也就是window.ecp
var EcpVersion = function(){
	// 版本号
	var VER = "1.0",
	// 公司名称
	COMP= "ygsoft",
	pp, rp, wcp,
	ss = "ScriptServlet";
		
	if (location.protocol.substr(0, 4) != "http") {
        // 本地模式时，默认JS在上级目录，即测试的HTML文件都放到demo目录中
    	pp = rp = wcp = ss = "";
    } else {
    
    	var pn = window.location.pathname;
    	// 项目路径,如/grm/component.ef/bcp/
    	if(pn && pn.indexOf("/") !==0){//兼容处理ie模态窗口下获取的pathname为grm/ecp
    		pn = "/" + pn;
    	}
    	pp = pn.substring(0,pn.lastIndexOf("/") + 1);
    	//路径中第一段，如/grm/， /YGFMISWeb/，/YGFMISWebRes/
    	wcp = pn.substring(0,pn.indexOf("/",1)+1);
    	// 平台路径
    	rp = wcp + "ecp/"; // 例如 /grm/ecp/
    	//脚本管理Servlet
    	ss = rp+ss;
    }
	
	/**
	 * 因为jQuery还没有下来，增加浏览器判断,参考了jQuery代码
	 * @ignore
	 * @author yangwenyi@ygsoft.com
	 * @date 2014.7.5
	 */
   function _myBrws(){
		//Useragent RegExp
		var rwebkit = /(webkit)[ \/]([\w.]+)/,
			ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
			rmsie = /(msie) ([\w.]+)/,
			rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
		function uaMatch( ua ) {
			ua = ua.toLowerCase();
			var m = rwebkit.exec( ua ) || ropera.exec( ua ) ||rmsie.exec( ua ) ||
				ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||[];
			if(m[1]==="mozilla" && m[0].indexOf("trident")>-1){ m[1] ="msie";} //修正IE11
			return { browser: m[1] || "", version: m[2] || "0" };
		}	
		brm =  uaMatch( navigator.userAgent );
		var brs ={};
		if ( brm.browser ) {
			brs[ brm.browser ] = true;
			brs.version = brm.version;
		}
		// Deprecated, use jQuery.browser.webkit instead
		if (  brs.webkit ) {  brs.safari = true; }
		return brs;
 	} 
   
	return {
		getVersion : function(){
			return VER;
		},
		getSystemParam : function(name){
			if(EcpTool[name]==null){
				try{
					EcpTool[name] = EcpTool.ajax("/grm/ecp/RemoteParamServlet?p0="+name, "GET").replace("\"","").replace("\"",""); 
				}catch(e){
					window.console &&　window.console.log(name+"：系统参数加载失败。");
				}
			}
			return EcpTool[name];
		},
		getCompany : function(){
			return COMP;
		},
		getRegIEVer : function(){
			// 从注册表读取浏览器版本号
			var regWsh,
				path0 = "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer",
				paths = [path0+"\\svcVersion",
				         path0+"\\Version"],
				vp = paths[0],
				bv;
			try {
				regWsh = new ActiveXObject("WScript.Shell");
				bv = regWsh.RegRead(vp);
				if (bv == null || bv == "") {
					vp = paths[1];
					bv = regWsh.RegRead(vp);
				}
				if (bv != null) {
					return bv.split(".")[0];
				}
			} catch (e) {
				if (vp == paths[1]) {
					// 已经读取过且有异常
					return null;
				}
				try {
					vp = paths[1];
					bv = regWsh.RegRead(vp);
					if (bv != null) {
						return bv.split(".")[0];
					}
				} catch(e) {}
			}
			return null;
		},
		browser: _myBrws(), //by yangwenyi 2014.7.5
		getChromeSetupUrl: function(){ //by yangwenyi 2014.7.5
			var c =  EcpCookie.getCookie("UPDATEURL"); 
			if(c){
				var  h = "/chromesetup/chromeSetup.html";
				return unescape(c) + h;
			}else{
				return null;
			}
		},
		/**
		 * 写控制台日志
		 * @examp
		 *   EcpVersion._consoleLog("出错了：{0},{1}",5,10);
		 *   在应用中也可以这样使用：
		 *   $.ecp._consoleLog("出错了：{0},{1}",5,10);
		 */
		_consoleLog: function(msg){ 
			if(window.console){
				for(var args = arguments, sz=args.length , i=1; i<sz; i++){
					msg = msg.replace(new RegExp("\\{\\s*"+(i-1)+"\\s*\\}","g"), args[i]);
				}
				if(window.console.log){
					window.console.log(msg);
				}
			}
		},
		
	    extend : function(){
	    	$.extend.apply(this, arguments);
	    },
	    KEY_SCRIPT_CUK: "performance_scriptCompact",
	    DEFAULT_CONTENTTYPE: "application/x-www-form-urlencoded; charset=UTF-8",
		rootPath: rp,		//为了兼容，暂不要移除
		ecpRootPath: rp, 	//取名ecpRootPath更名副其实,yangwenyi 2014-9-26增加
		projectPath: pp, 	//项目路径，即url中从ip:port后第一个/到最后一个/之间的内容
	    webCtxPath: wcp,   	//web上下文路径，即url中从ip:port后第一个/到第二个/之间的内容,yangwenyi 2014-9-26增加
	    scriptServlet: ss 	//脚本加载Servlet的路径,yangwenyi 2014-9-26增加
	};
}();

/**
* 脚本动态导入服务
* 提供了单个或者批量、同步或者异步的脚本、样式表导入服务
* 基于减少http请求次数考虑（需要加载了这个服务，才能通过这个服务去批量加载其他服务的脚本文件），此服务直接定义在初始化器之中
*/
//在执行了extender.js后，EcpTool的方法将进入$.ecp
var EcpTool = EcpInitUtils = /**@lends $.ecp */{
		/**
         * 特征对象
         * @field
         */
        supports: {
           //脚本标签是否支持异步
    	   SCRIPT_ASYNC: undefined
    	},
    	/**
    	 * 判断是否存在$.ecp.thisWindow
    	 * @return {Boolean}
    	 */
    	hasThisWindow: function (){
         	return window.$ && window.$.ecp && window.$.ecp.thisWindow;
        },
        /**
         * 获得当前（全局)命名空间
         * @return {String},如果没有$.ecp.thisWindow则返回"null"，否则返回$.ecp.thisWindow.nameSpace
         */
        getCurrentNS: function(){
        	return  this.hasThisWindow() ? $.ecp.thisWindow.nameSpace : "null";
        },
        
	/**
	 * 加载器选择
	 * <p>
	 * 判断是使用自动压缩合并的CompressorServlet还是LAB进行加载。<br>
	 * 判断规则按优先级从高到低为：<br>
	 * 1.如果性能管理器已经转载，使用性能管理器中的配置<br>
	 * 2.如果是本地模式，使用LAB进行加载<br>
	 * 3.如果是远程模式，并且设置为debug模式，使用LAB进行加载<br>
	 * 4.使用CompressorServlet进行加载<br>
	 * </p>
	 */
	useServerLoader : function(){
		// 默认是否使用服务端加载器
		var usl = true, 
		// 判断是否http协议
		   sc,
		   http = this.isHttp();
		if(http){
			sc = EcpCookie.getCookie(EcpVersion.KEY_SCRIPT_CUK);
			if(sc=="2"){return true;}
		}
		
		if(sc === "0"){ usl = false; } 
		else if(sc === "1"){ usl = true; } 
		//本地模式,或者url中指定了dev=true, 或者url指定了debug=true,或者cookie中指定了performance_debug=1
		else{
			 var dev = this.getArg("debug");
			 if(!http || dev === "true" || this.getAjaxEnv().debug==true ) {
				usl = false;
			}else if(dev === "false"){ usl = true; }//为程序员给与干预机会
		}
			
        return usl; 
	},
	//useServerLoader的简称，by ywy 2014-11-2
	isvrLd: function(){ 
		return this.useServerLoader();
	},
	
	/**
	 * 获取body元素
	 */
	getBody : function(){
		return document.body || document.getElementsByTagName("body")[0];
	},
	/**
	 * 获取head元素
	 */
	getHead : function(){
		return document.head || document.getElementsByTagName("head")[0];
	},
	/**
	 * @ignore
	 */   	
	jsLoadingCounter : 0,
	/**
	 * 资源类型判定
	 */
	isTypeOfRes: function(res,type){
		if(res ==null || res==""){
		   	return null;
		}
		var l = res.length,t="."+type, lt = t.length;
	   	return l>lt && res.substring(l - lt)===t;
	 },
	/**
	 * 是否js资源
	 */
	isJs: function(res){
		return this.isTypeOfRes(res,"js");
     },
     /**
      * 是否css资源
      */
    isCss: function(res){
    	 return this.isTypeOfRes(res,"css");
     },
    /**
     * 是否页面文件资源
     */
    isHtml: function(res){
    	 return this.isTypeOfRes(res,"html") || this.isTypeOfRes(res,"htm");
    },
  /**
   * 格式化url，增加web上下文路径
   * @example
   *   $.ecp.standardURL("/p/","/ecp/a.js"); //假设webCtxpath=/grm/, 返回 /grm/ecp/a.js
   *   $.ecp.standardURL("/p/","/grm/ecp/a.js"); //返回 /grm/ecp/a.js
   *   $.ecp.standardURL("/p/","a.js"); //返回 /p/a.js
   *   $.ecp.standardURL("/p","a.js"); //返回 /p/a.js
   *   
   * @param {String} pathLeading 路径前缀
   * @param {String} _url		 路径
   * @return 标准化后的路径
   * @author yangwenyi@ygsoft.com
   * @date 2015-2-27
   */
  standardURL: function (pathLeading, _url){
	   	 function startsWith(src, bstr){
	   		 return  src && bstr && src.indexOf(bstr) ===0;
	     }
	   	var r ="";
	   	if(startsWith(_url, "http:") || startsWith(_url, "https:") || !(this.isJs(_url) || this.isCss(_url))){
	   		r = _url;
	   	}else if(_url.indexOf('/') === 0){
    		if(startsWith(_url, "/grm/") || startsWith(_url, "/YGFMISWeb/") || startsWith(_url, "/YGFMISWebRes/")){
	   			r = _url;
	   		}else{
	   			r=  EcpVersion.webCtxPath + _url.substring(1);
	   		}
	    }else{
	       	 r= pathLeading;
	       	 if(r && r.substring(r.length - 1) !== "/"){
	       		r += "/"; 
	       	 }
	       	 r +=  _url;
	    }
	    return r;
     },
    /**
     * 模块管理对象
     * @author yangwenyi@ygsoft.com
     * @date 2015-2-26
     */
	LdRes: {	
	      mods: [],  //已经加载模块清单库,js文件库。模块用小写，而js保持大小写不变并且是全路径
	      alias: {   //别名库
    	 	"jquery": "ecp.jquery",  //jquery及扩展
    	 	"core": "ecp.core",		//ecp模型与服务
    	 	"baseui": "ecp.baseui",	//ecp基本控件，如输入、按钮、菜单等
    	 	"chart": "ecp.chart",	//plot及fusion图标控件
    	 	"verbose": "ecp.verbose", //ecp杂项，如
    	 	"bizui": "ecp.bizui",	//ecp业务控件，如单位、组织选择器，分类体系、对象分类选择器
		    "jgrid": "ecp.jgrid",	//jq表格、树
		    "qgrid": "ecp.qgrid",   //qzz表格、树
		    
    	 	"grid": "qgrid,jgrid", //包含两大表格体系qgrid,jgrid
    	 	"ecp.basic": "jquery,core,baseui,grid", //包括ecp的5个模块
    	 	"ecp.advance": "ecp.basic,ecp.verbose,ecp.bizui",    //包括ecp的7个模块
    	 	"ecp.all": "ecp.advance,ecp.chart"    //包括ecp的8个模块
     	  },
     	  styles: (function(){
     		 var h1 = "ecpjs/themes/",
     		 	 h2 = h1 + "com.ygsoft.ecp.skin.",
     		 	 h3 = h1 +"yui/";
		     return {
		         "ecp.skin.default": [	//ecp缺省皮肤集合,从com.ygsoft.ecp.web.skin.default.style移到这里是为了减少一次请求
		     	      h2+"defaults.css",
		     	      h2+"icon.css",
		     	      h2+"main.css",
		     	      h2+"gridStyle.css",
		     	      h3+"cssgrids.css",
		     	      h3+"layout.css",
		     	      h2+"ygtip.css"                 
		 	      ]
		 	  };
     	  })(),
     	   /**
     	    * 根据模块或者css文件查找css文件清单
     	    * @param {String[]} modsCss 模块或者css文件数组
     	    * @return {String[]} css文件清单
     	    */
     	  findStyleByMods: function(modsCss){
     	      var mod, s = this.styles,css=[];
     		  for(var sz = modsCss.length,i=0; i<sz; i++){
     			 mod = modsCss[i];
     			 if(s[ mod ]) {
     				css = css.concat( s[ mod ] );
     			 }else{
     				css.push(mod);
     			 }
     		  }
     		  return css;
     	   },
     	   
     	  /**
     	   * 根据别名an查找模块
     	   * @param {string} an 模块别名
     	   * @return {string[]} 模块清单数组
     	   */
     	  findJsModsByAlias: function(an){
     		   var als = this.alias;
     		  for(var k in als){
     			  if(k === an){
     				 return  als[k].split(",");
     			  }
      		  }
     		  return null;
     	  },
     	  /**
     	   * 增加模块到已加载库中
     	   * @private
     	   * @param {String|String[]} mods 模块名或模块名数组
     	   */
	      _addMods: function(mods){
	    	  this.mods=this.mods.concat(mods);	
	      },
	      /**
	       * 判断模块或者js是否已经加载
	       * @param {String} modjs 模块名或js文件名
	       */
	      isExist: function(modjs){
	    	 var  res = this.mods;
	    	 for(var i=0; i<res.length; i++){
	    	   	 if( modjs==res[i]) {return true;}
	    	 }
	    	 return false;
	      },
	     /**
	      * 增加资源到已加载清单库中
	      * @param {String|String[]} res 资源或资源数组，资源可以是模块也可以是js文件
	      * @param {String} rootPath 路径前缀
	      * @param {Boolean} repeatLoad 是否需要重复加载
	      * @return {Stringp[]} 分析后需要加载的资源清单数组
	      */	      
	      add: function(res,pathLeading,repeatLoad){ //res是模块或者js文件,返回标准的模块或者文件混合数组
	    	   
	    	 if(typeof res === "string"){
	    	    res = res.replace(/\|/g,",").split(",");	 
	    	 }
	    	 var  mods=[],repeatMods=[], me=this;
	    	 (function(res){
	    		 var isjs,exists, alias;
	    		 for(var i=0; i<res.length; i++){
		    		 isjs = EcpTool.isJs(res[i]);
		    		 if(isjs){
		    			 res[i] = EcpTool.standardURL(pathLeading,res[i]);
		    			 exists =  me.isExist(res[i]);
		    		}else{
		    			 res[i] = res[i].toLowerCase();
		    			 alias = me.findJsModsByAlias( res[i] );
		    			 if(alias){
		    			    arguments.callee.call(me,alias);	 
		    			 }else{
		    				 exists =  me.isExist(res[i]); 
		    			 }
		    		}
		    	    if( exists === false){ //如果不存在
		    	        mods.push(res[i]); 
		    	    }else{
		    	      if(repeatLoad){ //js文件（如控制器等）需要重复加载，因为其中的事件需要重复执行。
		    	    	  repeatMods.push(res[i]);
		    	      }
		    	    }
		    	    
		    	 }
	    	 })(res);
	    	 me._addMods(mods);
	    	 return  mods.concat(repeatMods);
		    	
	      }
	},	//end LdRes
	/**
	 * 执行js代码
	 * @param {String} jsCode js代码或者js文件路径
	 */
	evalJs: function(jsCode){
	    //if(!jsCode) {return;}
	    if(jsCode){
	    	try{
     			jsCode = this.ajax(jsCode, "GET"); 
    		}catch(e){
    			throw new Error("获取脚本文件失败："+url);
    		}
	    	
	    }
		try {
            if(window.execScript){
                window.execScript(jsCode);
            }else{
                window.eval(jsCode);
            }
		}catch(e){
			var msg = "执行脚本文件失败：{0}, 原因：{1}";
			EcpVersion._consoleLog(msg,jsCode,e.message);
			//throw new Error(msg);
		}
	},
	/**
	 * 根据模块查找js清单
	 * @param {string[]} mods 模块和/或js文件数组
	 */
	findJsByMods: function(mods){
		function allIsJs(mods){
			for(var sz=mods.length,i=0;i<sz;i++){
				if(!EcpTool.isJs(mods[i])){ return false;}
			}
			return true;
		}
		
		var r;
		if(EcpTool.isHttp()){//服务端非压缩加载
			if(allIsJs(mods)){ //如果全部是js文件，无需到服务器绕一圈
			  return mods;
			}
			mods = mods.join(",");
			r = EcpTool.ajax(EcpVersion.scriptServlet, "GET", {"modules": mods,"action": "getFileList"}); 
			r = eval(r); //逗号分割的js文件列表数组
	    }else{ //本地文件加载
	    	r = EcpVersion.localMods.findByMods(mods);
	    }
		return r;
	},
	getMainMods: function(deftMods){ //或者script上的mods属性或者url的mods参数
		 var mods = this.getArg("mods"); 
		 if(!mods){  mods = document.getElementsByTagName("script")[0].getAttribute("mods"); } 
		 //统一3种加载方式为模块加载
		 return mods ? mods : deftMods; 
	},
	
    /**
    * 同步或异步加载脚本，既可以加载js文件组合，也可以加载模块。
    * 
    * @param {String} url 加载的js文件路径或者模块或者二者的组合，如果是array数组，会将所有要加载的脚本文件内联为一个http请求一次返回
    * @param {Function} callback 加载完成后执行的回调函数。同步还是异步加载，取决于是否传入回调函数，没有传入则代表是同步加载
    * @param {Boolean} isEcpPlatform 是否是Ecp平台，true表示相当路径取webCtxPath/ecp/,否则取项目路径
    * @param {Boolean} repeatLoad 是否需要重复加载，对于控制器这是必须的，一般在控制器中jsImport的脚本也将重复加载解析，因为其中的事件是需要重复执行的。 add by yangwenyi. 2014-9-27
    *	因此如果需要在控制器中加载模块，请指明不需要重复加载，即 形如 $.ecp.jsImport(mods,null,isEcpPlatform,false);
    * <p>
    * 对于无需加载后立即执行的脚本都应当采用此方式加载，最普遍的是只包含“函数定义”类型的JS文件<br>
    * 对于需要加载后立即执行的脚本，譬如脚本中定义了资源，要在外部使用到，典型的如jQuery中的“$”，需要使用回调函数<br>
    * 在回调函数中可以安全地使用导入脚本中的资源，如果无法确定资源使用访问范围，则脚本必须使用同步导入。同步导入可能会阻塞浏览器渲染过程，降低用户体验<br>
    * 如果url中不是绝对路径（没有以“/”或者“\”开头），则加载相对于网站根目录路径下的文件<br>
    * 屏蔽IE与FF对<script>标签同步/异步加载的差异<br>
    * 记录加载标记，保证在页面已经加载的js文件不会被重复加载<br>
    * 与服务端配合，实现脚本加载时自动压缩，避免注释、空格等非执行因素导致的额外带宽开销<br>
    * 如果url是数组，并且是异步加载，需要在异步加载的同时，保障脚本的执行先后顺序<br>
    * </p>
    */
    jsImport: function (url, callback, isEcpPlatform,repeatLoad) {
    	var isJsImport = true;
    	if(this.isArray(url)){//兼容get请求参数过长，导致加载js失败问题			
			if(url.length>10){
				this.jsImport(url.slice(0,10), undefined, isEcpPlatform,repeatLoad);
				url= url.slice(10);
			}else{
				isJsImport = false;
			}
		}else if(url && url.indexOf(".js") == url.length-3){//以js结尾的js文件。
			isJsImport =false;
		}
	    var _callback = function () {
	    	if(typeof callback =="function"){
	    		callback();
	    	}else if(callback){
	    		window.console && window.console.warn && window.console.warn("jsImport的回调函数不合法（应为函数类型）, callback："+callback+",url:"+url);
	    	}
		    this.jsLoadingCounter--;
	     };
	     this.jsLoadingCounter++;
		if(typeof url === "undefined" || (this.isArray(url) && url.length === 0)){
        	_callback();
        	return;
        }
  
        //分析isEcpPlatform和repeatLoad
       var ept =  typeof isEcpPlatform;
       if(ept !=="boolean"){
    	  if(ept ==="undefined"){ isEcpPlatform=false; repeatLoad = true; }
    	  else{ //数值型，携带了isEcpPlatform,repeatLoad两种信息
    		var isecp = isEcpPlatform;
    		isEcpPlatform = repeatLoad = false;
    		if(isecp === 2 || isecp === 3){
    			isEcpPlatform = true; 
    		}
    		if(isecp === 1 || isecp === 3){
    			repeatLoad = true;
    		}
    	  }
       }else{
    	 if(typeof repeatLoad === "undefined"){ repeatLoad = false;}   
       }
       var rp = isEcpPlatform ? EcpVersion.ecpRootPath : EcpVersion.projectPath,
          modsJs = this.LdRes.add(url,rp,repeatLoad); //处理已加载资源，返回待处理资源（模块或js)
       
        // 加载js
       function _loadModsJs(modsJs,cb){// 服务端脚本压缩加载：modsJs既可以是文件数组，也可以是模块列表串
    	   if (this.isvrLd()  && isJsImport) {
    		   ScriptLoader.load(modsJs, cb);  //// 服务端脚本压缩加载
    	   } else {//非压缩加载
    		  var jsOfMods = this.findJsByMods(modsJs);  //将模块转化为js清单
	    	   if(callback ){ // 回调函数时请求方式（异步）
	    		   //将放在head中，调试方便（控制器以及控制器的头部jsImport资源走此路径）
	    		   this.script(jsOfMods, callback ? cb : null); 
	    	   } else { // 同步请求js
	    		   for (var sz=jsOfMods.length,i =0; i<sz; i++){ 
	    			    //下载并执行js文件，调试不方便（控制器头以下jsImport资源走此路径）
	    			   //这种js需要逐步调试才能进入（浏览器命名那个生成动态的js片段，名字形式为： VM36546之类）
	    			   EcpTool.evalJs(jsOfMods[i]); 
	    		   }  
	    		   this.jsLoadingCounter--;
	    	   }
    	  }
       }
       var hasTW = this.hasThisWindow();
       if(hasTW){ 
        	var curNS = $.ecp.thisWindow.nameSpace; //暂存当前命名空间
//        	var curRsNS = $.ecp.thisWindow.rsNameSpace;
        }
       _loadModsJs.call(this, modsJs, _callback); 
       if(hasTW){ 
          $.ecp.thisWindow.nameSpace = curNS;  //恢复当前命名空间
//          $.ecp.thisWindow.rsNameSpace = curRsNS;
        }
    },
    /**
    * 加载CSS样式表,不处理已加载问题
    * <p>
    * 考虑到平台的实际情况，对于样式表，暂不提供压缩方式。
    * 从extender.js移到这里，是为了共用代码。
    * </p>
    * @param {String|String[]} url 加载的css文件路径或者模块
    * @param {Boolean} isEcpPlatform 是否是Ecp平台路径，参见jsImport
    * @author yangwenyi@ygsoft.com
    * @date 2014.9.27
    */
    cssImport: function (url, isEcpPlatform) {
     	//皮肤样式处理 
       if(typeof isEcpPlatform === "undefined"){isEcpPlatform =true;}
    	if(!(url instanceof Array)){
    		url = (url+"").split(",");
    	}
    	var rp = isEcpPlatform ? EcpVersion.ecpRootPath : EcpVersion.projectPath;
    		 
    	url = this.LdRes.findStyleByMods(url);
    	/*if(url instanceof String){
			url = url.toString();
		}*/
    	for(var sz = url.length, i=0; i<sz; i++){
    		var p = url[i];
			//p = p.indexOf('/') === 0 ? p : rp + p;
    		p = this.standardURL(rp,p);
    		p = p+"";
    		window.console && window.console.log && window.console.log("创建style: "+p);
	        this.createStyleLink( p );
    	}
    	 
    },
    /**
     * 清除服务端压缩脚本
     * @param {Boolean} dispDialog 是否显示对话框，在系统信息面板中操作清除按钮才弹出对话框
     */
    removeResources: function(dispDialog){
		var cbFn = function(xhr){
			var msg = "成功清除服务端压缩脚本。";
			if(xhr.readyState==4 && xhr.status==200){
				EcpVersion._consoleLog(msg);
				if(dispDialog){
					$.ecp.dialog(msg,{},xhr.responseText);
				}
			}
		}  
		this.ajax(EcpVersion.scriptServlet,"POST",{ "action": "remove"},cbFn);
    },

    /**
     * 判断是否移动浏览器
     * @returns {Boolean}
     */
    isMobile: function(){
    	return EcpMobileBrowser.versions.mobile || this.getBody().getAttribute("mobile") === "true";
    },
    /**
     * 是否为 http 请求
     * @returns {Boolean}
     */
    isHttp: function(){
		return EcpVersion.rootPath !== "";
	},
	/**
	 * 是否为 数组
	 * @param {Object} p 需要判断的对象
	 * @returns {Boolean}
	 */
	isArray: function(p){
		return Object.prototype.toString.call(p) === "[object Array]";
	},
	/**
     * 获取字符串的哈希值
     * @param {String} 需求获取哈希的字符串
     * @returns {String} 对应字符串的哈希值
     */
	getHashCode: function (str) {
         var h = 1315423911, i, ch;
         for (i = str.length - 1; i >= 0; i--) {
             ch = str.charCodeAt(i);
             h ^= ((h << 5) + ch + (h >> 2));
         }
         return (h & 0x7FFFFFFF);
     },
     /**
      * 创建tag类型元素
      * @param {String } tag dom元素类型
      * @param {Object } attrs dom元素的属性
      * @return {DomEL} dom元素对象
      * @author yangwenyi@ygsoft.com 
      * @date 2014-9-25
      */
     createEl: function(tag,attrs){
    	 var el = document.createElement(tag);
    	 for(var k in attrs){  el[k] = attrs[k]; }
    	 return el;
     },
     /**
      * 创建脚本script元素 
      * @param {Boolean} [append] 是否将该元素添加到DOM树的header中
      * @param {Boolean} [async] 是否添加async属性,如果为undefined不添加
      * @return {DomEL} script元素
      * @author yangwenyi@ygsoft.com 
      * @date 2014-9-25
      */
     createScript: function(append, async){
    	 var attrs={type: "text/javascript", charset: "utf-8"};
    	 if(async === false){
    		 attrs.async = false;
    	 }
    	 var el = this.createEl("script",attrs);
    	 if(append){
	    	 var head = this.getHead(); 
	    	 head.appendChild(el);
    	 }
    	 return el;
     },
    /**
    * 创建样式link元素并添加到DOM树的header中
    * @param {String} href  样式文件url
    * @return {DomEL} link元素
    * @author yangwenyi@ygsoft.com 
    * @date 2014-9-25
    */     
     createStyleLink: function(href){
    	 var h = this.getHead(),
    	 	el = this.createEl("link",
    	 		{rel: "stylesheet",type: "text/css",rel: "stylesheet",href: href});
    	 h.appendChild(el);
    	 return el;
     },
     
     /**
      * 创建XHR对象
      * @param {String} url 请求路径
      * @param {String} m  请求方式method ,GET/POST
      * @param {Boolean} asyn 异步
      * @param {Object|Object[]} [h] 请求头header,支持两种格式(1){key1:val1,key2:val2,...},(2)[{name:key1,data:val1},{name:key2,data:val2}]
      * @return {XMLHttpRequest}
      * @author yangwenyi@ygsoft.com 
      * @date 2014-9-25
      */
     createXhr: function(url,m,asyn,h){ 
 		var xhr;
 		try{ xhr = new ActiveXObject('MSXML2.XMLHTTP');}catch(e){ xhr = new XMLHttpRequest();}
 	 	if(arguments.length > 0){
 	 		xhr.open(m, url, asyn);  
 	 		if(h){
 	 		  if(h instanceof Array){
  	 			for(var sz=h.length,i=0; i < sz; i++){  xhr.setRequestHeader( h[i].name,  h[i].data); }
  	 		  }else{
  	 			 for(var k in h){  xhr.setRequestHeader(k, h[k]); }
  	 		  }
 	 		}
 	 	}
 	 	return xhr;
 	},
     /**
      * 发起ajax请求
      * @param {String} url 请求的地址
      * @param {String} m  请求方式：POST|GET
      * @param {Object} h 携带的参数头header,[{name:"x",data:"y"},...],或者{x: "y",...}
      * @param {Function} [cb] 回调函数
      * @returns {String}
      * @author yangwenyi@ygsoft.com 
      * @date 2014-9-25
      */
     ajax: function(url, m, h,cb){
 		var xhr = this.createXhr(url,m,false,h);
 		if(cb){
 			xhr.onreadystatechange= function(){
 			  	cb(xhr);
 			};
 		}
 		xhr.send(null);
 		var rt = xhr.responseText;
 		xhr = null;
 		return rt;
     },
     /**
      * 获取URL参数
      * @param {String} n 参数名
      * @return {string} url中n 参数的值
      *@author yangwenyi@ygsoft.com 
      * @date 2014-9-25
      */
     getArg: function(n){
    	 var qs = window.location.search;
    	 qs = qs.replace(/^\?/,"");
    	 qs = qs.split("&");
    	 for(var sz=qs.length,i=0; i<sz; i++){
    	   var aa = qs[i].split("=");	 
    	   if(aa[0] === n){
    		 return aa[1];   
    	   }
    	 }
     },
     
     /**
      * @ignore
      */
     ajaxEnv: {},
     /**
      * 获取ajax Envocation
      */
     getAjaxEnv: function(){
        var pd=false,ad=false;
   	   if(EcpCookie.getCookie("performance_debug")=="1"){
   		  pd = true;  
   	   }
   	   if( this.isHttp() && this.ajaxEnv.debug === null ){
   	  	  var qs = location.search;
   	   		 if( (qs && qs.indexOf("debug")>-1) ){
   	   			 ad = true;
   	   		  }
   	   }
   	   this.ajaxEnv.debug = ad || pd ;  
   	   return this.ajaxEnv;
   	},
   	/**
   	 * 请求脚本
   	 * @param {String} url 脚本路径
   	 * @param {Function} cb  回调方法callback
   	 */
     script: function(url, cb){
    	 if(typeof url === "undefined" || url === null){// 空值检测
    		 cb && cb();
    		 return;
    	 }
    	 if(typeof url === "string"){// 归纳法：统一成数组进行处理
        	 url = [url];
         }
    	 if(!url.length){// 空数组则返回
    		 cb && cb();
    		 return;
    	 }
    	 if( this.supports.SCRIPT_ASYNC === undefined){
    		 this.supports.SCRIPT_ASYNC = typeof document.createElement("script").async === "undefined";
    	 }
    	 var loadFn = (this.supports.SCRIPT_ASYNC ? this._doStackLoder : this._doSyncLoader)
    	 loadFn.apply(this, arguments);
         
     },
     /**
      * 具有async属性的script标签的加载方式
      * @ignore
      */
     _doSyncLoader: function(url, cb){
    	 var hd = this.getHead();
         while(url.length){
        	 var s = this.createScript(false,false);
         	 this._onSyncLoaded(s, url.length === 1, cb);
        	 s.src = url.shift();// 数组出队
        	 hd.insertBefore(s, hd.firstChild); //并不马上下载
         }
     },
     /**
      * 注册事件，该方法独立出来的原因是为了script参数闭包下来
      * @param {ScriptTag} script 脚本标签 
      * @param {Bool} ef 结束标记endFlag 
      * @param {Function} cb 回调函数
      * @ignore
      */
     _onSyncLoaded: function(script, ef, cb){
    	 script.onload = script.onerror = function(){ 
    		 script.onload = script.onerror = null;
    		 ef && cb && cb();
         };
     },
     /**
      * 不具有async属性的script标签的加载方式
      * @ignore
      */
     _doStackLoder: function(url, cb){
	       var args = arguments, self = args.callee, hd = this.getHead(), me = this;
	       var script = this.createScript(false);
	       script.onload = script.onerror = script.onreadystatechange = function(){
	    	   var rdst = script.readyState;
	           if ( rdst && rdst != "loaded" && rdst != "complete"){return;}
	           script.onload = script.onerror = script.onreadystatechange = null;// 置空，避免ie8以下（包括ie8）内存泄露
	           if(url.length){// 如果队列中还有脚本需要加载，继续调用
	          	 self.apply(me, args);
	           } else {// 如果队列中已不存在脚本，则调用回调函数
	          	 cb && cb();
	           }
	       };
	       script.src = url.shift();// 数组出队
	       hd.insertBefore(script, hd.firstChild);// 将script标签加入到head中
     }
}
////end EcpTool 

/**
 * 脚本压缩导入器 
 * @class ScriptLoader 
 */
var ScriptLoader = function()/**@lends ScriptLoader */{
	// 脚本结束符号、脚本分隔符
	var END_TAG = "@END@", SPLIT_TAG = "@GRACE@",
	
	// 请求压缩脚本的地址
	  compressServlet = EcpVersion.scriptServlet,
	  head = EcpTool.getHead() || document.documentElement;
	
	/**
	 *加载脚本 
	 */
	function _loadScript(xhr, param) {
		var stxt = xhr.responseText,slen = stxt.length;
		if(slen === param.lastLength){return;}
		// 取出还未执行的脚本部分
		var pack = stxt.substring(param.lastLength, slen);
		param.lastLength = slen;
		// 分割脚本并加入队列
		var  qlen1 ,piece, pieces = pack.split(SPLIT_TAG), sque = param.scriptQueue;
		EcpVersion._consoleLog("脚本块数：{0}", pieces.length);
		for(var sz=pieces.length,i=0; i<sz; i++){
			piece = pieces[i];
			if(sque.length === 0){// 如果队列为空，则直接入队
				sque.push( piece );
			} else {
				qlen1 = sque.length - 1;
				stxt = sque[qlen1];
				/*判断队列中最后一个脚本是否已经完整，不完整则将当前脚本补充进去。
				  否则当前脚本单独放入一个数组元素中
				*/
				if(stxt.indexOf(END_TAG) === -1){
					sque[qlen1] = stxt + piece;
				} else {
					sque.push( piece ); 
				}
			}
		}
		executeScript(param);
	}
	
	/**
	 * 执行脚本
	 */
	function executeScript(param){
		var stxt,etlen =END_TAG.length, sque = param.scriptQueue;
		while(sque.length > 0){
			stxt = sque[0];
			// 如果当前脚本不完整，则退出解析程序
			if(stxt.indexOf(END_TAG) === -1){ break; }
			// 将结束符号END_TAG删除
			stxt = stxt.substring(0, stxt.length - etlen );
			var script = EcpTool.createScript(false); //document.createElement("script");
			if(stxt && stxt.indexOf("UIFrame=ecp.ui.layout.Frame") !=-1){
				stxt = stxt.replace(/[\n]/,'');
				stxt = stxt.replace(/<[sS][cC][rR][iI][pP][tT][^<>]*>[^<>]*<\/[sS][cC][rR][iI][pP][tT]>/g,'');
			}
			script.text = stxt;
			try{
				head.insertBefore(script, head.firstChild);
			}catch(ex){
			   	EcpTool._consoleLog("{0},{1}",ex,stxt);
			}
			head.removeChild(script);
			// 出队
			sque.shift();
		}
	}
	
   /**
	* 导入脚本
	* @param {String} url 导入的脚本地址
	* @param {Function} callback 脚本加载完后的回调函数
	*/
	return { 
		load : function(url, callback){  //已改造成模块和js可以混合加载
			function  _fromStartTime(){
				var win = window.parent === window.self ? window : window.parent;
				return (+new Date() - win.timeAtStartLoadPage);
			}

			var param = {
					lastLength : 0,// 已经执行到的js内容位置，用于MXHR
					callback : callback,
					scriptQueue : [] // 需要执行的js内容队列
			};
			EcpVersion._consoleLog("{0} ms 脚本压缩导入器-loading-[url]: {1}", _fromStartTime(), url);
			// 判断是否数组
			if (!EcpTool.isArray(url)) {  url = url.split(","); } 
			//每个模块或者文件生成一个hashCode
			var reqUrl = this.createResrcReqUrl(url,"js");
			// MXHR处理
			// 将需要提交的参数列表格式化成hashcode，以减少长度，并且作为某种脚本组合的唯一标识
			var myheader = {fileNames: url.join(","),action: "compress", "Content-Type": EcpVersion.DEFAULT_CONTENTTYPE},
			    scriptTimer, //脚本下载检测定时器
				xhr = EcpTool.createXhr(reqUrl,"get",false, myheader);
			xhr.onreadystatechange = function(){
				if(xhr.readyState === 3 && !scriptTimer){
					// 3为开始下载服务端的文件流，定时检查是否有新的脚本被下载
					scriptTimer = window.setInterval(function(){ _loadScript(xhr, param);},15);
				} else if (xhr.readyState === 4){
					xhr.onreadystatechange = function(){};// 修正ie下内存泄露的问题  modify by wuhuating 20130514
                    if (xhr.status == 404) {
                        throw new Error("新平台服务启动失败，请查看服务端日志！");
                    } else {
					    // 4为下载完成，清除定时器
					    clearInterval(scriptTimer);
					    // 执行最后一次加载脚本
					    _loadScript(xhr, param);
					    param.callback && param.callback();
					    EcpVersion._consoleLog("{0} ms 脚本压缩导入器-loaded-[url]: {1} [nameSpace]:{2}",_fromStartTime(),url,EcpTool.getCurrentNS());
                     }
				}
			}
			xhr.send(null);
		},
		/**
		 * 根据模块与文件类型创建请求串
		 * @param {string|String[]} mods 模块清单
		 * @param {string} ftype 文件类型，可选"js"或者"css"
		 */
		createResrcReqUrl: function (mods,ftype){
			var hcs=[],hc;
			if(typeof mods === "string") { mods = mods.split(","); }
			for(var sz=mods.length,i=0; i<sz;i++){
				hc = EcpTool.getHashCode(mods[i]);
				hcs.push(hc);
			}
			hc = hcs.join(","); //以逗号分开的hashcode串
 			var reqUrl = compressServlet+"?"+"hc="+hc+"&fileType="+ftype;
			return reqUrl;
		}
	}
}();
(function(EcpV){
function ecpStartup() {
	// IE6-HACK IE6的BUG默认未开启背景图片缓存，导致图片文件会反复请求产生大量HTTP请求
	try { document.execCommand('BackgroundImageCache', false, true); } catch(e) {};
	// IE6-HACK END;
	//处理标题参数
	var p = "_winTitle";
	var tl = EcpTool.getArg(p) || EcpCookie.getCookie(p);
	if (tl && tl!=="undefined" && tl !=="null") {
		tl = decodeURI(tl);
		document.title = tl;
	}
	// 防止重复加载
	if (window.ecp) { return; }
	// 创建ecp_baseconfig辅助div
	function _createBaseconfigEl(){
		var el = document.createElement("div");
		el.style.cssText = "display:none;";
		el.id="ecp_baseconfig";
		EcpTool.getBody().appendChild(el);
	}
	function _createWinFactory(){
		// 旧平台对象引用缓存到新平台，解决旧平台打开新平台窗口，然后再从新平台打开旧平台窗口的问题
		var p = opener || parent;
		if(p){
			try {//modify fuxiaopan 2013.9.24 避免不同域造成错误
				window.WindowFactory = p.WindowFactory ? p.WindowFactory : window.WindowFactory;
			} catch (e) {}
		}
	}
	 function _loadMods(mods){
		  function __loadCbFn(){
   		  function __startPage(ald){
   			 if( $ && $.ecp && $.ecp.startup){ //如果加载了ecp.core模块
   				 $.ecp.startup();
   			 }else{ //否则显示页面
   				  document.body.style.visibility = "visible";
   				  ald && ald();
   			 }
   		  }
   		    var ald = window.afterLoad; //类似onLoad，避免被覆盖
	    		if(window.documentcompletes===true){
	    			 __startPage(ald);
	    		}else{
	    			window.onload=function(){ 
	    				 __startPage(ald);
	    			}
	    		}
		 }
    	EcpTool.jsImport(mods, __loadCbFn , true,false);
    }
	
	_createWinFactory();	//兼顾YG老平台
	_createBaseconfigEl();	// 创建ecp_baseconfig辅助div
	if (EcpTool.isHttp()) {
		if(EcpTool.getArg("delRes")==="true"){ EcpTool.removeResources(); } //如果需要删除压缩文件
		if(EcpTool.setDevModeByServer){EcpTool.setDevModeByServer();} //由服务器动态生成的回调函数
	}else{ //本地加载,需要先下载分析所有模块
		var lijs = "ecpjs/com.ygsoft.ecp.initiator.local.js"; //本地模式下的额外初始化器
        	lijs = EcpV.ecpRootPath +  lijs;
        	EcpTool.evalJs( lijs ); 
    }
 
    var mods="com.ygsoft.ecp.web.All"; //缺省的模块别称，包含ecp.all以及项目的标配
	//获取页面依赖的模块
 	mods = EcpTool.getMainMods(mods); 
 	
    _loadMods(mods);
    
}

/**
 * 启动前置脚本 
 * @return {Boolean} 如果返回false表示不要继续启动了，否则将继续启动。
 * @author yangwenyi@ygsoft.com
 * @date 2014.7.5
 */
function beforeEcpStartup(){
	 function _goForIE6_9(){
		//评价稽核打开不需要在ChromeFrame中运行
//		var flts =["/grm/appraise","/grm/audit.common","/grm/audit"];
	    var href = window.location.href;
//		for(var sz=flts.length,i=0; i<sz;  i++){
//			if(href.indexOf(flts[i])>-1){ return true; }
//		}	
		//对于嵌入式Iframe,不转向 . 2014.7.16
		if(window.parent !== window.self){ return true; }
		//只有IE6-9才转向谷歌内核
		if(EcpV.browser.msie){
			var v = EcpV.getRegIEVer();
			if (v == null || v > 9){return true;}
			href= EcpV.getChromeSetupUrl();
		    //只有cookie中存在UPDATEURL才转向谷歌内核
			if(href){ window.location.href = href; return false; }
			else{ return true; }
		}else{ return true; }
	 }
	 return _goForIE6_9();
 }
//启动之前的前置脚本，返回true才启动  by yangwenyi 2014.7.5
if(beforeEcpStartup()){  
	/*从startup中移到这里，即在下载body内容之前加载样式,是为了彻底解决静态页面的闪变。
	  用配置平台的登录页面做实验，无论重复刷新多快，登录框一次成形，而之前可能看得出 闪变过程。
	  但是否js线程锁定了线程，效果不明显？还需要验证。
	  by yangwenyi 2014-9-27
    */
	
	(function(){
		if(EcpTool.getBody()){ //检测页面是否生成
			//body获取后引样式，因IE下在document.readyState不为true时进行DOM的append操作会出现无法打开站点问题
			EcpTool.cssImport("ecp.skin.default",true); 
			ecpStartup();//异步启动
		} else {
			setTimeout(arguments.callee); //等待
		}
	})(); 
}
})(EcpVersion);
//下面可插入扩展回调函数的定义。




