import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import PDFMerger from 'pdf-merger-js';

const directory = 'output';
const baseUrl = 'https://oet.bamf.de/ords/oetut/f?p=514:1:0';

// Elements
// Since I don't have access to the source code, before running the script make sure that the text values of the buttons are still the same
const startButtonLocator = '[value="Zum Fragenkatalog"]';
const nextButtonLocator = '[value="nächste Aufgabe >"]';
const answerLocator = '.t3data';

// Make sure that the number of questions hasn't changed
const noQuestions = 310;

// Remove any existing files in the output directory
fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(directory, file), (err) => {
      if (err) throw err;
    });
  }
});

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium', // I had some problems with chromium, so I had to add this path here. Before running make sure that you also need this line, and if so, add the correct path
    headless: false,
    args: ['--lang=en-EN'],
  });
  const page = await browser.newPage();

  await page.goto(baseUrl, {
    waitUntil: 'load',
  });
  await page.pdf({ path: `${directory}/home-page.pdf` });

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click(startButtonLocator),
  ]);

  // Go through all the questions and generate a pdf file for each question and answer
  for (let i = 1; i <= noQuestions; i++) {
    await page.pdf({ path: `${directory}/frage-${i}.pdf` });

    // We are always selecting the last answer, just so that the answers are displayed
    const answer = await page.$$(answerLocator);
    await answer[10].click(); // Each question has 4 answers, which is a table with 12 cells. The 11th element is the selection button for the last question
    await page.pdf({ path: `${directory}/antwort-${i}.pdf` });

    // The last question doesn't have next button
    if (i != noQuestions) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click(nextButtonLocator),
      ]);
    }
  }

  await browser.close();

  // Merge and save all questions and answers in two separate pdf files
  const mergerQuestions = new PDFMerger();
  const mergerAnswers = new PDFMerger();

  fs.readdirSync(directory).forEach(async (file) => {
    if (file.includes('frage')) {
      await mergerQuestions.add(`${directory}/${file}`);
    } else if (file.includes('antwort')) {
      await mergerAnswers.add(`${directory}/${file}`);
    }
  });

  await mergerQuestions.save(`${directory}/alle-fragen.pdf`);
  await mergerAnswers.save(`${directory}/alle-antworten.pdf`);

  // Export the merged PDF as a nodejs Buffer
  let mergedPdfBuffer = await mergerQuestions.saveAsBuffer();
  fs.writeFileSync(`${directory}/alle-fragen.pdf`, mergedPdfBuffer);

  mergedPdfBuffer = await mergerAnswers.saveAsBuffer();
  fs.writeFileSync(`${directory}/alle-antworten.pdf`, mergedPdfBuffer);
})();
