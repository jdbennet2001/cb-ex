$(document).ready(function(){

  var hash = window.location.hash.substr(1);

  $.getJSON('/catalog/directory' + hash, function(data){
    data.folders.forEach(function(item){
        $('.candidates').folder(item);
    });

    data.issues.forEach(function(item){
      $('.candidates').comic(item.value);
    });
  });

  window.onhashchange=function(){
      window.location.reload();
  };

  $('#random-action').click(function(event){
      window.location.hash = '#/random';
      event.preventDefault();
  });

  $('#open-folder-action').click(function(event){
      var selected = $('.selected');
      if ( selected.length  !== 1){
        return;
      }
      debugger;

      event.preventDefault();
      window.location.hash = '#' + selected.data().model.directory;
  });

});


(function($) {
    $.fn.extend({
        folder: function(data) {

            function display_folder(data) {

                var comic_div = $('<div/>', {
                    "class": 'comic'
                }).appendTo('.candidates');

                var cover = $('<img />', {
                    src: '/icons/io/folder.png',
                }).appendTo(comic_div);

                var comic_info = $('<div/>', {
                    "class": "comic-info"
                }).appendTo(comic_div);

                $('<div/>', {
                    "class": "title",
                    "text": data.name
                }).appendTo(comic_info);

                cover.click(function(){
                  window.location.hash = '#' + data.value;
                });

                return comic_div;
            }

            var slash = data.value.lastIndexOf('/');
            var name = data.value.substr(slash+1);

            var model = this.model = {
                name: name,
                value: data.value
            };

            var div = display_folder(model);

            //Cache data for later reference
            div.data('model', model );

        }
    });
})(jQuery);

(function($) {
    $.fn.extend({
        comic: function(data) {

            function display_cover(data) {

                var comic_div = $('<div/>', {
                    "class": 'comic'
                }).appendTo('.candidates');

                comic_div.click(function(event){
                    $(this).addClass('selected');
                    event.stopPropagation();
                });

                var cover = $('<img />', {
                    src: '/catalog/cover/' + encodeURIComponent(data.name),
                }).appendTo(comic_div);

                cover.tooltipster({
                    content: data.description
                });

                cover.click(function(){
                    window.open('/cb-ex?issue=' +  encodeURIComponent(data.location) );
                });

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
                    "text": data.date
                }).appendTo(meta_data);

                return comic_div;
            }

            var name = data.name.replace(/ *\([^)]*\) */g, "");
                name = name.replace(/\.[^/.]+$/, "");
            var hash = name.indexOf('#');
            data.series = data.name.substr(0, hash);

            var dash = name.indexOf('-', hash);
            data.description = name.substr(dash+1)|| 'n/a';

            data.date = S(data.name).between('(', ')').s || '--';
            if ( !moment(data.date, "YYYY-MM-DD", true).isValid() ){
              data.date  = '--'
            }
            data.number = S(data.name).between(' #', ' ').s || '--';
            if ( !S(data.number).isNumeric() ){
              data.number = '--';
            }

            if ( data.number == '--' && data.date == '--'){
              data.series = name;
            }

            var div = display_cover(data);

            //Cache data for later reference
            div.data('model', data );

        }
    });
})(jQuery);
