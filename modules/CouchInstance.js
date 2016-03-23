var request = require('request');
var nconf 	= require('nconf');
var Promise = require('promise');
var util 	= require('util');
var fs 		= require('fs');
var nano 	= require('nano')('http://localhost:5984');

/* Map of connections names to connection objects (wrapped in Promise objects) */
var connections = {};

function CouchInstance(databases){

	databases.forEach( function(database){
		connections[database] =init_db(database);
	});

}



/*
 Insert a record into the specified database. Updates an existing record if necessary.
 */
CouchInstance.prototype.insert = function(database, key, data ){

	//Save the data index for later use
	data._id = key;

	var promise = new Promise(function(resolve, reject) {

		connections[database].then(function(connection){
			add_rev(connection, key, data).then(function(data){
				return insert_document(connection,data);
			}).then(function(body){
				resolve(body);
			},function(err){
				reject(err);
			});
		});

	});

	return promise;

};

/*
 Check if a document with a specified key exists in the database.
 */
CouchInstance.prototype.exists = function(database, key){

	var promise = new Promise(function(resolve, reject) {

		connections[database].then(function(connection){
			connection.head( key, function(err,body){
				if (err )
					reject(err);
				else
					resolve(body);
			});
		});

	});
	return promise;

};

/*
 Upload a file to the database
 */
CouchInstance.prototype.upload = function( database, key, location ){

	var promise = new Promise(function(resolve, reject) {

		connections[database].then(function(connection){

			fs.readFile(location, function(err, data) {
			    connection.attachment.insert(key, key, data, 'image/jpg', function(err, body){
			    	if ( err )
			    		reject(err);
			    	else
			    		resolve(body);
			    });
			});

		});

	});

	return promise;

};

CouchInstance.prototype.addView = function(database, view_name, design_doc_name, map_function) {

	var promise = new Promise(function(resolve, reject) {

		connections[database].then(function(connection) {

			connection.insert({
				"views": { "directory_contents": {
						"map": function(doc) {
							if ( doc.directory && doc.name ){
								emit(doc.directory, doc.name);
							}
						}
					}
				}
			}, '_design/people', function(error, response) {
				console.log("yay");
				resolve(response);
			});
		});
	});

	return promise;
};


/*
 Generate a database connection (create the database if necessary)
 Returns a promise, with the database connection. 
 */
function init_db( database ){

	var promise = new Promise(function(resolve, reject) {

		nano.db.list(function(err, body) {
			if ( body.indexOf(database) > -1 ){
				console.log( 'Connected to existing database: ' + database );
				resolve( nano.db.use(database) );
			}else{
				nano.db.create(database, function(err, body) {
					if ( err ){
						console.log( 'Error connecting to database: ' + database + ', error is: ' + util.inspect(err) );
						reject(err);
					}
					console.log( 'Connected to new database: ' + database );
					resolve( nano.db.use(database) );
				});
			}
		});

	});
	return promise;
}

/*
 Insert document, with index and revision, to the database
 */
function insert_document( connection, data ){

	var promise = new Promise(function(resolve, reject) {

		connection.insert(data, function(err, body){
			if ( err ){
				reject(err);
			}else{
				resolve(body);
			}
		});
	});
	return promise;

}

/*
 Add revision information to a record prior to writing to the back end.
 */
function add_rev(connection, key, data){

		var promise = new Promise(function(resolve, reject) {

			connection.get(key, { revs_info: true }, function(err, body){
				if ( err ){
					resolve( data );
				}else{
					data._rev = body._rev;
					resolve(data);
				}
			});

		});
		return promise;
}


CouchInstance.prototype.allocate = function(database){

};

/* 
 Drop a database
 */
CouchInstance.prototype.drop = function(database){

			var promise = new Promise(function(resolve, reject) {

			});
			return promise;

};

module.exports =  CouchInstance;
