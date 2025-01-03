const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Load API keys from a separate JSON file
const apiKeys = JSON.parse(fs.readFileSync('apis.json', 'utf8'));

// Function to escape text for Anki import
function escapeText(text) {
    return text.replace(/\"/g, '\"\"').replace(/\\n/g, '<br>');
}

// Function to save to a text file
function saveToFile(content, filename) {
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`File saved as: ${filename}`);
}

// Function to fetch images from Unsplash API
async function fetchImage(word) {
    const unsplashBaseURL = "https://api.unsplash.com/search/photos";
    const unsplashApiKey = apiKeys.unsplash;

    try {
        const response = await axios.get(unsplashBaseURL, {
            params: {
                query: word,
                per_page: 1
            },
            headers: {
                Authorization: `Client-ID ${unsplashApiKey}`
            }
        });

        const photos = response.data.results;
        if (photos.length > 0) {
            return `<img src="${photos[0].urls.small}">`;
        } else {
            console.log(`No images found for: ${word}`);
            return "No image available";
        }
    } catch (error) {
        console.error(`Error fetching image for '${word}':`, error.message);
        return "Error fetching image";
    }
}

async function fetchPronunciation(word) {
    const url = `https://apifree.forvo.com/key/${apiKeys.FORVO_API_KEY}/format/json/action/word-pronunciations/word/${word}/language/no`;
    const response = await axios.get(url);
    return response.data.items[0]?.pathmp3 || '';
}

async function fetchWordDetails(word) {
    const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;
    const options = {
        headers: {
            'X-RapidAPI-Key': apiKeys.FORVO_API_KEY,
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
    };
    const response = await axios.get(url, options);
    return {
        wordClass: response.data.results[0]?.partOfSpeech || '',
        generalMeaning: response.data.results[0]?.definition || ''
    };
}

async function fetchExampleSentences(word) {
    const url = `https://tatoeba.org/en/sentences/search?query=${word}&from=nor&to=eng&json`;
    const response = await axios.get(url);
    return response.data?.sentences.map(sentence => sentence.text).slice(0, 3) || [];
}

// Function to fetch additional data
async function fetchAdditionalData(word) {
    const picture = await fetchImage(word);
    //const pronunciation = await fetchPronunciation(word);
    //const { wordClass, generalMeaning } = await fetchWordDetails(word);
    //const exampleSentences = await fetchExampleSentences(word);

    return { picture, pronunciation, wordClass, generalMeaning, exampleSentences };
}

// Function to scrape words and generate Anki-compatible text
async function scrapeWords(numberOfWords) {
    const baseURL = 'https://1000mostcommonwords.com/1000-most-common-norwegian-words/';

    try {
        // Fetch the HTML content
        const { data } = await axios.get(baseURL);
        const $ = cheerio.load(data);

        let ankiContent = '';
        let wordCount = 0;

        // Parse the table rows
        $('tbody tr').each(async (index, element) => {
            if (wordCount >= numberOfWords) return; // Stop if the limit is reached

            const cells = $(element).find('td');
            const number = $(cells[0]).text().trim();
            const norwegian = $(cells[1]).text().trim();
            const english = $(cells[2]).text().trim();

            if (number && norwegian && english) {
                console.log(`Scraping word: ${norwegian} (${wordCount + 1}/${numberOfWords})`);

                // Fetch additional data
                const { picture, pronunciation, wordClass, generalMeaning, exampleSentences } =
                    await fetchAdditionalData(norwegian);

                // Escape text and prepare Anki content
                const escapedEnglish = escapeText(english);
                const escapedNorwegian = escapeText(norwegian);
                const escapedPronunciation = escapeText(pronunciation);
                const escapedWordClass = escapeText(wordClass);
                const escapedGeneralMeaning = escapeText(generalMeaning);
                const escapedExampleSentences = exampleSentences.map(escapeText).join('<br>');

                ankiContent += `${escapedEnglish};${picture};${escapedNorwegian};${escapedPronunciation};${escapedWordClass};${escapedGeneralMeaning};${escapedExampleSentences}\n`;

                wordCount++;
            }
        });

        // Save to file
        saveToFile(ankiContent, `norwegian_words_top_${numberOfWords}.txt`);
    } catch (error) {
        console.error('Error scraping the website:', error);
    }
}

// Specify the number of words to scrape
const numberOfWords = 50; // Change this to 500, 1000, etc.
scrapeWords(numberOfWords);
