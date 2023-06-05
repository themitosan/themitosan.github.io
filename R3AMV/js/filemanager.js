/*
	R3 Auto Map View
	filemanager.js
*/

temp_FILEMANAGER = {

	// Select file
	selectFile: function(ext, callback){

		// Check if data was provided
		if (ext !== void 0 && typeof callback === 'function'){

			// Check for extension
			if (ext === ''){
				ext = '*.*';
			}

			// Reset file loader
			document.getElementById('APP_FILE_LOADER').value = '';
			document.getElementById('APP_FILE_LOADER').files = null;
			document.getElementById('APP_FILE_LOADER').accept = ext;

			// Call load file popup
			TMS.triggerClick('APP_FILE_LOADER');

			// Start read
			document.getElementById('APP_FILE_LOADER').onchange = function(){
				callback(document.getElementById('APP_FILE_LOADER').files[0]);
			}

		}

	}

}