$(document).ready(function(){
	$("#submit").on("click",function(){
		var aa = $("#fmaintenance").val();
		if(aa){
			alert("fd");
		} else {
			$("#submit").popup('open');
		}
	});
});