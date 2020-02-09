const express = require('express');
const Nightmare = require('nightmare');

const cheerio = require('cheerio');
const async = require('async');
const bodyParser = require('body-parser');

var app = express();
const port = 8021;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, likeGecko) Chrome/41.0.2228.0 Safari/537.36';
const CONTENT_TYPE = 'application/json; charset=utf-8'

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.listen(port, function () {
    console.log('server has started on port: ' + port);
});

app.post('/parse', function (req, res) {
    const url = req.body.url;
    var nightmare = Nightmare({show:true})
    nightmare
        .useragent(USER_AGENT)
        .goto(url)
        .wait('.mono')
        .evaluate(function () {
            const title = $('title')[0].innerText;
            const codes = Array.prototype
                .slice.call($('div.mono > a'))
                .map(function(e) { return e.outerText })
                .filter(function (e) {
                    return e.length === 4;
                })
                .reduce(function(p, c) {
                    if (p.indexOf(c) < 0) p.push(c);
                    return p;
                }, []);

            return {'title': title, 'codes' : codes};
        })
        .end()
        .then(function (codes) {
            res.header('Content-Type', CONTENT_TYPE);
            res.json(codes);
        })
        .catch(function (error) {
            console.log('Failed due to ', error)
        });
})