 function next(current, pages){

 	if ( current == ( pages.length -1) )
 		return current;
 	else
 		current = ++current;

 	cache( current, pages );

 	var width = $('body').width();

 	var location = current * width;
 	var new_page = pages[current];


 	$('#header').get(0).scrollIntoView();

	$('#slides').animate({
		scrollLeft: location
	}, 500, function() {
	});


 	
 	return current;

 }

 function align(current, pages) {
 	var width = $('body').width();
 	var location = current * width;
 	$('#slides').animate({
 		scrollLeft: location
 	}, 125, function() {});

 }

 function previous(current, pages){

 	if ( current == 0 ){
 		return current;
 	}else{
 		current = --current;
 	}

 	cache( current, pages );

 	$('#header').get(0).scrollIntoView();

	var width = $('body').width();
 	var location =current * width;

 	$('#slides').animate( { scrollLeft: location }, 500);

 	return current;
 
 }

 function cache( current_index, pages ){

 	for ( var i = 0; i < pages.length; i++ ){
 		if ( i < ( current_index - 1 )  || i > (current_index + 1) ){
 			unload_image( pages[i] );
 		}else{
 			load_image( pages[i] );
 		}
 	}

 }

 function load_image( page ){
 	page  = $(page);

	if ( page.attr('src') == page.attr('data-src') ){
 		return page;
 	}

 	page.attr('src', page.attr('data-src') );
 	return page;
 }

function unload_image( page ){
 	page  = $(page);
 	if ( page.attr('src') == '/icons/blank-page.png'){
 		return page;
 	}

 	page.attr('src', '/icons/blank-page.png');
 	return page;
 }


 $( document ).ready(function() {

 	var pages = $('#slides img');
 	var current = 0;

 	//Debug...
 	cache( 0, pages );

	$("body").keydown(function(e) {
	  if(e.keyCode == 39) {
	    current = next(current, pages);
	  }
	  else if(e.keyCode == 37) { 
	    current = previous(current, pages);
	  }
	});

	$('.left').on('click', function(){
		current = previous(current, pages);
	});

	$('.right').on('click', function(){
		current = next(current, pages);
	});

	$(window).resize(function(){

	 	var width = $('body').width();
		var location = current * width;
		$('#header').get(0).scrollIntoView();
	 	$('#slides').animate( { scrollLeft:  location }, 0, 'linear');

	});

	jQuery(window).on('scrollstop', function(){
		align( current, pages);
	});

    jQuery( window ).on( "swipeleft", function( event ) {
	    current = next(current, pages);
    });

    jQuery( window ).on( "swiperight", function( event ) {
	    current = previous(current, pages);
    });

});

