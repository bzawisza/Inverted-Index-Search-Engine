const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const striptags = require('striptags');
const stopWords = require('./stopwords.json').reduce((map, word) => {map[word] = true; return map;}, {});
const fs = require('fs');
const rmdir = require('rmdir');

class Webcrawler {
    constructor(trie, url="https://nodejs.org/api/documentation.html") {
        const crawler = new Crawler(url);
        crawler.maxDepth = 2;
        crawler.maxConcurrency = 5;
        crawler.interval = 1000;
        crawler.parseScriptTags=false;
        crawler.decodeResponses = true;
        crawler.on("fetchcomplete", (queueItem, body, response) => {
            const $ = cheerio.load(body);
            // console.log($("title").text());
            let text = striptags($("title").text() + ' ' + $("body").text(), [], ' ');
            text = text.replace(/('s|[\W])/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase().split(' ').filter(word => !stopWords[word] && word).reduce((map,word) => {map[word] = map[word] ? map[word] + 1 : 1; return map}, {});
            // console.log(queueItem.url);
            for (const word in text) {
                const score = text[word];
                const file = this._savelink(word, queueItem.url, score);
                trie.insert(word, file);
            }
        });
        crawler.on('complete', () => {
            console.log('Done indexing the interwebs');
            // trie.graph();
        });
        this.crawler = crawler;
        this.dir = './invertedFiles';
        rmdir(this.dir, (err, stdout, stderr) => {
            fs.mkdirSync(this.dir);
            this.crawler.start();
        });
    }

    _savelink(word, url, score) {
        const file = `${this.dir}/${word}.json`;
        if (fs.existsSync(file)) {
            const index = require(file);
            if (!index[url]) {
                index[url] = score;
                fs.writeFileSync(file, JSON.stringify(index));
            }
        } else {
            const index = {};
            index[url] = score;
            fs.writeFileSync(file, JSON.stringify(index));
        }
        return file;
    }
}

module.exports = Webcrawler;