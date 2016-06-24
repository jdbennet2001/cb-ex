// $(document).ready(function(){
//
//   var widget = $('body').spinner('Hello!');
//   debugger;
//
// });

(function($) {
    $.fn.extend({
        spinner: function(message) {

            function display(data) {

                var main_div = $('<div/>', {
                    "class": 'jqSpinnerDialog'
                }).appendTo('body');

                var cover = $('<img />', {
                    src: '/icons/spiffygif.gif',
                    class: 'icon'
                }).appendTo(main_div);

                $('<span/>', {
                    "class": "message",
                    "text": message
                }).appendTo(main_div);

                return main_div;
            }

            display();

        }
    });
})(jQuery);
