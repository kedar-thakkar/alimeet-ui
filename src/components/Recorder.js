// React System Libraries
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import $ from 'jquery';
import { useReactMediaRecorder, ReactMediaRecorder } from "react-media-recorder";

// Customised Libraries or components
import { ENDPOINTURL } from './common/endpoints';

function Recorder(props) {

    // Use State for Recorder
    const [videoUrl, setVideoUrl] = useState('');
    const [currentMeetingId, setCurrentMeetingId] = useState();
    const [response, setResponse] = useState("");
    const [componentStatus, setComponentStatus] = useState("");
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");
    const [exitbutton,setexitbutton]= useState('');
    const [recordStatus,setRecordingStatus]= useState('');
    const {
      error,
      status,
      startRecording,
      stopRecording,
      mediaBlobUrl,
      clearBlobUrl
    } = useReactMediaRecorder({screen:true, audio:true});
    useEffect(() => {
        if (props.action === "start") {
            $('#start-rec').click();
        }
        if (props.action === "stop") {
            $('#stop-rec').click();
          
            if (mediaBlobUrl && error !=="permission_denied") {
                // window.open(videoUrl, '_blank');      
                uplaodDocument();
            }
            
            clearBlobUrl();
            //props.recordState('stop');
        }

        //for setmeeting id from meetingUI component
        if (props.meetingId) {
            setCurrentMeetingId(props.meetingId)
        }
    }, [props.action,videoUrl,props.meetingId]);

    useEffect(() => {
      if(error === 'permission_denied'){
        props.stateChanger(false);
        props.stateLoader(false);
        props.handleRec('stop');
        //props.recordState('stop');
      }
    },[error]);

    useEffect(() => {
      if(status === 'recording'){
        props.stateChanger(true);
        props.stateLoader(true);
        //props.recordState('start');
        props.handleRec('start');
      }
    },[status]);

    useEffect(() => {
      if(mediaBlobUrl){
        setVideoUrl(mediaBlobUrl);
      }
    },[mediaBlobUrl]);

    // const stopRec = (error) => {
    //   setexitbutton(error);
    // }

    // const statusRec = (status) => {
    //   setRecordingStatus(status);
    // }
    
    // Upload an document of recording to AWS
    const uplaodDocument = async () => {
        props.stateChanger(true);
        props.stateLoader(true);
        //props.recordState('start');
        setComponentStatus({
          status: "processing",
          message: "Uploading Document..."
        });

        var formData = new FormData();    
        let blob = await fetch(videoUrl).then(r => r.blob());    
        var today = new Date().toString()
        let teacherName = localStorage.getItem('user_name');
        teacherName = teacherName.replaceAll(' ', '');
        let meetingId = localStorage.getItem('active_meeting_id');
        let fileName = teacherName+''+meetingId+''+today+'.mp4';
        formData.append("files", blob, fileName);
        
        try {
            setComponentStatus({
              status: "processing",
              message: "processing"
            })   
            const recordingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/addAllDocuments?meetingId=${meetingId}&source=Recordings&userId=${userId}`,
                formData, {
                headers: {
                  "Authorization": `Bearer ${token}`
                }
            });
            
            if (recordingResponse.data.Status === "200") {
              props.stateChanger(false);
              props.stateLoader(false);
              //props.recordState('stop');
              setComponentStatus({
                status: "OK",
                message: recordingResponse.data.message
              });
            }else{
              props.stateChanger(false);
              props.stateLoader(false);
              setComponentStatus({
              status: "error",
              message: recordingResponse.data.message
              });
            }
        } catch (error) {
          props.stateChanger(false);
          props.stateLoader(false);
          //props.recordState('stop');
            setComponentStatus({
                status: "error",
                message: "Something went wrong When Save Your Recording"
            });
        }
    }

    return (
        <div>
                <div className="d-none">
                  <button onClick={startRecording} id="start-rec">Start Recording</button>
                  <button onClick={stopRecording} id="stop-rec"> Stop Recording</button>
                </div>
                {console.log('error log ---> ',error)},
                {console.log('status log ---> ',status)},
                {/* {
                  status !== "recording" ? setRecordingStatus(status) : ""
                } */}
                {/* {
                  mediaBlobUrl && setVideoUrl(mediaBlobUrl)
                } */}

        </div>
    );
}

export default Recorder;