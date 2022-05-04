import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { RecordRTC, MediaStreamRecorder } from "recordrtc";
import STTClassComponent from './STTClassComponent';


let socket;
let recorder;
let audioStream = "component";
function STT() { 

   return (<>
   {/* <STTClassComponent/> */}
   </>)
}

export default STT;