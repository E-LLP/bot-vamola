var system = require('system');

// if (system.args.length < 3) {
//     console.log("Missing arguments.");
//     phantom.exit();
// }

var system = require('system');
var env = system.env;

var port = parseInt(require('system').env.PORT || 3333); 

var server = require('webserver').create();
var urlPrefix = system.args[1];

var parse_qs = function(s) {
    var queryString = {};
    var a = document.createElement("a");
    a.href = s;
    a.search.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryString[$1] = $3; }
    );
    return queryString;
};

var renderHtml = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.onCallback = function() {
        cb(page.content);
        page.close();
    };
//    page.onConsoleMessage = function(msg, lineNum, sourceId) {
//        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
//    };
    page.onInitialized = function() {
       page.evaluate(function() {
            setTimeout(function() {
                window.callPhantom();
            }, 5000);
        });
    };
    page.open(url);
};

server.listen(port, function (request, response) {
    var route = parse_qs(request.url)._escaped_fragment_;
    var url = urlPrefix
      + request.url.slice(1, request.url.indexOf('?'))
      + '#!' + decodeURIComponent(route);
    renderHtml(url, function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');
