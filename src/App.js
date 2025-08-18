import './App.css';
import { useRef, useState } from 'react';

export default function Home() {
  const socket = useRef(null);
  const audioContext = useRef(null);
  const mediaStream = useRef(null);
  const scriptProcessor = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState({}); 

  const getToken = async () => {
    const response = await fetch('http://localhost:8000/token');
    const data = await response.json();

    if (!data || !data.token) {
      alert('Failed to get token');
      return null;
    }

    return data.token;
  };

  const startRecording = async () => {
    const token = await getToken();
    if (!token) return;

    const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&formatted_finals=true&token=${token}`;
    socket.current = new WebSocket(wsUrl);

    const turns = {}; // for storing transcript updates per turn

    socket.current.onopen = async () => {
      console.log('WebSocket connection established');
      console.log('Connected to:', wsUrl);
      setIsRecording(true);

      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext({ sampleRate: 16000 });

      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      scriptProcessor.current = audioContext.current.createScriptProcessor(4096, 1, 1);

      source.connect(scriptProcessor.current);
      scriptProcessor.current.connect(audioContext.current.destination);

      scriptProcessor.current.onaudioprocess = (event) => {
        if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;

        const input = event.inputBuffer.getChannelData(0);
        const buffer = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          buffer[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }
        socket.current.send(buffer.buffer);
      };
    };

    socket.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      const message = JSON.parse(event.data);

      if (message.type === 'Turn') {
        const { turn_order, transcript } = message;
        turns[turn_order] = transcript;

        setTranscripts({ ...turns });
      }
    };

    socket.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      stopRecording();
    };

    socket.current.onclose = () => {
      console.log('WebSocket closed');
      socket.current = null;
    };
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect();
      scriptProcessor.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }

    if (socket.current) {
      socket.current.send(JSON.stringify({ type: 'Terminate' }));
      socket.current.close();
      socket.current = null;
    }
  };

  const orderedTranscript = Object.keys(transcripts)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => transcripts[k])
    .join(' ');

  return (
    <div className="App">
      <header>
        <h1 className="header__title">Real-Time Transcription (v3)</h1>
        <p className="header__sub-title">
          Powered by AssemblyAI's latest real-time model
        </p>
      </header>
      <div className="real-time-interface">
        <p className="real-time-interface__title">Click start to begin recording!</p>
        {isRecording ? (
          <button className="real-time-interface__button" onClick={stopRecording}>
            Stop recording
          </button>
        ) : (
          <button className="real-time-interface__button" onClick={startRecording}>
            Record
          </button>
        )}
      </div>
      <div className="real-time-interface__message">
        <p><strong>Transcript:</strong> {orderedTranscript}</p>
      </div>
    </div>
  );
}