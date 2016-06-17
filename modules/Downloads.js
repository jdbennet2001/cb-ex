/*
 List all issues waiting to be processed.
 */

var ls      = require('list-directory-contents');
var nconf   = require('nconf');
var S       = require('string');
var Promise = require('promise');
var leftPad = require('left-pad');
var path    = require('path');
var fs      = require('fs');

var Archive = require('./Archive');

//Location of issues to be filed
var source_dir  = nconf.get('source_dir');

/*
 List of issues available to be filed.
 Format:
  {
    name:
    path:
  }
  Pre-condition: Each issue has its cover extracted into the node module
 */
var issues = [];

 function Downloads(){
    scan( source_dir );
 }

Downloads.prototype.issues = function(){
    return issues;
};

/*
 Return the cover for an image in the queue.
 */
Downloads.prototype.cover = function(req, res){

  var dec = decodeURIComponent(req.params.cover);
  var cover = path.join(process.cwd(), 'public/covers', dec + '.jpg' );

  if ( fs.existsSync( cover ) ){
      res.sendfile( cover );
  }else{
      console.log( cover + " does not exist.");
      res.sendFile( __dirname + '/public/icons/balloon.png');
  }

};


/*
 Scan the target directory to find all issues waiting to be filed.
 */
 function scan(source_dir){

   //Scan the directory to find all issues waiting to be filed.
   console.log( 'Scanning '+ source_dir + ' for queued issues.');
   ls(source_dir, function (err, tree) {
      var comics = tree.filter(function(leaf){
        var ext = path.extname(leaf);
        return !!ext.match(/^.cb*/i);
      });


   //Extract the covers
   console.log( comics.length + ' issues found, extracting covers.');
   comics.forEach(function(comic, index, list){

        var basename = path.basename(comic);
        var name = path.basename(comic, path.extname(comic) );

        var current = leftPad(index, 3, 0);
        var total   = leftPad(list.length, 3, 0 );
        console.log('Extracting cover for: ' + path.basename( comic ) );

        var archive = new Archive(comic);
        archive.extractCover();

        //Issue available to be filed

        var summary = {
          name: name,
          path: comic
        };
        issues.push(summary);

   });

   console.log('Input directory scanned / good to go.');

 });

}



 module.exports = new Downloads();
