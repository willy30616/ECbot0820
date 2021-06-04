'use strict';
const
    //bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port', port);

app.use(express.json());

app.listen(app.get('port'), function () {
    console.log('[app.listen] Node app is running on port', app.get('port'));
});

module.exports = app;

//const MOVIE_API_KEY = config.get('MovieDB_API_Key');
const SHEETDB_PRODUCTINFO_ID = config.get('productionfo_id');

app.post('/webhook', function (req, res) {
    let data = req.body;
    let queryCategory = data.queryResult.parameters["Category"];
    var thisQs = {};
    //判斷傳進來的Category是否為"熱門"
    if (queryCategory == "熱門") {
        thisQs.IsHot = "TRUE";
    } else {
        thisQs.Category = queryCategory;
    }
    thisQs.casesensitive = false;

    
    request({
        uri: "https://sheetdb.io/api/v1/" + SHEETDB_PRODUCTINFO_ID + "/search?",
        json: true,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        qs: thisQs
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            console.log("[SheeDB API] Success");
            sendCards(body, res);

        } else {
            console.log("[SheetDB API] failed");
        }
    });
});



function sendCards(body, res) {
    console.log("[sendCarSoulCards] In");
    var thisFulfillmentMessages = [];
    for (var x = 0; x < body.length; x++) {
        var thisObject = {};
        thisObject.card = {};
        thisObject.card.title = body[x].Name;
        thisObject.card.subtitle = body[x].Category;
        thisObject.card.imgeUri = body[x].Photo;
        thisObject.card.buttons = [
            {
                "text": "看大圖片",
                "postback": body[x].Photo
            }
        ];
        thisFulfillmentMessages.push(thisObject);
    }
    var responseObject = {
        fulfillmentMessage: thisFulfillmentMessages
    };
    res.json(responseObject);

};