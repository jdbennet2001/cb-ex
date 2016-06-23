

//Display list of queued Comics
$.getJSON('/downloads', function(data) {
    data.forEach(function(entry){
           $('.queue').queuedComic(entry);
    });
});


//Watch for selection change events
var queue = document.querySelector('.queue');
queue.addEventListener("selection", function(e) {

  debugger;

	console.info("Event is: ", e);
	console.info("Model data is: ", e.detail);

  //Clear the suggestion area
  $('.candidates').empty();

  //Display new suggestions
  get_suggestions( e.detail.series, e.detail.number, e.detail.year);

});

function get_suggestions(series, number, year) {

    var filters = ['ECC Ediciones', 'Panini Comics', 'Planeta DeAgostini'];

    var search = '/comicvine/suggestions/' + series + ' ' + number;
    var url = encodeURI(search);

    // display_running_icon();

    if ( window.currentAJAX ){
        window.currentAJAX.abort();
    }

    //Get the suggestions
    window.currentAJAX =$.getJSON(url, function(data) {


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

        //Sort by popularity
        data = data.sort(function(a, b) {
            var aPop = a.popularity || 0;
            var bPop = b.popularity || 0;
            return bPop - aPop;
        });

        //Save the suggestions to the internal model
        data.forEach(function(entry, index) {
            $('.candidates').suggestion( entry );
        });


    }.bind(this));

}
