/*
 A FIFO Queuing system based on CouchDB
 */

var couchDB = require('./CouchInstance');

var keys = [];

 function CouchQueue(db){
   //Attach to Queue

   //Get keys
 }

 CouchQueue.prototype.push = function( item ){

   //Insert new item into queue

 };

 CouchQueue.prototype.pop = function(){

   var key = keys.pop();

   //Couch DB -> get key / item

   //return item;

 };

 module.exports = CouchQueue;
