var child_process = require('child_process');
var crc 	= require('crc');
var fs 		= require('fs');
var fse 	= require('fs-extra');
var path 	= require('path');
var S    	= require('string');


function Archive(filepath){
	this.path = filepath;
	this.project_directory =  path.join( __dirname, '/../');
	this.tmp_directory = path.join( __dirname, '/../public/tmp');
	this.issue_name = S(path.basename(filepath)).chompRight(path.extname(filepath)).s;
}

Archive.prototype.extract = function(target_dir){

	var file = this.path;
	var type = this.type();

	var target  = target_dir || this.tmp_directory;

	fse.emptyDirSync(target_dir);

	var result;
	console.log( 'Extracting ' + file + ", to " + target_dir +', with extension ' + type );

	if ( type == 'cbt'){
	 	result = child_process.spawnSync( '/usr/bin/tar', [ '-xvf', file ], { 'cwd': target_dir } );
	}
	else if( type == 'cbz' ){
	 	result = child_process.spawnSync( '/usr/bin/unzip', [ '-j', file ], { 'cwd': target_dir } );
	}
	else{
    	result = child_process.spawnSync( 'unrar', [ 'e', file ], { 'cwd': target_dir } );
	}

	if ( type === 'cbr' && result.status == 10 ){
	 	result = child_process.spawnSync( '/usr/bin/unzip', [ '-j', file ], { 'cwd': target_dir } );
	}

	if ( result.stderr.toString() ){
		console.log( '.. stderr: ' + result.stderr.toString());
	}
	else{
		console.log( '.. sdtout: ' + result.stdout.toString() );
	}

	return target_dir;

};

/*
 Return the address of the cover
 */
Archive.prototype.extractCover = function(){

	//Wipe the temporary directory
	fse.emptyDirSync(this.tmp_directory);

	var target = path.join(this.project_directory, 'public/covers', this.issue_name + ".jpg");

	if ( !fs.existsSync( target ) ){

		//Extract the files to a temporary directory
		this.extract(this.tmp_directory);

		//Get the list
		var files = fs.readdirSync( this.tmp_directory );

		//Filter out non-jpg files.
		files = files.filter( function( file ){
			var extname = path.extname(file).toLowerCase();
			if ( extname != '.jpg' && extname != '.png' && extname != '.jpeg' && extname != '.gif' && extname != '.webp')
				return false;
			else
				return true;

		});

		if ( files.length === 0 ){
			return;
		}

		//Copy files
		var source = path.join( this.tmp_directory, files[0] );
		fse.copySync( source, target );

		//Resize
		try{
	    	result = child_process.spawnSync( 'sips', [ '-Z', 512, path.basename(target)  ], { 'cwd': path.dirname(target)  } );
    	}
    	catch( err ){
    		console.error( 'Resize failure: ' + err.message );
    	}


	}else{
		//console.log( 'Cover already exists, skip');
	}


	//Add done, clean up
	fse.emptyDirSync(this.tmp_directory);

	return target;

};



/*
 Return a list of all files in the Archive.
 */
Archive.prototype.contents = function(){

};


/*
 Return cbz or cbr as the Archive type.
 */
Archive.prototype.type = function(){

		var extname = path.extname(this.path).toLowerCase();
		extname = extname.replace('.', '' );

		return extname;

};

module.exports = Archive;
