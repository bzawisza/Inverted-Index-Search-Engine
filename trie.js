// Just a global Counter to uniquely identify nodes. Useful for generating a pretty image of the trie with graphwiz :)
let globalCounter = 0;

class Node {
    constructor(label = '', value) {
        this.id = globalCounter++;
        this.label = label;
        this.value = new Map();
        value && this.value.set(this.label, value);
        this.children = new Map();
    }
    getNode(key) { // helper method to find the first node in in the map that start with the key
        key = [...this.children.keys()].filter(kk => kk.startsWith(key))[0];
        return (key && this.children.get(key)) || null;
    }
}
class Trie {
    constructor() {
        this.root = new Node();
        this.str = '';
    }

    // O(1)
    insert(word, value) {
        let node = this.root.getNode(word.charAt(0));
        let parentNode = this.root;
        let i = 0;
        do { // loop through children nodes
            const letter = () => word.charAt(i);
            let sameletters = 0;
            // increment same letters counter at the current node, incase we need to split the current label.
            while (node && letter() && node.label.charAt(sameletters) == letter()) {
                i++;
                sameletters++;
            }
            if (!node) { // parent doesn't have this child - insert a new child node
                const label = word.substring(i, word.length);
                parentNode.children.set(label, new Node(label, value));
                return;
            } else if (node.children.size && sameletters == node.label.length) { // go to the next child node
                parentNode = node;
                node = node.getNode(letter());
            } else if (sameletters < node.label.length && word.length - i == 0) { // a word in trie exists that exists that is longer than this word. This word is a substring. Insert the value here.
                node.value.set(node.label.substring(0, sameletters), value);
                return;
            } else if ((sameletters < node.label.length) && word.length - i != 0) { // a substring of the word we want to insert is in a substring of the label we are looking at. We need to split this node.
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
            } else if (word.length - i != 0) { // new word is longer and there are no children - replace the node were looking at with the new word
                parentNode.children.delete(node.label);
                const currentEndLabel = word.substring(i - sameletters, word.length); // old
                node.label = currentEndLabel;
                node.value.set(currentEndLabel, value);
                parentNode.children.set(currentEndLabel, node);
                return;
            } else { // inserting to the same node that already exists
                node.value.set(node.label, value);
            }
        } while (i < word.length);
    }

    // recursively go through nodes and find the key
    get(key) {
        let node = this.root;
        let i = 0;
        let sameletters = 0;
        while (node && i < key.length) {
            node = node.getNode(key[i]);
            sameletters = 0;
            // need to go one letter at a time
            while (node && key.charAt(i) && node.label.charAt(sameletters) == key.charAt(i)) {
                i++;
                sameletters++;
            }
        }
        return node ? node.value.get(key.substring(i - sameletters)) : undefined;
    }

    // nice method to generate graphwiz for viewing the trie :)
    graph() {
        let str = 'digraph {\nroot0 [label="root"];\n';
        const _gv_helper = node => {
            [...node.children.values()].forEach(c => {
                str += `${c.label}${c.id} [label="{<f0>${c.label}|<f1>${[...c.value]}}" shape=Mrecord];\n`
                str += `\t${node.label ? node.label : 'root'}${node.id}:f1 -> ${c.label}${c.id}:f0;\n`;
                _gv_helper(c, str);
            });
        }
        _gv_helper(this.root);
        str += '}';
        return str;
    }
}

module.exports = Trie;