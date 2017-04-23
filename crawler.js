const Crawler = require("simplecrawler");
const cheerio = require('cheerio');
const striptags = require('striptags');
const stopWords = require('./stopwords.json').reduce((map, word) => {
    map[word] = true;
    return map;
}, {});
const fs = require('fs');
const rmdir = require('rmdir');

class Webcrawler {
    constructor(invertedIndex, url = "https://nodejs.org/api/documentation.html") {

        // setup simplecrawler
        const crawler = new Crawler(url);
        crawler.maxDepth = 2; // Only go 2 urls deep. Since this is a simple web crawler, we don't need to crawl the entire internet.
        crawler.maxConcurrency = 5;
        crawler.interval = 1000;
        crawler.parseScriptTags = false;
        crawler.decodeResponses = true;

        // Method that runs when a website is visited
        crawler.on("fetchcomplete", (queueItem, body, response) => {
            const $ = cheerio.load(body);

            // remove tags from the website. Combine the title and body which will be indexed.
            let text = striptags($("title").text() + ' ' + $("body").text(), [], ' ');

            // remove special characters from the website content.
            // filter out stop words
            // create a word count map that will be used for ranking/scoring the website
            text = text.replace(/('s|[\W])/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .toLowerCase()
                .split(' ')
                .filter(word => !stopWords[word] && word)
                .reduce((map, word) => {
                    map[word] = map[word] ? map[word] + 1 : 1;
                    return map
                }, {});

            // console.log($("title").text());
            // console.log(queueItem.url);

            // update each occurance list and update the invertedIndex
            for (const word in text) {
                const score = text[word];
                const file = this._savelink(word, queueItem.url, score);
                invertedIndex.insert(word, file);
            }

        });

        // Method that runs once we finish indexing
        crawler.on('complete', () => {
            invertedIndex.saveGV();
            console.log('Done indexing the interwebs');
        });

        this.crawler = crawler;
        this.dir = './invertedFiles';

        // remove directory that saves occurance lists and start the crawler
        rmdir(this.dir, (err, stdout, stderr) => {
            fs.mkdirSync(this.dir);
            this.crawler.start();
        });
    }

    // update the occuranceList
    _savelink(word, url, score) {
        const file = `${this.dir}/${word}.json`;

        // check if the file already exists
        if (fs.existsSync(file)) {
            const index = require(file);

            // only update the occurance list if the url is not already here
            if (!index[url]) {
                index[url] = score;
                fs.writeFileSync(file, JSON.stringify(index));
            }

        } else {
            // create a new occurance list if it doesn't exist
            const index = {};
            index[url] = score;
            fs.writeFileSync(file, JSON.stringify(index));
        }
        return file;
    }
}

module.exports = Webcrawler;