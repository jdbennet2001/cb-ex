var util 			= require('util');
var fs 				= require('fs');
var S       	= require('string');

var url = 'http://localhost:5984';
var nano    	= require('nano')(url);

function Cache(db_name){

}

Cache.prototype.get = function(key){

  nano.get(key, function(err, body) {
    if (!err)
      console.log(body);
  });

};

Cache.prototype.set = function(key){

  nano.insert(data, key, function(err, body) {
    if (!err)
      console.log(body);
  });

};

module.exports = new Cache();
