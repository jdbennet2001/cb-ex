



//Display list of queued Comics
$.getJSON('/downloads', function(data) {
    data.forEach(function(entry){
           $('.queue').queuedComic(entry);
    });
});
