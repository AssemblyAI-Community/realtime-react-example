const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors());

app.get('/token', async (req, res) => {
  try {
    const response = await axios.post('https://api.assemblyai.com/v2/realtime/token', 
      { expires_in: 3600 }, 
      { headers: { authorization: `${process.env.AAI_KEY}` } }); 
    const { data } = response; 
    res.json(data); 
  } catch (error) {
    const {response: {status, data}} = error;    
    res.status(status).json(data);
  }
});

app.set('port', 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${server.address().port}`);
});
