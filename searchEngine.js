const Trie = require('./trie');
const Webcrawler = require('./crawler');
const fs = require('fs');
/*
web crawler
    stores info in dictionary

search engine
    dictionary - invarted index
        word (index term)
            compressed trie
                external nodes tore index of the occurance list of the associated term
        L (occurance lists - references)
            dictionary or sorted
            stored on disk

query for single keyword - Word matching query
    return associated list

multiple keywords - page contains ALL keywords
    intersection of results
*/

const trie = new Trie();
// trie.insert('a',1);
// trie.insert('a',2);
// trie.insert('ab',2);
// trie.insert('abc',3);
// trie.insert('abd',4);
// trie.insert('bear', 1);
// trie.insert('bull', 3);
// trie.insert('buy', 4);
// trie.insert('bid', 2);
// trie.insert('sell', 5);
// trie.insert('stock', 6);
// trie.insert('stop', 7);
// trie.insert('bell', 8);
// trie.insert('bett', 9);
// trie.graph();
// console.log(trie.get('a'))
// console.log(trie.get('ab'))
// console.log(trie.get('abc'))
// console.log(trie.get('abd'))
// trie.insert('domain', 'test');


const search = (words) => {
    if (words.length) {
        let results = words.split(" ").map(word => {
            return trie.get(word);
        });
        if (results.indexOf(undefined) > -1)
            return "No results";
        results = results.map(filename => {
            const file = fs.readFileSync(filename);
            const contents = JSON.parse(file);
            return contents;
        }).reduce((res1,res2)=>{
            const intersection = {};
            for (let key in res1) {
                if (res2[key]) {
                    intersection[key] = (res1[key] + res2[key])
                }
            }
            return intersection;
        });
        return Object.keys(results).sort((a,b) => {
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

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Url:', (word) => {
    const crawler = new Webcrawler(trie, word.length > 0 ? word : undefined);
    const getInput = () => {
        rl.question('Search: ', (word) => {
            if (word == 'exit') {
                rl.close();
            } else {
                console.log(search(word));
                getInput();
            }
        });
    }
    getInput();
});

