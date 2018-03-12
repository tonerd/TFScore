const fs = require('fs');
const async = require('async');

const DOCUMENTS_DIRECTORY = 'documents';
const WORDS_FILE = 'words.txt';

/*
  Iterate through the documents in the given directory, and return object with
  best TF score and file name.  Result object keys are the words being searched for.
*/
function CheckDocuments(directory, trie, callback) {
  let result = {};

  fs.readdir(directory, (error, files) => {
    if (error) {
      return callback(error);
    }

    let calls = [];
    for(let i = 0; i < files.length; i++) {
      calls.push((callback) => {
        fs.readFile(directory + '/' + files[i], 'utf8', (error, data) => {
          if(error) {
            return callback(error);
          }
          let words = data.trim().split(/[ \n]+/);

          FindWords(words, trie, (wordCounts) => {
            let keys = Object.keys(wordCounts);
            for(let index in keys) {
              let key = keys[index];
              let score = wordCounts[key] / words.length;
              
              if(!result[key]) {
                result[key] = { score: score, file: files[i] };
              }
              else if(result[key].score < score) {
                result[key].score = score;
                result[key].file = files[i];
              }
            }

            callback();
          });
        })
      });
    }

    async.parallel(calls, (error) => {
      callback(error, result);
    });
  });
}

/*
  Check if directory exists
*/
function CheckIfDirectoryExists(directory, callback) {
  fs.stat(directory, (error, stats) => {
    if(error || !stats.isDirectory()) {
      return callback('Could not find \'' + directory + '\' directory');
    }
    callback();
  });
}

/*
  Check if file exists
*/
function CheckIfFileExists(file, callback) {
  fs.stat(file, (error, stats) => {
    if(error || !stats.isFile()) {
      return callback('Could not find ' + file);
    }
    callback();
  });
}

/*
  Create a trie based on an array of words
*/
function CreateTrie(words) {
  let trie = {};
  for(let i = 0; i < words.length; i++) {
    let current = trie;
    let word = words[i].trim().toLowerCase();
    if(word === '') {
      continue;
    }

    for(let j = 0; j < word.length; j++) {
      let item = word[j];
      if(!current[item]) {
        current[item] = {};
      }
      current = current[item];
    }
    current.end = true;
  }
  return trie;
}

/*
  Given an array of words and a trie, calculate how many words match words in
  the trie structure, return hash table with count of words, keyed on word being
  searched for.
*/
function FindWords(words, trie, callback) {
  let result = {};
  for(let i = 0; i < words.length; i++) {
    let node = trie;
    let current = words[i].replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
    for(let j = 0; j < current.length; j++) {
      let char = current[j];
      if(j === current.length - 1 && node[char] && node[char].end) {
        if(result[current]) {
          result[current]++;
        }
        else {
          result[current] = 1;
        }
      }
      else if(node[char]) {
        node = node[char];
      }
      else {
        break;
      }
    }
  }
  callback(result);
}

/*
  Parse the words from the given file, return them in an array
*/
function ParseWords(file, callback) {
  fs.readFile(file, 'utf8', (error, data) => {
    if(error) {
      return callback(error);
    }
    let text = data.trim();

    if(text === '') {
      return callback('No words found in ' + file);
    }
    let words = text.split(/[ \n\r]+/);
    callback(null, words);
  })
}

/*
  Main program
*/
function Main() {
  CheckIfDirectoryExists(DOCUMENTS_DIRECTORY, (error) => {
    if(error) {
      return console.log(error);
    }

    CheckIfFileExists(WORDS_FILE, (error) => {
      if(error) {
        return console.log(error);
      }

      ParseWords(WORDS_FILE, (error, words) => {
        if(error) {
          return console.log(error);
        }

        let trie = CreateTrie(words);
        CheckDocuments(DOCUMENTS_DIRECTORY, trie, (error, result) => {
          if(error) {
            return console.log(error);
          }

          for(let i = 0; i < words.length; i++) {
            if(!result[words[i]]) {
              console.log('WORD: ' + words[i] + '\tSCORE: ' + 0 + '\tFILE: No matches found');
            }
            else {
              console.log('WORD: ' + words[i] + '\tSCORE: ' + result[words[i]].score + '\tFILE: ' + result[words[i]].file);
            }
          }
        });
      });
    });
  });
}

Main();
