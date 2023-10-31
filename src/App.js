import './App.css';
import { useRef, useState } from 'react';
import * as RecordRTC from 'recordrtc';

function App() {
  const socket = useRef(null)
  const recorder = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const generateTranscript = async() => {
    const response = await fetch('http://localhost:8000/token');
    const data = await response.json();

    if(data.error){
      alert(data.error)
    }
      
    const { token } = data;
  
    socket.current = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
  
    const texts = {};
    socket.current.onmessage = (voicePrompt) => {
      let msg = '';
      const res = JSON.parse(voicePrompt.data);
      texts[res.audio_start] = res.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}` 
          console.log(msg)
        }
      }
      setTranscript(msg)
    };
  
    socket.current.onerror = (event) => {
      console.error(event);
      socket.current.close();
    }
    
    socket.current.onclose = event => {
      console.log(event);
      socket.current = null;
    }
  
    socket.current.onopen = () => {
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
            ondataavailable: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;
                if (socket.current) {
                  socket.current.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
                }
              };
              reader.readAsDataURL(blob);
            },
          });
          recorder.current.startRecording();
        })
        .catch((err) => console.error(err));
    };
    
    setIsRecording(true) 
  }

  const endTranscription = async (event) => {
    event.preventDefault();
    setIsRecording(false) 

    socket.current.send(JSON.stringify({terminate_session: true}));
    socket.current.close();
    console.log(prompt)
    socket.current = null;

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
          <button className="real-time-interface__button" onClick={generateTranscript}>Record</button>
        )}
      </div>
      <div className="real-time-interface__message">
        {transcript}
      </div>
    </div>
  );
}

export default App;
