const fs = require('fs');
const exec = require('child_process').exec;
const Trie = require('./trie');

const trie = new Trie();
trie.insert('a', 1);

// inserting a node with the same key
trie.insert('a', 2);

// no children. update the label
trie.insert('ab', 2);

// no children. update the label
trie.insert('abc', 3);

// split
trie.insert('abd', 4);

// new node under root
trie.insert('bear', 1);

// b - ull
trie.insert('bull', 3);

// split bu
trie.insert('buy', 4);
trie.insert('bid', 2);
trie.insert('sell', 5);
trie.insert('stock', 6);
trie.insert('stop', 7);
trie.insert('bell', 8);
trie.insert('bett', 9);

// edge case to split th and distribute the h
trie.insert('there', 1);
trie.insert('that', 2);
trie.insert('tap', 3);

// another case to add x to the root node when there are multiple children and subchildren
trie.insert("the", 2)
trie.insert("they", 3)
trie.insert("this", 4)
trie.insert("xpple", 5)
trie.insert("xmerica", 6)
trie.insert("xmple", 7)
trie.insert("x", 8)
trie.insert("xm", 9)
console.log(trie.graph());

// console.log('Writing gv file to ./documentation/test.gv');
// fs.writeFileSync('./documentation/test.gv', trie.graph());
// console.log('Trying to write png file using graphwiz dot');
// exec('dot -Tpng ./documentation/test.gv > ./documentation/test.png', (error, stdout, stderr) => {
//     if (!error) {
//         console.log('Saved to ./documentation/test.png');
//     } else {
//         console.log('Couldn\'t generate png. ');
//         fs.unlinkSync('./documentation/test.png')
//     }
// });