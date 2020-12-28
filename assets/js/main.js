/*
	main.js
*/
var downLink = 'about:blank';
window.onload = function(){
	TMS_STARTUP();
};
function TMS_STARTUP(){
	var cDate = new Date;
	$('#MENU_CENTER').fadeIn({duration: 500, queue: false});
	$('#DIV_TOOLS_BG').fadeIn({duration: 2500, queue: false});
	document.getElementById('LBL_YEAR').innerHTML = cDate.getFullYear();
};
function TMS_RUN_R3V2(){
	document.title = 'TMS Tools - Please wait...';
	$('body').css({'background-image': 'none'});
	document.getElementById('BTN_WEB').disabled = 'disabled';
	document.getElementById('BTN_DOWN').disabled = 'disabled';
	$('#HTML_CANVAS').fadeOut({duration: 800, queue: false});
	setTimeout(function(){
		window.location.assign('https://themitosan.github.io/R3V2');
	}, 1400);
};
function TMS_SHOW_R3V2(){
	$('#MENU_CENTER').fadeOut({duration: 100, queue: false});
	setTimeout(function(){
		document.title = 'TMS Tools - R3V2';
		$('#MENU_R3V2').fadeIn({duration: 200, queue: false});
	}, 110);
};
function TMS_DOWNLOAD_R3V2(){
	window.location.assign(downLink);
};