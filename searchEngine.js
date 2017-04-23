const Webcrawler = require('./crawler');
const InvertedIndex = require('./invertedIndex');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Read input from the command line.
// Ask for url to start indexing
rl.question('Url to start indexing (default: https://nodejs.org/api/documentation.html): ', (website) => {

    // create inverted index.
    const invertedIndex = new InvertedIndex();

    // setup asynchronous web crawler that will add to our inverted index
    new Webcrawler(invertedIndex, website.length > 0 ? website : undefined);

    console.log('Type exit to exit at any time, or press ctrl+c.');

    // recursively get words to search for.
    const getInput = () => {
        rl.question('Search: ', (word) => {
            if (word == 'exit') {
                rl.close();
            } else {
                console.log(invertedIndex.search(word));
                getInput();
            }
        });
    }
    getInput();

});