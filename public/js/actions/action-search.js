function search_action(){

}

search_action.prototype.run =function(model){

  $('body').search_dialog(model.name);

};

(function($) {
    $.fn.extend({
        search_dialog: function(message) {

            function display(data) {

                var main_div = $('<div/>', {
                    "class": 'jqSearchDialog'
                }).appendTo('body');

                var cover = $('<input />', {
                    id: 'search',
                    text: message
                }).appendTo(main_div);

                var okay = $('<div/>', {
                    "class": "button ok",
                    "text": "Okay"
                }).appendTo(main_div);

                okay.click(function(){
                    var value = $(this).value();
                    hide();
                    action_okay(value);
                });

                var cancel = $('<div/>', {
                    "class": "button cancel",
                    "text": "Cancel"
                }).appendTo(main_div);

                cancel.click(function(){
                  hide();
                });

                return main_div;
            }

            function hide(){
              $('.jqSearchDialog').remove();
            }

            function action_okay(){

              //Clear the suggestion area
              $('.candidates').empty();

              $('body').spinner('Loading...');

              var p = get_suggestions( e.detail.series, e.detail.number, e.detail.year);

              p.then(function(result){
                $('.jqSpinnerDialog').remove();
              },function(err){
                $('.jqSpinnerDialog').remove();
                console.log('Error retrieving data: ' + err );
              });

            }

            var div = display();

        }
    });
})(jQuery);
