/*
	R3 Auto Map View
	tools.js
*/

temp_TOOLS = {

	// Process checkbox status
	processCheckbox: function(domName){
		var res = !1,
		    domId = document.getElementById(domName).checked;
		if (domId === !1){
			res = !0;
		}
		document.getElementById(domName).checked = res;
	},

	// Parse value polarity
	parsePolarity: function(value){
		var res = 0;
		if (res !== void 0){
			res = value - value - value;
		}
		return res;
	}

}