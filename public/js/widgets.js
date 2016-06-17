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

            var div = display_cover(data);
            //add_click_handler(div);

        }
    });
})(jQuery);
