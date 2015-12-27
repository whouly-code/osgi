/**
* 远光Gris平台3.0版本 http://www.ygsoft.com/
* 
* $.ecp系统级工具方法类
*
* 变更版本：
* wuhuating@ygsoft.com 2012-8-17 创建
* yagnwenyi@ygsoft.com 2014-9-30 重构
*/
(function($, undefined){
	var K_VO = "valueObject",
		K_CC = "_cloneControl",
		MemoryLog= {
			dlid: "ecpDownloadIframe",
			maxRow: 2000,
			prompt: "开启内存日志记录功能:\n设置截取最大行数为（此数值过大会影响系统性能 ）:",
		    beanId: "com.ygsoft.ecp.service.log.MemoryLogService"
		 };
	
	window.ecp = $.ecp = EcpVersion;
	
	$.ecp.extend(EcpTool);
	
	$.ecp.extend(EcpCookie);
	
	$.ecp.extend(/**@lends $.ecp */{
		/**
		 * dom通过$.data获取dom对应的上下文到
		 * @param {Object} dom DOM对象，默认为body
		 * @returns {Object}
		 * @author yinshanpeng@ygsoft.com
		 * @date 2014.9.19
		 */
		getContext: function(dom){
			if(dom && dom.context && dom.context !== document){
				return dom.context;
			}
			//过滤dom是对象但不是DOM元素的情况
			if(!dom || !dom[0]){
				dom = $("body");
			}
			return $.data(dom[0], "_EcpContext");
		},
		/**
		 * 通过$.data设置dom的上下文
		 * @param {Object} dom DOM对象，默认为body
		 * @param {Object} context 上下文 
		 * @author yinshanpeng@ygsoft.com
		 * @date 2014.9.19
		 */
		setContext: function(dom, context){
			if(arguments.length === 1){
				context = dom;
				dom = $("body");
			}
			$.data(dom[0], "_EcpContext", context);
		},
		/**
		 * 创建命名空间，防止命名冲突，可批量创建命名空间，如果已存在该命名空间，则不重新创建
		 * 
		 * @example
		 *  nameSpace("a.b", "b.c") 创建了a.b与b.c的命名空间
		 * @author yinshanpeng@ygsoft.com
		 * @date 2014.9.19
		 */
		nameSpace : function(){
			var arg = arguments,sz =arg.length, o = null;
			// 保存当前的nameSpace
			if($.ecp && $.ecp.thisWindow){
				var _ns = arg[sz - 1];
				$.ecp.thisWindow.nameSpace = _ns;
//				$.ecp.thisWindow.rsNameSpace = ns;
			}
			function _crNs(s){
				var  i, k, a, ns;
				// 以"."分割字符串
				a = s.split(".");
				// 取出第一节点对象
				ns = a[0];
				// 判断是否存在ns字符串对应的对象，若不存在则进行初始化成原始对象{}
				if(window[ns] === undefined){
					window[ns] = {};
				}
				o = window[ns];
				
				// 循环判读对象已存在，如果未存在，则初始化成原始对象{}
				for (i = 1; i < a.length; i++){
					k = a[i];
					if(o[k] === undefined){
						o[k] = {};
					}
					o = o[k];
				}
			}
			
			for (var j = 0; j < sz; j++){
				_crNs(arg[j]);
			}
			return o;
		},
		/**
		 * 定义命名空间，nameSpace的简写
		 * @author yinshanpeng@ygsoft.com
		 * @date 2014.9.19
		 */
		ns: function(){
			return this.nameSpace.apply(this,arguments);
		},

		
	   /**
        * 异步加载脚本
        * <p>
        * 	基于使用方便性考虑，添加此函数。避免开发人员无法正确理解jsImport中异步回调函数的意义。
        * </p>
        * @param {String | String[]} url 加载的js文件路径，如果是array数组，会将所有要加载的脚本文件内联为一个http请求一次返回。
        * @author yinshanpeng@ygsoft.com
        * @date 2014.9.19
        */
        jsAsynchronousImport: function (url) {
            $.ecp.jsImport(url, function () { });
        },
        /**
         * @ignore
         */
        _jsImport: $.ecp.jsImport,
      
        /**
         * 启动模版
         * @author yinshanpeng@ygsoft.com
         * @date 2014.9.19
         */
        toStartupMode: function(){
        	$.ecp.jsImport = function(){};
        	//$.ecp.loadModule = function(){};
        },
        /**
         * 加载模版
         * @author yinshanpeng@ygsoft.com
         * @date 2014.9.19
         */
        toReadyMode: function(){
        	$.ecp.jsImport = this._jsImport;
        	//$.ecp.loadModule = this._jsImport;
        } 
        /**
         * 加载模块
         * @method
         * @see $.ecp.jsImport
         * @author yinshanpeng@ygsoft.com
         * @date 2014.9.19
         */
       // loadModule: $.ecp.jsImport
	});
	/**
	 * 当前窗口对象
	 * @name $.ecp.thisWindow
	 * @namespace $.ecp.thisWindow
	 */
	$.ecp.thisWindow =/**@lends $.ecp.thisWindow */ {
	        /**
	         * 命名空间
	         */
			nameSpace : "",
			/**
			 * 事件对象
			 */
	        event : {
				onBeforeInit : {},
				onBeforeLoad : {},
				onLoad : {},
				onShow : {},
				onClose : {}
			},
			event2 : {
				onBeforeInit : {},
				onBeforeLoad : {},
				onLoad : {},
				onShow : {},
				onClose : {}
			},
			/**
			 * 关闭事件
			 * @param nmsp 命名空间
			 * @param func 关闭时执行的回调函数
			 */
			onClose : function(fn) {
//				if(arguments.length === 1){
//					func = nmsp;
//					nmsp = null;
//				}
				this._registerEvent("onClose", fn);
			},
			
			/**
			 * 初始化前事件
			 * @param nmsp 命名空间
			 * @param func 初始化前执行的回调函数
			 */
			onBeforeInit : function(fn){
//				if(arguments.length === 1){
//					func = nmsp;
//					nmsp = null;
//				}
				this._registerEvent("onBeforeInit", fn);
			},
			
			/**
			 * 加载前事件
			 * @param nmsp 命名空间
			 * @param func 加载前事件执行的回调函数
			 */
			onBeforeLoad : function(fn){
//				if(arguments.length === 1){
//					func = nmsp;
//					nmsp = null;
//				}
				this._registerEvent("onBeforeLoad", fn);
			},
			/**
			 * 加载事件
			 * @param nmsp 命名空间
			 * @param func 加载事情执行的回调函数
			 */
			onLoad : function(fn){
//				if(arguments.length === 1){
//					func = nmsp;
//					nmsp = null;
//				}
				this._registerEvent("onLoad", fn);
			},
			/**
			 * 显示事件
			 * @param nmsp 命名空间
			 * @param func 显示事件执行的回调函数
			 */
			onShow : function(fn){
//				if(arguments.length === 1){
//					func = nmsp;
//					nmsp = null;
//				}
				this._registerEvent("onShow", fn);
			},
			
			/**
			 * @ignore
			 */
			
			_registerEvent2: function(e, fn) {
				if(!fn){
					return;
				}
				//如果传递过来的命名空间不为空，那么当前命名空间取传递过来的
//				if($.ecp.utils.notEmpty(nmsp)){
//					this.nameSpace = nmsp;
//				}
				var  a,
					 me = this,
					 ns = me.nameSpace;
				var _f = function(){// 注册前包装一层，用来切换当前命名空间
					var r, oldNs = me.nameSpace;// 保存旧的命名空间
					me.nameSpace = ns;// 切换成当前命名空间
					r = fn.apply(this, arguments);// 执行事件
					me.nameSpace = oldNs;// 切换回旧的命名空间
					return r;
				}
				a = me.event2[e][ns];
				if(!a){
					a = me.event2[e][ns] = [];
				}
				a.push(_f);
				
			},
			
			_registerEvent : function() {},
			
			/**
			 * @ignore
			 */
			_registerEventBak : function(e, fn){
				if(!fn){
					return;
				}
				//如果传递过来的命名空间不为空，那么当前命名空间取传递过来的
//				if($.ecp.utils.notEmpty(nmsp)){
//					this.nameSpace = nmsp;
//				}
				var  a,
					 me = this,
					 ns = me.nameSpace;
				var _f = function(){// 注册前包装一层，用来切换当前命名空间
					var r, oldNs = me.nameSpace;// 保存旧的命名空间
					me.nameSpace = ns;// 切换成当前命名空间
					r = fn.apply(this, arguments);// 执行事件
					me.nameSpace = oldNs;// 切换回旧的命名空间
					return r;
				}
				//存放回调函数 modi by zxw
				if(fn.toString){
					_f.fn = fn.toString();
				}
				a = me.event[e][ns];
				if(!a){
					a = me.event[e][ns] = [];
				}
				a.push(_f);
			},
			
			/**
			 * 获取事件
			 * @param e 事件名称
			 * @param ns 命名空间
			 * @returns 返回回调函数
			 */
			getEvent: function(e, ns){
				var fn = this.event[e][ns];
				//过滤重复的函数
				if($.type(fn) === "array"){
					for(var i = 0; i < fn.length; i++){
						if(!fn[i]){break;}
						var fnStr = fn[i].fn;
						for(var m = fn.length-1; m > i; m--){
							if(fnStr && fnStr == fn[m].fn){
								fn.splice(m,1);
							}
						}
					}
				}
				delete this.event[e][ns];
				return fn;
			},

			getEvent2: function(e, ns){
				var fn = this.event2[e][ns];
				return fn;
			},
			/**
			 * 切换成只读状态
			 */
			readOnly: function(){
				this._registerEvent = this._registerEvent2;
			},
			editable: function(){
				this._registerEvent = this._registerEventBak;
			}
	}
	$.ecp.thisWindow.readOnly();
	
	var _valFn = $.fn.val; //保存jQuery原始val方法
	/**
	 * @name $.fn
	 * @namespace $.fn
	 */
	$.extend($.fn,/**@lends $.fn */ {
		/**
		 * 代理jQuery的原生方法，增加对象、数组类型值的处理
		 * @param {String} v
		 */
		val: function(v){
			if(arguments.length){
				if($.isPlainObject(v) || $.isArray(v)){
					this.data(K_VO, v);
				} else {
					this.removeData(K_VO);
					this[K_CC] && this[K_CC].val(v);
				}
				return _valFn.call(this, v);
			} else {
				return this.data(K_VO) || _valFn.call(this);
			}
		},
		/**
		 * 通过DOM元素的改变模型值 
		 * <p>
		 *  用于代替jQuery的val()方法，原有方法不触发onChange事件
		 * </p>
		 * @param {Object} v 如果传入此参数，代表是设置值
		 */
		value: function (v) {
			var $me = $(this);
			if (!arguments.length) {
				return $me.val();
			}
			var dm,
				df = $me.attr("dataField");
			if (df) {
				dm = $me.data("_dataModel");
				if (dm){
					dm.get(df).value(v);
				}else{
					$me.val(v);
					this[K_CC] && this[K_CC].val(v);
				}
			} else {
				$me.val(v);
				this[K_CC] && this[K_CC].val(v);
			}
			return $me;
		}
	});
	
	// 切换旧方法，增加异常堆栈信息打印特性
	var _dispatch = $.event.dispatch;   //保存jQuery原始dispatch方法
	$.event.dispatch = function(){
		try{
			return _dispatch.apply(this, arguments);
		}catch(e){
			if(!(/\[Ecp\.End\.Task\]/g.test(e))){
				$.ecp.getLog().error("执行事件时发生异常，原因：" + e.message + "。堆栈信息为：\n" + printStackTrace({e:e}).join("\n"));
    			throw e;
    		}
		}
	}
	
	// 绑定快捷键
	$(document).keydown(function(evt){
		if(!evt.altKey){
			return;
		}
		var kc = evt.keyCode;
		// Alt + F2  组合键
		if(kc === 113){
			// 销毁所有page级缓存
			var msg = "解压成功！",
				c = $.ecp.cache,
				scuk = EcpVersion.KEY_SCRIPT_CUK;

			// 将压缩脚本选项设置成否
			if( !($.ecp.getCookie(scuk)=="2")){
				$.ecp.addCookie(scuk, "0");
				//将调试模式设置为true
				$.ecp.addCookie("performance_debug", "1");
				msg +=	"<br/>脚本加载方式修改为非压缩模式！";
			}else{
				$.ecp.addCookie(scuk, "2");
				//将调试模式设置为true
				$.ecp.addCookie("performance_debug", "2");
				msg +=	"<br/>脚本加载方式修改为压缩模式！";
			}
 
			// 操作结果提示
			$.ecp.notify( msg );
			return;
		}
		
		if(!evt.ctrlKey ){
			return;
		}
 		// 开启记录内存日志，DEBUG ,ctrl alt - 
		  var cnt,
		  	  beanId = MemoryLog.beanId;
          if( (kc==189 || kc==109)){
        	  cnt = window.prompt(MemoryLog.prompt, MemoryLog.maxRow);
        	  if (cnt != null) {
           		  $.ecp.rs.synPostService(beanId+".start",[null, cnt]);
        	  }
          }
          //关闭记录内存日志，下载压缩后的内存日志文件,ctrl alt +
          else if( (kc==187 ||kc==107)){
    		  $.ecp.rs.asynPostService(beanId+".getOutputAndStop",[null],function(data){
    			  if(data){
    				  var url,
    				  	  dlf,
    				  	  obj = $.parseJSON(data);
    				  if(obj){
    					  url =  obj.url;
    				  }else{
    					  url = data.url;
    				  }
    				  
        			  if(url){
        				  url = ecp.utils.getEcpUrl(url);
        				  //mdf by pengxiao for chromeFrame 截取日志时弹出窗口无法关闭
	      				  if (!$.ecp.utils.isIE()) {
	      					  var doc = document;
	      					  dlf = doc.getElementById(MemoryLog.dlid);
	          				  if (dlf == null) {
	          					dlf = doc.createElement("iframe");
	          					dlf.id = MemoryLog.dlid;
	          					dlf.style.display="none";
	          					doc.body.appendChild(dlf);
	          				  }
	          				  dlf.src = url;
	      				  } else {
	      					  window.open(url);
	      				  }
	      				  //mdf over
        			  }
        		  }
        	  });
          }
          //获取内存日志快照，同时关闭记录内存日志,在新的页签中显示， ctrl alt \
          else if( kc==220){
          	 var log = $.ecp.rs.ajax4Bean(beanId+".getMemoryLog",[null],null,"text");
        	 var win = window.open('about:blank');
        	 win.document.write('<pre>'+log+'</pre>');
          }
	});
	
	//处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外。onkeypress作用于Firefox、Opera，onkeydown作用于IE、Chrome 
	document.onkeypress = document.onkeydown = function(e) {
	    var ev = e || window.event;//获取event对象
	    if(ev.keyCode !== 8){
	    	return;
	    }
	    var obj = ev.target || ev.srcElement,//获取事件源
	    	t = obj.type || obj.getAttribute('type');//获取事件源类型
	    //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
	    if(t !== "password" && t !== "text" && t !== "textarea"){
	    	return false;
	    }
	    //获取作为判断条件的事件类型
	    var ro = obj.getAttribute('readonly'),
	    	enb = obj.getAttribute('enabled');
	    //处理null值情况
	    ro = ro ? ro : false;
	    enb = enb? enb : true;
	    //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
	    //并且readonly属性为true或enabled属性为false的，则退格键失效
	    if(ro || !enb){
	        return false;
	    }
	}
	
	$.ecp.Document = {};
	
})(jQuery);