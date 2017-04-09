const Trie = require('./trie');
const Webcrawler = require('./crawler');
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
const crawler = new Webcrawler(trie);
// trie.insert('domain', 'test');
