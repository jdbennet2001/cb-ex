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

            function add_click_handler(data) {

                var self = this;
                var f = display_cover;

                div.click(function(evt) {

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

            debugger;

            var model = this.model = {
                name: data.name,
                path: data.path,
                series: getSeries(data.name),
                year: getYear(data.name),
                number: getNumber(data.name)
            };

            var div = display_cover(model);
            //add_click_handler(div);

        }
    });
})(jQuery);
