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





            function add_click_handler(data, model) {

                var self = this;
                var f = display_cover;


                div.click(function(evt) {


                    //Clear any selected issues
                    $('.queue .comic.selected').removeClass('selected');

                    //Select the new node
                    $(this).addClass('selected');

                    if ( evt.target.nodeName != 'IMG'){
                      return;
                    }

                    // First create the event
                    var queue = document.querySelector('.queue');
                    var myEvent = new CustomEvent("selection", {
                      detail: model
                    });

                    queue .dispatchEvent(myEvent);

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
            add_click_handler(div, model);

            //Cache data for later reference
            div.data('model', model );

        }
    });
})(jQuery);
