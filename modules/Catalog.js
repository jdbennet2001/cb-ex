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


var CouchDB = require('./CouchInstance');

//Various tables in CouchDB
var issue_cache = new CouchDB('issues');
var folder_cache =  new CouchDB('folders');
var series_cache = new CouchDB('series');
var covers_cache = new CouchDB('covers');

var promise_loop = require('../npm_local/promise_loop');

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

function isComicFolder(filename){
	//Skip metadata
    if ( S(filename).contains('metadata') ){
      return false;
    }

    //Skip mac index files
    else if ( S(path.basename(filename)).startsWith('.')){
      return false;
    }
    else{
    	return true;
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

  var keys = Object.keys(issue);

  var p = promise_loop.array(keys,function(key){
      return update_cover(key);
  });

	p.then( function(){
		console.log( 'Finished updating covers.');
	} );

  return p;
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

/*
 @input: An JSON object containing all ComicVine series found in the catalog.
         Format: { series # : location }
 */
function update_series( series ){

  //Find folder, relative to target directory
  var entries = Object.keys(series).map(function(key){
    var location = series[key];
    var entry = {
        path: S(location).chompLeft(target_dir).s,
        index: key
    };
    return entry;
  });

  //Insert data, sequentially, into the cache
  var promise = promise_loop.array( entries, function(folder){
                  series_cache.insert(folder.index, folder);
                });

  //All done...
	promise.then( function(){
		console.log( 'Finished updating series.');
	} );

  return promise;

}

function update_folders(folders){

  //Find folder, relative to target directory
  var entries = folders.map(function(folder){

      var entry = {
        folder : S(folder).chompLeft(target_dir).s,
        parent : path.dirname(folder)
      };

      return entry;
  });

  //Insert data, sequentially, into the cache
  var promise = promise_loop.array( entries, function(entry){
                  folder_cache.insert(entry.folder, entry);
                });

	promise.then( function(){
		console.log( 'Finished updating folders.');
	});

  	return promise;
}


/*
 Walk the file system, rebuilding the catalog for all files.
 */
Catalog.prototype.update = function(){

	var emitter = walk(target_dir);

	var archives = {};
	var series = {};
	var folders = [];

	emitter.on('file',function(filename,stat){
		if ( isArchive(filename) ){
			console.log( ' .. archive: ' + filename );
			archives[filename] = stat;
		}
	});

	emitter.on('directory',function(filename,stat){
		if ( isSeriesFolder(filename) && isComicFolder(filename)){
			console.log( ' .. series: ' + filename );
			var index =  S(filename).between('(', ')' ).s;
			series[index] = filename;
		}
		if (isComicFolder(filename) ){
			folders.push(filename);
		}
	});

	emitter.on('end', function() {
  		console.log( 'Done!');
  		console.log( 'Archives: ' + Object.keys(archives).length + ", series: " + Object.keys(series).length + ", folders: " + folders.length  );


  		update_issues( archives ).then(function(){
  			debugger;
  			return update_series(series);
  		}).then(function(){
	  		return update_covers( archives );
  		}).then( function(){
  			return update_folders(folders);
  		}).then(function(){
  			console.log( 'CouchDB ready to go!');
  		});
  	});

};


module.exports = new Catalog();
