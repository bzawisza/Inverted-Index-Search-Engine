const Trie = require('./trie');
const Webcrawler = require('./crawler');
const fs = require('fs');

class InvertedIndex {
    constructor(website) {
        this.trie = new Trie();
    }

    // used to search our trie and return urls
    search(words) {
        // check if we actually searched for something
        if (words.length) {
            let results = words.split(" ").map(word => { // search for each word we typed inside the trie
                return this.trie.get(word); // this returns a relvative file path to the occurance list
            });
            if (results.indexOf(undefined) > -1)
                return "No results";
            results = results.map(filename => { // read the occurance list from the fs
                const file = fs.readFileSync(filename);
                const contents = JSON.parse(file);
                return contents;
            }).reduce((res1, res2) => { // get the intersection of each of the websites.
                const intersection = {};
                for (let key in res1) {
                    if (res2[key]) {
                        intersection[key] = (res1[key] + res2[key])
                    }
                }
                return intersection;
            });
            return Object.keys(results).sort((a, b) => { // sort the results by score and return
                if (results[a] > results[b])
                    return -1;
                if (results[a] < results[b])
                    return 1;
                return 0;
            });
        } else {
            return "No results";
        }
    }

    // insert a key, value into the trie
    insert(key, value) {
        return this.trie.insert(key, value);
    }

    // save graphwiz file for viewing the results
    saveGV() {
        // console.log('Writing gv file to ./documentation/graphviz.gv');
        fs.writeFileSync('./documentation/graphviz.gv', this.trie.graph());
    }
}

module.exports = InvertedIndex;