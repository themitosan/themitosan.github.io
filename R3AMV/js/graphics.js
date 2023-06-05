/*
	R3 Auto Map View
	graphics.js
*/

temp_GRAPHICS = {

	/*
		Variables
	*/
	zIndexMap: 10,
	addedMaps: {},
	addedLines: {},
	xFarestMap: '',
	distanceFactor: 20,
	addedMapHistory: [],
	enabledDragList: [],
	enableCanvasDrag: !1,
	skipUpdateGuiLabel: !1,

	/*
		Functions
	*/

	// Update canvas css
	updateCanvasCss: function(fSize){
		document.getElementById('APP_STYLE').innerHTML = '.DIV_ROOM {padding: ' + (10 + fSize) + 'px;}\n.PLAYER_PRESENT {text-shadow: 0px 0px ' + (4 + fSize) + 'px #002d;}\n.SVG_CURRENT_FLOW {stroke-dasharray: ' +
														 (6 + fSize) + ';}\n@keyframes CONNECTION_FLOW { 100% {stroke-dashoffset: -' + (6 + fSize) + '0;}';
		APP.graphics.updatePlayerPos();
		APP.graphics.updateLines();
	},

	// Update canvas zoom
	updateCanvasZoom: function(){
		const cZoom = document.getElementById('OPTION_mapCanvasZoom').value;
		document.getElementById('LABEL_mapCanvasZoom').innerHTML = cZoom;
		TMS.css('APP_MAP_CANVAS', {'transform': 'scale(' + cZoom + ')'});
	},

	// Reset canvas zoom
	resetCanvasZoom: function(){
		document.getElementById('OPTION_mapCanvasZoom').value = 1;
		APP.graphics.updateCanvasZoom();
	},

	// Update current map label
	updateGuiLabel: function(){

		// Check if can update GUI labels
		if (this.skipUpdateGuiLabel === !1){

			var cMap = '',
				canvasDragStatus = 'INACTIVE';

			// Check canvas drag status
			if (this.enableCanvasDrag === !0){
				canvasDragStatus = 'ACTIVE';
			}

			// Set label strings
			document.getElementById('LABEL_mapDragStatus').innerHTML = 'Canvas drag is ' + canvasDragStatus;

		}

	},

	// Display top message
	displayTopMsg: function(msg, timeout){

		// Set skip update label flag as true
		this.skipUpdateGuiLabel = !0;

		// Set GUI
		TMS.css('MENU_TOP', {'height': '30px'});

		// Set labels
		document.getElementById('LABEL_mapDragStatus').innerHTML = msg;
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = '';

		// Reset skip label flag and update it after timeout
		setTimeout(function(){

			APP.graphics.skipUpdateGuiLabel = !1;
			APP.graphics.updateGuiLabel();

			// Check if need to hide top menu
			if (APP.options.hideTopMenu === !0){
				TMS.css('MENU_TOP', {'height': '0px'});
			}

		}, timeout);

	},

	// Add room to map
	pushMap: function(mapName, parent){

		var canAdd = !0,
			mList = this.addedMaps,
			cMap = APP.gameHook.gameData.cMap,
			distanceFactor = this.distanceFactor,
			fontSizeFactor = APP.options.settingsData.fontSize;

		// Check if current map was added
		if (document.getElementById('ROOM_' + mapName) !== null){
			canAdd = !1;
		}

		if (canAdd === !0){

			// Default coords
			var posX = 50000,
				posY = 50050,
				mapExtraClass = [],
				dPadding = (10 + fontSizeFactor),
				isBioRandMod = document.getElementById('CHECKBOX_isBioRand').checked;

			if (parent !== void 0){

				// Update parent door counts
				APP.graphics.addedMaps[parent].doors.push(mapName);

				// Get parent data
				var rect = TMS.getCoords('ROOM_' + parent);

				// Set default position
				posX = rect.L + (rect.W / 2);
				posY = rect.T;

			}

			// Change class depending on current map
			switch (mapName){

				// Game start
				case 'R10D':
					mapExtraClass.push('GAME_START');
					break;

				// Mercs game start
				case 'R70C':
					mapExtraClass.push('GAME_START');
					break;

				// Game end
				case 'R50E':
					mapExtraClass.push('GAME_END');
					break;

				// Mercs game end
				case 'R600':
					mapExtraClass.push('GAME_END');
					break;

			}

			// Check if is save room
			if (APP.database.bio3.rdt[mapName].saveRoom === !0){
				mapExtraClass.push('SAVE_ROOM');
			}

			// Check if "is BioRand" mode is active
			if (isBioRandMod === !0){

				// Update BioRand objective
				if (parent !== void 0){
					APP.options.updateBioRandObjective(mapName, parent);
				} 

				// Check if reset objective flag is active
				if (APP.options.bioRandObjectives.reset === !0){

					// Check if map is loading and if needs to apply distance from previous segment
					if (APP.options.isMapLoading === !1 && APP.options.bioRandObjectives.applyDistance === !0){

						// Get farest map coords and update X pos.
						const fMap = TMS.getCoords('ROOM_' + APP.graphics.xFarestMap);
						APP.options.bioRandObjectives.applyDistance = null;
						posX = fMap.WL + (window.innerWidth / 2);

					}

					// Reset objective flags
					APP.options.bioRandObjectives.reset = !1;
					APP.options.bioRandObjectives.applyDistance = null;

				}

				// Check if current map is an objective
				if (APP.database.bio3.bioRandObjectives[mapName] !== void 0){
					mapExtraClass.push('BIORAND_OBJECTIVE');
				}

			}

			// Generate room html and append to canvas
			const mapTemp = '<div id="ROOM_' + mapName + '" title="[' + mapName + ']\n' + APP.database.bio3.rdt[mapName].name + ', ' + APP.database.bio3.rdt[mapName].location +
							'" class="DIV_ROOM ' + mapExtraClass.toString().replace(',', ' ') + '" style="z-index: ' + APP.graphics.zIndexMap + ';top: ' + posY + 'px;left: ' + posX +
							'px;">[' + mapName + ']<br>' + APP.database.bio3.rdt[mapName].name + '</div>';

			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Bump map z-index counter
			APP.graphics.zIndexMap++;

			// Push selected map to list
			APP.graphics.addedMaps[mapName] = {x: posX, y: posY, doors: []};

			// Push map to history
			this.addedMapHistory.push({mapName: mapName, parent: parent});			
			
		}

		// Push line
		APP.graphics.pushLine(parent, mapName);

		// Update labels
		this.updateGuiLabel();

	},

	// Create line
	pushLine: function(parent, newMap){

		// Declare variables
		var canAdd = !0,
			connectedLines,
			reverseConnection,
			lineList = this.addedLines,
			lineNames = [
				parent + '_' + newMap,
				newMap + '_' + parent
			];

		// Check if can add new lines to canvas
		lineNames.forEach(function(lNames){
			if (lineList[lNames] !== void 0){
				canAdd = !1;
			}
		});
		if (parent === void 0){
			canAdd = !1;
		}

		if (canAdd === !0){

			var pData = TMS.getRect('ROOM_' + parent),
				nData = TMS.getRect('ROOM_' + newMap),
				canvasData = TMS.getRect('APP_MAP_CANVAS'),
				x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
				y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
				x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
				y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

			// Create HTML and render new lines
			lineNames.forEach(function(lName){

				const tempLine = '<svg id="' + lName + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff"/></svg>';
				TMS.append('APP_MAP_CANVAS', tempLine);

			});

			// Push to list
			APP.graphics.addedLines[parent + '_' + newMap] = { p: parent, n: newMap };
			APP.graphics.addedLines[newMap + '_' + parent] = { p: newMap, n: parent };

		}

		// Check if load map process isn't running
		if (APP.options.isMapLoading === !1){

			// Update current lines
			Array.from(document.getElementsByClassName('SVG_CURRENT_FLOW')).forEach(function(cElement){
				TMS.removeClass(cElement.id, 'SVG_CURRENT_FLOW');
			});

			// Add connection animation to current line and set backwards connection id
			TMS.addClass(parent + '_' + newMap, 'SVG_CURRENT_FLOW');
			reverseConnection = newMap + '_' + parent;

			// Display only current line with animation
			connectedLines = Object.keys(lineList).filter(function(cLine){
				if (cLine.indexOf(newMap) !== -1){
					TMS.css(cLine, {'opacity': '1'});
				}
			});
			TMS.css(reverseConnection, {'opacity': '0'});

			// Update line after render
			APP.graphics.updateLines('ROOM_' + newMap);

		}

	},

	// Enable drag element
	enableDrag: function(domName){

		// Variables
		var dList = this.enabledDragList,
			pos1 = pos2 = pos3 = pos4 = 0,
			elmnt = document.getElementById(domName);

		// Process drag event
		function dragElement(evt){
			evt = evt || window.event;
			evt.preventDefault();
			pos1 = (pos3 - evt.clientX);
			pos2 = (pos4 - evt.clientY);
			pos3 = evt.clientX;
			pos4 = evt.clientY;
			finalX = (elmnt.offsetLeft - pos1);
			finalY = (elmnt.offsetTop - pos2);

			// Update CSS
			TMS.css(domName, {'top': finalY + 'px', 'left': finalX + 'px'});

			// Update Lines
			if (domName !== 'APP_MAP_CANVAS'){
				APP.graphics.updateLines(domName);
			}

		}

		// Stop drag event
		function stopDrag(){
			document.onmouseup = null;
			document.onmousemove = null;
		}

		// On mouse down
		function dragMouseDown(evt){
			evt = evt || window.event;
			evt.preventDefault();
			pos3 = evt.clientX;
			pos4 = evt.clientY;
			document.onmouseup = stopDrag;
			document.onmousemove = dragElement;
		}

		// Check if can enable drag
		if (dList.indexOf(domName) === -1 && elmnt !== null){
			document.getElementById(domName).onmousedown = dragMouseDown;
			APP.graphics.enabledDragList.push(domName);
		}

	},

	// Update lines
	updateLines: function(roomName){

		const lineList = this.addedLines;

		if (Object.keys(lineList).length !== 0){

			// Get default connected lines
			var processList = Object.keys(lineList);

			// Check if room name was provided. If so, update only connected lines
			if (roomName !== void 0){
				processList = Object.keys(lineList).filter(function(cLine){
					if (cLine.indexOf(roomName.replace('ROOM_', '')) !== -1){
						return cLine;
					}
				});
			}

			// Process lines
			processList.forEach(function(cLine){

				// Set variables
				var canvasData = TMS.getRect('APP_MAP_CANVAS'),
					pData = TMS.getRect('ROOM_' + lineList[cLine].p),
					nData = TMS.getRect('ROOM_' + lineList[cLine].n),
					x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
					y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
					x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
					y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

				// Update line
				document.getElementById(cLine).innerHTML = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff"/>';

			});

		}

	},

	// Update player position
	updatePlayerPos: function(){

		// Check if player map history
		if (APP.gameHook.mapHistory.length !== 0){

			Object.keys(this.addedMaps).forEach(function(cMap){
				TMS.removeClass('ROOM_' + cMap, 'PLAYER_PRESENT');
			});

			const newRoomId = 'ROOM_' + APP.gameHook.mapHistory.slice(-1);

			// Add class
			TMS.addClass(newRoomId, 'PLAYER_PRESENT');

			var menuPos = TMS.getRect('MENU_RIGHT'),
				playerRect = TMS.getRect(newRoomId),
				roomData = {
					x: parseFloat(TMS.getCssData(newRoomId, 'left').replace('px', '')),
					y: parseFloat(TMS.getCssData(newRoomId, 'top').replace('px', ''))
				},

				// Calc new pos.
				nextX = parseFloat(roomData.x - (((window.innerWidth / 2) - playerRect.width / 2) - menuPos.width / 2)),
				nextY = parseFloat(roomData.y - ((window.innerHeight / 2) - playerRect.height / 2));

			// Update canvas position
			TMS.css('APP_MAP_CANVAS', {'left': APP.tools.parsePolarity(nextX) + 'px', 'top': APP.tools.parsePolarity(nextY) + 'px'});

		}

	},

	// Toggle drag map
	toggleDragMapCanvas: function(){

		// Declare vars
		var pos = APP.graphics.enabledDragList.indexOf('APP_MAP_CANVAS');

		// Check enable canvas drag
		switch (APP.graphics.enableCanvasDrag){

			case !1:
				TMS.css('APP_MAP_CANVAS', {'cursor': 'move', 'transition-duration': '0s'});
				APP.graphics.enableDrag('APP_MAP_CANVAS');
				APP.graphics.enableCanvasDrag = !0;
				break;

			case !0:
				TMS.css('APP_MAP_CANVAS', {'cursor': 'auto', 'transition-duration': '1s'});
				document.getElementById('APP_MAP_CANVAS').onmousedown = null;
				if (pos !== -1){
					APP.graphics.enabledDragList.splice(pos, 1);
				}
				APP.graphics.enableCanvasDrag = !1;
				break;

		}

		// Update labels
		this.updateGuiLabel();

	}

}