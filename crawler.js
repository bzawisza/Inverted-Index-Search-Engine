const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const striptags = require('striptags');
const stopWords = require('./stopwords.json').reduce((map, word) => {map[word] = true; return map;}, {});
const fs = require('fs');

class Webcrawler {
    constructor(trie) {
        const crawler = new Crawler("https://en.wikipedia.org/wiki/Main_Page");
        crawler.maxDepth = 1;
        crawler.maxConcurrency = 5;
        crawler.interval = 1000;
        crawler.parseScriptTags=false;
        crawler.decodeResponses = true;
        crawler.on("fetchcomplete", (queueItem, body, response) => {
            const $ = cheerio.load(body);
            console.log($("title").text());
            let text = striptags($("title").text() + ' ' + $("body").text(), [], ' ');
            text = text.replace(/('s|[\W])/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase().split(' ').filter(word => !stopWords[word] && word).reduce((map,word) => {map[word] = map[word] ? map[word] + 1 : 1; return map}, {});
            console.log(queueItem.url);
            for (const key in text) {
                const score = text[key];
                const file = this._savelink(key, [queueItem.url, score]);
                trie.insert(key, file);
            }
        });
        crawler.on('complete', () => {
            trie.graph();
        });
        this.crawler = crawler;
        this.crawler.start();
        this.urls = 0;
    }
    
    _binarySearch(arr, needle) {
        let m = 0, n = arr.length -1;
        while (m <= n) {
            const k = (n+m) >> 1;
            const cmp = needle.localeCompare(arr[k][0])
            if (cmp > 0) {
                m = k + 1;
            } else if (cmp < 0) {
                n = k - 1;
            } else {
                return k;
            }
        }
        return -m;
    }

    _savelink(word, data) {
        const file = `./invertedFiles/${word}.json`;
        if (fs.existsSync(file)) {
            const index = require(file);
            const ret = this._binarySearch(index, data[0]);
            if (ret < 0) {
                index.splice(-ret, 0, data);
                fs.writeFileSync(file, JSON.stringify(index));
            }
        } else {
            fs.writeFileSync(file, JSON.stringify([data]));
        }
        return file;
    }
}

module.exports = Webcrawler;