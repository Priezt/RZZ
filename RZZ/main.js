var source_visible = false;
var content_visible = false;
var url_history_visible = false;
var rzz_list_visible = false;
var url_history = new Array();
var rzz_list = new Array();
var current_rzz_selector = "";
var zgroup_visible = false;
var zgroup_list = new Array();
var rzz_fifo = new Array();
var piece_place_visible = false;

$(init);

function init(){
	console.log("init start");
	$("#get_url").click(fetch_url);
	$("#temp_place").hide();
	$("#source_html").hide();
	$("#toggle_source").click(toggle_source);
	$("#toggle_content").click(toggle_content);
	$("#toggle_result").click(toggle_result);
	$("#history_content").hide();
	$("#url_history").click(toggle_url_history);
	$("#rzz_title").click(toggle_rzz_list);
	$("#get_pieces").click(get_pieces);
	$("#piece_place").hide();
	$("#save_rzz").click(save_rzz);
	$("#msg_div").hide();
	$("#zgroup_title").click(toggle_zgroup_container);
	$("#zgroup_container").hide();
	$("#add_zgroup").click(add_new_zgroup);
	update_zgroup_buttons_list();
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
		var html = $("<div>").append($(this).clone()).remove().html();
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

function toggle_result(){
	if(piece_place_visible){
		piece_place_visible = false;
		$("#piece_place").hide("slow");
	}else{
		piece_place_visible = true;
		$("#piece_place").show("slow");
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
		msg("url fetch complete");
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

function save_rzz(){
	var rzz_name = $("#rzz_name").val();
	var rzz = $("#url").val()+"|"+$("#selector").val();
	localStorage["rzz_" + rzz_name] = rzz;
	if(localStorage["rzzlist"]){
		rzz_list = JSON.parse(localStorage["rzzlist"]);
	}
	if(rzz_list.indexOf(rzz_name) < 0){
		rzz_list.unshift(rzz_name);
	}
	localStorage["rzzlist"] = JSON.stringify(rzz_list);
	console.log(rzz_name+": "+rzz);
	msg("saved: " + rzz_name);
}

function msg(msg_text){
	$("#msg_div").text(msg_text);
	$("#msg_div").hide();
	$("#msg_div").show(1000, function(){
		$(this).delay(2000).hide(1000);
	});
}

function toggle_rzz_list(){
	console.log("toggle rzz list");
	if(rzz_list_visible){
		rzz_list_visible = false;
		$("#rzz_list").hide("slow");
	}else{
		rzz_list_visible = true;
		display_rzz_list();
		$("#rzz_list").show("slow");
	}
}

function toggle_zgroup_container(){
	console.log("toggle zgroup container");
	if(zgroup_visible){
		zgroup_visible = false;
		$("#zgroup_container").hide("slow");
	}else{
		zgroup_visible = true;
		$("#zgroup_container").show("slow");
	}
}

function display_rzz_list(){
	console.log("display rzz list");
	$("#rzz_list").empty();
	$("#rzz_list").append($("<hr>"));
	if(localStorage["rzzlist"]){
		rzz_list = JSON.parse(localStorage["rzzlist"]);
		console.log("found rzz: "+rzz_list.length);
		for(var i=rzz_list.length-1;i>=0;i--){
			var rzz_name = rzz_list[i];
			var new_div = $("<div class=\"url_history_link\" onclick=\"select_rzz("+(i)+")\"></div>");
			new_div.text(rzz_name);
			new_div.hover(function(){
				$(this).addClass("url_hover");
			},function(){
				$(this).removeClass("url_hover");
			});
			$("#rzz_list").append(new_div);
		}
	}
}

function select_rzz(idx){
	//console.log("select index: " + idx);
	var rzz_name = rzz_list[idx];
	console.log("select rzz: " + rzz_name);
	$("#rzz_list").hide();
	rzz_list_visible = false;
	$("#piece_place").empty();
	$("#piece_place").show();
	piece_place_visible = true;
	rzz_fifo.push(rzz_name);
	launch_rzz();
}

function launch_rzz(){
	if(rzz_fifo.length == 0){
		console.log("zgroup all done");
		msg("zgroup all done");
		return;
	}
	var rzz_name = rzz_fifo.shift();
	var rzz_string = localStorage["rzz_"+rzz_name];
	var parts = rzz_string.split("|");
	var rzz_url = parts[0];
	var rzz_selector = parts[1];
	current_rzz_selector = rzz_selector;
	$.get(rzz_url, cb_rzz_url_fetched);
}

function cb_rzz_url_fetched(data){
	console.log("fetch success");
	console.log("data length: " + data.length);
	var clear_data = process_html(data);
	$("#source_html").val(clear_data);
	$("#temp_place").html(clear_data);
	console.log("get pieces");
	var selector_str = "#temp_place ";
	selector_str += current_rzz_selector;
	console.log("jquery selector: " + selector_str);
	$(selector_str).each(function(){
		//console.log("found one piece here");
		var new_div = $("<div>");
		new_div.addClass("one_piece");
		var html = $("<div>").append($(this).clone()).remove().html();
		console.log("found: " + html);
		new_div[0].innerHTML = html;
		$("#piece_place").append(new_div);
	});
	console.log("rzz completed");
	window.setTimeout("launch_rzz()", 100);
}

function add_new_zgroup(){
	var zgroup_str = $("#zgroup_value").val();
	if(zgroup_str.match(/^\s*$/)){
		return;
	}
	var parts = zgroup_str.split(":");
	var new_group_name = parts[0];
	var rzz_list_str = parts[1];
	localStorage["zgroup_"+new_group_name] = rzz_list_str;
	if(localStorage["zgrouplist"]){
		zgroup_list = JSON.parse(localStorage["zgrouplist"]);
	}
	if(zgroup_list.indexOf(new_group_name) < 0){
		zgroup_list.unshift(new_group_name);
	}
	localStorage["zgrouplist"] = JSON.stringify(zgroup_list);
	update_zgroup_buttons_list();
	console.log("add new zgroup: " + new_group_name);
	msg("add new zgroup: " + new_group_name);
}

function update_zgroup_buttons_list(){
	$("#saved_zgroup_buttons").empty();
	if(localStorage["zgrouplist"]){
		zgroup_list = JSON.parse(localStorage["zgrouplist"]);
	}
	for(var i=0;i<zgroup_list.length;i++){
		var new_button = $("<input type=button>");
		new_button.val(zgroup_list[i]);
		new_button.click(run_zgroup);
		$("#saved_zgroup_buttons").append(new_button);
	}
}

function run_zgroup(){
	var zgroup_name = $(this).val();
	launch_zgroup(zgroup_name);
}

function launch_zgroup(zgroup_name){
	rzz_fifo = localStorage["zgroup_" + zgroup_name].split(",");
	console.log("launch zgroup: " + zgroup_name);
	console.log("total rzz count: " + rzz_fifo.length);
	$("#piece_place").empty();
	$("#piece_place").show();
	piece_place_visible = true;
	launch_rzz();
}

