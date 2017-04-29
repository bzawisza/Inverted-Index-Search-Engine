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
            if (!node) { // current node doesn't exist -- insert new node to parentNode
                const label = word.substring(i, word.length);
                parentNode.children.set(label, new Node(label, value));
                return;
            } else if (sameletters <= node.label.length && word.length - i == 0) { // a word in trie exists that exists that is longer than this word. This word is a substring of that word. eg: testicle is in the trie. test is being inserted
                node.value.set(node.label.substring(0, sameletters), value);
                return;
            } else if (node.children.size && sameletters == node.label.length) { // there's subchildren and we went through all the letters
                parentNode = node;
                node = node.getNode(letter());
            } else if ((sameletters < node.label.length) && word.length - i != 0) { // a substring of the word we want to insert is in a substring of the label we are looking at. We need to split this node and insert. ex: trie is: s-top and stock is being inserted
                const hadChildren = (node.children.size != 0);

                parentNode.children.delete(node.label);
                const replacementNode = new Node(node.label.substring(0, sameletters));
                parentNode.children.set(replacementNode.label, replacementNode);

                const currentEndLabel = node.label.substring(sameletters, node.label.length); // get the remaining letters of the old node
                if (!hadChildren) { // map a new child node
                    node.label = currentEndLabel;
                    replacementNode.children.set(currentEndLabel, node);
                } else {
                    node.children.forEach(childNode => { // add the current child nodes
                        childNode.label = currentEndLabel + childNode.label;
                        replacementNode.children.set(childNode.label, childNode);
                        // update values mappings
                        const entries = [...childNode.value.entries()];
                        entries.forEach(([key]) => childNode.value.delete(key));
                        entries.forEach(([key, value]) => childNode.value.set(currentEndLabel+key, value));
                    })
                }
                
                const newEndLabel = word.substring(i, word.length); // new node
                replacementNode.children.set(newEndLabel, new Node(newEndLabel, value));

                // update values mappings
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
            } else if (word.length - i != 0) { // // all the letters in the node we're looking at are a substring of our word and there are no children. eg: test is in the trie. testicle is being inserted. 
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
        let str = 'digraph {\nxroot0 [label="{<f0>root|<f1>}" shape=Mrecord];\n';
        const _gv_helper = node => {
            [...node.children.values()].forEach(c => {
                str += `x${c.label}${c.id} [label="{<f0>${c.label}|<f1>${[...c.value]}}" shape=Mrecord];\n`
                str += `\tx${node.label ? node.label : 'root'}${node.id}:f1 -> x${c.label}${c.id}:f0;\n`;
                _gv_helper(c, str);
            });
        }
        _gv_helper(this.root);
        str += '}';
        return str;
    }
}

module.exports = Trie;