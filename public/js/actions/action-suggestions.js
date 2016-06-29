function action_suggestions(){

}

action_suggestions.prototype.run = function(series, number, year){

  //Clear the suggestion area
  $('.candidates').empty();

  $('body').spinner('Loading...');

  //Display new suggestions
  var p = get_suggestions( series, number, year);

  p.then(function(result){
    $('.jqSpinnerDialog').remove();
  },function(err){
    $('.jqSpinnerDialog').remove();
    console.log('Error retrieving data: ' + err );
  });

};

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


        //And year...
        data = data.sort(function(a, b) {
            var aPop = new Date(a.cover_date);
            var bPop = new Date(b.cover_date);
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
