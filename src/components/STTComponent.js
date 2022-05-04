import React from 'react';
import { MediaStreamRecorder } from "recordrtc";

class STTComponent extends React.Component {
    constructor() {
        super();
        this.state = this.initialState;
        this.requestUserMedia();
    }
    
    audioStream = null;
    initialState = {
    socket: "",
    recorder: ""   
    }

    requestUserMedia() {        
        const recordRtc = require("recordrtc");
        this.captureUserMedia((stream) => {
            this.audioStream = recordRtc(stream, { type: 'audio' });
            this.startSTT(stream);
        });
    }

    captureUserMedia(callback) {
        var params = { audio: true, video: false };
        navigator.getUserMedia(params, callback, error => {
          alert(JSON.stringify(error));
        });
    }

    onChunkAvailable = (blob) => {
        this.reader = new FileReader();
        this.reader.readAsDataURL(blob);
        this.reader.onloadend = () => {        
            try {
                if (this.setConnected) {
                    this.socket.send(blob);
                }
            } catch (error) {            
                console.log(error);
            }
        };
    };

    initSocketConnection1 = () => {      
        let interval = setInterval(() => {
          this.socket = new WebSocket("wss://asr.sorizava.co.kr:7443/client/ws/speech");      
          this.socket.onclose = (event) => {
            console.log("WebSocket is closed:", event);            
          };
      
          this.socket.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);           
            if(dataFromServer.result) {               
              try {                
                this.props.setSubtitle(dataFromServer.result.hypotheses[0].transcript)
              } catch (error) {
                console.log(error)
              }
            }            
          }
      
          this.socket.onerror = (event) => {         
          };
      
          this.socket.onopen = (event) => {
            this.setConnected = true;      
            if (this.recorder) {
              this.recorder.startRecording();              
            } else {             
              this.socket.close();
            }
          };  
          clearInterval(interval)
        },500);  
    };

    startSTT = (streamData) => { 
        try {         
          const recordRtc = require("recordrtc");
          //if (this.audioTrackLocal && this.audioTrackLocal.stream) {
            this.recorder = recordRtc(streamData, {
              type: "audio",
              recorderType: MediaStreamRecorder,
              mimeType: "audio/webm",
              bitsPerSecond: 128000,
              checkForInactiveTracks: false,
              timeSlice: 500,
              ondataavailable: this.onChunkAvailable,
            });
            this.recorder && this.initSocketConnection1();     
        } catch (error) {        
          this.recorder = null;
          this.socket && this.socket.close();          
        }
    };

    stopLocalStreaming = () => {
        this.recorder &&
            this.recorder.stopRecording(() => {
                try {
                    this.reader && this.reader.abort();
                    this.reader = null;
                    this.socket && this.socket.close();
                } catch (error) {              
                    console.log(error);
                }
                this.setState({
                    isLocalStreaming: false,
                    isLocalStreamingStopAlert: true,
                });
            });
        this.recorder = null;
    };

    render() {
        return <h2></h2>;
    }
}
export default STTComponent;