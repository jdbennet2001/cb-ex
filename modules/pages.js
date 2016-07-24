var nconf     = require('nconf');
var util      = require('util');
var S         = require('string');
var fs        = require('fs');
var child_process = require('child_process');
var Promise   = require('promise');
var path      = require('path');



var Archive = require("./Archive");

exports.index = function(req, res) {

    var issue = req.query.issue;

    if (!fs.existsSync(issue) ) {
        return res.send(500);
    }

    var tmp_directory = path.join(process.cwd(), '/public/viewer');

    if ( !fs.existsSync(tmp_directory) ){
      fs.mkdirSync( tmp_directory );
    }

    var archive = new Archive(issue);

    archive.extract(tmp_directory);
    debugger;
    resize_direcory(tmp_directory);

    console.log('Rendering directory.');
    render_dust_page(req, res, tmp_directory);

};

/*
 Resize all images in a given directory
 */
function resize_direcory(directory) {

    //Get the list
    var files = fs.readdirSync(directory);
    console.log( files.length + ' files to be processed.');

    //Filter out non-jpg files.
    files = files.filter(function(file) {
        var extname = path.extname(file).toLowerCase();
        console.log( 'Checking ' + file + 'with extention ' + extname );
        if (extname != '.jpg' && extname != '.png' && extname != '.jpeg' && extname != '.webp')
            return false;
        else
            return true;

    });

    console.log(files.length + ' files extracted.');

    var p = files.reduce(
        function(previous, next) {
            return previous.then(function(result) {
                var location = path.join(directory, next);
                return resize_file(location);
            });

        }, Promise.resolve());

    console.log('Files complete.');
}

function resize_file(source) {

    var sips_promise = new Promise(function(resolve, reject) {

        var output = "";

        var cf_result = child_process.spawn('sips', ['-Z', 2048, path.basename(source)], {
            'cwd': path.dirname(source)
        });

        cf_result.stdout.on('data', function(data) {
            output = output + data.toString();
            console.log('\t' + data.toString());
        });

        cf_result.on('exit', function(code) {

            console.log('..command complete ' + source);
            if (code === 0) {
                resolve(output);
            } else {

                reject(code);
            }

        });

    });

    return sips_promise;
}

function render_dust_page(req, res, file_directory) {


    var files = fs.readdirSync(file_directory);

    var model = {
        files: []
    };

    files.forEach(function(item) {

        var original_url = path.join(file_directory, item);
        var new_url = original_url.replace(/#/g, '_');
        fs.renameSync(original_url, new_url);



        var stats = fs.statSync(new_url);
        var extname = path.extname(new_url).toLowerCase();
        var isJPG = (extname == '.jpg' || extname === '.jpeg' || extname == '.webp');

        if (stats.isFile() && isJPG) {
            var basename = path.basename(new_url);
            model.files.push("/viewer/" + basename + '?' + Math.random());
        }

    });

    res.render('pages', model);

}
