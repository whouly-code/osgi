$(document).ready(function(){
	$("#login").on("click",function(event){
//		window.open('/hck/material/main/main.html');
		var userName = $("#userName").val();
		var passWord = $("#passWord").val();
		$.ajax({
			url:"/hck/loginServlet",
			type:"get",
			data:{
				userName:userName,
				passWord:passWord
			},
			success: function(data, textStatus){
				winOption = "height=200,width=810,toolbar=1,menubar=1"
					+ ",location=1";
				var win = window.open('/hck/material/main/main.html');
				window.close();
//				win.blur();
//				win.opener.focus();
//				location.href = "/hck/material/main/main.html";
//				if(data*1){
//				openWin('/hck/material/main/main.html',"winName");
//					var sFeatures = "height=200, width=810, scrollbars=yes, resizable=yes";
//					window.open('/hck/material/main/main.html',"winName",sFeatures);
//				}
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				var a = XMLHttpRequest;
			}
		});
	});
	function openWin(url, winName, option){
		var winOption = null;
		if(option){
			winOption = option;
		} else {
//			window.open(url, winName, winOption) 弹出新窗口的命令； 
//		　　'url' 弹出窗口的文件名； 
//		　　'winName' 弹出窗口的名字（不是文件名），非必须，可用空''代替； 
//			winOption 参数 字符串形式(height=600, width=810, scrollbars=yes, resizable=yes)
//		　　height=100 窗口高度； 
//		　　width=400 窗口宽度； 
//		　　top=0 窗口距离屏幕上方的象素值； 
//		　　left=0 窗口距离屏幕左侧的象素值； 
//		　　toolbar=no 是否显示工具栏，yes为显示； 
//		　　menubar，scrollbars 表示菜单栏和滚动栏。 
//		　　resizable=no 是否允许改变窗口大小，yes为允许； 
//		　　location=no 是否显示地址栏，yes为允许； 
//		　　status=no 是否显示状态栏内的信息（通常是文件已经打开），yes为允许；
			winOption = "height=600,width=810,scrollbars=yes,resizable=yes,toolbar=yes,menubar=1"
				+ "location=yes";
		}
//		躲避拦截技巧
//		var purl='http://www.taobao.com/promotion/defaultbackpop.html';
//		var w=760;
//		var h=480;
//		var adPopup = window.open('about:blank', '_blank','width='+w+',height='+h+', ...');
//		adPopup.blur();
//		adPopup.opener.focus();
//		adPopup.location = purl;
//		$E.removeListener(document.body, 'click', arguments.callee);
		
//		location.href = url;
		window.open(url);
//		window.open(url,"winName",winOption);
	}
});