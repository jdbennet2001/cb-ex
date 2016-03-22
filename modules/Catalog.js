/* Wrapper code for the key/value catalog used to index the catalog */
var walk    = require('walkdir');
var fs      = require('fs');
var fse 	= require('fs-extra');
var nconf   = require('nconf');

var S       = require('string');
var path    = require('path');
var Promise = require('promise');

var CouchInstance 	= require('./CouchInstance');
var Archive 		= require('./Archive');

var source_dir = nconf.get('source_dir');
var target_dir = nconf.get('target_dir');

var couchDB = new CouchInstance( ['issues', 'folders', 'covers'] );

function Catalog(){

}

function isArchive(filename){

    //Skip metadata
    if ( S(filename).contains('metadata') ){
      return false;
    }

    //Skip mac index files
    else if ( S(path.basename(filename)).startsWith('.')){
      return false;
    }

	var extension = path.extname( filename.toLowerCase() );
	if ( extension == '.cbr' || extension === '.cbt' || extension == '.cbz'){
		return true;
	}
	else{
		return false;
	}
}

function isCover( filename ){

	var extension = path.extname( filename.toLowerCase() );
	if ( extension == '.jpg' || extension === '.png' || extension == '.jpeg'){
		return true;
	}
	else{
		return false;
	}	
}

function isSeriesFolder(filename){

	var index = S(filename).between('(', ')' ).s;
	if ( S(index).isNumeric() && index.length > 0 ){
		return true;
	}
	else{
		return false;
	}
}

function getArchiveSummary( filename, stat ){

    var record = {
      size: stat.size,
      name: path.basename(filename),
      location : S(filename).chompLeft(target_dir).s,
      directory: S(filename).chompLeft(target_dir).chompRight(path.basename(filename)).s
    };

    return record;
}

function update_issues( issues ){

	var counter = 0;

	var promise = Object.keys(issues).reduce(

		function(previous, next) {
			return previous.then(function(result) {
				var record = getArchiveSummary( next, issues[next] );
				console.log('.. adding ' + next);
				counter++;
				return couchDB.insert('issues', next, record);
			});

		}, Promise.resolve());

	promise.then( function(){
		console.log( 'Finished updating issues.');
	} );

  	return promise;
}

function update_covers( issues ){

	debugger;

	var promise = Object.keys(issues).reduce(

		function(previous, next) {
			return previous.then(function(result) {
				return update_cover(next);
			});

		}, Promise.resolve());

	promise.then( function(){
		console.log( 'Finished updating covers.');
	} );

  	return promise;
}

function update_cover( filename ){

	var promise = new Promise(function(resolve, reject) {

		var key = path.basename(filename);

		//Cover in database? 
		couchDB.exists('covers', key).then(function(body) {

			console.log('Processing cover for : ' + path.basename(filename) + ' ... skipped.');
			resolve( body );

		}, function(err) {
			
			//No?, generate a thumbnail
			var archive = new Archive(filename);
			var cover = archive.extractCover();

				if ( !cover ){
					return resolve('- no cover -');
				}

				console.log( 'Uploading cover: ' + path.basename(cover) );

				//Upload it..
				couchDB.upload('covers',key, cover).then(function(body){
					var tmp_directory = path.join( __dirname, '/../public/tmp');
					fse.emptyDirSync(tmp_directory); 
					resolve(body);

				},function(err){
					debugger;
					resolve(err);
				});
	

		});

	});

	return promise;
}

function update_series( series ){

}


/*
 Walk the file system, rebuilding the catalog for all files.
 */
Catalog.prototype.update = function(){

	var emitter = walk(target_dir);

	var archives = {};
	var series = {};
	var covers = {};


	emitter.on('file',function(filename,stat){
		if ( isCover(filename) ){
			console.log( ' .. cover: ' + filename );
			covers[path.basename(filename)] = filename;
		}else if ( isArchive(filename) ){
			console.log( ' .. archive: ' + filename );
			archives[filename] = stat;
		}
	});

	emitter.on('directory',function(filename,stat){
		if ( isSeriesFolder(filename) ){
			console.log( ' .. series: ' + filename );
			var index =  S(filename).between('(', ')' ).s;
			series[index] = filename;
		}
	});

	emitter.on('end', function() {
  		console.log( 'Done!');
  		console.log( 'Archives: ' + Object.keys(archives).length + ", series: " + Object.keys(series).length + ", covers: " + Object.keys(covers).length  );


  		// update_issues( archives );
  		// update_series( series );
  		update_covers( archives );
  	});

};

module.exports = new Catalog();