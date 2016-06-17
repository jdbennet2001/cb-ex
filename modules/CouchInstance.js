var request = require('request');
var nconf 	= require('nconf');
var Promise = require('promise');
var util 	= require('util');
var fs 		= require('fs');
var S       = require('string');

var url = 'http://localhost:5984';
var nano    = require('nano')(url);


function CouchInstance(database_name){

	//Connect to the database
	this.database_name = database_name;
	this.connection = init_db(database_name);

}




/*
 Insert a record into the specified database. Updates an existing record if necessary.
 */
CouchInstance.prototype.insert = function(key, data ){

	//Save the data index for later use
	data._id = key;
	var connection = this.connection;

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection){
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
 Insert a record into the specified database. Updates an existing record if necessary.
 */
CouchInstance.prototype.delete = function(key, rev){


	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection){
			connection.destroy( key, rev, function(err, body){
				if (err){
					reject(err);
				}else{
					resolve(body);
				}
			});
		});

	});

	return promise;

};

/*
 Check if a document with a specified key exists in the database.
 */
CouchInstance.prototype.exists = function(key){

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection){
			connection.head( key, function(err,body){
				if (err ){
					reject(err);
				}
				else{
					resolve(body);
				}
			});
		});

	});
	return promise;

};

/*
 Upload a file to the database
 */
CouchInstance.prototype.upload = function(key, location ){

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection){

			fs.readFile(location, function(err, data) {
			    connection.attachment.insert(key, key, data, 'image/jpg', function(err, body){
			    	if ( err ){
			    		reject(err);
			    	}
			    	else{
			    		resolve(body);
			    	}
			    });
			});

		});

	});

	return promise;

};

CouchInstance.prototype.addView = function(design_doc_name, view_name, map_function) {

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection) {

			var vn = view_name;
			var view = { "views": {} };
			view.views[view_name] = { 'map' : map_function };

			connection.insert( view, design_doc_name, function(error, response) {
									console.log("View: " + view_name + ", added.");
									resolve(response);
								});
			});
	});

	return promise;
};

/*
 Query a view to find documents with a specific key:
 @param: database name
 @param: design document name (do not include the '_design/' prefix)
 @param: view name
 @param: keys used when filtering results. Example: { keys: ['term1'] }
 @return: An array of: { _id: .., key: ..., value:...} objects
 */
CouchInstance.prototype.queryView = function(design_doc_name, view_name, params ){

	var connection = this.connection;

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection) {

			connection.view(design_doc_name, view_name, params, function(err, body) {
				if ( err ){
					reject(err);
				}else{
					if ( body.rows && body.rows.length === 1){
						resolve( body.rows[0].value );
					}else{
						resolve(body.rows);
					}
				}
			});
		});
	});
};


/**
 Return all documents in a given database
 **/
CouchInstance.prototype.all = function( database ){

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection) {
			connection.list(function(err, body) {
				if (err){
					reject(err);
				}
				else{
					resolve(body.rows);
				}
			});
		});

	});

	return promise;

};

/**
 Return a set of documents for a  given database.

 Differs from CouchIntance.all by allowing a limit and skip value for pagination
 **/
CouchInstance.prototype.list = function(skip, limit ){

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection) {
			connection.list( {include_docs: true, skip:skip, limit: limit, descending: true}, function(err, body) {
				if (err){
					reject(err);
				}
				else{
					resolve(body);
				}
			});
		});

	});

	return promise;

};

CouchInstance.prototype.compact = function( ){

	var promise = new Promise(function(resolve, reject) {
		nano.db.compact(database, function(err, body){
			if (err){
				reject(err);
			}
			else{
				resolve(body);
			}
		});
	});

	return promise;

};

/*
 Wath a data base for changes
 */
CouchInstance.prototype.follow = function( callback ){

	this.following.push(callback);

};


/*
 Generate a database connection (create the database if necessary)
 Returns a promise, with the database connection.
 */
function init_db( database ){

	var promise = new Promise(function(resolve, reject) {

		nano.db.list(function(err, body) {

			if ( err ){
				return reject(err);
			}
			else if ( body.indexOf(database) > -1 ){
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


module.exports =  CouchInstance;
