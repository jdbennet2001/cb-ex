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
    http = require('http');


//Configuration settings
    nconf.file('./config/config.json');
var source_dir = nconf.get('source_dir');
var target_dir = nconf.get('target_dir');

var Catalog = require('./modules/Catalog');


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

// Catalog.update();

// Start server
http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
});









