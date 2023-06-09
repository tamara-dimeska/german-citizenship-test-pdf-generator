# german-citizenship-test-pdf-generator

The purpose of this project is to help me and people like me, that study better when they have the material in paper.

## What does the script do?
1. The script opens the official website where the library of possible questions for the German naturalization test is
2. Goes through all the quesstions in the library
3. Takes a screenshot of all unanswered questions
4. Select one answer, takes a screenshot of the answers of the questions
5. Merges all unanswered questions in one pdf `alle-fragen.pdf`
6. Merges all answers in one pdf `alle-antworten.pdf`

The final PDFs can be found in the `output/` directory.

## How to run the script?
1. Checkout the repo
2. Run `npm install`
3. Run `npm run create-pdf`

Before running open `create-pdf.ts` file and make sure that:
1. The element locators haven't changed
2. The number of questions is still the same
3. The base URl is still the same

Good luck and happy studying! 
