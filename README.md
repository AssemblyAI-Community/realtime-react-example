# AssemblyAI Real-Time Microphone Transcription-React Example

This open-source repo provided by AssemblyAI displays how to use our Real-time API with the React framework.

In this app, we grab an audio stream from the user's computer and then send that over a WebSocket to AssemblyAI for Real-time transcription. Once AssemblyAI begins transcribing, the app displays the text in the browser. This is accomplished using Express for our backend and React for our frontend.

## How To Install and Run the Project

##### ❗Important❗

- Before running this app, you need to upgrade your AssemblyAI account. The real-time API is only available to upgraded accounts at this time.
- Running the app before upgrading will cause an **error with a 402 status code.** ⚠️
- To upgrade your account you need to add a card. You can do that in your dashboard [here](https://www.assemblyai.com/app/)!

##### Instructions

1. Clone the repo to your local machine.
2. Open a terminal in the main directory housing the project. In this case `real-time-react`.
3. Run `npm install` to ensure all dependencies are installed.
4. Add a `.env` file to the `server` folder. Add your AssemblyAI key to the `.env` file. You can find your API key on the "Account" page in your dashboard [here](https://www.assemblyai.com/app/account). Copy and paste it into the `.env` file replacing "YOUR-PERSONAL-API-KEY" with your own key:

```
ASSEMBLYAI_API_KEY="YOUR-PERSONAL-API-KEY"
```

5. Start the app with the command `npm start`. The app will run on port 3000. Open `http://localhost:3000/` in your browser and click "Record" to receive live transcription.

## Further Documentation

- [AssemblyAI Real-Time Documentation](https://www.assemblyai.com/docs/speech-to-text/streaming)
- [recordrtc](https://www.npmjs.com/package/recordrtc)
- [Express](https://expressjs.com/)

## Contact Us

If you have any questions, please feel free to reach out to our Support team - support@assemblyai.com!
