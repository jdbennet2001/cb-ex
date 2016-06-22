(function($) {
    $.fn.extend({
        queuedComic: function(data) {

            function display_cover(data) {

                var comic_div = $('<div/>', {
                    "class": 'comic'
                }).appendTo('.queue');

                var cover = $('<img />', {
                    src: '/downloads/covers/' + encodeURIComponent(data.name)
                }).appendTo(comic_div);

                var comic_info = $('<div/>', {
                    "class": "comic-info"
                }).appendTo(comic_div);

                $('<div/>', {
                    "class": "title",
                    "text": data.series
                }).appendTo(comic_info);

                var meta_data = $('<div/>', {
                    "class": "meta-data"
                }).appendTo(comic_info);

                $('<span/>', {
                    "class": "number",
                    "text": data.number
                }).appendTo(meta_data);

                $('<span/>', {
                    "class": "year",
                    "text": data.year
                }).appendTo(meta_data);

                return comic_div;
            }

            function getSeries(name){
              var basename = name.replace(/ *\([^)]*\) */g, "");

              //Pull out all tokens with suspect characters
              var tokens = basename.split(' ').filter(function(token){
                  return !S(token).contains('#');
              });

              var series = tokens.join(' ');
              return series;
            }

            function getYear(name){

              var text = S(name).replaceAll('_', ' ').replaceAll('(', ' ').replaceAll(')', ' ').replaceAll('-', ' ').s;

              var years = text.split(' ').filter(function(token){
                return ( S(token).isNumeric() && S(token).toInt() > 1935 );
              });

              var year = years.length ? years.pop() : ' ';
              return year;

            }

            function getNumber(name){

              var text = S(name).replaceAll('_', ' ').replaceAll('(', ' ').replaceAll(')', ' ').replaceAll('#', ' ').s;

              var numbers = text.split(' ').filter(function(token){

                return ( S(token).isNumeric() && S(token).toInt() < 900 );
              });

              var number = numbers.length ? numbers.pop() : ' ';
              return number;

            }




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
                        } else if (number == issue_number) {
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
                    data.forEach(function(entry) {
                        model.suggestions[entry.id] = entry;
                    }.bind(this));

                    display_suggestions_on_screen(data);


                }.bind(this));

            }

            function add_click_handler(data) {

                var self = this;
                var f = display_cover;


                div.click(function(evt) {

                  debugger;

                    //Clear any selected issues
                    $('.queue .comic.selected').removeClass('selected');

                    //Select the new node
                    $(this).addClass('selected');

                    //Clear the suggestion area
                    $('.candidates').empty();

                    var issue = $(this);

                    //Get series and number
                    var series = $('.title', issue).text();
                    var number = $('.number', issue).text();
                    var year = $('.year', issue).text();


                    //Get new ones (if we've clicked on the image)
                    if ( evt.target.nodeName == 'IMG'){
                        get_suggestions(series, number, year);
                    }

                });
            }


            var model = this.model = {
                name: data.name,
                path: data.path,
                series: getSeries(data.name),
                year: getYear(data.name),
                number: getNumber(data.name)
            };

            var div = display_cover(model);
            add_click_handler(div);

        }
    });
})(jQuery);
