import './App.css';
import { useRef, useState } from 'react';
import { RealtimeTranscriber } from 'assemblyai/streaming';
import * as RecordRTC from 'recordrtc';

function App() {
  /** @type {React.MutableRefObject<RealtimeTranscriber>} */
  const realtimeTranscriber = useRef(null)
  /** @type {React.MutableRefObject<RecordRTC>} */
  const recorder = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const getToken = async () => {
    const response = await fetch('http://localhost:8000/token');
    const data = await response.json();

    if (data.error) {
      alert(data.error)
    }

    return data.token;
  };

  const startTranscription = async () => {
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sampleRate: 16_000,
    });

    const texts = {};
    realtimeTranscriber.current.on('transcript', transcript => {
      let msg = '';
      texts[transcript.audio_start] = transcript.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`
          console.log(msg)
        }
      }
      setTranscript(msg)
    });

    realtimeTranscriber.current.on('error', event => {
      console.error(event);
      realtimeTranscriber.current.close();
      realtimeTranscriber.current = null;
    });

    realtimeTranscriber.current.on('close', (code, reason) => {
      console.log(`Connection closed: ${code} ${reason}`);
      realtimeTranscriber.current = null;
    });

    await realtimeTranscriber.current.connect();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        recorder.current = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm;codecs=pcm',
          recorderType: RecordRTC.StereoAudioRecorder,
          timeSlice: 250,
          desiredSampRate: 16000,
          numberOfAudioChannels: 1,
          bufferSize: 4096,
          audioBitsPerSecond: 128000,
          ondataavailable: async (blob) => {
            if(!realtimeTranscriber.current) return;
            const buffer = await blob.arrayBuffer();
            realtimeTranscriber.current.sendAudio(buffer);
          },
        });
        recorder.current.startRecording();
      })
      .catch((err) => console.error(err));

    setIsRecording(true)
  }

  const endTranscription = async (event) => {
    event.preventDefault();
    setIsRecording(false)

    await realtimeTranscriber.current.close();
    realtimeTranscriber.current = null;

    recorder.current.pauseRecording();
    recorder.current = null;
  }


  return (
    <div className="App">
      <header>
        <h1 className="header__title">Real-Time Transcription</h1>
        <p className="header__sub-title">Try AssemblyAI's new real-time transcription endpoint!</p>
      </header>
      <div className="real-time-interface">
        <p id="real-time-title" className="real-time-interface__title">Click start to begin recording!</p>
        {isRecording ? (
          <button className="real-time-interface__button" onClick={endTranscription}>Stop recording</button>
        ) : (
          <button className="real-time-interface__button" onClick={startTranscription}>Record</button>
        )}
      </div>
      <div className="real-time-interface__message">
        {transcript}
      </div>
    </div>
  );
}

export default App;
