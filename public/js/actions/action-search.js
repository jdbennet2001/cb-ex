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

                input.focus();

                var okay = $('<div/>', {
                    "class": "button ok",
                    "text": "Okay"
                }).appendTo(main_div);

                okay.click(function(){
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

              var tokens = value.split(' ');

              var series = tokens.filter(function(token){
                return !S(token).startsWith('#');
              }).join(' ');

              var number = tokens.filter(function(token){
                return S(token).startsWith('#');
              }).join(' ').replace('#', '');


              var action = new action_suggestions();
              action.run(series, number);

            }

            var div = display();

        }
    });
})(jQuery);
