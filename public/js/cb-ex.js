
//Display list of queued Comics
$.getJSON('/downloads', function(data) {
    data.forEach(function(entry){
           $('.queue').queuedComic(entry);
    });
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
 Selection change event
 */
var queue = document.querySelector('.queue');
queue.addEventListener("selection", function(e) {

	console.info("Event is: ", e);
	console.info("Model data is: ", e.detail);

  //Clear the suggestion area
  $('.candidates').empty();

  $('body').spinner('Loading...');

  //Display new suggestions
  var p = get_suggestions( e.detail.series, e.detail.number, e.detail.year);

  p.then(function(result){
    $('.jqSpinnerDialog').remove();
  },function(err){
    $('.jqSpinnerDialog').remove();
    console.log('Error retrieving data: ' + err );
  });

});

function get_suggestions(series, number, year) {

    var filters = ['ECC Ediciones', 'Panini Comics', 'Planeta DeAgostini'];

    var search = '/comicvine/suggestions/' + series;
    if ( number && S(number).isNumeric() ){
      search += ' ' + S(number).toInt();
    }
    var url = encodeURI(search);

    // display_running_icon();

    if ( window.currentAJAX ){
        window.currentAJAX.abort();
    }

    //Get the suggestions
    var p = window.currentAJAX =$.getJSON(url, function(data) {


        window.currentAJAX = undefined;

        data = data.filter( function(entry){
            return (entry.resource_type == 'issue');
        });

        //Remove empty entries
        data = data.filter(function(entry) {
            return !!entry;
        });

        //Filter out known, useless, companies
        data = data.filter(function(entry) {
            var company = entry.company;
            if (filters.indexOf(company) > -1)
                return false;
            else
                return true;
        });


        //Sort by popularity
        data = data.sort(function(a, b) {
            var aPop = a.popularity || 0;
            var bPop = b.popularity || 0;
            return bPop - aPop;
        });

        //And year...
        data = data.sort(function(a, b) {
            var aPop = a.cover_date || 0;
            var bPop = b.cover_date || 0;
            return bPop - aPop;
        });

        var candidates = JSON.parse(JSON.stringify(data));


        //TODO: Filter out by year
        data = data.filter(function(entry) {

            if (!year)
                return true;

            var cover_date = entry.cover_date;
            if (!cover_date) {
                return false;
            } else if (cover_date.indexOf(year) > -1) {
                return true;
            } else {
                return false;
            }
        });

        //Empty matches, ignore that filter..
        data = data.length ? data : candidates;

        //TODO: Filter out issue
        data = data.filter(function(entry) {

            if (!number)
                return true;

            var issue_number = entry.issue_number;
            if (!issue_number) {
                return true;
            } else if (parseInt(number, 10) == issue_number) {
                return true;
            } else {
                return false;
            }
        });

        //Empty matches, ignore that filter..
        data = data.length ? data : candidates;

        //Save the suggestions to the internal model
        data.forEach(function(entry, index) {
            $('.candidates').suggestion( entry );
        });


    }.bind(this));

    return p;

}
