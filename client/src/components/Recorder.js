import React, { useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Recorder = () => {
  const { businessId } = useParams();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];

      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("businessId", businessId);


      await axios.post("http://localhost:5000/upload", formData);
    };

    mediaRecorder.start();
    setRecording(true);

    // ⏱ Auto stop after 5 sec
    setTimeout(() => {
      mediaRecorder.stop();
      setRecording(false);
    }, 5000);
  };

  return (
    <div>
      <h3>Review for business: {businessId}</h3>
      <button onClick={startRecording} disabled={recording}>
        {recording ? "Recording..." : "Start Recording"}
      </button>
    </div>
  );
};

export default Recorder;