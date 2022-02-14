"use strict";
exports.__esModule = true;
var express = require("express");
var api = express();
api.get('*', function (req, res) {
    res.send(`Hello World!<p>${JSON.stringify(req)}`);
});
var api_server = api.listen(6942, function () {
    var host = api_server.address().address;
    var port = api_server.address().port;
    console.log("Listening at http://%s:%s", host, port);
});
