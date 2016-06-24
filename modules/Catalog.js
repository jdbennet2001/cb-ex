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

var source_dir = nconf.get('source_dir');
var target_dir = nconf.get('target_dir');


var CouchDB = require('./CouchInstance');

//Various tables in CouchDB
var issue_cache = new CouchDB('issues');
var folder_cache =  new CouchDB('folders');
var series_cache = new CouchDB('series');
var covers_cache = new CouchDB('covers');

function Catalog(){

}

Catalog.prototype.series = function(req, res){
    var id = req.params.id;


    series_cache.get(id).then(function(result){
      res.json(result);
    },function(err){
      res.send(500);
    });

};

Catalog.prototype.insert = function(req, res){

  var model = req.body;

  //Move file
  mv(model.source, path.join(model.directory, name), function(err) {
      if ( err ){
        return res.stats(500).send(err);
      }

      res.status(200);

      //Update various caches, if necessary

      //Extract cover into catalog      

  });



};

module.exports = new Catalog();
