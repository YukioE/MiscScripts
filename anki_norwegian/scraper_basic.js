(async function generateAnkiDeck() {
    // Get table rows from the website
    const rows = Array.from(document.querySelectorAll('table tbody tr')).slice(1, 101); // Skip header row and limit to 100 rows

    // Map over rows to extract data
    const data = rows.map(row => {
        const cells = row.querySelectorAll('td');
        const norwegianWord = cells[1]?.textContent.trim();
        const englishWord = cells[2]?.textContent.trim();
        const pronunciationLink = `<a href="https://de.forvo.com/word/${encodeURIComponent(norwegianWord)}/#no">Pronunciation</a>`;
        return `${englishWord};${norwegianWord}<br>${pronunciationLink}`;
    });

    // Combine into a single string
    const content = data.join('\n');

    // Create a blob and download it as a .txt file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'norwegian_top_100_words.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Anki deck file generated and downloaded!');
})();
