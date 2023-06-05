/*
	R3 Auto Map View
	main.js
*/

const APP = {

	// Version
	version: '1.0.0',
	name: 'R3 Auto Map View',

	// Import other files
	tools: temp_TOOLS,
	options: temp_OPTIONS,
	graphics: temp_GRAPHICS,
	database: temp_DATABASE,
	filemanager: temp_FILEMANAGER,
	gameHook: {
		gameData: {},
		mapHistory: [],
		gameActive: !1,
	},

	/*
		Functions
	*/

	// Start keyboard shortcuts
	startKbShortcuts: function(disableGlobal){

		// Start keypress
		window.onkeyup = function(evt){

			if (evt.key === 'Control'){
				APP.graphics.toggleDragMapCanvas();
			}

		}

	},

	// About screen
	about: function(){
		window.alert(APP.name + ' - Version: ' + APP.version + '\nCreated by TheMitoSan\n\nTwitter: @themitosan');
	},

	// Init
	init: function(){

		try {

			// Set vars
			const appTitle = APP.name + ' - Version: ' + APP.version; 

			// Update log and app title
			console.info(appTitle);
			document.title = appTitle;

			// Start keyboard shortcuts
			APP.startKbShortcuts();

			// Reset zoom scale dom
			document.getElementById('OPTION_mapCanvasZoom').value = 1;

			// Display menus
			setTimeout(function(){
				TMS.css('MENU_TOP', {'height': '30px'});
				TMS.css('MENU_RIGHT', {'width': '168px'});
			}, 30);

		} catch (err) {
			window.alert('ERROR - Something happened on boot process!\n' + err);
			console.error(err);
			throw new Error(err);
		}

	}

}

// Remove modules
delete temp_TOOLS;
delete temp_OPTIONS;
delete temp_GRAPHICS;
delete temp_DATABASE;
delete temp_FILEMANAGER;

// Init
window.onload = APP.init;