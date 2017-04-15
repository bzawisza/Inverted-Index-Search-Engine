class Node {
    constructor(label='', value) {
        this.label = label;
        this.value = new Map();
        value && this.value.set(this.label, value);
        this.children = new Map();
    }
    getNode (key) {
        key = [...this.children.keys()].filter(kk => kk.startsWith(key))[0];
        return (key && this.children.get(key)) || null;
    }
}
class Trie {
    constructor() {
        this.root = new Node();
        this.str = '';
    }
    insert(word, value) {
        let node = this.root.getNode(word.charAt(0));
        let parentNode = this.root;
        let i = 0;
        do {
            const letter = () => word.charAt(i);
            let sameletters = 0;
            while (node && letter() && node.label.charAt(sameletters) == letter()) {
                i++;
                sameletters++;
            }
            if (!node) { // parent doesn't have this child
                const label = word.substring(i,word.length);
                parentNode.children.set(label, new Node(label, value));
                return;
            } else if (node.children.size && sameletters == node.label.length) { // go to the next level.
                parentNode = node;
                node = node.getNode(letter());
            } else if (sameletters < node.label.length && word.length-i == 0) { // word in trie is longer                
                node.value.set(node.label.substring(0, sameletters), value);
                return;
            } else if ((sameletters < node.label.length) && word.length-i != 0) { // part of word is in the trie. need to split it.
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
                parentNode.children.delete(node.label);
                const currentEndLabel = word.substring(i-sameletters, word.length); // old
                node.label = currentEndLabel;
                node.value.set(currentEndLabel, value);
                parentNode.children.set(currentEndLabel, node);
                return;
            } else { // inserting to the same node that already exists
                node.value.set(node.label, value);
            }
        } while (i < word.length);
    }

    get(key) {
        let node = this.root;
        let i = 0;
        let sameletters = 0;
        while (node && i < key.length) {
            node = node.getNode(key[i]);
            sameletters = 0;
            while (node && key.charAt(i) && node.label.charAt(sameletters) == key.charAt(i)) {
                i++;
                sameletters++;
            }
        }
        return node ? node.value.get(key.substring(i-sameletters)) : undefined;
    }

    graph() {
        this.str = 'digraph {\n';
        this.print(null);
        this.str += '}';
        console.log(this.str);
    }

    print(node) {
        const parent = node || this.root;
        const cs = [...parent.children.values()];
        cs.forEach(c => {
            this.str += `${c.label} [label="{<f0>${c.label}|<f1>${[...c.value]}}" shape=Mrecord];\n`
            this.str += `\t${parent.label ? parent.label : 'root'}:f1 -> ${c.label}:f0;\n`;
            this.print(c, this.str);
        });
    }
}

module.exports = Trie;