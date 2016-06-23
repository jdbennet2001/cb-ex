/*
 Sequential execution of asynchronous operations
 */
var Promise = require('promise');

function promise_loop(){

}

/*
 Execute a given callback for each item in an array.

 Each item is processed in sequence.
 The callback must return a promise.

 @returns: A promise that completes when all items have been processed.
 */
promise_loop.prototype.array = function( items, callback ){

  var promise = array.reduce( function(previous, next ){
    return previous.then(function(result){
      return callback(next);
    });
  }, Promise.resolve() );

  return promise;

};

module.exports = new promise_loop();
