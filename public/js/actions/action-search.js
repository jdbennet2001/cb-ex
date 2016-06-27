function search_action(){

}

search_action.prototype.run =function(model){

  debugger;
  $('body').search_dialog(model.name);

};

(function($) {
    $.fn.extend({
        search_dialog: function(message) {

            function display(data) {

                var main_div = $('<div/>', {
                    "class": 'jqSearchDialog'
                }).appendTo('body');

                var input = $('<input />', {
                    id: 'search',
                    value: message
                }).appendTo(main_div);

                var okay = $('<div/>', {
                    "class": "button ok",
                    "text": "Okay"
                }).appendTo(main_div);

                okay.click(function(){
                    debugger;
                    var value = input.val();
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

            function action_okay(value){

              debugger;
              var action = new action_suggestions();
              action.run(value);

            }

            var div = display();

        }
    });
})(jQuery);
