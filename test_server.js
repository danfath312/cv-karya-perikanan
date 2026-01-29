const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/translate', async (req, res) => {
  try {
    const { text, source = 'id', target = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const fetch = require('node-fetch');
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${source}|${target}`;

    const translationResponse = await fetch(apiUrl);
    const data = await translationResponse.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return res.json({ 
        success: true,
        translatedText: data.responseData.translatedText 
      });
    } else {
      return res.json({ 
        success: false,
        error: 'Translation service unavailable',
        translatedText: text
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Translation failed: ' + error.message 
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
