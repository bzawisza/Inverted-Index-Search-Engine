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

let enableLog = false;

class Node {
    constructor(label='', value) {
        this.label = label;
        this.value = new Map();
        value && this.value.set(this.label, value);
        this.children = new Map();
    }
    getNode (key) {
        key = [...this.children.keys()].filter(kk => kk.startsWith(key));
        return (key[0] && this.children.get(key[0])) || null;
    }
}
class Trie {
    constructor() {
        this.root = new Node();
    }
    insert(word, value) {
        let node = this.root.getNode(word.charAt(0));
        let parentNode = this.root;
        let i = 0;
        do {
            const letter = () => word.charAt(i);
            let sameletters = 0;
            while (node && node.label.charAt(sameletters) == letter()) {
                i++;
                sameletters++;
            }
            if (!node) {
                enableLog && console.log('new')
                const label = word.substring(i-1,word.length);
                parentNode.children.set(label, new Node(label, value));
                return;
            } else if (node.children.size && sameletters == node.label.length) {
                enableLog && console.log('same');
                parentNode = node;
                node = node.getNode(letter());
            } else if (sameletters < node.label.length && word.length-i == 0) { // word in trie is longer
                enableLog && console.log('merge3');
                node.value.set(node.label.substring(0, sameletters), value);
                return;
            } else if ((sameletters < node.label.length) && word.length-i != 0) { // substr in trie doesn't have children
                enableLog && console.log('merge2');

                parentNode.children.delete(node.label);
                const replacementNode = new Node(node.label.substring(0, sameletters));
                parentNode.children.set(replacementNode.label, replacementNode);

                const currentEndLabel = node.label.substring(sameletters, node.label.length); // old
                node.label = currentEndLabel;
                replacementNode.children.set(currentEndLabel, node);
                
                const newEndLabel = word.substring(i, word.length); // new
                replacementNode.children.set(newEndLabel, new Node(newEndLabel, value));

                // update values
                const entries = [...node.value.entries()];
                entries.forEach(([key]) => node.value.delete(key));
                entries.forEach(([key, value]) => {
                    const k = key.substring(sameletters, key.length);
                    if (k.length == 0) {
                        replacementNode.value.set(key, value);
                    } else {
                        node.value.set(k, value);
                    }
                });
                return;
            } else if (word.length-i != 0) { // new word is longer
                enableLog && console.log('merge1', word.length-i);
                parentNode.children.delete(node.label);
                const currentEndLabel = word.substring(i-sameletters, word.length); // old
                node.label = currentEndLabel;
                node.value.set(currentEndLabel, value);
                parentNode.children.set(currentEndLabel, node);
                return;
            }
        } while (i < word.length);
    }

    print(node) {
        let cs = node || [...this.root.children.values()];
        cs.forEach(c => {
            console.log(`${c.label} - ${[...c.value.values()]}`);
            this.print([...c.children.values()]);
        });
    }

}


const dictionary = new Trie();
// dictionary.insert('a',1);
// dictionary.insert('ab',2);
// dictionary.insert('abc',3);
dictionary.insert('bear', 1);
dictionary.insert('bid', 2);
dictionary.insert('bull', 3);
dictionary.insert('buy', 4);
dictionary.insert('sell', 5);
dictionary.insert('stock', 6);
dictionary.insert('stop', 7);
dictionary.insert('bell', 8);
dictionary.insert('bett', 9);
dictionary.print()