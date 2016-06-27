    var express = require('express'),
    dust = require('dustjs-linkedin'),
    helpers = require('dustjs-helpers'),
    cons = require('consolidate'),
    path = require('path'),
    util = require( 'util'),
    request = require('request'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    serveStatic = require('serve-static'),
    compress = require('compression'),
    nconf = require('nconf'),
    S = require('string'),
    jf = require('jsonfile'),
    Promise = require('promise'),
    http = require('http'),
    fs = require('fs');


//Configuration settings
    nconf.file('./config/config.json');
var source_dir = nconf.get('source_dir');
var target_dir = nconf.get('target_dir');



//Fire up express
var app = express();
app.engine('dust', cons.dust);
app.set('views', __dirname + '/views');
app.set('view engine', 'dust');

app.use(serveStatic(path.join(__dirname, 'public')));
app.use(bodyParser());

//Listen on...
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3810);

// Start server
http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
});

/*   --------------------- Download APIs --------------------- */
var downloads = require('./modules/Downloads');

//Get list of comics that need to be filed
app.get('/downloads', function(req, res){
    var comics = downloads.issues();
    res.json(comics);
    res.end();
});

//Return the cover for a downloaded issue.
app.get('/downloads/covers/:cover', function(req, res){
   downloads.cover(req, res);
 });

 /*   --------------------- ComicVine APIs --------------------- */
 var comicVine = require('./modules/ComicVine');
 app.get('/comicvine/suggestions/:query', function(req,res){
    comicVine.getSuggestions(req,res);
 });

 //Get information about a given series
 app.get('/comicvine/series/:id', function(req,res){
    comicVine.series(req,res);
 });

 /*   ------------ Catalog (CouchDB) Infrastructure ------------- */
 var index = require('./modules/Index');
 app.get('/index/update',function(req,res){
   debugger;
    index.update();
    res.send(200);
 });

 var catalog = require('./modules/Catalog');
 //Return information about a given series, if present
 app.get('/catalog/series/:id', function(req, res){
   catalog.series(req,res);
 });

 //Insert an archive into the catalog
 app.post('/catalog/insert', function(req, res){
   debugger;
   catalog.insert(req, res);
 });
