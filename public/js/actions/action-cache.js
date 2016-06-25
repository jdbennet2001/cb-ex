/*
 Upate the cache used to store information about comics waiting to be filed.
 */
function cache_action(){

  this.foo = 4;

}

function cache_action_get(model){

  var search = '/comicvine/suggestions/' + model.series;
  if ( model.number && S(model.number).isNumeric() ){
    search += ' ' + S(model.number).toInt();
  }

  var jqxhr = $.get(search);

  jqxhr.then(function(data){
      console.log('Got data: ' + data );
  });

  return jqxhr;
}

cache_action.prototype.run = function(models){


  var promise = models.reduce( function(previous, next, index, array ){
    return previous.then(function(result){
      console.log( 'Processing item ' + index + ' of ' + array.length );
      $('.status').text(index + '/' + array.length );
      return cache_action_get(next);
    });
  }, Promise.resolve() );

  promise.then(function(){
      $('.status').text('--');
      console.log( 'All items processed.');
  });

  return promise;

};
