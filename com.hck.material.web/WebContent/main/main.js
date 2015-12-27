
$(document).ready(function() {
	$("#showMaterialList").on("click", function() {
		$.ajax({
			url : "/hck/queryServlet",
			type : "get",
			data : {
				zipcode : 97201,
				materialId : "abcde"
			},
			success : function(data, textStatus) {
				var c = data;
				alert(data);
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				var a = XMLHttpRequest;
			}
		});
	});
	function fu(a,b){
		var c= a;
	}
	
	
});