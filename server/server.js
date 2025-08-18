const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/token', async (req, res) => {
  const expiresInSeconds = 500;
  const url = `https://streaming.assemblyai.com/v3/token?expires_in_seconds=${expiresInSeconds}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    });

    res.json({ token: response.data.token });
  } catch (error) {
    console.error("Error generating temp token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

app.set('port', 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${server.address().port}`);
});
