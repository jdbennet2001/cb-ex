var nconf = require('nconf'),
    S = require('string'),
    path = require('path'),
    Promise = require('promise'),
    util = require('util'),
    request = require('request');
var jsonfile = require('jsonfile');
var fs = require('fs');

var CouchDB = require('./CouchInstance');
var cache = new CouchDB('comic_vine_cache');

function ComicVine() {

}

/*
 Get information about a given series
 */
 ComicVine.prototype.getSeriesInfo = function( req, res ){
    //TODO...
 };


/**
 Call ComicVine to get suggestions for a given comic
 **/
ComicVine.prototype.getSuggestions = function(req, res) {

    var query = req.params.query;

    debugger;

    cache.get(query).then(function(data) {
        console.log('Returning query ' + query + ' from cache.');
        res.send(data.results);

    }, function(err) {
        console.log('Empty cache for query ' + query + ', call comic vine.');
        debugger;
        getSuggestionsFromCV(query).then(function(results) {
            cache.insert(query, {results: results});
            res.send(results);
        }, function(err) {
            res.status(500);
        });
    });
};

/*
 Given an issue, find information about its parent series
 */
ComicVine.prototype.series =function( req, res ){

    var id = req.params.id;
    var url = "http://www.comicvine.com/api/volume/4050-" + id + '/';
    var query = "?api_key=fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d&format=json&field_list=publisher,start_year,name";


    var options = {
        url: url + query,
        headers: {
            'User-Agent': 'request'
        }
    };

    request(options, function(error, response, body) {
        var data = JSON.parse(body);
        res.send( data.results );
    });

};




function getSuggestionsFromCV(query) {

    var url = "http://comicvine.gamespot.com/api/search/?api_key=fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d&format=json&resources=issue";
    url = url + "&query=" + encodeURIComponent(query);

    console.log('Querying comic vine for "' + query + '"');

    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    };


    var promise = new Promise(function(resolve, reject) {


        request(options, function(err, response, body) {

            console.log('.. request complete');

            if (typeof body == 'string' && is_json(body)) {
                body = JSON.parse(body);
            } else {
                reject(body);
            }

            var results = body.results.filter(function(result) {
                return result.resource_type == 'issue';
            });

            resolve(results);
        });

    });

    return promise;

}

function is_json(input) {

    var result = false;

    try {
        var json = JSON.parse(input);
        result = true;
    } catch (err) {

    }
    return result;
}


module.exports = new ComicVine();
