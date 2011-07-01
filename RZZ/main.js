var source_visible = false;
var content_visible = false;
var url_history_visible = false;
var url_history = new Array();

$(init);

function init(){
	console.log("init start");
	$("#get_url").click(fetch_url);
	$("#temp_place").hide();
	$("#source_html").hide();
	$("#toggle_source").click(toggle_source);
	$("#toggle_content").click(toggle_content);
	$("#history_content").hide();
	$("#url_history").click(toggle_url_history);
	$("#get_pieces").click(get_pieces);
	$("#piece_place").hide();
	console.log("init end");
}

function select_url(idx){
	//console.log("select index: " + idx);
	var url = url_history[idx];
	//var url = e.innerText;
	console.log("select url: " + url);
	$("#history_content").hide();
	url_history_visible = false;
	$("#url").val(url);
	fetch_url();
}

function get_pieces(){
	console.log("get pieces");
	var selector_str = "#temp_place ";
	selector_str += $("#selector").val();
	console.log("jquery selector: " + selector_str);
	$("#piece_place").hide();
	$("#piece_place").empty();
	$(selector_str).each(function(){
		//console.log("found one piece here");
		var new_div = $("<div>");
		new_div.addClass("one_piece");
		//var html = $(this).html();
		var html = $(this)[0].outerHtml;
		console.log("found: " + html);
		new_div[0].innerHTML = html;
		$("#piece_place").append(new_div);
	});
	$("#piece_place").show("slow");
}

function display_url_history(){
	console.log("display url history");
	$("#history_content").empty();
	$("#history_content").append($("<hr>"));
	if(localStorage["url_history"]){
		url_history = eval(localStorage["url_history"]);
		console.log("found url: "+url_history.length);
		for(var i=url_history.length-1;i>=0;i--){
			var url = url_history[i];
			var new_div = $("<div class=\"url_history_link\" onclick=\"select_url("+(i)+")\"></div>");
			//new_div.click(function(e){
			//	select_url(e);
			//});
			new_div.text(url);
			new_div.hover(function(){
				$(this).addClass("url_hover");
			},function(){
				$(this).removeClass("url_hover");
			});
			$("#history_content").append(new_div);
		}
	}
}

function toggle_url_history(){
	console.log("toggle url history");
	if(url_history_visible){
		url_history_visible = false;
		$("#history_content").hide("slow");
	}else{
		url_history_visible = true;
		display_url_history();
		$("#history_content").show("slow");
	}
}

function toggle_source(){
	if(source_visible){
		source_visible = false;
		$("#source_html").hide("slow");
	}else{
		source_visible = true;
		$("#source_html").show("slow");
	}
}

function toggle_content(){
	if(content_visible){
		content_visible = false;
		$("#temp_place").hide("slow");
	}else{
		content_visible = true;
		$("#temp_place").show("slow");
	}
}

function add_url_history(url){
	if(localStorage["url_history"]){
		url_history = eval(localStorage["url_history"]);
		if(url_history[url_history.length - 1] == url){
			return;
		}
	}else{
		url_history = new Array();
	}
	url_history.push(url);
	if(url_history.length > 10){
		url_history.shift();
	}
	localStorage["url_history"] = JSON.stringify(url_history);
}

function fetch_url(){
	var url = $("#url").val();
	if(url.match(/^\s*$/)){
		return;
	}
	add_url_history(url);
	console.log("fetch url: ")+url;
	$("#temp_place").hide();
	$.get(url, function(data){
		console.log("fetch success");
		console.log("data length: " + data.length);
		var clear_data = process_html(data);
		//console.log(clear_data);
		$("#source_html").val(clear_data);
		$("#temp_place").html(clear_data);
		$("#temp_place").show("slow");
		content_visible = true;
	});
}

function process_html(data){
	//console.log(data);
	var result = rip_body_html(data);
	result = remove_script(result);
	result = remove_on_event(result);
	return result;
}

function rip_body_html(data){
	var result = data.match(/\<body[^\>]*\>([\s\S]*)\<\/body\>/i);
	//console.log(result);
	if(result && result.length >= 2){
		return result[1];
	}else{
		return "";
	}
}

function remove_script(data){
	var result = data.replace(/\<(?:\!\-\-)?script[\s\S]+?\<\/script(?:\-\-)?\>/ig, "");
	return result;
}

function remove_on_event(data){
	var result = data.replace(/ on[a-z]+\=\"[\s\S]*?\"/gi, " ");
	result = result.replace(/ on[a-z]+\=\'[\s\S]*?\'/gi, " ");
	return result;
}
