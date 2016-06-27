
//Display list of queued Comics
$.getJSON('/downloads', function(data) {
    data.forEach(function(entry){
           $('.queue').queuedComic(entry);
    });
});

/*
 Update the index...
 */
$('#update-catalog-action').click(function(){
    $.get('/index/update',function(){});
});

/*
 Cache information for all pending comicss
 */
 $.getScript('/js/actions/action-cache.js');
 $('#cache-action').click(function(){

   //Get the model for each queued issue.
   var models = [];
   $('.comic').each(function(comic){
      var model = $(this).data('model');
      models.push( model );
   });

   //Filter out anything without a year and number
   models = models.filter(function(model){
     var year = model.year ? model.year.trim() : undefined;
     var number = model.number ? model.number.trim() : undefined;
     return (year && number );
   });

    var action = new cache_action();
    action.run(models);

 });

/*
 Import a comic into the catalog
 */
 $.getScript('/js/actions/action-file.js');
 $('#import-action').click(function(){

   var queued = $('.queue .selected');
   var selected = $('.candidates .selected');


   if ( queued.length === 0 || selected.length === 0 ){
     return;
   }

   var action = new file_action();
   var p = action.run(queued.data('model'), selected.data('model') );

   p.then(function(){
     $('.selected').remove();
   }, function(err){
     console.log( 'Error filing issue: ' + err );
   });

 });

/*
 -------- Search Dialog -----------
 */
 $.getScript('/js/actions/action-search.js');
 $('#search-action').click(function(){

   var selected = $('.queue .selected');
   if ( selected.length === 0 ){
     return;
   }

   var action = new search_action();
   action.run(selected.data('model'));
 });

/*
 Selection change event
 */
$.getScript('/js/actions/action-suggestions.js');
var queue = document.querySelector('.queue');
queue.addEventListener("selection", function(e) {

  debugger;

	console.info("Event is: ", e);
	console.info("Model data is: ", e.detail);

  var action = new action_suggestions();
  action.run( e.detail.series, e.detail.number, e.detail.year );

});
