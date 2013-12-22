var path = require('path');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var ntwitter = require('ntwitter');
var restclient = require('node-restclient');
var express = require('express');
var app = express();

GLOBAL.config = require('nconf').argv().env().file({ file: path.join(__dirname, 'config.json') });
console.log(config.get("twitter"));

var tweeter = new ntwitter(config.get("twitter"));

app.get('/', function(req, res) {
    
});

app.listen(config.get("port") || 3000);

(function() {
    tweeter.verifyCredentials(function(err, data) {
      if (err) {
        console.log("Bad credentials, cannot login.");
        return;
      } else {
        console.log("Done!");
      }
    }).stream('user', { track : "TyperBot" }, function(stream) {
        console.log("Opening tweet stream.");
        stream.on('data', function(data) {
            if (!data.user) {
                return;
            }
            var asker = data.user.screen_name;
            if (data.in_reply_to_screen_name === "TyperBot") {
                // TODO: capture (h|t|d)
                var wantsType = /:t\s*(.*)/.exec(entities.decode(data.text));
                var wantsDescription = /:d\s*(.*)/.exec(entities.decode(data.text));
                if (wantsType) {
                    console.log("type matched, fetch " + wantsType[1]);
                    console.log("http://www.haskell.org/hoogle/?mode=json&hoogle=".concat(escape(wantsType[1])));
                    restclient.get("http://www.haskell.org/hoogle/?mode=json&hoogle=" + escape(wantsType[1]), function(data) {
                        var parsedResult = JSON.parse(data);
                        if (parsedResult.results.length != 0) {
                            console.log("Replying With Result: " + parsedResult.results[0]);
                            reply(parsedResult.results[0].self);
                        } else {
                            reply("I'm sorry, but Hoogle has no entry for " + result[1]);
                        }
                    });
                } else if (wantsDescription) {
                    console.log("docs matched, fetch " + wantsDescription[1]);
                    console.log("http://www.haskell.org/hoogle/?mode=json&hoogle=".concat(escape(wantsDescription[1])));
                    restclient.get("http://www.haskell.org/hoogle/?mode=json&hoogle=" + escape(wantsDescription[1]), function(data) {
                        var parsedResult = JSON.parse(data);
                        if (parsedResult.results.length != 0) {
                            console.log("Replying With Result: " + parsedResult.results[0]);
                            reply(parsedResult.results[0].docs);
                        } else {
                            reply("I'm sorry, but Hoogle has no entry for " + result[1]);
                        }
                    });
                }
                reply("I'm sorry, but I cannot process this request.";
            }
            function reply(msg) {
                tweeter.updateStatus("@" + asker + " " + msg, function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                })   
            }
        });
        stream.on('end', function(resp) {
            console.log("Naughty twitter, listening again.");
            setTimeout(1000, listen);
        });
        stream.on('destroy', function(resp) {
            console.log("You can't kill me, listening again.");
            setTimeout(1000, listen);
        });
    })
})();

module.exports.app = app

