var nconf   = require('nconf'),
    S       = require('string'),
    path    = require('path'),
    Promise = require('promise'),
    util    = require('util'),
    request = require('request');
var jsonfile = require('jsonfile');
var fs      = require('fs');

var url = 'http://localhost:5984';
var nano    	= require('nano')(url);


function ComicVine(){
  
}

/**
 Call ComicVine to get suggestions for a given comic
 **/
ComicVine.prototype.getSuggestions =function(req, res){

        var url = "http://comicvine.gamespot.com/api/search/?api_key=fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d&format=json&resources=issue";

        var query = req.params.query;
        // url = url + "&query=" + query;
        url = url + "&query=" + 'flash%2091';

        var key = S(query).replaceAll('%20', '').s;

        console.log( 'Querying comic vine for ' + key );

        var options = {
          url: url,
          headers: {
            'User-Agent': 'request'
          }
        };

        request(options, function(err, response, body ){

            console.log( '.. request complete');

            if ( typeof body == 'string' && is_json(body)){
                body = JSON.parse(body);
            }else{
              res.send(500);
              res.end();
            }

            var results = body.results.filter(function(result){
                return result.resource_type == 'issue';
            });

            res.send(results);

        });

};

function is_json( input ){

    var result = false;

    try{
        var json = JSON.parse(input);
        result = true;
    }catch(err){

    }
    return result;
}


module.exports = new ComicVine();
