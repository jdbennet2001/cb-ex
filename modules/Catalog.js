/* Wrapper code for the key/value catalog used to index the catalog */
var walk    = require('walkdir');
var fs      = require('fs');
var fse 	= require('fs-extra');
var nconf   = require('nconf');

var S       = require('string');
var path    = require('path');
var Promise = require('promise');
var mv      = require('mv');

var CouchInstance 	= require('./CouchInstance');
var Archive 		= require('./Archive');
var index       = require('./Index.js');

var source_dir = nconf.get('source_dir');
var target_dir = nconf.get('target_dir');


var CouchDB = require('./CouchInstance');

//Various tables in CouchDB
var issue_cache = new CouchDB('issues');
var folder_cache =  new CouchDB('folders');
var series_cache = new CouchDB('series');
var covers_cache = new CouchDB('covers');

var issues = [];
var folders = [];

function Catalog(){

  /*
   Group folders / issues by directory for easier browsing
   */
  folder_cache.addView('_design/browse', 'directory_contents', function(doc) {
      emit(doc.parent, doc.folder);
  });

  issue_cache.addView('_design/browse', 'directory_contents', function(doc){
      emit(doc.directory, doc);
  });

  folder_cache.contents().then(function(contents){
      folders = contents;
      console.log( folders.length + ', folders cached.');
  });

  issue_cache.contents().then(function(contents){
      issues = contents;
      console.log( issues.length + ', issues cached.');
  });

}

Catalog.prototype.series = function(req, res){
    var id = req.params.id;


    series_cache.get(id).then(function(result){
      res.json(result);
    },function(err){
      res.send(500);
    });

};

/*
 Walk existing titles to see if a new folder should be inserted into an existing title.
 */
Catalog.prototype.folder_location = function(req, res){

  var series = req.query.filter;

  debugger;

  var title = folders.find(function(folder){
      return S(series).contains(folder.name);
  });

  if ( title ){
    res.json(title);
  }else{
    res.send(404);
  }


};

Catalog.prototype.random = function(req, res){

  var results = { folders: [], issues: [] };

  for ( var i = 0; i < 25; i++ ){
    var item = issues[Math.floor(Math.random()*issues.length)];
    var record = JSON.parse(JSON.stringify(item));
    record.location = target_dir + record.location;
    results.issues.push( {value: record});
  }

  res.json(results);
};

/*
 Return all entries in a given directory
 */
Catalog.prototype.directory_contents = function(req, res){

  var results = {};

  var directory = S(decodeURIComponent(req.url)).chompLeft('/catalog/directory').s || "";

  folder_cache.queryView('browse', 'directory_contents', directory).then(function(folders){
    results.folders = folders;
    return issue_cache.queryView('browse', 'directory_contents', directory);
  }).then(function(issues){
    issues.forEach(function(issue){
        //Comic viewer uses absolute paths
        issue.value.location = target_dir + issue.value.location;
    });
    results.issues = issues;
    res.json(results);
  }, function(err){
    return res.sendStatus(500);
  });

};

Catalog.prototype.cover = function(req, res){

  debugger;
  var name = decodeURIComponent(S(req.url).chompLeft('/catalog/cover/').s);


  covers_cache.getAttachment(name).then(function(data){
    res.contentType('image/jpeg');
    res.end(data, 'binary');
  }, function(err){
    res.sendFile( process.cwd() + '/public/icons/balloon.png');
  });

};

Catalog.prototype.insert = function(req, res){

  var model = req.body;

  //Move file
  var target =  path.join(target_dir, model.directory, model.name);

  console.log( 'Copying ' + model.name + ' to ' + target );

  mv(model.source, target, {mkdirp: true},  function(err) {
      if ( err ){
        console.log('Error: ' + err + ' for: ' + model.source + " to " + target );
        return res.status(500).send(err);
      }

      console.log('Copy complete..');

      res.send(200);

      //Update various caches, if necessary
      series_cache.insert(model.series, { index: model.series, path: model.directory } );

      issue_cache.insert(target, { directory: model.directory, name: model.name, location: target});

      //Extract cover into catalog
      index.indexCover(target);

  });



};

module.exports = new Catalog();
