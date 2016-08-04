 request 	= require('request');
var nconf 		= require('nconf');
var Promise 	= require('promise');
var util 			= require('util');
var fs 				= require('fs');
var S       	= require('string');

var url = 'http://localhost:5984';
var nano    	= require('nano')(url);


function CouchInstance(database_name){

	//Connect to the database
	this.database_name = database_name;
	this.connection = init_db(database_name);

}

CouchInstance.prototype.addView = function(design_doc_name, view_name, map_function) {

	var connection = this.connection;

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

CouchInstance.prototype.keys = function() {

	var doc_url = url + '/' +  this.database_name + '/_all_docs';

  var p = new Promise(function(resolve, reject) {

    request(doc_url, function(error, response, body) {

			if ( error || response.statusCode !== 200){
				return reject(error);
			}

			var rows =  JSON.parse(body).rows;
			var keys = rows.map(function(row){
					return row.id;
			});

      resolve(keys);
      console.log(keys.length + ' keys found.');
		});

  });

  return p;

};


CouchInstance.prototype.contents = function() {

	var db_name = this.database_name;
	var doc_url = url + '/' +  this.database_name + '/_all_docs?include_docs=true';

  var p = new Promise(function(resolve, reject) {

    request(doc_url, function(error, response, body) {

			if ( error || response.statusCode !== 200){
				return reject(error);
			}

			var rows =  JSON.parse(body).rows;
			rows = rows.map(function(row){
				return row.doc;
			});

      resolve(rows);
      console.log('Contents for db: ' + db_name + ', ' + rows.length + ' rows found.');
		});

  });

  return p;

};


/*
 Query a view to find documents with a specific key:
 @param: database name
 @param: design document name (do not include the '_design/' prefix)
 @param: view name
 @param: key used when filtering the results
 @return: An array of: { _id: .., key: ..., value:...} objects
 */
CouchInstance.prototype.queryView = function(design_doc_name, view_name, params ){

	var connection = this.connection;

	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection) {
			connection.view(design_doc_name, view_name, { keys: [params]}, function(err, body) {
				if ( err ){
					return reject(err);
				}
 				resolve(body.rows);
			});

		});
	});

	return promise;

};


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

CouchInstance.prototype.get = function(key) {

    var connection = this.connection;

    var promise = new Promise(function(resolve, reject) {

        connection.then(function(database) {
					database.get(key, function(err, body){
						if ( err ){
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

	var connection = this.connection;

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

	var connection = this.connection;

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

/*
 Grab and attachment from the database
 */
 /*
 Upload a file to the database
 */
CouchInstance.prototype.getAttachment = function(key, location ){

	var connection = this.connection;


	var promise = new Promise(function(resolve, reject) {

		connection.then(function(connection){

			connection.attachment.get(key, key, function(err, body){
				if ( err ){
					return reject(err);
				}
				resolve( body );

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
