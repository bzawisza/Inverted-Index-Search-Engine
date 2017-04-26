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

// another edge case
trie.insert('there', 1);
trie.insert('that', 2);
trie.insert('tap', 3);

// print out graphviz syntax
console.log(trie.graph());