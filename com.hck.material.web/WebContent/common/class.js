/**
 * 远光Gris平台3.0版本 http://www.ygsoft.com/
 * Grace [Gris Application Cloud-Computing Extension]
 * 
 * 类定义功能脚本
 * 
 * 变更版本：
 * wuhuating@ygsoft.com 2012-2-29 创建
 * yangwenyi@ygsoft.com 2014-10-21 重大重构
 */
// 这个方法是借用Prototypejs中的定义
// 当前是否处于创建类的阶段
(function ($) {
	
	var iFlg = false,PT = "prototype"; //initializing
	
	/**
	 * 定义类
	 * @ignore
	 * @param {Object} bc 基类
	 * @param {Object} cc 子类
	 * @param {Boolean} bt bindThis 是否将方法绑定到当前类，将this关键字固定成当前类，就算apply、call方法都无法影响其this的值
	 * @returns {Object}
	 */
	function jClass(bc, cc, bt) {
		function _isFn(f){
			return typeof f === "function";
		}
		
		// 兼容jClass({}, true)的情况
		if(typeof cc === "boolean"){
			bt = cc;
		}

		// 只接受一个参数的情况 - jClass(prop)
		if (typeof (bc) === "object") {
			cc = bc;
			bc = null;
		}
		
		// 本次调用所创建的类（构造函数）
		function F() {
			var _p, 
				me = this;
			// 如果当前处于实例化类的阶段，则调用init原型函数
			if (!iFlg) {
				// 如果父类存在，则实例对象的baseprototype指向父类的原型
				// 这就提供了在实例对象中调用父类方法的途径
				if (bc) {
					me.baseprototype = bc[PT];
				}
				// 通过bind方法给每个方法的this绑定当前对象，避免丢失 modify by wuhuating
				if(bt){
					_p = F[PT];
					for(var n in _p){
						if( _isFn(_p[n]) ){
							_p[n] = _p[n].bind(me);
						}
					}
				}
				// 如果存在初始化方法才执行：modify by wuhuating
				me.init && me.init.apply(me, arguments);
			}
		}
		
		// 如果此类需要从其它类扩展
		if (bc) {
			iFlg = true;
			F[PT] = new bc();
			F[PT].constructor = F;
			iFlg = false;
		}
		
		// 覆盖父类的同名函数
		for (var n in cc) {
			if (cc.hasOwnProperty(n)) {
				var _p = F[PT],
					_c = cc[n];
				// 如果此类继承自父类bc并且父类原型中存在同名函数name
				if ( bc && _isFn(_c) && _isFn(_p[n]) ) {
					// 重定义函数name - 
					// 首先在函数上下文设置this.base指向父类原型中的同名函数
					// 然后调用函数prop[name]，返回函数结果
					// 注意：这里的自执行函数创建了一个上下文，这个上下文返回另一个函数，
					// 此函数中可以应用此上下文中的变量，这就是闭包（Closure）。
					// 这是JavaScript框架开发中常用的技巧。
					_p[n] = (function(_n, fn) {
						var m = function() {
							var me = this,
								_b = me.base,
								r;  
							me.base = bc[PT][_n]; //将this.base指向基类同名方法
							r = fn.apply(me, arguments);//执行子类方法，在子类方法中调用了this.base就是执行父类的方法
							me.base = _b;  
							return r;
						};
						m.callFn = fn;
						return m;
					})(n, _c);
					
				} else {
					_p[n] = _c;
				}
			}
		}
		
		// 复制静态方法
		var f;
		for(var n in bc){
			f = bc[n];
			if( _isFn(f) ){F[n] = f}
		}
		return F;
	};
	
	$.ecp.extend(/**@lends $.ecp */{
		/**
		 * 定义类
		 * @param {Object} bc 基类
		 * @param {Object} cc 子类
		 * @param {Boolean} bt bindThis 是否将方法绑定到当前类，将this关键字固定成当前类，就算apply、call方法都无法影响其this的值
		 * @returns {Object}
		 */
		Class : function(bc, cc, bt){
			return jClass(bc, cc, bt);
		}
	});
})(jQuery);