import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { RecordRTC, MediaStreamRecorder } from "recordrtc";
import userprofile from './../images/user_avatar.png';
let userId = localStorage.getItem('user_id');
let userProfileImage = localStorage.getItem('user_profile_image');

if(!userProfileImage) {
  userProfileImage = userprofile;
}


let userName = localStorage.getItem('user_name');


class STTClassComponent extends React.Component {

    constructor() {
        super();
        this.state = this.initialState;
        
        this.requestUserMedia();
    }
      audioStream = null;
      initialState = {
        socket: "",
        recorder: "",
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
            //Honeybadger.notify(error)
            console.log(error);
          }
        };
    
      };

    initSocketConnection1 = () => {
      console.log('Inside intiSocketConnection1');
      this.socket = new WebSocket("wss://asr.sorizava.co.kr:7443/client/ws/speech");
      this.socket.onclose = (event) => {
          console.log("WebSocket is closed:", event);
      };
        let finalMessage = '';
        let oldSubtitileSegment;
        this.socket.onmessage = (message) => {
          const dataFromServer = JSON.parse(message.data);
          
          if(dataFromServer.result) {
             
            try {
                let captionsLocal = [];
                let subtitleFlag = dataFromServer.result.final;
                let subtitleSegment = dataFromServer.segment;
                  //STT - Start
                  // Pass Captions to Socket to remote users
                    let remoteUserId = userId;
                    let remoteUserProfile = userProfileImage;
                    
                        if(localStorage.getItem('removeOldSTT') == 1) {
                          finalMessage = '';
                        }
                        //if(this.props.isSubtitle && this.props.isAudioMuted == false) {
                        if(this.props.isSubtitle && (this.props.isAudioMuted == false || oldSubtitileSegment == subtitleSegment)){
                          
                            oldSubtitileSegment = subtitleSegment;
                            console.log("checkoutAttendence")
                          

                            // make final message to send on screen
                            if(subtitleFlag){
                              
                              console.log('inside STT removeOldSTT =========== ',localStorage.getItem('removeOldSTT'));
                              if(localStorage.getItem('removeOldSTT') == 1 || finalMessage.length > 50) {
                                finalMessage = '';
                              }
                              finalMessage += dataFromServer.result.hypotheses[0].transcript;
                              //this.props.finalSTTMessage += dataFromServer.result.hypotheses[0].transcript;
                              //let tempFinalMessage =  this.props.setfinalSTTMessage();
                              //this.props.setfinalSTTMessage(finalMessage);
                              console.log('before : '+finalMessage);

                              // if(finalMessage.length > 100){
                              //   finalMessage = finalMessage.substring(20);
                              //   console.log('after : '+finalMessage.length);
                              // }
                              console.log('finalMessage from Server inside condition: '+finalMessage);
                            }
                          
                            if(dataFromServer.result.hypotheses[0].transcript != '...'){

                              // Validate last element is of same user
                              // if(captionsLocal.length > 0){
                              //   if(captionsLocal[captionsLocal.length - 1].user_id == userId) {
                              //     console.log("Inside if");
                              //     captionsLocal.splice(captionsLocal.length - 1,1);
                              //   }
                              //   console.log("outside if")
                              // }

                              // set caption to local array
                              captionsLocal.push({'user_id':userId,'username':userName,'captions':finalMessage, 'currentSubtitle':dataFromServer.result.hypotheses[0].transcript, 'subtitleFlag':subtitleFlag, 'subtitleSegment':subtitleSegment, 'userProfile':userProfileImage}); 

                              // Set Captions for sending to parent component
                              
                              console.log("Child Component:",captionsLocal);
                            }
                       
                      }
                      this.props.getCaptions(captionsLocal);
            } catch (error) {
              // console.log(error)
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

      };
      //Stop

      startSTT = (streamData) => {
        try {         
          const recordRtc = require("recordrtc");
          //if (this.audioTrackLocal && this.audioTrackLocal.stream) {
            this.recorder = recordRtc(streamData, {
              type: "audio",
              recorderType: MediaStreamRecorder,
              mimeType: "audio/webm",
              bitsPerSecond: 1000,
              checkForInactiveTracks: false,
              timeSlice: 500,
              ondataavailable: this.onChunkAvailable,
            });
            this.recorder && this.initSocketConnection1();
     
        } catch (error) {
          //Honeybadger.notify(error)
        
          this.recorder = null;
          this.socket && this.socket.close();
          // this.writeLog("local-streaming-failed", error.message, "error");
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
              //Honeybadger.notify(error)
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
      return "";
    }
  }

  export default STTClassComponent;
