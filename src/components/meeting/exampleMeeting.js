import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './style.scss';
import "./css/fonts/stylesheet.css";
//import "./css/mdb.min.css";
import "./css/magnific-popup.css";
import "./css/slick.css";
// import "./css/style.css";
import audioOff from "../../assets/img/brand/audio-off.svg";
import audioOn from "../../assets/img/brand/group.svg";
import videoOn from "../../assets/img/brand/videocam-24-px.svg";
import videoOff from "../../assets/img/brand/video-off.svg";
import screenShareOn from "../../assets/img/brand/screen-on.svg";
import screenshareOff from "../../assets/img/brand/screen-share-24-px.svg";
import subtitleImage from '../../../src/images/subtitles.svg'

import {
    Col, Form, FormGroup, Label,
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Badge,
    Spinner,
    Progress,
} from "reactstrap";
import { data, map } from 'jquery';
import $ from 'jquery';
import Chat from './chat';
import Axios from 'axios';
import io from 'socket.io-client';
import queryString from "query-string"
import { ENDPOINJITSITURL } from '../common/endpointJitsi';
import { ENDPOINSOCKETURL, ENDPOINTURL } from '../common/endpoints';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Prelaunch from '../meeting/prelaunch';
import Whiteboard from './whiteboard';
import Fabricwhiteboard from './fabricwhiteboard';
import axios from 'axios';
import STTClassComponent from '../STTClassComponent';
import DocumentUpload from '../documentUpload';
import { ReactMediaRecorder } from 'react-media-recorder';
import Recorder from '../Recorder';



//For  Muting of video tracks    
let isVideoMuted = false;
let isAudioMuted = false;
let room = null;
let localTracks = [];
let connection = null;
let participantsList = [];
let currentUser = {};
let socket = '';
let participants = [];
let remoteTracks = [];
let myVideoId = '';
let teacherMainTrack = "";
let cameraDeviceId = [];
let micDeviceId = [];
let sharescreen = false;
let participantsDetails = [];
let speakerOnScreen = null;
let screenRecording = false;
let isVideo = true;
let isScreenShared = false;
// let cameraOptions= [];
// let microphoneOptions= [];
let subtitle_handler = false;
let { roomName, meetingData } = queryString.parse(window.location.search);


const useStyles = makeStyles({
    slides: {
    },
});

const marks = [
    {
        value: 0,
        label: 'Low',
    },
    {
        value: 25,
        label: 'Low defi.',
    },
    {
        value: 50,
        label: 'Standart defi.',
    },
    {
        value: 75,
        label: 'High defi.',
    }
];

function valuetext(value) {
    return `${value}`;
}

function valueLabelFormat(value) {
    return marks.findIndex((mark) => mark.value === value) + 1;
}

let savedTrack = [];

function ExampleMeeting(props) {

    useEffect(() => {

        let userType = localStorage.getItem('user_role');
        setRole(userType);

    }, [])

    const toggleStudentScreen = () => {
        $(".list_box").toggleClass('teachers_On')
        //$(".videotoggleview").toggleClass('teachers_on')
        $('.local-video-view').toggleClass('small')
    }

    const {
        className
    } = props;


    const [modal, setModal] = useState(false);
    const [modalpwd, setModalpwd] = useState(false);
    const [modalsecurity, setModalsecurity] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [role, setRole] = useState("");
    const [videoMuted, setVideoMuted] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [scrollHandler, setScrollHandler] = useState(true);
    const allParticipants = [];
    const [imageElement, setImageElement] = useState("");

    // Make the prelaunch screen true
    const [prelaunchScreen, setPrelaunchScreen] = useState(true);
    const [size, setSize] = useState("");
    const [allMediaDevices, setAllMediaDevices] = useState([]);
    const [meetingPassword, setMeetingPassword] = useState('');
    const [currentMeetingId, setCurrentMeetingId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRes, setpasswordRes] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [subtitleDisplay, setSubtitleDiplay] = useState('');
    const [documentToggleModal, setDocumentToggleModal] = useState(false);

    const [recordingHandler, setRecordingHandler] = useState('')
    const [recordAction, setRecordAction] = useState('start')


    const setModalIsOpenToTrue = () => {
        setModalIsOpen(true)
    }

    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false)
    }

    const classes = useStyles();


    const toggle = () => setModal(!modal);
    const togglepwd = () => {
        setModalpwd(!modalpwd);
        props.history.push("/user/meeting/meetinglist");

    }
    const togglesecurity = () => setModalsecurity(!modalsecurity);


    const handleSizeChanged = size => {
        console.log("size", size);
        // this.setState({ size });
        setSize(size);
    };

    const getDatasetBySize = size => ({
        widthRange: size.width > 200 ? "large" : "small",
        heightRange: size.height > 200 ? "large" : "small"
    });

    useEffect(() => {

        if (scrollHandler === true) {
            setScrollHandler(false);
            if ($('.list_otr').is(':empty')) {
                $('.list_otr').removeClass('active');
            } else {
                $('.list_otr').addClass('active');
            }
        }

    }, [scrollHandler])

    const video1 = () => setModal(!modal);
    /* global $, JitsiMeetJS */

    const options = {
        serviceUrl: 'https://meets.alibiz.net/http-bind',
        hosts: {
            domain: 'meets.alibiz.net',
            muc: 'conference.meets.alibiz.net'
        },
        resolution: 1080,
        maxFullResolutionParticipants: 2,
        setSenderVideoConstraint: '1080',
        setReceiverVideoConstraint: '180',
        constraints: {
            video: {
                aspectRatio: 16 / 9,
                height: {
                    ideal: 1080,
                    max: 1080,
                    min: 1080
                }
            }
        }
    }

    const confOptions = {
        openBridgeChannel: true
    };


    let isJoined = false;
    let uploadModal = false;
    let muteButtonClick = false;

    /**
     * Handles local tracks.
     * @param tracks Array with JitsiTrack objects
     */
    function onLocalTracks(tracks) {
        // if (
        //     cameraOptions[0].value === "" &&
        //     microphoneOptions[0].value === ""
        //   ) {
        //     JitsiMeetJS.mediaDevices.enumerateDevices(getMediaDevices);
        //   }         
        localTracks = tracks;

        console.log("Local Tracks -----------------", tracks);
        for (let i = 0; i < localTracks.length; i++) {

            try {
                localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                    audioLevel => console.log(`Audio Level local: ${audioLevel}`));
                localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    (data) => console.log('local track muted', 'data'));

                localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => {
                        console.log('local track stoped');
                        if (isVideo) {
                            switchVideo();
                        }
                    });
                localTracks[i].addEventListener(
                    JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                    deviceId =>
                        console.log(
                            `track audio output device was changed to ${deviceId}`));
            } catch (error) {
                console.error(error);
            }

            const role = localStorage.getItem("user_role");
            if (localTracks[i].getType() === 'video') {
                $("#jitsi-wrapper").append(`<video autoplay='1' id='localVideo${i}' class='${tracks[i].track.id} local-video-view ${role === 'Student' && 'student-view'}' />`);
                localTracks[i].attach($(`#localVideo${i}`)[0]);

                myVideoId = tracks[i].track.id;

            } else {
                $("#jitsi-wrapper").append(
                    `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
                localTracks[i].attach($(`#localAudio${i}`)[0]);
            }
            if (isJoined) {
                room.addTrack(localTracks[i]);
            }
            console.log('room---', room);
        }
    }

    /**
     * Handles remote tracks
     * @param track JitsiTrack object
     */

    //Remote video track MuteChanged event hadler responsible for switching between avatar and video screens
    const remoteVideoTrackMuteChangedEventHandler = (track) => {
        let xid = track.track.id;
        xid = xid.slice(0, -2);
        const participant = track.getParticipantId();
        console.log("participantid===", participant);
        console.log("participantid===", participant);
        // console.log(`id ==== video-off-${xid}`)
        console.log('track muted : ', track.muted)
        console.log("Element: ", "audio-off-icon-" + xid);

        if (track.muted) {
            $(`#audio-off-icon-${participant}`).removeClass('d-none');
            $(`#video-off-${xid}`).removeClass('d-none');
        } else {
            $(`#video-off-${xid}`).addClass('d-none');
            $(`#audio-off-icon-${participant}`).addClass('d-none');

        }

    };


    /* SOCKET CODE START */

    useEffect(() => {
        socket = io(ENDPOINSOCKETURL);
        //socket = io("http://localhost:5000");
        socket.emit('join', { room: roomName });
        let meeting = JSON.parse(meetingData);
        if (meeting) {
            setCurrentMeetingId(meeting.meetingId)
            // localStorage.setItem("meetingId", meeting.meetingId)
            // console.log("Example meeting", meeting.meetingId)
        }
        if (meeting.meetingPassword) {
            setModalpwd(true);
        }
        startMeeting();
        checkForPassword()

    }, [])


    useEffect(() => {
        console.log("currentMeetingId", currentMeetingId)
    }, [currentMeetingId])

    const checkForPassword = () => {

        (
            <>
                {/* <Button color="danger" onClick={togglepwd}>aaaa</Button> */}

            </>
        )

    }
    useEffect(() => {
        if (socket) {

            socket.on('remove-share-screen', ({ id }) => {
                console.log('remove-share-screen');
            })

            socket.on('subtitle-data', ({ data }) => {
                console.log('subtitle-data-from-socket', data);
                setSubtitleDiplay(data);
            })

            socket.on('screen-share-on', ({ data }) => {
                // console.log('screen-share-on');

                let interval = setInterval(() => {
                    $('.myteacher-screen').addClass("teacher-small-screen");
                    // console.log("socketdata", data);                  

                    $(`.${data}`).addClass("share-screen-view");

                    $(`.${data}`).removeClass("teacher-small-screen");

                    if ($(`.${data}`).hasClass("share-screen-view")) {

                        // clearInterval(interval)
                        console.log("teacherMainTrack", teacherMainTrack);
                        try {
                            if (teacherMainTrack) {

                                console.log("teachertrackid-------", $(`#${teacherMainTrack}`))
                                $(`#${teacherMainTrack}`).wrap(`<ResizeConsumer
                                className="container"
                              ></ResizeConsumer`);
                                teacherMainTrack = "";
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        // making teacher screen draggable 

                        clearInterval(interval)

                    }

                }, 500);

            })
        }
    }, [])

    /* SOCKET CODE END */


    // SUBTITLE USEEFFECT
    useEffect(() => {
        if (subtitle_handler === true) {
            socket.emit('subtitle', { data: subtitle })
            setSubtitleDiplay(subtitle)
        } else {
            socket.emit('subtitle', { data: "" })
            setSubtitleDiplay('')
        }

    }, [subtitle])

    function prelaunchMediaHandler(audioId, videoId) {
        // return selectedDevice;
        // console.log("selectedDevice", selectedDeviceId)
        // console.log("kind: ", kind);

        console.log("audioId: ", audioId)
        console.log("videoId: ", videoId)

        // const inputDevice = kind + "input";
        // const outputDevice = kind + "output";

        // FOR VIDEO DEVICES
        // allMediaDevices.map((device) => {
        //     if(device.kind === inputDevice || device.kind === outputDevice){
        //         // dipose code 
        //     } 
        // })  

        for (let i = 0; i < localTracks.length; i++) {
            localTracks[i].dispose();
        }

        JitsiMeetJS.createLocalTracks({
            devices: ["audio", "video"],
            cameraDeviceId: videoId,
            micDeviceId: audioId,
        }).then(onLocalTracks)
            .catch(error => {
                throw error;
            });

        setPrelaunchScreen(false);
        setModalIsOpen(false)
        connection.connect();


    }

    // function prelaunchMediaHandler1(selectedDeviceId, kind) {
    //     setPrelaunchScreen(false);
    //     // return selectedDevice;
    //     console.log("selectedDevice", selectedDeviceId)
    //     console.log("kind: ", kind);
    //     const inputDevice = kind + "input";
    //     const outputDevice = kind + "output";

    //     // FOR VIDEO DEVICES
    //     // allMediaDevices.map((device) => {
    //     //     if(device.kind === inputDevice || device.kind === outputDevice){
    //     //         // dipose code 
    //     //     } 
    //     // })  

    //     for (let i = 0; i < localTracks.length; i++) {
    //         localTracks[i].dispose();
    //     }

    //     JitsiMeetJS.createLocalTracks({
    //         devices: ["audio", "video"],
    //         cameraDeviceId: selectedDeviceId,
    //         micDeviceId: selectedDeviceId,
    //     }).then(onLocalTracks)
    //     .catch(error => {
    //         throw error;
    //     });       

    // }

    // function getMediaDevices(devices,kind){        
    //     devices.forEach((device, idx) => {
    //     const inputDevice = kind + "input";
    //     const outputDevice = kind + "output";
    //       if (inputDevice === "videoinput") {
    //         let cameraOptions = [...cameraOptions];
    //         cameraOptions = cameraOptions.filter((cam) => cam.value !== "");
    //         cameraOptions.push({
    //           label: device.label,
    //           value: device.deviceId,
    //           key: idx,
    //           kind: "videoinput",
    //         });          
    //       }
    //       if (outputDevice === "audioinput") {
    //         let microphoneOptions = [...microphoneOptions];
    //         microphoneOptions = microphoneOptions.filter((mic) => mic.value !== "");
    //         microphoneOptions.push({
    //           label: device.label,
    //           value: device.deviceId,
    //           key: idx,
    //           kind: "audioinput",
    //         });            
    //       }
    //     });
    //     };



    function viewStudent() {
        console.log("viewStudent is working")
    }

    function onRemoteTrack(track) {

        console.log("user called again", track)
        if (track.isLocal()) {
            return;
        }
        const participant = track.getParticipantId();


        let participantName = room.getParticipantById(participant)._displayName;
        participantName = participantName.split('#');


        if (!remoteTracks[participant]) {
            remoteTracks[participant] = [];
        }
        const idx = remoteTracks[participant].push(track);

        track.addEventListener(
            JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
        console.log('=================>');
        track.addEventListener(
            JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, remoteVideoTrackMuteChangedEventHandler
            // () => {
            //     console.log('remote track muted');
            // }
        );
        track.addEventListener(
            JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
            () => console.log('remote track stoped'));
        track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
            deviceId =>
                console.log(
                    `track audio output device was changed to ${deviceId}`));

        const id = participant + track.getType() + idx;
        console.log("participant.....", participant);

        console.log("track.getType(): ", track.getType());


        const role = localStorage.getItem('user_role');
        console.log('role =============> ', role);
        if (role === 'Teacher' || role === 'teacher') {

            console.log("role===", role);
            if (track.getType() === 'video') {


                const trackId = track.track.id;
                const MAIN_TRACK_ID = trackId.slice(0, -2);
                console.log("track-----------", MAIN_TRACK_ID);

                removeDiv(participant);
                console.log("NEW USER ENTERED THE MEETING - In Teacher")
                $("#remote-users-wrapper").append(`
                    <div class="student_box" id='${participant}video-wrapper' onclick="$('#${participant}video${idx}').toggleClass('student-video-focus');" >
                        <div class="student_img"> 
                            <img src='https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG' class='d-none' id="video-off-${MAIN_TRACK_ID}" />
                            <video autoplay='1' class='remote-video' poster="https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG" id='${participant}video${idx}' />
                            </div>
                        <span class="icon" id='remote-name-${MAIN_TRACK_ID} text-white'>${participantName[1]}<img class="small-audio-off-icon d-none" id="audio-off-icon-${participant}" src=${audioOff} width="30" style="margin: 0 5px; width: 20px;"/> </span>
                                               
                    </div>`);
                console.log("idx", idx);
                console.log("trackId", trackId);
                console.log("MAIN_TRACK_ID", MAIN_TRACK_ID);


                setScrollHandler(true);

            } else {
                $("#jitsi-wrapper").append(
                    `<audio autoplay='1' id='${participant}audio${idx}' />`);
            }
            track.attach($(`#${id}`)[0]);

        } else if (role === 'Student') {
            console.log('participantName[0] =============> ', participantName[0]);
            if (participantName[0] === 'Teacher' || participantName[0] === 'teacher') {
                console.log('track.getType() in teacher ', track.getType());
                if (track.getType() === 'video') {
                    console.log("track--------------", track);
                    // console.log("track;;;;;;;;;;;;;;;;;".tostring(track));
                    // console.log("track;;;;;;;;;;;;;;",track);
                    removeDiv(idx);
                    removeDiv(idx);
                    const trackId = track.track.id;
                    const MAIN_TRACK_ID = trackId.slice(0, -2);
                    console.log("track-----------", MAIN_TRACK_ID);
                    console.log("trackId", trackId);

                    console.log("NEW USER ENTERED THE MEETING - In Student")
                    if (!teacherMainTrack) {
                        teacherMainTrack = participant + 'video' + idx;
                        console.log("MAIN_TRACK_ID teacherMainTrack", participant + 'video' + idx);
                    }
                    removeDiv(participant);
                    $("#jitsi-wrapper").append(`
                            <div id='${participant}video-wrapper'>
                                <img src='https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG' class='remote-video student-view-video-off d-none' id="video-off-${MAIN_TRACK_ID}" />
                                <video autoplay='1' poster="https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG" class='myteacher-screen ${MAIN_TRACK_ID}' id='${participant}video${idx}' />
                            </div>
                    `);



                } else {
                    $("#jitsi-wrapper").append(
                        `<audio autoplay='1' id='${participant}audio${idx}' />`);
                }
                track.attach($(`#${id}`)[0]);

            }
        }
        removeDiv(idx);
        console.log(remoteTracks);

    }

    /**
     * That function is executed when the conference is joined
     */
    let selfParticipantId = null;
    let idDisplayNameMap = new Map();
    async function onConferenceJoined() {
        participants = await room.getParticipants();
        console.log('conference joined!');
        isJoined = true;
        for (let i = 0; i < localTracks.length; i++) {
            room.addTrack(localTracks[i]);
        }
        participantsList = participants;
        console.log("participantsList", participantsList);



    }
    /**
     *
     * @param id
     */
    function onUserLeft(id) {
        console.log('user left');
        removeDiv(id);
        if (!remoteTracks[id]) {
            return;
        }
        const tracks = remoteTracks[id];
        console.log("USER LEFT TRACKS", tracks)
        console.log("USER LEFT REMOTE TRACKS", remoteTracks);

        try {
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].detach($(`#${id}${tracks[i].getType()}`));
                console.log('removeDiv', removeDiv);
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * That function is called when connection is established successfully
     */
    function onConnectionSuccess() {

        roomName = roomName.toLocaleLowerCase();
        console.log("roomName: ", roomName);

        room = connection.initJitsiConference(roomName, confOptions);
        console.log("inside onConnectionSuccess");
        room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        console.log("JitsiMeetJS.events.conference: ", JitsiMeetJS.events.conference)
        room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
            console.log(`track removed!!!${track}`);
        });

        room.on(
            JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            onConferenceJoined);
        room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
            console.log('user join');
            remoteTracks[id] = [];
        });
        room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {

            console.log(`${track.getType()} - ${track.isMuted()}`);
        });
        room.on(
            JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
            (userID, displayName) => console.log(`${userID} - ${displayName}`));
        room.on(
            JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
            (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
        room.on(
            JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
            () => console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`));

        // console.log("------------------");
        room.join();

        let userRole = localStorage.getItem('user_role');
        let userName = localStorage.getItem('user_name');
        room.setDisplayName(userRole + '#' + userName);
        room.receiveVideoController._receiverVideoConstraints = 180
        console.log('ROOM: ', room)
    }

    /**
     * This function is called when the connection fail.
     */
    function onConnectionFailed() {
        console.error('Connection Failed!');
    }

    const toggleSubtitleHandler = () => {
        subtitle_handler = !subtitle_handler;
        console.log("SUB-TITLE MODE", subtitle_handler);
    }

    const manageVideoQuality = () => {
        console.log(room)
        if (room) {
            room.receiveVideoController._receiverVideoConstraints = 180
            console.log('ROOM Recieve Video Controller: ', room.receiveVideoController._receiverVideoConstraints);
        }

    }

    /**
     * This function is called when the connection fail.
     */
    function onDeviceListChanged(devices) {
        console.info('current devices', devices);
        // setAllMediaDevices(devices);
    }

    /**
* This function is called when we disconnect.
*/
    function disconnect() {
        console.log('disconnect!');
        connection.removeEventListener(
            JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            onConnectionSuccess);
        connection.removeEventListener(
            JitsiMeetJS.events.connection.CONNECTION_FAILED,
            onConnectionFailed);
        connection.removeEventListener(
            JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            disconnect);
    }

    //For setFlagChangeClick
    function setFlagChangeClick() {

        muteButtonClick = true;

    }


    //For getting profile picture
    let participantsDetails = [];
    function getProfilePicture(user) {
        const selectedParticipant = participantsDetails.find(
            (participant) =>
                participant.id === user
            //   participant.email === user || participant.userName === user
        );
        const avtarLink = selectedParticipant && selectedParticipant.avatar_url;
        if (avtarLink) {
            return avtarLink;
        } else {
            return;
        }
    };

    useEffect(() => {
        socket.on("on-mute-everyone", () => {
            isAudioMuted = false
            onAudioMuteStateChanged();
            console.log("on-mute-everyone");
        })

    }, [])

    function onAudioMuteStateChanged() {
        // console.log("===========audiomuted");
        // console.log(localTracks);
        console.log(isAudioMuted)
        console.log(localTracks);
        //
        for (let i = 0; i < localTracks.length; i++) {

            if (localTracks[i].type === "audio") {


                try {

                    if (isAudioMuted === true) {
                        localTracks[i].unmute();
                        console.log("audiounmuted===========>");
                    } else {
                        localTracks[i].mute();
                        console.log("audiomuted===========>");
                    }



                } catch (err) {
                    console.log(err);
                }

            }
        }



        isAudioMuted = !isAudioMuted;
        setAudioMuted(!audioMuted);
    };



    async function onVideoMuteStateChanged(track) {

        $('.local-video-view').toggleClass('hide')
        $('.video-off-small-image').toggleClass('active');
        for (let i = 0; i < localTracks.length; i++) {

            if (localTracks[i].type === "video") {

                try {

                    if (isVideoMuted === true) {
                        localTracks[i].unmute();
                        console.log("video unmuted====>");
                    } else {
                        localTracks[i].mute();
                        console.log("video muted====>");
                    }
                    isVideoMuted = !isVideoMuted;

                } catch (err) {
                    console.log(err);
                }

            }
        }


        $(".video-off-big-image").toggleClass('show');

        setVideoMuted(!videoMuted)
    };

    //For switchBigScreen    
    let isFullScreen = false;
    function switchBigScreen() {
        var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method  
            (document.mozFullScreen || document.webkitIsFullScreen);

        var docElm = document.documentElement;
        if (!isInFullScreen) {

            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }
            else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
                alert("Mozilla entering fullscreen!");
            }
            else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
                alert("Webkit entering fullscreen!");
            }
        }

    }

    function whiteboardhandler(action) {
        if (action === true) {
            switchVideo()
            $(`.whiteboard-wrapper`).addClass("show")
        } else {
            $(`.whiteboard-wrapper`).removeClass("show")
        }
    }


    function deletehandler() {
        window.confirm("Are you sure you want to delete!");

    }


    function addClassToElementClassList(element, styleClass) {
        element.classList.add(styleClass);
    }


    function removeClassFromElementClassList(element, styleClass) {
        element.classList.remove(styleClass);
    }



    //For attaching Track
    async function attachTrack(track, id) {
        track && detachTrack(track, id);
        track && (await track.attach(document.getElementById(id)));
    }

    //removing all the html video elements from track's container list
    async function detachTrack(track, id) {
        if (track && track.containers) {
            track.containers.forEach((container) => {
                if (container && container.id === id) {
                    track.detach(document.getElementById(id));
                }
            });
        }
    }

    //For Reload The Meeting
    function onClickRejoinNow() {
        window.location.reload();
    }

    /**
     *
     */

    async function unload(value) {
        // room.leave();
        // console.log("room", room);
        // props.history.push("/user/meeting/meetinglist");

        for (let i = 0; i < localTracks.length; i++) {
            localTracks[i].dispose();
        }
        console.log('room', room);
        console.log('connection', connection);
        // props.history.push("/endmeeting");
        room.leave();
        connection.disconnect();
        console.log(value)
    }








    // function videoQuality360(Resolution=360){ 
    function setSenderVideoConstraint() {
        JitsiMeetJS.conference.setSenderVideoConstraint('1080');
    }
    // room.setSenderVideoConstraint('1082');
    //     console.log("your video quality is 1082"); 


    function videoQuality180() {
        // room.setSenderVideoConstraint('180');
        //     console.log("your video quality is 180");

    }

    //For Muting All Participants

    function handleMuteAllParticipant() {
        console.log("called mute everyone");
        console.log("participantsList", participantsList);

        socket.emit("mute-everyone");
        participantsList.forEach((participant) => {
            console.log("called mute everyone......................");
            const _participant = room.getParticipantById(participant._id);
            console.log("called _participant.getJid()......................", _participant.getJid())
            room.muteParticipant(_participant._id, "audio");
        })

        // participantsList.map(participant => {
        //     // console.log("participant", participant);
        //     // console.log("participant._tracks", participant._tracks)
        //     let participantTracks = participant._tracks;
        //     participantTracks.map(track => {
        //         if (track.type === 'audio') {
        //             console.log("before audio track", track);

        //             console.log(track.mute);

        //             try {
        //                 track.mute();
        //                 track.mute = true;
        //             } catch (error) {
        //                 console.log("errorerror: ", error)
        //             }

        //             console.log("after audio track", track);
        //         }
        //     })

        // })

    };


    /**
     *
     * @param selected
     */
    function changeAudioOutput(selected) { // eslint-disable-line no-unused-vars
        JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
    }

    $(window).bind('beforeunload', unload);
    $(window).bind('unload', unload);

    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

    function startMeeting() {


        console.log('THIS IS START MEETING')

        const initOptions = {
            disableAudioLevels: true
        };

        JitsiMeetJS.init(initOptions);

        connection = new JitsiMeetJS.JitsiConnection(null, null, options);

        try {

            connection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                onConnectionSuccess);
            connection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_FAILED,
                onConnectionFailed);
            connection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                disconnect);

            JitsiMeetJS.mediaDevices.addEventListener(
                JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
                onDeviceListChanged);

        } catch (error) {
            console.log(error);
        }

        if (prelaunchScreen === false) {
            console.log('If prelaunchScreen ================> ', prelaunchScreen);
            connection.connect();
        } else {
            console.log('Else prelaunchScreen ================> ', prelaunchScreen);
        }


        JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'], resolution: '180', maxFps: '10' })
            .then(onLocalTracks)
            .catch(error => {
                throw error;
            });

        if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
            JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
                const audioOutputDevices
                    = devices.filter(d => d.kind === 'audiooutput');

                console.log("prelaunch devices: ", devices)
                setAllMediaDevices(devices)
                if (audioOutputDevices.length > 1) {
                    $('#audioOutputSelect').append(
                        audioOutputDevices
                            .map(
                                d =>
                                    `<option value="${d.deviceId}">${d.label}</option>`)
                            .join('\n'));

                    $('#audioOutputSelectWrapper').show();
                }
            });
        }

    }


    const chatHandler = () => {

        $('.toolbox-content').toggleClass('small')
        $('.meeting_section').toggleClass('small')
        $('.chat-box-sec').toggleClass('show')
        $('.circle').removeClass('active')

    }


    /**
  * @author Nikhil
  * @param {string} elementId
  * HTML element ID of the remote element
  *
  * this function removes the dead div elements after user leaves a conference
  */
    const removeDiv = (elementId) => {
        if (!elementId) {
            return null;
        }
        console.log('elementId', elementId);
        const videoElement = document.getElementById(elementId + "video-wrapper");
        const audioElement = document.getElementById(elementId + "audio");
        videoElement && videoElement.remove();
        audioElement && audioElement.remove();
    }

    const handleChange = (event, newValue) => {

        if (room) {
            console.log('Room ---------------------> ', room);
            if (newValue == 0) {
                onVideoMuteStateChanged(null);
            } else if (newValue == 25) {
                if (isVideoMuted === true) {
                    onVideoMuteStateChanged(null);
                }
                room.setReceiverVideoConstraint(180);
                room.setSenderVideoConstraint(180);
            } else if (newValue == 50) {
                if (isVideoMuted === true) {
                    onVideoMuteStateChanged(null);
                }
                room.setReceiverVideoConstraint(360);
                room.setSenderVideoConstraint(360);
            } else if (newValue == 75) {
                if (isVideoMuted === true) {
                    onVideoMuteStateChanged(null);
                }
                room.setReceiverVideoConstraint(1080);
                room.setSenderVideoConstraint(1080);
            }

        }

    };

    /**
     *
     */
    // function switchVideo() { // eslint-disable-line no-unused-vars
    //     isVideo = !isVideo;
    //     if (localTracks[1]) {
    //         localTracks[1].dispose();
    //         localTracks.pop();
    //     }
    //     JitsiMeetJS.createLocalTracks({
    //         devices: [isVideo ? 'video' : 'desktop']
    //     })
    //         .then(tracks => {
    //             console.log("JitsiMeetJS.events.track: ", JitsiMeetJS.events.track)
    //             localTracks.push(tracks[0]);
    //             localTracks[1].addEventListener(
    //                 JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
    //                 () => console.log('local track muted'));
    //             localTracks[1].addEventListener(
    //                 JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
    //                 (e) => {
    //                     console.log('inside switch video local track stoped', e);
    //                 });


    //             localTracks[1].attach($('#localVideo1')[0]);
    //             room.addTrack(localTracks[1]);
    //         })
    //         .catch(error => console.log(error));
    // }


    function switchVideo() {

        for (let i = 0; i < localTracks.length; i++) {
            console.log('tracks --------------------------- ', localTracks[i]);
        }


        isVideo = !isVideo;
        if (localTracks[1]) {
            localTracks[1].dispose();
            localTracks.pop();
        }
        JitsiMeetJS.createLocalTracks({
            devices: ['desktop']
        })
            .then(tracks => {
                localTracks.push(tracks[0]);
                localTracks[1].addEventListener(
                    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    () => console.log('local track muted'));
                localTracks[1].addEventListener(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => console.log('local track stoped'));
                localTracks[1].attach($('#localVideo1')[0]);
                room.addTrack(localTracks[1]);


            })
            .catch(error => console.log(error));

        JitsiMeetJS.createLocalTracks({
            devices: ['video']
        })
            .then(tracks => {
                localTracks.push(tracks[0]);
                localTracks[2].addEventListener(
                    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    () => console.log('local track muted'));
                localTracks[2].addEventListener(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => console.log('local track stoped'));
                $("#jitsi-wrapper").append(`<video autoplay='1' id='localVideo0' class='list_box_test' />`);
                localTracks[2].attach($('#localVideo1')[0]);
                room.addTrack(localTracks[2]); 
            })
            .catch(error => console.log(error));

    }

    const modal1 = (
        <div className={classes.slides}>
            <Slider
                defaultValue={20}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-restrict"
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
            />
        </div>
    );

    const modalsecurity1 = (
        <div>
            <p>You can add a password to your meeting. Participants will need to provide the password before they are allowed to join the meeting.</p>
            <br></br>
            <Label>Password</Label>
            <Input type="email" name="password" id="password" placeholder="Add Meeting Password" onChange={(e) => setMeetingPassword(e.target.value)} />
        </div>
    );

    const modalSetting = <Prelaunch mediaDevices={allMediaDevices} prelaunchMediaHandler={prelaunchMediaHandler} setPrelaunchScreen={setPrelaunchScreen} modal=
        {true} />;


    const addPassword = async () => {
        // calling the app password api.
        try {
            const token = localStorage.getItem("auth_token");
            let meeting = JSON.parse(meetingData);


            console.log("Meeting password: ", meetingPassword);

            const data = Axios.post(`${ENDPOINTURL}/alimeet/meeting/addPassword`, {
                "meetingEntity": {
                    "meetingId": meeting.meetingId,
                    "roomName": meeting.roomName,
                    "meetingTitle": meeting.meetingTitle,
                    "meetingDesc": meeting.meetingDesc,
                    "invites": meeting.invites,
                    "startTime": meeting.startTime,
                    "endTime": meeting.endTime,
                    "meetingPassword": meetingPassword,

                    "user": {
                        "id": meeting.user.id
                    },
                }
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
        } catch (error) {
            console.log(error)
        }
        togglesecurity()
    }

    const confirmMeetingPassword = async () => {
        const token = localStorage.getItem("auth_token");
        let meeting = JSON.parse(meetingData);
        const data = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/validateMeetingPassword?meetingId=${meeting.meetingId}&meetingPassword=${password}`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        if (data) {
            if (data.data === 'Password Matched!') {
                setModalpwd(false);
            } else {
                setpasswordRes(data.data);
            }
        }
    }

    return (
        <>
            {
                recordingHandler && <Recorder action={recordingHandler} meetingId={currentMeetingId} />
            }
            <DocumentUpload meetingId={currentMeetingId} modal={documentToggleModal} setDocumentToggleModal={setDocumentToggleModal} />
            {/* <STTClassComponent setSubtitle={setSubtitle} /> */}
            <Modal isOpen={modalpwd} modalTransition={{ timeout: 700 }} backdropTransition={{ timeout: 1300 }}
                toggle={togglepwd} className={className}>
                <ModalHeader toggle={togglepwd}>Enter Meeting Password</ModalHeader>
                <ModalBody>
                    <Input name="password" id="password" placeholder="Add Meeting Password" onChange={(e) => setPassword(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={confirmMeetingPassword}>Confirm</Button>{' '}
                    <Button color="secondary" onClick={togglepwd}>Cancel</Button>
                </ModalFooter>
                <center><p style={{ margin: "10px" }}>{passwordRes}</p></center>
            </Modal>
            {
                prelaunchScreen === false ? (
                    <>
                        <div className="meeting_section">

                            <div className="whiteboard-wrapper">
                                <Fabricwhiteboard whiteboardhandler={whiteboardhandler} />
                            </div>
                            <div id="jitsi-wrapper" className={role !== 'Teacher' && 'local-small-view'}>
                                <div className="jitsi-wrapper videotoggleview" id=''>
                                    {
                                        localStorage.getItem('user_role') === 'Student' ? <img src="https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG" className="video-off-small-image" /> :
                                            localStorage.getItem('user_role') === 'Student' ? <img src="https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG" className="video-off-small-image" /> :
                                                <img src="https://assets.zoom.us/images/en-us/desktop/generic/video-not-working.PNG" className="video-off-big-image" />
                                    }
                                </div>
                            </div>

                            <div className="mian_screen_img">
                                <div className="avatar">
                                    <img src="images/avatar.png" alt="" />
                                </div>
                                {

                                    <div className="list_box teachers_On border-yellow">
                                        <div className="list_otr" id='remote-users-wrapper'>
                                            {/* */}
                                        </div>

                                    </div>

                                }
                            </div>

                            {/* {
                                subtitleDisplay && (
                                    <div className="subtitle-wrapper">
                                        <p className='subtitle-text'>{subtitleDisplay}</p>
                                    </div>
                                )
                            } */}
                            <div className="toolbox-content">
                                <div className="toolbox toolbox_left_icon">
                                    <ul>
                                        <li>
                                            <a title="채팅" href="#" className="chating_btn" onClick={(e) => {
                                                e.preventDefault();
                                                chatHandler();
                                            }}>
                                                <svg height="24" width="24" viewBox="0 0 32 32">
                                                    <path d="M26.688 21.313v-16H5.313v18.688l2.688-2.688h18.688zm0-18.625a2.64 2.64 0 012.625 2.625v16c0 1.438-1.188 2.688-2.625 2.688H8l-5.313 5.313v-24a2.64 2.64 0 012.625-2.625h21.375z"></path>
                                                </svg>
                                                <span className="circle"></span>
                                            </a>
                                        </li>
                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    {/* <button ></button>    */}
                                                    <img title="화면공유" onClick={() => switchVideo()}
                                                        src={
                                                            isVideo
                                                                ? screenshareOff
                                                                : screenShareOn
                                                        }
                                                        alt=""
                                                    />
                                                </li>
                                            )
                                        }
                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <a title="모두 음소거" href="#" className="all_mute_icon">
                                                        <svg onClick={handleMuteAllParticipant} height="24" width="24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="587.91px" height="587.91px" viewBox="0 0 587.91 587.91" xmlSpace="preserve">
                                                            <g><g><g><path d="M86.451,501.46c26.937,26.936,58.315,48.088,93.265,62.871c36.207,15.314,74.642,23.078,114.239,23.078 c39.596,0,78.032-7.764,114.239-23.078c34.949-14.783,66.328-35.936,93.266-62.871c26.936-26.938,48.09-58.316,62.871-93.266 c15.314-36.207,23.08-74.643,23.08-114.238c0-39.598-7.766-78.033-23.08-114.239c-14.781-34.95-35.936-66.328-62.871-93.265 c-26.938-26.937-58.316-48.09-93.266-62.872C371.986,8.265,333.551,0.501,293.955,0.501c-39.597,0-78.032,7.765-114.239,23.079 c-34.95,14.782-66.328,35.936-93.265,62.872s-48.09,58.315-62.873,93.264C8.265,215.923,0.5,254.358,0.5,293.956 c0,39.596,7.765,78.031,23.079,114.238C38.361,443.144,59.515,474.522,86.451,501.46z M293.955,43.341 c138.411,0,250.614,112.204,250.614,250.615c0,138.41-112.203,250.613-250.614,250.613S43.34,432.366,43.34,293.956 C43.34,155.545,155.544,43.341,293.955,43.341z" /><path d="M293.955,587.909c-39.667,0-78.167-7.778-114.434-23.117c-35.01-14.809-66.442-35.998-93.423-62.979 c-26.983-26.984-48.172-58.417-62.979-93.425C7.778,372.119,0,333.618,0,293.956c0-39.663,7.778-78.165,23.118-114.435 c14.807-35.008,35.997-66.44,62.979-93.423c26.982-26.983,58.415-48.172,93.423-62.979c36.27-15.34,74.771-23.118,114.434-23.118 c39.666,0,78.167,7.778,114.433,23.119c35.009,14.807,66.441,35.997,93.425,62.979c26.984,26.985,48.173,58.417,62.979,93.423 c15.341,36.27,23.119,74.771,23.119,114.434c0,39.662-7.778,78.163-23.119,114.433c-14.806,35.007-35.994,66.439-62.979,93.425 c-26.982,26.98-58.415,48.169-93.425,62.979C372.121,580.131,333.62,587.909,293.955,587.909z M293.955,1.001 c-39.529,0-77.898,7.751-114.044,23.039c-34.889,14.757-66.215,35.874-93.106,62.765c-26.892,26.892-48.009,58.217-62.766,93.105 C8.751,216.057,1,254.427,1,293.956C1,333.483,8.751,371.854,24.039,408c14.757,34.889,35.874,66.214,62.766,93.106 c26.89,26.889,58.215,48.006,93.106,62.765c36.142,15.287,74.512,23.038,114.044,23.038s77.901-7.751,114.044-23.039 c34.89-14.758,66.216-35.875,93.106-62.764c26.893-26.895,48.009-58.22,62.764-93.106 c15.289-36.146,23.041-74.516,23.041-114.044c0-39.529-7.752-77.899-23.041-114.044c-14.754-34.887-35.871-66.212-62.764-93.106 c-26.892-26.891-58.218-48.008-93.106-62.765C371.855,8.752,333.485,1.001,293.955,1.001z M293.955,545.069 c-67.075,0-130.136-26.12-177.565-73.549c-47.429-47.43-73.55-110.489-73.55-177.564S68.96,163.82,116.39,116.391 c47.429-47.429,110.49-73.55,177.565-73.55c67.075,0,130.135,26.121,177.564,73.55c47.43,47.43,73.55,110.49,73.55,177.565 s-26.12,130.135-73.55,177.564C424.09,518.949,361.029,545.069,293.955,545.069z M293.955,43.841 c-66.808,0-129.617,26.017-176.858,73.257c-47.24,47.241-73.257,110.05-73.257,176.858c0,66.808,26.017,129.617,73.257,176.856 c47.24,47.24,110.05,73.257,176.858,73.257s129.617-26.017,176.857-73.257c47.24-47.239,73.257-110.049,73.257-176.856 c0-66.808-26.017-129.618-73.257-176.858C423.571,69.857,360.763,43.841,293.955,43.841z" /></g><g><path d="M184.92,402.989c4.183,4.184,9.664,6.275,15.146,6.275c5.482,0,10.964-2.092,15.146-6.275l78.742-78.742l78.743,78.742 c4.182,4.184,9.664,6.275,15.146,6.275s10.963-2.092,15.146-6.275c8.365-8.363,8.365-21.926,0-30.291l-78.744-78.742 l78.742-78.743c8.365-8.365,8.365-21.928,0-30.292c-8.363-8.365-21.926-8.365-30.291,0l-78.743,78.743l-78.742-78.743 c-8.365-8.365-21.928-8.365-30.292,0c-8.365,8.365-8.365,21.927,0,30.292l78.743,78.743l-78.743,78.742 C176.555,381.063,176.555,394.626,184.92,402.989z" /><path d="M387.844,409.765c-5.856,0-11.36-2.28-15.5-6.422l-78.389-78.389l-78.388,78.389c-4.14,4.142-9.645,6.422-15.5,6.422 s-11.36-2.28-15.5-6.422c-4.14-4.14-6.42-9.644-6.42-15.498c0-5.855,2.28-11.359,6.42-15.5l78.389-78.389l-78.389-78.389 c-8.546-8.547-8.546-22.453,0-31c4.14-4.14,9.644-6.42,15.5-6.42c5.855,0,11.36,2.28,15.5,6.42l78.389,78.389l78.389-78.389 c4.141-4.14,9.645-6.42,15.5-6.42c5.854,0,11.358,2.28,15.498,6.42c4.141,4.14,6.42,9.645,6.42,15.5s-2.279,11.36-6.42,15.5 l-78.389,78.389l78.391,78.389c4.141,4.141,6.421,9.645,6.421,15.5c0,5.854-2.28,11.358-6.421,15.498 C399.202,407.484,393.698,409.765,387.844,409.765z M293.955,323.54l79.096,79.096c3.95,3.952,9.204,6.129,14.793,6.129 c5.587,0,10.841-2.177,14.793-6.129c3.951-3.95,6.128-9.203,6.128-14.791s-2.177-10.842-6.128-14.793l-79.098-79.096 l79.096-79.096c3.951-3.951,6.127-9.205,6.127-14.793s-2.176-10.841-6.127-14.792c-3.95-3.951-9.203-6.127-14.791-6.127 s-10.842,2.176-14.793,6.127l-79.096,79.096l-79.096-79.096c-3.951-3.951-9.205-6.127-14.793-6.127 c-5.588,0-10.841,2.176-14.792,6.127c-8.156,8.157-8.156,21.428,0,29.585l79.096,79.096l-79.096,79.096 c-3.951,3.951-6.127,9.205-6.127,14.793s2.176,10.841,6.127,14.791c3.952,3.952,9.205,6.129,14.793,6.129 s10.841-2.177,14.793-6.129L293.955,323.54z" /></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
                                                        </svg>
                                                    </a>
                                                </li>
                                            )
                                        }

                                    </ul>
                                </div>
                                <div className="toolbox toolbox_center_icon">
                                    <ul>
                                        <li>

                                            <div onClick={onAudioMuteStateChanged} className="toggle_mute_audio">

                                                <img title="음소거설정/해제"
                                                    src={
                                                        isAudioMuted ? audioOff : audioOn
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                        </li>
                                        <li>
                                            <a title="???" href="/user/meeting/meetinglist" onClick={unload} className="meeting_leave_icon">
                                                <svg height="24" width="24" viewBox="0 0 32 32">
                                                    <path d="M16 12c-2.125 0-4.188.313-6.125.938v4.125c0 .5-.313 1.063-.75 1.25a13.87 13.87 0 00-3.563 2.438c-.25.25-.563.375-.938.375s-.688-.125-.938-.375L.373 17.438c-.25-.25-.375-.563-.375-.938s.125-.688.375-.938c4.063-3.875 9.563-6.25 15.625-6.25s11.563 2.375 15.625 6.25c.25.25.375.563.375.938s-.125.688-.375.938l-3.313 3.313c-.25.25-.563.375-.938.375s-.688-.125-.938-.375a13.87 13.87 0 00-3.563-2.438c-.438-.188-.75-.625-.75-1.188V13c-1.938-.625-4-1-6.125-1z">
                                                    </path>
                                                </svg>
                                            </a>
                                        </li>
                                        <li>


                                            <div>

                                                <img title="카메라시작/중지" onClick={onVideoMuteStateChanged}
                                                    src={
                                                        !isVideoMuted ? videoOn : videoOff
                                                    }
                                                    alt={isVideoMuted}
                                                />
                                            </div>
                                            <div>
                                                {isVideoMuted}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="toolbox toolbox_right_icon">
                                    <ul>

                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <a title="타일 뷰" href="#" className="students_screen" onClick={toggleSubtitleHandler}>
                                                        <img src={subtitleImage} height="24" width="24" ></img>
                                                    </a>
                                                </li>
                                            )

                                        }

                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <a title="타일 뷰" href="#" className="students_screen" onClick={toggleStudentScreen}>
                                                        <svg fill="none" height="24" width="24" viewBox="0 0 24 25">
                                                            <path d="M10.3250849,0 L0.905709203,0 C0.407569141,0 0,0.407569141 0,0.905709203 L0,10.3250849 C0,10.823225 0.407569141,11.2307941 0.905709203,11.2307941 L10.3250849,11.2307941 C10.823225,11.2307941 11.2307941,10.823225 11.2307941,10.3250849 L11.2307941,0.905709203 C11.2307941,0.407569141 10.823225,0 10.3250849,0 Z M9.41937571,9.41937571 L1.81141841,9.41937571 L1.81141841,1.81141841 L9.41937571,1.81141841 L9.41937571,9.41937571 Z" id="Shape"></path>
                                                            <path d="M23.5484393,0 L14.1290636,0 C13.6309235,0 13.2233544,0.407569141 13.2233544,0.905709203 L13.2233544,10.3250849 C13.2233544,10.823225 13.6309235,11.2307941 14.1290636,11.2307941 L23.5484393,11.2307941 C24.0465793,11.2307941 24.4541485,10.823225 24.4541485,10.3250849 L24.4541485,0.905709203 C24.4541485,0.407569141 24.0465793,0 23.5484393,0 Z M22.6427301,9.41937571 L15.0347728,9.41937571 L15.0347728,1.81141841 L22.6427301,1.81141841 L22.6427301,9.41937571 Z" id="Shape"></path>
                                                            <path d="M10.3250849,13.2233544 L0.905709203,13.2233544 C0.407569141,13.2233544 0,13.6309235 0,14.1290636 L0,23.5484393 C0,24.0465793 0.407569141,24.4541485 0.905709203,24.4541485 L10.3250849,24.4541485 C10.823225,24.4541485 11.2307941,24.0465793 11.2307941,23.5484393 L11.2307941,14.1290636 C11.2307941,13.6309235 10.823225,13.2233544 10.3250849,13.2233544 Z M9.41937571,22.6427301 L1.81141841,22.6427301 L1.81141841,15.0347728 L9.41937571,15.0347728 L9.41937571,22.6427301 Z" id="Shape"></path>
                                                            <path d="M23.5484393,13.2233544 L14.1290636,13.2233544 C13.6309235,13.2233544 13.2233544,13.6309235 13.2233544,14.1290636 L13.2233544,23.5484393 C13.2233544,24.0465793 13.6309235,24.4541485 14.1290636,24.4541485 L23.5484393,24.4541485 C24.0465793,24.4541485 24.4541485,24.0465793 24.4541485,23.5484393 L24.4541485,14.1290636 C24.4541485,13.6309235 24.0465793,13.2233544 23.5484393,13.2233544 Z M22.6427301,22.6427301 L15.0347728,22.6427301 L15.0347728,15.0347728 L22.6427301,15.0347728 L22.6427301,22.6427301 Z" id="Shape"></path>

                                                        </svg>
                                                    </a>
                                                </li>
                                            )

                                        }
                                        <li>
                                            <a title="추가기능" type="button" onClick={() => $("#more-action").toggleClass("show")} className="dropdown" data-mdb-toggle="dropdown" aria-expanded="false">
                                                <svg height="24" width="24" viewBox="0 0 24 24">
                                                    <path d="M12 15.984c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 19.078 9.984 18s.938-2.016 2.016-2.016zm0-6c1.078 0 2.016.938 2.016 2.016s-.938 2.016-2.016 2.016S9.984 13.078 9.984 12 10.922 9.984 12 9.984zm0-1.968c-1.078 0-2.016-.938-2.016-2.016S10.922 3.984 12 3.984s2.016.938 2.016 2.016S13.078 8.016 12 8.016z"></path>
                                                </svg>
                                            </a>                                            <ul className="dropdown-menu" id="more-action">
                                                {/* // eslint-disable-next-line jsx-akr-is-valid */}
                                                <li>
                                                    <a className="dropdown-item" onClick={setModalIsOpenToTrue} href="#">Setting
                                                        <Modal isOpen={modalIsOpen} >
                                                            <ModalBody><h1 style={{ textAlign: 'center' }}>Setting</h1></ModalBody>
                                                            <ModalBody>
                                                                {modalSetting}
                                                            </ModalBody>
                                                            <ModalFooter>
                                                                {/* <Button color="primary" onClick={setModalIsOpenToFalse}>ok</Button>                                                        */}
                                                                <Button color="primary" onClick={setModalIsOpenToFalse}>Cancel</Button>
                                                            </ModalFooter>
                                                        </Modal>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" onClick={toggle} href="#">Video Quality
                                                        <div>
                                                            {/* <a color="danger" onClick={toggle}>Video Quality</a> */}
                                                            <Modal isOpen={modal} modalTransition={{ timeout: 700 }} backdropTransition={{ timeout: 1300 }}
                                                                toggle={toggle} className={className}>
                                                                <ModalHeader toggle={toggle}>Vedio Quality</ModalHeader>
                                                                <ModalBody>
                                                                    {modal1}
                                                                </ModalBody>
                                                            </Modal>
                                                        </div>
                                                    </a>
                                                </li>
                                                {
                                                    localStorage.getItem('user_role') === "Teacher" && (
                                                        <li><a onClick={() => whiteboardhandler(true)} className="dropdown-item" href="#">White board</a></li>
                                                    )
                                                }
                                                {
                                                    localStorage.getItem('user_role') === "Teacher" && (
                                                        <li><a onClick={() => {
                                                            if (screenRecording === false) {
                                                                setRecordingHandler('start');
                                                                setRecordAction('stop');
                                                            } else {
                                                                setRecordingHandler('stop');
                                                                setRecordAction('start');
                                                            }
                                                            screenRecording = !screenRecording;
                                                        }} className="dropdown-item" href="#">{recordAction} Recording</a></li>
                                                    )
                                                }

                                                {
                                                    localStorage.getItem('user_role') === "Teacher" && (
                                                        <li><a onClick={() => setDocumentToggleModal(true)} className="dropdown-item" href="#">Upload Document</a></li>
                                                    )
                                                }

                                                {
                                                    localStorage.getItem('user_role') === "Student" && (
                                                        <li><a onClick={() => setDocumentToggleModal(true)} className="dropdown-item" href="#">Document</a></li>
                                                    )
                                                }
                                                {
                                                    localStorage.getItem('user_role') === "Teacher" && (
                                                        <li><a className="dropdown-item" onClick={togglesecurity} href="#">Security</a>
                                                            <Modal isOpen={modalsecurity} modalTransition={{ timeout: 700 }} backdropTransition={{ timeout: 1300 }}
                                                                toggle={togglesecurity} className={className}>
                                                                <ModalHeader toggle={togglesecurity}>Security option</ModalHeader>
                                                                <ModalBody>
                                                                    {modalsecurity1}
                                                                </ModalBody>
                                                                <ModalFooter>
                                                                    <Button color="primary" onClick={addPassword}>Add</Button>
                                                                    <Button color="primary" onClick={togglesecurity}>Cancel</Button>
                                                                </ModalFooter>
                                                            </Modal>
                                                        </li>
                                                    )
                                                }
                                                <li><a onClick={switchBigScreen} className="dropdown-item" href="#">Full screen</a></li>
                                                {
                                                    localStorage.getItem('user_role') === "Teacher" && (
                                                        <li><a onClick={handleMuteAllParticipant} className="dropdown-item" href="#">Mute all</a></li>
                                                    )
                                                }
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="chat-box-sec">
                            <Chat subtitleMessage={subtitleDisplay} />
                        </div>

                        {/* <div className='custom-alert'>
                            <div className='custom-alert-wrapper'>
                                <div className='custom-alert-content'>
                                    <h3><b>Alert</b></h3><br />
                                    <p style={{ fontSize: '16px' }}>You Have alredy sharedscreen!!</p>
                                    <div className="custom-alert-button">
                                        <button className='btn gray_btn' onClick={() => $('.custom-alert').removeClass('show')}>Ok</button>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </>
                ) : (
                    <Prelaunch mediaDevices={allMediaDevices} prelaunchMediaHandler={prelaunchMediaHandler} setPrelaunchScreen={setPrelaunchScreen} />
                )
            }
            {/* <div>
                <Sharescreen/>
            </div>         */}

        </>

    )

}
export default ExampleMeeting;
