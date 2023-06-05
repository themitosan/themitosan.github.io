/*
	R3 Auto Map View
	options.js
*/

temp_OPTIONS = {

	/*
		Variables
	*/
	hideTopMenu: !1,
	isMapLoading: !1,
	bioRandObjectives: {
		reset: !1,
		current: null,
		parentMap: null,
		applyDistance: null,
	},
	settingsData: {
		fontSize: 13,
	},

	/*
		BioRand Functions
	*/

	// Update BioRand objective
	updateBioRandObjective: function(mapName, parent){

		var cPrev,
			bRandDb,
			cObjective,
			canContinue = !0,
			canSolveObjective = !1;

		// Set objective
		if (APP.database.bio3.bioRandObjectives[mapName] !== void 0 && APP.options.bioRandObjectives.current !== mapName){

			canContinue = !1;
			APP.options.bioRandObjectives.current = mapName;
			APP.options.bioRandObjectives.parentMap = parent;
			APP.options.bioRandObjectives.applyDistance = APP.database.bio3.bioRandObjectives[mapName].applyDistance;
			
			if (APP.options.isMapLoading === !1){
				APP.graphics.displayTopMsg('New Objective: ' + APP.database.bio3.rdt[mapName].name + ', ' + APP.database.bio3.rdt[mapName].location, 5200);
			}

		}

		// Reset objective
		if (canContinue === !0 && APP.options.bioRandObjectives.current !== null){

			cPrev = APP.options.bioRandObjectives.parentMap;
			cObjective = APP.options.bioRandObjectives.current;
			bRandDb = APP.database.bio3.bioRandObjectives[cObjective];

			// Solve objective process
			const solveObjective = function(){
				
				APP.options.bioRandObjectives.reset = !0;
				APP.options.bioRandObjectives.current = null;
				APP.options.bioRandObjectives.parentMap = null;

				if (APP.options.isMapLoading === !1){
					APP.graphics.displayTopMsg('Objective complete! - ' + APP.database.bio3.rdt[parent].name + ', ' + APP.database.bio3.rdt[parent].location, 5200);
				}

			}

			// Check if can solve current objective
			if (bRandDb.endsOn === null && parent === cObjective){
				canSolveObjective = !0;
			}
			if (canSolveObjective === !1 && bRandDb.endsOn === mapName && parent === cObjective){
				canSolveObjective = !0;
			}

			// End
			if (canSolveObjective === !0){
				solveObjective();
			}

		}

	},

	/*
		Functions
	*/

	// Reset map
	resetMap: function(){

		// Reset vars
		APP.graphics.zIndexMap = 10;
		APP.graphics.addedMaps = {};
		APP.graphics.addedLines = {};
		APP.graphics.xFarestMap = '';
		APP.gameHook.mapHistory = [];
		APP.graphics.addedMapHistory = [];
		APP.graphics.enabledDragList = [];
		this.bioRandObjectives = { current: null, parentMap: null, reset: !1, applyDistance: null },

		// Reset drag
		APP.graphics.enableCanvasDrag = !0;
		APP.graphics.toggleDragMapCanvas();
		document.getElementById('APP_MAP_CANVAS').onmousedown = null;

		// Reset HTML
		document.getElementById('APP_MAP_CANVAS').innerHTML = '';
		TMS.css('APP_MAP_CANVAS', {'top': '-50000px', 'left': '-50000px'});

	},

	// Load map
	loadMapProcess: function(data){

		// Set map loading process as true
		APP.options.isMapLoading = !0;

		// Declare reader variables
		var saveData,
			reader = new FileReader();
		
		reader.addEventListener('load', function(evt){

			// Get data
			saveData = JSON.parse(atob(evt.target.result.replace('data:application/json;base64,', '')));

			// Reset map
			APP.options.resetMap();

			// Push all maps again and update it's previous location
			saveData.history.forEach(function(cAction){
				APP.graphics.pushMap(cAction.mapName, cAction.parent);
			});
			Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

				// Update data
				APP.graphics.addedMaps[cMap].x = saveData.addedList[cMap].x;
				APP.graphics.addedMaps[cMap].y = saveData.addedList[cMap].y;

				// Update map positions
				TMS.css('ROOM_' + cMap, {
					'top': saveData.addedList[cMap].y + 'px',
					'left': saveData.addedList[cMap].x + 'px'
				});

			});

			// Set farest map
			APP.graphics.xFarestMap = saveData.xFarestMap;

			// Update lines
			APP.graphics.updateLines();

			// Update canvas pos.
			TMS.css('APP_MAP_CANVAS', {
				'top': saveData.canvasPos.y + 'px',
				'left': saveData.canvasPos.x + 'px'
			});

			// Set map loading process as false
			APP.options.isMapLoading = !1;

		});

		// Start load process
		reader.readAsDataURL(data);

	},

	// Load map
	loadMapFile: function(){
		APP.filemanager.selectFile('.json', function(path){
			APP.options.loadMapProcess(path);
		});
	}

}