SUMMARY:
This application takes in a list of words, and collection of documents, and
returns the document with the highest TF score for each word.  Results are
displayed in the console.

PREREQUISITES:
Node is required to be installed for this application to run.

INSTALLATION:
Open a command prompt to the project directory, and execute "npm install".

EXECUTION:
Open a command prompt to the project directory, and execute "node tfscore".

To update the list of words being searched for, open the words.txt file and add
words (one per line).

This application searches all documents in the "documents" subfolder.

EXAMPLE SCENARIO:
With the sample files in the documents folder, and default word list, the
output is as follows.

WORD: queequeg	SCORE: 0.0066344993968636915	FILE: mobydick-chapter4.txt
WORD: whale	    SCORE: 0.0013544018058690745	FILE: mobydick-chapter1.txt
WORD: sea	      SCORE: 0.004514672686230248	  FILE: mobydick-chapter1.txt
