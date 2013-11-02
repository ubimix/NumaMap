var ImageMagick = require('imagemagick');
var _ = require('underscore');
var Q = require('q');
var fs = require("fs");
var path = require("path");

var sourceDir = '../data/images/street-art';
var targetFile = '../data/street-art.json';

readImages(sourceDir).then(function(metadata) {
    console.log('Files metadata association...')
    var index = {};
    var features = [];
    var results = {
        "label" : "Street Art",
        "type" : "FeatureCollection",
        "features" : features
    };
    console.log('----------------------------------------')
    console.log('Metadata:', metadata)
    _.each(metadata, function(data, file) {
        var name = file + '';
        var id = name.replace(/^.*?\/([\d]+).*$/gim, '$1')
        console.log(' * ', name, id)
        var info = index[id];
        if (!info) {
            info = index[id] = {
                "type" : "Feature",
                "geometry" : {
                    "type" : "Point",
                    "coordinates" : [ 0, 0 ]
                },
                "properties" : {
                    "type" : "photo",
                    "urls" : []
                }
            };
            features.push(info);
        }
        if (data) {
            info.geometry.coordinates = data;
        } else {
            info.properties.urls.push(name);
        }
        // console.log(id, info)
    })
    return results;
})
//
.then(function(results) {
    console.log(results);
    var json = JSON.stringify(results, null, 2);
    return Q.nfcall(fs.writeFile, targetFile, json);
})
//
.fail(function(error) {
    console.log('ERROR!', error)
}).done();

function toDegrees(gpsInfo) {
    var arr = [];
    _.each(gpsInfo.split(','), function(item) {
        var idx = item.indexOf('/');
        var val = parseInt(item.substring(0, idx)) / parseInt(item.substring(idx + 1));
        arr.push(val);
    });

    return arr[0] + (arr[1] / 60) + (arr[2] / 3600);
}

function readCoordinates(imagePath) {
    return Q.nfcall(ImageMagick.readMetadata, imagePath).then(function(metadata) {
        if (metadata.exif.gpsLatitude) {
            var lat = toDegrees(metadata.exif.gpsLatitude);
            var lng = toDegrees(metadata.exif.gpsLongitude);
            return [ lng, lat ];
        } else {
            return null;
        }
    });
}

function listFiles(folderPath, callback) {
    return Q.nfcall(fs.readdir, folderPath).then(function(children) {
        return children.map(function(file) {
            return path.join(folderPath, file);
        }).filter(function(file) {
            return fs.statSync(file).isFile();
        });
    })
}

function readImages(dir) {
    return listFiles(dir).then(function(files) {
        // return Q.all(_.map(files, function(file) {
        // return readCoordinates(file);
        // }))
        var metadata = {}
        var promise = Q();
        _.each(files, function(file) {
            promise = promise.then(function() {
                console.log('Read data: ', file, '...');
                return readCoordinates(file).then(function(data) {
                    metadata[file] = data;
                    return data;
                });
            })
        })
        return promise.then(function() {
            return metadata;
        });
    })
}

// 

