function file_action() {

}

file_action.prototype.run = function(source, target) {

  debugger;

  var name = getName(source, target);

  var p = new Promise(function(resolve, reject) {

    getSeriesLocation(target.volume.id).then(function(series_path) {

      var model = {
        source: source.path,
        directory: series_path,
        name: name,
        series: target.volume.id
      };

      return $.post('/catalog/insert', model);

    }).then(function(result) {
      resolve(result);
    }, function(err) {
      reject(err);
      console.log('Error: ' + err);
    });

  });

  return p;

};

function getName(source_model, target_model) {

  //What's the new name?
  var name = target_model.volume.name;
  if (target_model.issue_number) {
    name += ' #' + S(target_model.issue_number).padLeft(3, '0').s;
  }
  if (target_model.cover_date) {
    name += ' (' + target_model.cover_date + ')';
  }
  if (target_model.name) {
    name += ' - ' + target.name;
  }
  var dot = source_model.path.lastIndexOf('.');
  var extension = source_model.path.substring(dot);
  name += extension;

  return name;
}

/*
 Find the location, on disk for a given series id.
 */
function getSeriesLocation(series) {

  var promise = new Promise(function(resolve, reject) {

    //Check cache first.
    $.getJSON('/catalog/series/' + series, function(data) {

      var directory = data.path;
      resolve(directory);

    }).fail(function(err) {

      //Not in cache, check ComicVine
      $.getJSON('/comicvine/series/' + series, function(data) {

        var publisher = data.publisher.name;
        if (publisher != 'DC Comics' && publisher != 'Marvel') {
          publisher = 'Other';
        }

        var directory = '/' + publisher + '/' + data.name + ' ' + data.start_year + ' (' + series + ')';
        resolve(directory);

      }).fail(function(err) {
        reject(err);
      });
    });

  });
  return promise;

}
