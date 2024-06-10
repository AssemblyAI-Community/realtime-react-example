const express = require('express');
const cors = require('cors');
const { AssemblyAI } = require('assemblyai');
require('dotenv').config();

const aaiClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
const app = express();
app.use(express.json());
app.use(cors());

app.get('/token', async (req, res) => {
  try {
    const token = await aaiClient.realtime.createTemporaryToken({ expires_in: 3600 });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.set('port', 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${server.address().port}`);
});
