import { ReactMediaRecorder } from "react-media-recorder";
import React, { useState } from 'react';


function TestRecorder() { 

  return (
    <>
      <h1>Test recording</h1>
      <div>
        <ReactMediaRecorder  render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
            <div>
              <p>{status}</p>
              <button onClick={startRecording}>Start Recording</button>
              <button onClick={stopRecording}>Stop Recording</button>
              <video src={mediaBlobUrl} controls autoplay loop />
            </div>
          )}

          screen
        />
      </div>
    </>
  )

}

export default TestRecorder;