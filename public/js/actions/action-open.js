function open_action(){

}

open_action.prototype.run = function(model){
    window.open('/cb-ex?issue=' + encodeURIComponent(model.path) );
};
