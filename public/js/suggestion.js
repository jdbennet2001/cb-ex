(function($) {
    $.fn.extend({
        suggestion: function(entry) {

            function display_suggestion(entry) {

                var comic_div = $('<div/>', {
                    "class": 'comic',
                    'data-id': entry.id
                }).appendTo('.candidates');

                var cover_img = $('<img />', {
                    src: entry.image.medium_url,
                    "class": "tooltip"
                }).appendTo(comic_div);

                cover_img.tooltipster({
                    content: $(entry.description)
                });

                cover_img.click(function() {
                    var URL = entry.site_detail_url;
                    window.open(URL, '_blank', '', '');
                });

                var comic_info = $('<div/>', {
                    "class": "comic-info"
                }).appendTo(comic_div);

                $('<div/>', {
                    "class": "title",
                    "text": entry.volume.name
                }).appendTo(comic_info);

                var meta_data = $('<div/>', {
                    "class": "meta-data"
                }).appendTo(comic_info);

                $('<span/>', {
                    "class": "number",
                    "text": entry.issue_number
                }).appendTo(meta_data);

                var year = '----';
                if (entry.cover_date) {
                    var date = new Date(entry.cover_date);
                    year = date.getFullYear();
                }

                $('<span/>', {
                    "class": "year",
                    "text": year
                }).appendTo(meta_data);

                return comic_div;
            }

            function select_suggestion(element) {

                //Clear any selected issues
                $('.candidates .comic.selected').removeClass('selected');

                //Select the new node
                $(element).addClass('selected');

            }

            var comic = display_suggestion(entry);
            comic.click(function(evt) {
                select_suggestion(this);
            });

        }
    });
})(jQuery);
