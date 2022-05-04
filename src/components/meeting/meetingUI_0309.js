// React System Libraries
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import queryString from "query-string";
import io from 'socket.io-client';
import {
    Label,
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,   
} from "reactstrap";

// Customised Libraries or components
import '../../css/new-style.css';
import { ENDPOINSOCKETURL, ENDPOINTURL } from '../common/endpoints';
import person from '../../images/person.jpg';
import main_bg_img from '../../images/main_bg_img.jpg';
import close from '../../images/close.svg';
import STTComponent from '../STTClassComponent';
import Prelaunch from '../meeting/prelaunch';
//import Chat from './chat';
import Recorder from '../Recorder';
import Whiteboard from './whiteboard';
import CheckLoginStatus from '../common/loginStatus';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import JitsiComponent from '../meeting/JitsiComponent';

// Local Variables declared
let connection = null;
let room = null;
let isJoined = false;
let isAudioMuted = false;
let isVideoMuted = false;
const confOptions = {};
let localTracks = [];
let remoteTracks = [];
let muteAllParticipantsList = [];
let socket = '';
let isVideo = true;
let screenRecording = false;
let meetingId = 0;
let userId = localStorage.getItem('user_id');
let userRole = localStorage.getItem('user_role');
let userName = localStorage.getItem('user_name');
let initialName = localStorage.getItem('initial_name');
let userProfileImage = localStorage.getItem('user_profile_image');
let unreadMessageCount = 0;
let muteWhenLoad = 0;
let localUserId = 0;
let remoteMuteCounter = 1;
let userVideo;
let userAudio;
let chatTimeValue;
let sttSentence = '';
let captions = [];
let isStudentPresented;
let newRoomName;

let { roomName, meetingData } = queryString.parse(window.location.search);
if (roomName) {
    roomName = roomName.toLowerCase();
}

function MeetingUI(props) {
    // Get ROOM ID from query string
    const roomName = window.location.pathname.split("/").pop().toLowerCase();

    const [prelaunchScreen, setPrelaunchScreen] = useState(true);
    const [allMediaDevices, setAllMediaDevices] = useState([]);
    const [documentList, setDocumentList] = useState([])
    const [isSubtitle, setIsSubtitle] = useState(false);
    const [documentToggleModal, setDocumentToggleModal] = useState(false);
    const [subtitleDisplay, setSubtitleDiplay] = useState('');
    const [currentMeetingId, setCurrentMeetingId] = useState('');
    const [recordingHandler, setRecordingHandler] = useState('');
    const [recordAction, setRecordAction] = useState('start');
    const [subtitle, setSubtitle] = useState('');
    const [userColLength, setUserColLength] = useState(0);
    const [remoteParticipantList, setRemoteParticipantList] = useState([]);
    const [attendanceId, setAttendenceId] = useState('');
    const [modal, setModal] = useState(false);
    const [modalpwd, setModalpwd] = useState(false);
    const [modalsecurity, setModalsecurity] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [meetingPassword, setMeetingPassword] = useState('');
    const [passwordRes, setpasswordRes] = useState('');
    const [password, setPassword] = useState('');
    const [chatMessage, setChatMessage] = useState("");
    const [chatTime, setChatTime] = useState("");
    const [chatUnreadMessageCount, setChatUnreadMessageCount] = useState(0);
    const [meeetingDocumentCount, setMeeetingDocumentCount] = useState(0);
    const [componentStatus, setComponentStatus] = useState("");
    const [value1, setValue1] = useState(25);
    const [screenShared, setScreenShared] = useState("");

    const togglesecurity = () => setModalsecurity(!modalsecurity);
    const togglepwd = () => {
        setModalpwd(!modalpwd);
        props.history.push("/user/meeting/meetinglist");
    }
    const setModalIsOpenToTrue = () => {
        setModalIsOpen(true)
    }
    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false)
    }
    const {
        className
    } = props;

    let userName = localStorage.getItem('user_name');
    let meetingTitle = localStorage.getItem('meeting_title');

    /* global $, JitsiMeetJS */    
    const options = {
        serviceUrl: 'https://dev.alibiz.net/http-bind',
        hosts: {
            domain: 'dev.alibiz.net',
            muc: 'conference.dev.alibiz.net'
        },
        resolution: 1080,
        maxFullResolutionParticipants: 2,
        setSenderVideoConstraint: '1080',
        setReceiverVideoConstraint: '1080',
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
    /*const options = {
        serviceUrl: 'https://dev.alibiz.net/http-bind',
        hosts: {
            domain: 'dev.alibiz.net',
            muc: 'conference.dev.alibiz.net'
        },
        resolution: 1080,
        maxFullResolutionParticipants: 2,
        setSenderVideoConstraint: '1080',
        setReceiverVideoConstraint: '1080',
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
    }*/

    useEffect(() => {
        // validate user is logged in to access
        const isUserLoggedIn = CheckLoginStatus();
        if(isUserLoggedIn === false) {
            props.history.push('/');
        }

        if (socket) {
            //socket for Subtitle
            // socket.on('subtitle-data', ({ subtitle, userName, isSubtitle }) => {
            //     if (subtitle) {
            //         $(".cl_main_noti_box").removeClass("d-none");
            //     }else{
            //         $(".cl_main_noti_box").addClass("d-none");
            //     }

            //     if(userRole == "Student"){
            //         // Set Captions status
            //         setIsSubtitle(isSubtitle);
            //     }

            //     setSubtitleDiplay({
            //         subtitle: subtitle,
            //         userName: userName
            //     });
            // });

            //socket for Subtitle
            socket.on('subtitle-data', ({ sttSentence, userName, isSubtitle, remoteUserId }) => {
                let sttData = sttSentence;
                if (sttSentence) {
                    $(".cl_main_noti_box").removeClass("d-none");
                }else{
                    //$(".cl_main_noti_box").addClass("d-none");
                }

                if(userRole == "Student"){
                    // Set Captions status
                    setIsSubtitle(isSubtitle);
                }

                setSubtitleDiplay({
                    subtitle: sttSentence,
                    userName: userName
                });

                // Push Remote user captions
                if(sttSentence != null){
                    if(captions.length > 0){
                        for (var i in captions) {
                            if (captions[i].user_id == remoteUserId) {
                                captions.splice(i,1);
                                break; //Stop this loop, we found it!
                            }
                        }
                        captions.push({'user_id':remoteUserId,'username':userName,'captions':sttSentence});
                    }else{
                        captions.push({'user_id':remoteUserId,'username':userName,'captions':sttSentence});
                    }
                }
                console.log(captions);
            });

            // For Manage White board
            socket.on('on-handle-whiteboard', ({ action }) => {
                if (action === "open") {
                    $(".whiteboard-wrapper").addClass("show");
                    $(".whiteboard-wrapper").removeClass("d-none");
                    $('body').addClass('white_board_on');
                    //$('.main_meeting_videos').addClass('student_user');
                    //$('.main_meeting_videos').removeClass('d-none');

                    //Teacher screen on whiteboard - start
                    $('.cl_user_list').css('right','0');
                    $('.cl_user_list').css('width','22%');
                    $('.cl_user_list').css('position','absolute');
                    $('.cl_user_list').css('z-index','9999999');
                    $('.cl_user_list').css('top','0');
                    $('.cl_user_list').css('height','28%');
                    //Teacher screen on whiteboard - end

                } else {
                    $(".whiteboard-wrapper").removeClass("show");
                    $(".whiteboard-wrapper").addClass("d-none");
                    $('body').removeClass('white_board_on');
                    //$('.main_meeting_videos').removeClass('student_user');
                    //$('.main_meeting_videos').addClass('d-none');

                    //Teacher screen on whiteboard - start
                    $('.cl_user_list').css('right','');
                    $('.cl_user_list').css('width','50%');
                    $('.cl_user_list').css('position','');
                    $('.cl_user_list').css('z-index','');
                    $('.cl_user_list').css('top','');
                    $('.cl_user_list').css('height','');
                    //Teacher screen on whiteboard - end
                }
            })

            // New message from socket
            socket.on("new-message", ({ message, messagetime, name }) => {
                // Manage Unread counter badge
                unreadMessageCount = unreadMessageCount + 1;
                setChatUnreadMessageCount(unreadMessageCount);

                // Append New message to chat screen
                $("#remote_chat").append('<span className="time_chat" id="my_name">'+name+' <strong>'+messagetime+'</strong></span><p>'+message+'</p>');
                $("#user_chat_panel").animate({ scrollTop: $('#user_chat_panel').prop("scrollHeight") }, 1000);
            });

            //socket for muteall participants
            socket.on('on-mute-everyone', () => {
                console.log("on-mute-everyone");
                isAudioMuted = false;
                muteHandler();
            });
            
            // when we upload new document update document count to all active invites screen
            socket.on('on-document-counter',({count})=> {
                console.log("uploadeddocumentcount",count);
                //setMeeetingDocumentCount(count);
                getDocumentList();
            });

            // When teacher is mute specific student from teacher mode to manage remote participant audio status
            socket.on('on-remote-participant-handler',({requested_participant_id})=> {
                if(room && room.p2pDominantSpeakerDetection) {
                    if(room.p2pDominantSpeakerDetection.myUserID == requested_participant_id){
                        muteHandler();
                        socket.emit("reset-remote-mute-counter");
                    }
                }
            });

            // Reset counter for remote participant
            socket.on("on-reset-remote-mute-counter", () => {
                remoteMuteCounter = 1;
            });


            // Screen share socket
            // socket.on("screen-share-on", async ({ isScreenShareOn,newRoom }) => {
            //     if(isScreenShareOn === true){
            //             const resp = await delayStudentScreenShare();
            //             newRoomName = newRoom;
            //             // $('.cl_user_list').addClass('d-none');
            //              setScreenShared(true);
            //              $('.cl_main_home_box').addClass('d-none');
            //              $('.new_jitsi_component').removeClass('d-none');
                  
                   
            //     } else {
            //         newRoomName = "";
            //         $('.cl_user_list').removeClass('d-none'); 
            //         setScreenShared(false);
            //         $('.cl_main_home_box').removeClass('d-none');
            //         $('.new_jitsi_component').addClass('d-none');
            //     }
            // });
            
            // Present Student to Meeting
            socket.on('on-show-student', ({ id, action }) => {
                // Room Participants
                const allParticipants = room.getParticipants();
                //alert('inside on-show-student');
                if(action === 'endCall'){
                    $('.meeing_video_body').removeClass('present_student');
                    
                }
                // Map all tracks of presented student
                allParticipants.map((participants) => {
                    console.log(participants);

                    if(action === 'endCall') {
                        (participants._tracks).map(track => {
                            $(`.new_user_video_${track.getParticipantId()}`).remove();
                            $('.alimeet_section.student_page').removeClass('teachersharestudent')
                            $(`.new_user_audio_${track.getParticipantId()}`).remove();
                        });
                    }

                    if (id === participants._id) {
                        // Toggle Video
                        $('.meeing_video_body').toggleClass('present_student');
                        
                        (participants._tracks).map(track => {
                            console.log('match found...........')
                            const participant = track.getParticipantId();
                            const trackType = track.getType();
                            if (trackType === 'video') {
                                let userVideo = $(`.new_user_video_${participant}`).length;
                                console.log("VIDEO TAG LENGTH ======> ", userVideo)
                                if (userVideo === 0) {
                                    console.log('ADDING AUDIO TRACK =======> ')
                                    showUserToAll(track);
                                } else {
                                    console.log('REMOVING AUDIO TRACK =======> ')
                                    $(`.new_user_video_${participant}`).remove();
                                }
                            } else {
                                let userAudio = $(`.new_user_audio_${participant}`).length;
                                console.log("AUDIO TAG LENGTH ======> ", userAudio)
                                if (userAudio === 0) {
                                    console.log('ADDING VIDEO TRACK =======> ')
                                    showUserToAll(track);
                                    $('.alimeet_section.student_page').addClass('teachersharestudent')
                                } else {
                                    console.log('REMOVING VIDEO TRACK =======> ')
                                    $('.alimeet_section.student_page').removeClass('teachersharestudent')
                                    $(`.new_user_audio_${participant}`).remove();
                                }
                            }
                        })
                    }
                });
            });

            // screen + video of teacher to student
            socket.on("on-share-screen", ({action}) => {
                console.log("Screen Shared:",action);
            });
        }else{
            // Validate Room to allow user to join the meeting
            validateRoom(roomName);

            // Start Meeting
            JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
            startmeeting();
            
            //Socket Code start
            socket = io(ENDPOINSOCKETURL);
            console.log(io(ENDPOINSOCKETURL).id);
            socket.emit('join', { room: roomName });

            // Set Current time when page load
            formatAMPM(new Date);

            // if (meeting.meetingPassword) {
            //     setModalpwd(true);
            // }
        }
    },[socket]);

    // For Only STT feature
    // useEffect(() => {
    //     console.log("subtitle =>" + subtitle);
    //     console.log("isSubtitle =>" + isSubtitle);
    //     console.log("isAudioMuted =>" + isAudioMuted);
    //     if(socket && isSubtitle && subtitle && isAudioMuted === false) {
    //         $(".cl_main_noti_box").removeClass("d-none");
    //         if(localStorage.getItem('user_role') == "Teacher" && $('body').hasClass('TileView') === false) {
    //             $(".cl_main_noti_box").css("left","250px");
    //         } else {
    //             $(".cl_main_noti_box").css("left","0");
    //         }
    //             socket.emit('subtitle', { subtitle, userName, isSubtitle});
           
    //     }else{
    //         //$(".cl_main_noti_box").addClass("d-none");
    //         socket.emit('subtitle', { subtitle : '', userName : '', isSubtitle : isSubtitle});
    //     }
    // }, [subtitle]);

    // For Only STT feature
    useEffect(() => {

        /*console.log("subtitle =>" + subtitle);
        console.log("isSubtitle =>" + isSubtitle);
        console.log("isAudioMuted =>" + isAudioMuted);*/

        // if subtitle is off we will remove STT of local user
        if(isSubtitle === false && captions.length > 0){
            console.log("STT OFF");
            for (var i in captions) {
                if (captions[i].user_id == userId) {
                    captions.splice(i,1);
                    break; //Stop this loop, we found it!
                }
            }
            sttSentence = '';
        }

        // Pass Captions to Socket to remote users
        let remoteUserId = userId;
        if(socket && isSubtitle && subtitle && isAudioMuted === false) {

            // Manage local user captions
            if(localStorage.getItem('local_user_text') && localStorage.getItem('local_user_text').length > 300){
                localStorage.setItem('local_user_text','');
                sttSentence = '';
            }

            // Append captions till legnth of 70 chars
            if(subtitle != null){
                sttSentence += subtitle;
            }
            // Set Local storage text
            localStorage.setItem('local_user_text',sttSentence);

            // add new captions object
            if(userName && sttSentence != null){
                if(captions.length > 0){
                
                    //Find index of specific object using findIndex method.
                    let objIndex = captions.findIndex((obj => obj.user_id == userId));
                    for (var i in captions) {
                        if (captions[i].user_id == userId) {
                            captions.splice(i,1);
                            break; //Stop this loop, we found it!
                        }
                    }
                    captions.push({'user_id':userId,'username':userName,'captions':sttSentence});
                }else{
                    captions.push({'user_id':userId,'username':userName,'captions':sttSentence});
                }
            }

            //console.log(captions);
            
            $(".cl_main_noti_box").removeClass("d-none");
            socket.emit('subtitle', { sttSentence, userName, isSubtitle, remoteUserId});
        }else{
            //$(".cl_main_noti_box").addClass("d-none");
            socket.emit('subtitle', { sttSentence : '', userName : '', isSubtitle : isSubtitle, remoteUserId : remoteUserId});
        }

    }, [subtitle]);
    
   
    // Video Quality Feature
    const useStyles = makeStyles({
        slides: {
        },
    });
    const classes = useStyles();
    const videoQualityToggle = () => setModal(!modal);
    const handleChange = (event, newValue) => {
        if (room) {
            if (newValue == 0) {
                //onVideoMuteStateChanged(null);
                room.setReceiverVideoConstraint('180');
            } else if (newValue == 25) {
                if (isVideoMuted === true) {
                    // onVideoMuteStateChanged(null);
                }
                
                room.setReceiverVideoConstraint('720');
            } else if (newValue == 50) {
                if (isVideoMuted === true) {
                    // onVideoMuteStateChanged(null);
                }
                room.setReceiverVideoConstraint('1080');
            } else if (newValue == 75) {
                if (isVideoMuted === true) {
                    // onVideoMuteStateChanged(null);
                }
                room.setReceiverVideoConstraint('2160');
            }
            setValue1(newValue);   
        }
    };
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
            label: 'High defi.'
        }
    ];
    const valuetext = (value) => {
        return `${value}`;
    }
    const valueLabelFormat = (value) => {
        return marks.findIndex((mark) => mark.value === value) + 1;
    }
    const videoQuality = (
        <div className={classes.slides}>
            <Slider
                key={value1}
                defaultValue={value1}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-restrict"
                onChange={handleChange}
                valueLabelDisplay="auto"
                step={null}
                marks={marks}
            />
        </div>
    );

    //That function is called when connection is established successfully     
    const onConnectionSuccess= () => {
        try {
            room = connection.initJitsiConference(roomName, confOptions);
            room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
                //we need to add code for remove the remotetrack from here while remote track is left the meeting
                const participant = track.getParticipantId();
                const element = $(`#remote-user-${participant}`);
                if (element) {
                    element.remove();
                }                              
                console.log(`track removed!!!${track}`);
                getTotalRemoteUsers()
            });
            room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
            room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED,onConferenceJoined);
            room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
                console.log('user join');
                //remoteTracks[id] = [];
            });
            room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
            room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
                console.log(`${track.getType()} - ${track.isMuted()}`);
                if (track.getType() === 'video') {
                    const participant = track.getParticipantId();
                    const videotagid = participant + track.getType();
                    const imgtagid = participant + 'img';
                    const profileImage = participant + 'profile_image';
                    if (!track.isMuted()) {
                        $(`.${videotagid}`).removeClass('d-none');
                        $(`#${imgtagid}`).addClass('d-none');
                        $(`#${profileImage}`).addClass('d-none');
                    } else {
                        // Get Details of participant
                        let participantName = room.getParticipantById(participant)._displayName;
                        participantName = participantName.split('#');
                        console.log("Profile Image",participantName[3]);
                        console.log(participantName);
                        
                        $(`.${videotagid}`).addClass('d-none');

                        if(participantName[3]){
                            $(`#${imgtagid}`).addClass('d-none');
                            $(`#${profileImage}`).removeClass('d-none');
                        }else{
                            $(`#${imgtagid}`).removeClass('d-none');
                            $(`#${profileImage}`).addClass('d-none');
                        }
                    }
                }else {
                    const participant = track.getParticipantId();
                    if (track.isMuted()) {
                        $(`.audio-img-${participant}`).find("path").css("fill", "red");
                    } else {
                        $(`.audio-img-${participant}`).find("path").css("fill", "white");
                    }
                }

                // This code is used for managing mute all feature for remote track only
                if(localTracks[0] != track){
                    if(track.getType() === 'audio') {
                        if(track.isMuted() == true){
                            let position = muteAllParticipantsList.indexOf(track);
                            if(position > -1) {
                                muteAllParticipantsList.splice(position, 1);
                            }
                        }else{
                            muteAllParticipantsList.push(track);
                        }
                        //console.log('muteAllParticipantsList ===> '+muteAllParticipantsList);

                        if(muteAllParticipantsList.length > 0) {
                            $("#muteall_participants1").css("stroke", "white");
                            $("#muteall_participants2").css("stroke", "white");
                        }else{
                            $("#muteall_participants1").css("stroke", "red");
                            $("#muteall_participants2").css("stroke", "red");
                        }
                    }
                }

                // Send message on enter KEY
                $( "#send_mesage" ).on( "keydown", function(event) {
                    if(event.which == 13) {
                        manageChat();
                    }    
                });
            });
            room.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
                (userID, displayName) => console.log(`${userID} - ${displayName}`));
            room.on(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
                (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)); 
            let userRole = localStorage.getItem('user_role');
            let userName = localStorage.getItem('user_name');
            room.setDisplayName(userRole + '#' + userName + '#' + initialName + '#' + userProfileImage);
            room.join();

            // Remove Participant left side
            $('.cl_user_list').addClass('d-none');
        } catch (error) {
            console.log("onConnectionSuccess error",error);
        }                       
    }

    /**
    * That function is executed when the conference is joined
    */
    const onConferenceJoined = () => {
        try {
            isJoined = true;
            if(localTracks.length !== 0){
                for (let i = 0; i < localTracks.length; i++) {
                    room.addTrack(localTracks[i]);
                }
            }else{
                console.log('No localtrack found');
            } 
        } catch (error) {
            console.log("onConferenceJoined error",error);
        }   
    }

    /**
    * Handles local tracks.
    * @param tracks Array with JitsiTrack objects
    */
    const onLocalTracks = (tracks) => {
        localTracks = tracks;
        try {
            //to get prelaunch audio/video devices for prelaunch
            JitsiMeetJS.mediaDevices.enumerateDevices(onDeviceListChanged);

            if(localTracks.length !== 0){
                for (let i = 0; i < localTracks.length; i++) {
                    localTracks[i].addEventListener(
                        JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                        audioLevel => console.log(`Audio Level local: ${audioLevel}`));
                    localTracks[i].addEventListener(
                        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                        () => console.log('local track muted'));
                    localTracks[i].addEventListener(
                        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                        () => console.log('local track stoped'));
                    localTracks[i].addEventListener(
                        JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                        deviceId =>
                            console.log(
                                `track audio output device was changed to ${deviceId}`));
                    if (localTracks[i].getType() === 'video') {
                        $('.cl_main_home_box_video').append(`<video autoplay='1' class='local_video' id='localVideo${i}' />`);
                        localTracks[i].attach($(`#localVideo${i}`)[0]);
                    } else {
                        $('body').append(
                            `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
                        localTracks[i].attach($(`#localAudio${i}`)[0]);
                    }
                    if (isJoined) {
                        room.addTrack(localTracks[i]);
                    }
                }
            }else{
                console.log("localTracks not found")
            }
        } catch (error) {
            console.log("onLocalTracks error",error);
        }
        remoteExtaVideo();    
    }

    /**
     * Handles remote tracks
     * @param track JitsiTrack object
     */
    const onRemoteTrack = (track) => {
        try {
            if (track.isLocal()) {
                return;
            }

            // Add track of remote users to manage Mute all
            if(userRole == 'Student' && track.isMuted() == false){
                muteAllParticipantsList.push(track);
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
            track.addEventListener(
                JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('remote track muted'));
            track.addEventListener(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('remote track stoped'));
            track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));
            const id = participant + track.getType() + idx;
            let role = localStorage.getItem('user_role');
            localUserId = track.ownerEndpointId;

            if (participantName[0] === 'Admin' || participantName[0] === 'admin') {
                // track.attach($(`#${id}`)[0]);
                return;
            }

            //For Audio and Video img append             
            if(track.getType() === 'video'){
                userVideo = track.isMuted();
            }else{
                userAudio = track.isMuted();
            }
            
            if (role === "Teacher" || role === "teacher" || role === "Admin") {
                //alert('participantName[1] ===> '+participantName[1]);
                if((!participantName[1] || participantName[1] == 'undefined') && track.videoType !== 'desktop'){
                    return;
                }
                if (track.getType() === 'video') {
                    $('.cl_user_list').append(
                        `<div class="cl_user_list_box" id='remote-user-${participant}'>
                            <div class="cl_user_list_box_videos">
                                <span class="circle_remote_participant d-none" id="${participant}img">${participantName[2]}</span>
                                <span class="circle_remote_participant d-none" id="${participant}profile_image"><img src=${participantName[3]} /></span>
                                <video autoplay='1' class="${participant}video" id='${participant}video${idx}' onclick="if($('body').hasClass('TileView') === false){$('.cl_user_list_box:not(#remote-user-${participant})').removeClass('fullscreen'); $('#${participant}video${idx}').toggleClass('fullscreen'); if($('#remote-user-${participant}').hasClass('fullscreen') === false && $('body').hasClass('fullscreen') === false){$('body').toggleClass('fullscreen');} else if($('#remote-user-${participant}').hasClass('fullscreen') === true && $('body').hasClass('fullscreen') === true){$('body').toggleClass('fullscreen');} $('#remote-user-${participant}').toggleClass('fullscreen');}" />
                            </div>
                            <div class="cl_user_list_box_control">
                                <div class="mute_icon">
                                    <a href="#." class="handle_remote_participant_audio" data-participantid=${localUserId}>
                                        <svg class="audio-img-${participant}" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path class="audio-status-${participant}" d="M9.89962 9.83939L7.43401 7.21961C7.64144 6.67252 7.74743 6.08824 7.74618 5.49868V4.46791C7.75476 4.38776 7.73371 4.30719 7.68745 4.24311C7.64119 4.17903 7.57331 4.1364 7.49803 4.12415H7.24988C7.17454 4.13628 7.10659 4.17887 7.06031 4.24298C7.01402 4.3071 6.99303 4.38773 7.00173 4.46791V5.49868C7.00166 5.86533 6.94499 6.2295 6.83398 6.57678L6.41908 6.13629C6.47179 5.92828 6.49947 5.71404 6.50146 5.49868V2.06206C6.50146 0.92353 5.82997 0 5.00115 0C4.17233 0 3.50084 0.92353 3.50084 2.06206V3.03659L0.710644 0.0725381C0.686564 0.0454728 0.656577 0.0250719 0.623317 0.0131537C0.590056 0.00123562 0.554539 -0.00185039 0.51989 0.0041707C0.48524 0.0101918 0.452517 0.0251566 0.424596 0.0477064C0.396675 0.0702562 0.374412 0.0997308 0.35976 0.133527L0.0530455 0.675974C0.0118838 0.751084 -0.00603723 0.83794 0.0017957 0.924388C0.00962862 1.01084 0.0428248 1.09253 0.0967223 1.15798L9.29066 10.9253C9.31471 10.9524 9.34466 10.9729 9.3779 10.9848C9.41113 10.9968 9.44663 10.9999 9.48128 10.9939C9.51592 10.988 9.54866 10.9731 9.5766 10.9506C9.60454 10.9281 9.62684 10.8987 9.64154 10.8649L9.94876 10.3225C9.98942 10.2466 10.0066 10.1592 9.99774 10.0725C9.98892 9.98585 9.9546 9.90428 9.89962 9.83939V9.83939ZM6.24587 9.96608H5.37089V9.2407C5.55256 9.20442 5.72927 9.14437 5.89697 9.06197L5.11331 8.23043C5.00768 8.24329 4.90109 8.24469 4.79518 8.23463C3.92269 8.11794 3.25219 7.18966 3.05814 6.04745L2.2452 5.18332V5.33048C2.2452 7.25536 3.24475 8.97209 4.62049 9.23281V9.96871H3.74551C3.67018 9.98084 3.60222 10.0234 3.55594 10.0875C3.50966 10.1517 3.48866 10.2323 3.49736 10.3125V10.6562C3.48879 10.7364 3.50983 10.817 3.55609 10.881C3.60235 10.9451 3.67023 10.9877 3.74551 11H6.24587C6.32115 10.9877 6.38903 10.9451 6.43529 10.881C6.48155 10.817 6.5026 10.7364 6.49402 10.6562V10.3125C6.50341 10.2319 6.48273 10.1506 6.43639 10.0859C6.39004 10.0212 6.32169 9.97821 6.24587 9.96608V9.96608Z" fill="white"/>
                                        </svg>
                                    </a>
                                </div>                        
                                <h4>${participantName[1]}</h4>                        
                            </div>
                        </div>`
                        );
                } else {
                    $('body').append(
                        `<audio autoplay='1' id='${participant}audio${idx}' />`);
                }
                track.attach($(`#${id}`)[0]);
            }else{
                if (participantName[0] === 'Teacher' || participantName[0] === 'teacher') {
                    if (track.getType() === 'video') {
                        $('.cl_user_list').append(
                            `<div class="cl_user_list_box" id='remote-user-${participant}'>
                                <div class="cl_user_list_box_videos">
                                    <span class="Name_value d-none" id="${participant}img">${participantName[2]}</span>
                                    <span class="Name_value d-none" id="${participant}profile_image"><img src=${participantName[3]} /></span>
                                    <video autoplay='1' class="${participant}video" id='${participant}video${idx}' onclick="$('body').toggleClass('fullscreen'); if($('body').hasClass('fullscreen') === true){$('.cl_user_list').css('width','100%'); $('.fullscreen .cl_user_list').css('height','100%');}else{$('.cl_user_list').css('width','50%');}"/>
                                </div>
                                <div class="cl_user_list_box_control">
                                    <div class="mute_icon">
                                        <svg class="audio-img-${participant} width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path class="audio-status-${participant}" d="M9.89962 9.83939L7.43401 7.21961C7.64144 6.67252 7.74743 6.08824 7.74618 5.49868V4.46791C7.75476 4.38776 7.73371 4.30719 7.68745 4.24311C7.64119 4.17903 7.57331 4.1364 7.49803 4.12415H7.24988C7.17454 4.13628 7.10659 4.17887 7.06031 4.24298C7.01402 4.3071 6.99303 4.38773 7.00173 4.46791V5.49868C7.00166 5.86533 6.94499 6.2295 6.83398 6.57678L6.41908 6.13629C6.47179 5.92828 6.49947 5.71404 6.50146 5.49868V2.06206C6.50146 0.92353 5.82997 0 5.00115 0C4.17233 0 3.50084 0.92353 3.50084 2.06206V3.03659L0.710644 0.0725381C0.686564 0.0454728 0.656577 0.0250719 0.623317 0.0131537C0.590056 0.00123562 0.554539 -0.00185039 0.51989 0.0041707C0.48524 0.0101918 0.452517 0.0251566 0.424596 0.0477064C0.396675 0.0702562 0.374412 0.0997308 0.35976 0.133527L0.0530455 0.675974C0.0118838 0.751084 -0.00603723 0.83794 0.0017957 0.924388C0.00962862 1.01084 0.0428248 1.09253 0.0967223 1.15798L9.29066 10.9253C9.31471 10.9524 9.34466 10.9729 9.3779 10.9848C9.41113 10.9968 9.44663 10.9999 9.48128 10.9939C9.51592 10.988 9.54866 10.9731 9.5766 10.9506C9.60454 10.9281 9.62684 10.8987 9.64154 10.8649L9.94876 10.3225C9.98942 10.2466 10.0066 10.1592 9.99774 10.0725C9.98892 9.98585 9.9546 9.90428 9.89962 9.83939V9.83939ZM6.24587 9.96608H5.37089V9.2407C5.55256 9.20442 5.72927 9.14437 5.89697 9.06197L5.11331 8.23043C5.00768 8.24329 4.90109 8.24469 4.79518 8.23463C3.92269 8.11794 3.25219 7.18966 3.05814 6.04745L2.2452 5.18332V5.33048C2.2452 7.25536 3.24475 8.97209 4.62049 9.23281V9.96871H3.74551C3.67018 9.98084 3.60222 10.0234 3.55594 10.0875C3.50966 10.1517 3.48866 10.2323 3.49736 10.3125V10.6562C3.48879 10.7364 3.50983 10.817 3.55609 10.881C3.60235 10.9451 3.67023 10.9877 3.74551 11H6.24587C6.32115 10.9877 6.38903 10.9451 6.43529 10.881C6.48155 10.817 6.5026 10.7364 6.49402 10.6562V10.3125C6.50341 10.2319 6.48273 10.1506 6.43639 10.0859C6.39004 10.0212 6.32169 9.97821 6.24587 9.96608V9.96608Z" fill="white"/>
                                        </svg>
                                    </div>                        
                                    <h4>${participantName[1]}</h4>                        
                                </div>
                            </div>`
                            );
                    } else {
                        $('body').append(
                            `<audio autoplay='1' id='${participant}audio${idx}' />`);
                    }
                    track.attach($(`#${id}`)[0]);

                    // make half of teacher and half student UI
                    $('.cl_user_list').css('width','50%');
                    $('.cl_user_list_box').css('height','100%');
                    $('.cl_user_list_box_videos').css('height','100%');
                    $('.cl_user_list_box_videos').css('height','100%');
                    $('.cl_user_list_box_videos img, .cl_user_list_box_videos video').css("width","100%");
                    $('.cl_user_list_box_videos img, .cl_user_list_box_videos video').css("height","100%");
                    //$('.cl_user_list_box_videos img, .cl_user_list_box_videos video').css("object-fit","fill");
                }
            }

            // To show default Video status for remote participant
            if(userVideo === true){

                // If there is profile image then show user profile other wise show short name
                if(participantName[3]){
                    $(`#${participant}img`).addClass('d-none');
                    $(`#${participant}profile_image`).removeClass('d-none');
                }else{
                    $(`#${participant}img`).removeClass('d-none');
                    $(`#${participant}profile_image`).addClass('d-none');
                }

                $(`#${participant}video${idx}`).addClass('d-none');
            }

            // To show default audio status for remote participant 
            if(userAudio === true){
                $(`.audio-status-${participant}`).css("fill", "red");
            }

            // Manage Remote participant Boxes
            $('.cl_user_list').removeClass('d-none');

            if($("#muteall_participants1").css("stroke") == "rgb(255, 0, 0)") {
                handleMuteAllParticipant();
            }
            getTotalRemoteUsers();
        } catch (error) {
            console.log("onRemoteTrack error",error);
        }
    }

    /**     
     * @param id
     */
    const onUserLeft = (id) => {
        try {
            if (!remoteTracks[id]) {
                return;
            }
            const tracks = remoteTracks[id];
            if(tracks.length > 0){
                for (let i = 0; i < tracks.length; i++) {
                    tracks[i].detach($(`#${id}${tracks[i].getType()}`));
                }
                const element = $(`#remote-user-${id}`);
                if (element) {                    
                    element.remove();
                }
            }else{
                console.log("No Track Found To Remove");
            }
        } catch (error) {
           console.log("onUserLeft error",error); 
        }
    }
    
    /**
     * This function is called when the connection fail.
     */
    const onConnectionFailed= () =>{
        console.error('Connection Failed!');
    }

    /**
     * This function is called when we disconnect.
     */
    const disconnect = () => {
        try {
            connection.removeEventListener(
                JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                onConnectionSuccess);
            connection.removeEventListener(
                JitsiMeetJS.events.connection.CONNECTION_FAILED,
                onConnectionFailed);
            connection.removeEventListener(
                JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                disconnect);
        } catch (error) {
            console.log("disconnect error",error)
        }      
    }

    /**
     * This function is called when the connection fail.
     */
    const onDeviceListChanged = (devices) => {
        try {
            setAllMediaDevices(devices)
            console.info('current devices', devices);
        } catch (error) {
            console.log("onDeviceListChanged error",error);
        }    
    }
    
    // Start meeting
    const startmeeting = async () => {
        try {
            console.log('start meeting is calling');
            localTracks = [];

            //Jitsi initialization options
            const initOptions = {
                disableAudioLevels: true,
                // The ID of the jidesha extension for Chrome.
                desktopSharingChromeExtId: null,

                // Whether desktop sharing should be disabled on Chrome.
                desktopSharingChromeDisabled: false,

                // The media sources to use when using screen sharing with the Chrome
                // extension.
                desktopSharingChromeSources: ["screen", "window"],

                // Required version of Chrome extension
                desktopSharingChromeMinExtVersion: "0.1",

                // Whether desktop sharing should be disabled on Firefox.
                desktopSharingFirefoxDisabled: false,

                disableSimulcast: true,
            };
    
            //Jitsi Object initialization
            JitsiMeetJS.init(initOptions);

            //Jitsi connection
            connection = new JitsiMeetJS.JitsiConnection(null, null, options);

            //Jitsi addEventListeners for connection successfully
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
            
            // console.log("deviceMobile =========> ", deviceMobile)
            // if (prelaunchScreen === false || deviceMobile === true) {
            //     connection.connect();
            //     console.log('If prelaunchScreen ================> ', prelaunchScreen);           
            // } else {
            //     console.log('Else prelaunchScreen ================> ', prelaunchScreen);
            // }

            //Create User Localtracks 
            JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'], desktopSharingFrameRate: {
                min: 1,
                max: 5
           }})
            .then(onLocalTracks)
            .catch(error => {
                if(error.name === "NotReadableError") {
                    alert('Your webcam is already in use by another app !');
                    props.history.push("/user/meeting/meetinglist");
                } else {
                    console.log('error.name ==== '+error.name);
                    props.history.push("/error")
                }
                
            });
        } catch (error) {
            alert('Error while createLocalTrack : ',error);
            props.history.push("/error");
        }          
    }

    //For prelaunch
    const prelaunchMediaHandler = (audioId, videoId) => { 
        try {
            // Clear localtracks if found any
            if(localTracks.length !== 0){
                for (let i = 0; i < localTracks.length; i++) {
                    localTracks[i].dispose();
                }
            }

            // Create local tracks for audio and video
            JitsiMeetJS.createLocalTracks({
                devices: ["audio", "video"],
                cameraDeviceId: videoId,
                micDeviceId: audioId,
            }).then(onLocalTracks)
            .catch(error => {
                //throw error;
            });

            // set prelaunch screen to false to open meeting UI
            setPrelaunchScreen(false);
            
            // Invites Attendence
            checkInAttendence();
            //getDocumentList();
            connection.connect(); 
        } catch (error) {
            console.log("prelaunchMediaHandler error",error);
        }
    }

    /**
     *when user leave the meeting
     */
    const unload = async () => {
        try {
            
            captions = [];
            localStorage.removeItem('local_user_text');
            sttSentence = '';
            
            if(screenRecording === true) {
                clickrecoding();
            }

            if(localTracks.length > 0){
                for (let i = 0; i < localTracks.length; i++) {
                    localTracks[i].dispose();
                    //room.removeTrack(localTracks[i]);
                }

                // Checking out Invites attendence to meeting
                await checkOutAttendence();
                
                //Remove shared-student if any
                if(userRole == 'Teacher' && localStorage.getItem('is_student_present')){
                    localStorage.removeItem('presentedId');
                    localStorage.removeItem('is_student_present');
                    await socket.emit('show-student', {id:localStorage.getItem('presentedId'),action:'endCall'});                  
                }
                // Remove the room from JITSI
                if(room){
                    await room.leave();
                    await connection.disconnect();
                }
            }else{
                console.log("No Tracks found to remove");
            }
            
            // Redirect to Meeting List
            window.location.href  = "/user/meeting/meetinglist";
        }catch(error){
            await connection.disconnect();

            // Redirect to Meeting List
            window.location.href  = "/user/meeting/meetinglist";

            console.log("unload error",error);
        }
    }   

    /**
    * That function is executed when the track is muted
    */   
    const muteHandler = () => {
        console.log("Mute handling");
        if(localTracks.length !== 0){
            for (let i = 0; i < localTracks.length; i++) {
                if (localTracks[i].type === "audio") {
                    try {
                        if (isAudioMuted === true) {
                            localTracks[i].unmute();
                            $("#local_audio").css("fill", "#fff");
                            $(".circle_background").css("fill","#464958");
                            $(".line").addClass('d-none');
                            isAudioMuted = false;
                        } else {
                            localTracks[i].mute();
                            $(".cl_main_noti_box").addClass('d-none');
                            $(".circle_background").css("fill","#ff0000");
                            $("#local_audio").css("fill", "#fff");
                            $(".line").removeClass('d-none');
                            isAudioMuted = true;
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }else{
            console.log("error while calling Audio mutehandler")
        }        
    }

    /**
    * That function is executed when the video is muted
    */    
    const onVideoMuteStateChanged = async (e) => {
        console.log("VideoMuteStateChanged")
        if(localTracks.length !== 0){
            for (let i = 0; i < localTracks.length; i++) {
                if (localTracks[i].type === "video") {
                    try {
                        if (isVideoMuted === true) {
                            localTracks[i].unmute();                        
                            isVideoMuted = false;
                            /*$("#local_video").css("fill", "#464958");
                            $('.local_video').removeClass('d-none');
                            $('.local_video_mute_img').addClass('d-none');*/
                            
                            $("#local_video").css("fill", "#464958");
                            $('.local_video').removeClass('d-none');
                            $(".line1").addClass('d-none');
                            $('.local_video_mute_img1').addClass('d-none');
                            $('.local_video_mute_img').addClass('d-none');
                        } else {
                            localTracks[i].mute();
                            isVideoMuted = true;
                            /*$("#local_video").css("fill", "#ff0000");
                            $('.local_video').addClass('d-none');
                            $('.local_video_mute_img').removeClass('d-none');*/
                            $("#local_video").css("fill", "#ff0000");
                            $(".line1").removeClass('d-none');                            
                            $('.local_video').addClass('d-none');
                            if(userProfileImage){
                                $('.local_video_mute_img1').removeClass('d-none');
                                $('.local_video_mute_img').addClass('d-none');
                            }else{
                                $('.local_video_mute_img').removeClass('d-none');
                                $('.local_video_mute_img1').addClass('d-none');
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }else{
            console.log("error while calling video mutehandler")
        }
        
    }

    //For remove extra localvideo
    const remoteExtaVideo = () => {
        let tags = $(".local-video");
        if(tags.length > 1){
            $(".local-video")[1].remove();
        }
    }

    //For Getting Totalnumber of Remote Users
    const getTotalRemoteUsers = () => {
        const remoteUser = room.getParticipants();
        setUserColLength(remoteUser.length);
        setRemoteParticipantList(remoteUser);
    }   

    /**
     * Screen Share
     */
     const switchVideo = () => {
        if(!isVideo){
            $("#switch_video").css("fill", "#464958");
        }
        isVideo = !isVideo;       
        if (localTracks[1]) {
            localTracks[1].dispose();
            localTracks.pop();
        }
        JitsiMeetJS.createLocalTracks({
            devices: [ isVideo ? 'video' : 'desktop' ]
        })
        .then(tracks => {
            localTracks.push(tracks[0]);
            localTracks[1].addEventListener(
                JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('local track muted'));
            localTracks[1].addEventListener(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => {
                    console.log("isVideo",isVideo)
                    if (tracks[0].videoType === 'desktop' && isVideo === false) {
                        $("#switch_video").css("fill", "#464958");
                        switchVideo();
                    }
                }
            );

            // if(tracks[0].videoType === 'desktop'){
            //     //emit screen share
            //     socket.emit("screen-share", { isScreenShareOn: true});
            //     setScreenShared(true);
            //     $('.new_jitsi_component').removeClass('d-none');
            //     $('.cl_main_home_box').addClass('d-none');
                
            // } else {
            //     socket.emit("screen-share", { isScreenShareOn: false});
            //     setScreenShared(false);
            //     $('.new_jitsi_component').addClass('d-none');
            //     $('.cl_main_home_box').removeClass('d-none');
            // }

            localTracks[1].attach($('#localVideo1')[0]);
            room.addTrack(localTracks[1]);
            /* eslint-disable no-unused-expressions */
            isVideo === false;
        })
        .catch(error =>{
            switchVideo();
        });
    }


    //For SwitchVideo
    const switchVideohandler = () => {
        $("#switch_video").css("fill", "#ff0000");       
        switchVideo(); 
    }

    //For Full Screen
    const switchBigScreen = () => {
        var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method  
            (document.mozFullScreen || document.webkitIsFullScreen);

        var docElm = document.documentElement;
        if (!isInFullScreen) {
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            }else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
                alert("Mozilla entering fullscreen!");
            }else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
                alert("Webkit entering fullscreen!");
            }
        }
    }

    //MuteALl Participants
    const handleMuteAllParticipant = ()=> {
        // Mange SVG for MUTE all
        $("#muteall_participants1").css("stroke", "red");
        $("#muteall_participants2").css("stroke", "red");

        // Mute all remote Participants
        socket.emit("mute-everyone");
    };

    //for recording meeting
    const clickrecoding = () => {
        if (screenRecording === false) {
            setRecordingHandler('start');
            setRecordAction('stop');
            $("#recording_svg").css("fill", "#ff0000");
        } else {
            setRecordingHandler('stop');
            setRecordAction('start');
            $("#recording_svg").css("fill", "#464958");            
        }
        screenRecording = !screenRecording;
    }

    //for validate room to allow user to join meeting for invites
    const validateRoom = async () => {
        const token = localStorage.getItem("auth_token");
        try {
            const validateRoomResponse = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/validateRoom?roomName=${roomName}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (validateRoomResponse.data.Status === "200") {
                localStorage.setItem("active_meeting_id",validateRoomResponse.data.data.meetingId);
                localStorage.setItem("meeting_invities",validateRoomResponse.data.data.invitee);
                localStorage.setItem("meeting_uploaded_documents_count",validateRoomResponse.data.data.uploaded_documents_count);
                localStorage.setItem("meeting_title",validateRoomResponse.data.data.meetingTitle);
                
                // Set the current meeting Id
                setCurrentMeetingId(meetingId);
                setMeeetingDocumentCount(validateRoomResponse.data.data.uploaded_documents_count);

                let meetingUsers = localStorage.getItem("meeting_invities"); 
                if(meetingUsers && meetingUsers.indexOf(userId) == -1){
                    alert("이 회의에 초대되지 않았습니다. 회의 참여 초대장을 보내도록 권한을 요청하십시오.");
                    unload();
                    props.history.push("/user/meeting/meetinglist");
                }
            }else{
                alert("Something went wrong while validating conference. Please try again");
                //unload();
                props.history.push("/user/meeting/meetinglist");
            }
        } catch (error) {
            console.log("error while valdiating room");
        }
    }

    //for capturing attendance for invities
    const checkInAttendence = async () => {
        const userId = localStorage.getItem('user_id');
        const meetingId = localStorage.getItem('active_meeting_id');
        const token = localStorage.getItem("auth_token");
        try {
            const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/attendance/addCheckInTime?meetingId=${meetingId}&userId=${userId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            setAttendenceId(data.attendanceId);
        } catch (error) {
            console.log("error while capturing attendence")
        }
    }

    //for delay screen share student specific
    const delayStudentScreenShare = async () => {
        setTimeout(() => {
            console.log("checkoutAttendence")
        }, 3000);
    }
    //for capturing attendance for invities
    const checkOutAttendence = async () => {
        console.log("checkoutAttendence")     
        const token = localStorage.getItem("auth_token");
        try {
            const data = await Axios.post(`${ENDPOINTURL}/alimeet/attendance/addCheckOutTime?attendanceId=${attendanceId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })            
            if (data.data === "Attendance Check-out Successfully !") {            
                socket.emit('endcall');        
            }
        } catch (error) {
            console.log("error while capturing attendence")
        }
    }
    
    //For AddPassword
    const addPassword = async () => {       
        try {
            const token = localStorage.getItem("auth_token");
            let meeting = JSON.parse(meetingData);            
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

    //For ConfirmPassword
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

    // Meeting Participents
    const meetingParticipants = async () => {
        $("body").toggleClass("participant-listOpen");
        $("body").removeClass("ChatsBoxOpen");
        $("body").removeClass("document-listOpen");
    }
    const closeMeetingParticipants = async () => {
        $("body").removeClass("participant-listOpen");
    }

    //For chat handling
    const formatAMPM = async (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        chatTimeValue = strTime;
        setChatTime(strTime);
    }
    const chatHandler = () => {
        // Manage toggle
        $("body").toggleClass("ChatsBoxOpen");
        $("body").removeClass("participant-listOpen");
        $("body").removeClass("document-listOpen");

        // Reset Unread message count badge
        unreadMessageCount = 0;
        setChatUnreadMessageCount(unreadMessageCount);
    }
    const closeMeetingChat = async () => {
        $("body").removeClass("ChatsBoxOpen");
    }
    // Manage Live Chat for meeting
    const manageChat = async () => {
        // Set current time for chat message
        formatAMPM(new Date);

        if ($('#send_mesage').val() != '') {

            // Send message to conference
            socket.emit("send-message", { message: $('#send_mesage').val(), messagetime: chatTimeValue, name: localStorage.getItem('user_name')});

            // Append new message to chat
            $("#remote_chat").append('<span className="time_chat" id="my_name">You <strong>'+chatTimeValue+'</strong></span><p>'+$('#send_mesage').val()+'</p>');
            
            // Scroll to bottom
            $("#user_chat_panel").animate({ scrollTop: $('#user_chat_panel').prop("scrollHeight") }, 1000);

            // Clear the message
            $("#send_mesage").val("");
            newChatMessage("");
        }
    }

    // Manage Meeting Documents
    const meetingDocumentsHandler = async () => {
        // Get Meeting Documents
        getDocumentList();

        // Manage toggle
        $("body").toggleClass("document-listOpen");
        $("body").removeClass("ChatsBoxOpen");
        $("body").removeClass("participant-listOpen");
    }

    // Close meeting documents on click of close icon
    const closeMeetingDocuments = async () => {
        $("body").removeClass("document-listOpen");
    }

    // Manage Meeting Documents
    let formData = new FormData();
    const uploadHandler = async (e) => {
        var fi = document.getElementById('meeting_document'); // GET THE FILE INPUT.
        const token = localStorage.getItem("auth_token");
        const meetingId = localStorage.getItem("active_meeting_id");

        // checking for multiple file upload.
        if((e.target.files).length > 1){
            // cannot add multiple files . 
            alert("Sorry, multiple files are not allowed");
            return false;
        }else{
            formData.append('files', e.target.files[0]);

            // Start Uploading an document
            setComponentStatus({
                status: "processing",
                message: "Uploading Document..."
            });
            try {
                setComponentStatus({
                    status: "processing",
                    message: "Processing..."
                })
                const uploadDocumentResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/addAllDocuments?meetingId=${meetingId}&source=Documents&userId=${userId}`,
                        formData, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                });

                if (uploadDocumentResponse.data.Status === "200") {
                    setDocumentList(uploadDocumentResponse.data.data);
                    setMeeetingDocumentCount(uploadDocumentResponse.data.data.length);

                    // Send Meeting documnts legnth to all participents
                    socket.emit("document-counter", {count:uploadDocumentResponse.data.data.length});

                    // Remove Uplaoded file from formdata
                    formData.delete('files');

                    // Start Uploading an document
                    setComponentStatus({
                        status: "",
                        message: ""
                    });
                }else{
                    alert("Something went wrong while validating conference. Please try again");
                    props.history.push("/user/meeting/meetinglist");
                }
            } catch (error) {
                setComponentStatus({
                    status: "error",
                    message: "something went wrong while Document Uploaded"
                })
            }
        }
    }

    //For getting documentList
    const getDocumentList = async () => {
        const token = localStorage.getItem("auth_token");
        const meetingId = localStorage.getItem("active_meeting_id");
        try {
            const meetingDocumentResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentListAPI?meetingId=${meetingId}&source=Documents&userId=0`,
                {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (meetingDocumentResponse.data.Status === "200") {
                setDocumentList(meetingDocumentResponse.data.data);
                setMeeetingDocumentCount(meetingDocumentResponse.data.data.length);
            }else{
                alert("Something went wrong while validating conference. Please try again");
                props.history.push("/user/meeting/meetinglist");
            }
        } catch (error) {
            console.log(error.message)   
        }
    }

    // Delete the document from meeting
    const deleteDocument = async (documentId) => {
        try{
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })
            const token = localStorage.getItem("auth_token");
            const deleteDocumentResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/deleteDocumentAPI?documentId=${documentId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }});

            if (deleteDocumentResponse.data.Status === "200") {
                // Send Meeting documnts legnth to all participents
                socket.emit("document-counter", {count:deleteDocumentResponse.data.data.length});

                // Set Documents 
                setDocumentList(deleteDocumentResponse.data.data);
                setMeeetingDocumentCount(deleteDocumentResponse.data.data.length);
                setComponentStatus({
                    status: "",
                    message: ""
                });
            }else{
                alert("Something went wrong. Please try again");
                props.history.push("/user/meeting/meetinglist");
            }
        }catch(error){            
            setComponentStatus({
                status: "error",
                message: "something went wrong while Document Deleting"
            })
        }        
    }

    // For White board Handler 
    const whiteboardHandler = async (action) => {
        // Show Whiteboard to meeting participents
        if (action === true) {
            $(".whiteboard-wrapper").addClass("show");
            $(".whiteboard-wrapper").removeClass("d-none");
        } else {
            $(".whiteboard-wrapper").removeClass("show");
            $(".whiteboard-wrapper").addClass("d-none");
        }

        // Handle White board to show only by teacher
        if (localStorage.getItem('user_role') === "Teacher") {
            if (action === true) {
                socket.emit('handle-whiteboard', { action: 'open' });
            } else {
                socket.emit('handle-whiteboard', { action: 'close' });
            }
        }

        // Start = Student Side Only if user role is student then close white board and make previous UI
        if(localStorage.getItem('user_role') === "Student"){
            if(action === false){
                //Teacher screen on whiteboard - start
                $('.cl_user_list').css('right','');
                $('.cl_user_list').css('width','50%');
                $('.cl_user_list').css('position','');
                $('.cl_user_list').css('z-index','');
                $('.cl_user_list').css('top','');
                $('.cl_user_list').css('height','');
                //Teacher screen on whiteboard - end
            }else{
                //Teacher screen on whiteboard - start
                $('.cl_user_list').css('right','0');
                $('.cl_user_list').css('width','22%');
                $('.cl_user_list').css('position','absolute');
                $('.cl_user_list').css('z-index','9999999');
                $('.cl_user_list').css('top','0');
                $('.cl_user_list').css('height','28%');
                //Teacher screen on whiteboard - end
            }
        }
        // End = Student Side Only if user role is student then close white board and make previous UI
    }

    // For Tile View
    const tileView = async () => {
        $('.cl_user_list').toggleClass(`user${userColLength}`)
        $("body").toggleClass('TileView')

        if($("body").hasClass('TileView') === true){
            $(".cl_main_noti_box").css("left","0");
            $("body").removeClass('fullscreen');
            $('.cl_user_list_box').removeClass('fullscreen');
        }
    }

    // For device change
    const deviceChanges = async () => {
        window.location.href = "/user/meeting/MeetingUI/" + roomName;
    }

    // Handle Aduio for specific students
    //$(".handle_remote_participant_audio").click(function(){
    $(document).on('click', 'a.handle_remote_participant_audio', function() {
        if(remoteMuteCounter == 1){
            let requestedParticipantId = $(this).data('participantid');
            socket.emit("remote-participant-handler",{requested_participant_id:requestedParticipantId});
            remoteMuteCounter = remoteMuteCounter + 1;
        }
    });

    // Present to Meeting
    const presentToMeeting = async (id,action) => {

        isStudentPresented = localStorage.getItem('is_student_present');

        // To Manage SVG for presenting students
        if(localStorage.getItem('present_' + id)){

            // Remove Presented Student
            localStorage.removeItem('is_student_present');

            // Removed presneted student
            localStorage.removeItem('present_' + id);
            $("#" + id).find("path").css("fill","black");

            //
            localStorage.removeItem('presentedId');

            // Present Student
            socket.emit('show-student', {id:id,action:action});
        }else{
            if(isStudentPresented){
                alert("You have already presented one student");
                return false;
            }else{
                localStorage.setItem('is_student_present',true);
                localStorage.setItem('present_' + id,id);
                localStorage.setItem('presentedId',id);
                $("#" + id).find("path").css("fill","red");

                // Present Student
                socket.emit('show-student', {id:id,action:action});
            }
        }
    }

    // Present student to all members of meeting
    const showUserToAll = async (track) => {
        if (track.isLocal()) {
            return;
        }
        if(room){
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
            track.addEventListener(
                JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('remote track muted'));
            track.addEventListener(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('remote track stoped'));
            track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId =>
                    console.log(
                        `track audio output device was changed to ${deviceId}`));

            const id = participant + track.getType() + idx;

            if (participantName[0] === 'Admin' || participantName[0] === 'admin') {           
                return;
            }

            if (track.getType() === 'video') {
                $('.cl_user_list').append(
                    `<div class="cl_user_list_box present_student_video new_user_video_${participant}" id='remote-user-${participant}'>
                        <div class="cl_user_list_box_videos">
                            <span class="Name_value d-none" id="${participant}img">${participantName[2]}<span></span></span>
                            <span class="Name_value d-none" id="${participant}profile_image"><img src=${participantName[3]} /></span>
                            <video autoplay='1' class="${participant}video" id='${participant}video${idx}' />
                        </div>
                        <div class="cl_user_list_box_control">
                            <div class="mute_icon">
                                <svg class="audio-img-${participant} width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.89962 9.83939L7.43401 7.21961C7.64144 6.67252 7.74743 6.08824 7.74618 5.49868V4.46791C7.75476 4.38776 7.73371 4.30719 7.68745 4.24311C7.64119 4.17903 7.57331 4.1364 7.49803 4.12415H7.24988C7.17454 4.13628 7.10659 4.17887 7.06031 4.24298C7.01402 4.3071 6.99303 4.38773 7.00173 4.46791V5.49868C7.00166 5.86533 6.94499 6.2295 6.83398 6.57678L6.41908 6.13629C6.47179 5.92828 6.49947 5.71404 6.50146 5.49868V2.06206C6.50146 0.92353 5.82997 0 5.00115 0C4.17233 0 3.50084 0.92353 3.50084 2.06206V3.03659L0.710644 0.0725381C0.686564 0.0454728 0.656577 0.0250719 0.623317 0.0131537C0.590056 0.00123562 0.554539 -0.00185039 0.51989 0.0041707C0.48524 0.0101918 0.452517 0.0251566 0.424596 0.0477064C0.396675 0.0702562 0.374412 0.0997308 0.35976 0.133527L0.0530455 0.675974C0.0118838 0.751084 -0.00603723 0.83794 0.0017957 0.924388C0.00962862 1.01084 0.0428248 1.09253 0.0967223 1.15798L9.29066 10.9253C9.31471 10.9524 9.34466 10.9729 9.3779 10.9848C9.41113 10.9968 9.44663 10.9999 9.48128 10.9939C9.51592 10.988 9.54866 10.9731 9.5766 10.9506C9.60454 10.9281 9.62684 10.8987 9.64154 10.8649L9.94876 10.3225C9.98942 10.2466 10.0066 10.1592 9.99774 10.0725C9.98892 9.98585 9.9546 9.90428 9.89962 9.83939V9.83939ZM6.24587 9.96608H5.37089V9.2407C5.55256 9.20442 5.72927 9.14437 5.89697 9.06197L5.11331 8.23043C5.00768 8.24329 4.90109 8.24469 4.79518 8.23463C3.92269 8.11794 3.25219 7.18966 3.05814 6.04745L2.2452 5.18332V5.33048C2.2452 7.25536 3.24475 8.97209 4.62049 9.23281V9.96871H3.74551C3.67018 9.98084 3.60222 10.0234 3.55594 10.0875C3.50966 10.1517 3.48866 10.2323 3.49736 10.3125V10.6562C3.48879 10.7364 3.50983 10.817 3.55609 10.881C3.60235 10.9451 3.67023 10.9877 3.74551 11H6.24587C6.32115 10.9877 6.38903 10.9451 6.43529 10.881C6.48155 10.817 6.5026 10.7364 6.49402 10.6562V10.3125C6.50341 10.2319 6.48273 10.1506 6.43639 10.0859C6.39004 10.0212 6.32169 9.97821 6.24587 9.96608V9.96608Z" fill="white"/>
                                </svg>
                            </div>                        
                            <h4>${participantName[1]}</h4>                        
                        </div>
                    </div>`
                    );
            } else {
                $('body').append(`<audio autoplay='1' new_user_audio_${participant} id='${participant}audio${idx}' />`);
            }


            // To show default Video status for remote participant
            if(track.getType() === 'video' && track.isMuted() === true){

                // If there is profile image then show user profile other wise show short name
                if(participantName[3]){
                    $(`#${participant}img`).addClass('d-none');
                    $(`#${participant}profile_image`).removeClass('d-none');
                }else{
                    $(`#${participant}img`).removeClass('d-none');
                    $(`#${participant}profile_image`).addClass('d-none');
                }

                $(`#${participant}video${idx}`).addClass('d-none');
            }

            track.attach($(`#${id}`)[0]);
            getTotalRemoteUsers()
        }else{
            console.log("Error while presting student to all");
        }
    }

    // Set new message
    const newChatMessage = async (message) => {
        if(message){
            setChatMessage(message);
            $("#send_message_svg").find('path').css("fill","black");
        }else{
            $("#send_message_svg").find('path').css("fill","none");
        }
    }

    //For AddPassword Modal
    const modalsecurity1 = (
        `<div>
            <p>You can add a password to your meeting. Participants will need to provide the password before they are allowed to join the meeting.</p>
            <br></br>
            <Label>Password</Label>
            <Input type="email" name="password" id="password" placeholder="Add Meeting Password" onChange={(e) => setMeetingPassword(e.target.value)} />
        </div>`
    );
    
    if(!isSubtitle){
        $("#subtitle_svg").css("fill", "#FFFFFF");    
    }else{
        $("#subtitle_svg").css("fill", "#ff0000");
    }

    return(
        <>
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

        <Modal isOpen={modal} modalTransition={{ timeout: 700 }} backdropTransition={{ timeout: 1300 }}
            toggle={videoQualityToggle} className={className}>
            <ModalHeader toggle={videoQualityToggle}>Video Quality</ModalHeader>
            <ModalBody>
                {videoQuality}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={videoQualityToggle}>OK</Button>
            </ModalFooter>
        </Modal>
        {
            isAudioMuted === false && (
                // <STTComponent setSubtitle={setSubtitle} />
            )
        }
        {
            prelaunchScreen === false ? (
                <>
                    {
                        recordingHandler && <Recorder action={recordingHandler} meetingId={currentMeetingId} />
                    }
                    <div className="cl_meeting_videos_main">
                        {/* Top  Meeting Menu  */}
                        <div className="top_meeting_videos">
                            <div className="logo">
                                <a href="#.">
                                    <svg width="210" height="30" viewBox="0 0 210 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="210" height="30" fill="url(#pattern0)"/>
                                        <defs>
                                        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                                        <use transform="scale(0.00357143 0.025)"/>
                                        </pattern>
                                        <image id="image0" width="280" height="40"/>
                                        </defs>
                                    </svg>
                                </a>
                            </div>
                            <div className="meeting_title">
                                {meetingTitle}
                            </div>
                            <div className="meeting_menu">
                                <ul>
                                    <li>
                                        <a href="#." onClick={switchBigScreen}>
                                            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0)">
                                                <path d="M21.4749 9.1083e-07H0.555859C0.48368 -0.000130564 0.412182 0.0139727 0.345459 0.0415037C0.278736 0.0690346 0.218096 0.109453 0.167011 0.160445C0.115926 0.211438 0.0753973 0.272003 0.047745 0.338676C0.0200926 0.405349 0.00585926 0.476821 0.00585938 0.549001V10.581C0.00585938 10.7266 0.0637003 10.8662 0.166658 10.9692C0.269615 11.0722 0.409256 11.13 0.554859 11.13C0.700848 11.1297 0.840857 11.072 0.944553 10.9692C1.04825 10.8665 1.10728 10.727 1.10886 10.581V1.1H20.9299V20.924H11.3889C11.2419 20.924 11.101 20.9824 10.9971 21.0863C10.8932 21.1902 10.8349 21.3311 10.8349 21.478C10.8349 21.6249 10.8932 21.7658 10.9971 21.8697C11.101 21.9736 11.2419 22.032 11.3889 22.032H21.4749C21.5476 22.0321 21.6197 22.0179 21.687 21.9901C21.7543 21.9623 21.8154 21.9215 21.8669 21.87C21.9184 21.8186 21.9592 21.7574 21.987 21.6902C22.0148 21.6229 22.029 21.5508 22.0289 21.478V0.554001C22.029 0.481212 22.0148 0.409112 21.987 0.341839C21.9592 0.274565 21.9184 0.21344 21.8669 0.16197C21.8154 0.1105 21.7543 0.0696978 21.687 0.0419033C21.6197 0.0141089 21.5476 -0.000130835 21.4749 9.1083e-07V9.1083e-07Z" fill="white"/>
                                                <path d="M3.65786e-06 21.474C-0.000528309 21.6202 0.0569825 21.7607 0.159912 21.8645C0.262841 21.9684 0.402778 22.0272 0.549004 22.028H8.222C8.29479 22.0281 8.36689 22.0138 8.43417 21.9861C8.50144 21.9583 8.56256 21.9175 8.61403 21.866C8.6655 21.8145 8.70631 21.7534 8.7341 21.6861C8.7619 21.6189 8.77614 21.5468 8.776 21.474V13.806C8.77614 13.7332 8.7619 13.6611 8.7341 13.5938C8.70631 13.5265 8.6655 13.4654 8.61403 13.4139C8.56256 13.3625 8.50144 13.3216 8.43417 13.2939C8.36689 13.2661 8.29479 13.2518 8.222 13.252H0.550004C0.477523 13.2521 0.405783 13.2665 0.338907 13.2945C0.272032 13.3224 0.21134 13.3633 0.160321 13.4148C0.109303 13.4663 0.068963 13.5274 0.0416216 13.5945C0.0142803 13.6616 0.000476407 13.7335 0.00100366 13.806V21.474H3.65786e-06ZM1.1 14.355H7.673V20.924H1.103L1.1 14.355Z" fill="white"/>
                                                <path d="M10.0351 11.9903C10.139 12.094 10.2798 12.1523 10.4266 12.1523C10.5734 12.1523 10.7142 12.094 10.8181 11.9903L17.0591 5.74528V9.34528C17.0591 9.49221 17.1175 9.63312 17.2214 9.73702C17.3253 9.84091 17.4662 9.89928 17.6131 9.89928C17.76 9.89928 17.9009 9.84091 18.0048 9.73702C18.1087 9.63312 18.1671 9.49221 18.1671 9.34528V4.41728C18.1672 4.34449 18.153 4.27239 18.1252 4.20512C18.0974 4.13784 18.0566 4.07672 18.0051 4.02525C17.9537 3.97378 17.8925 3.93298 17.8253 3.90518C17.758 3.87739 17.6859 3.86315 17.6131 3.86328H12.6831C12.5362 3.86328 12.3953 3.92165 12.2914 4.02554C12.1875 4.12944 12.1291 4.27035 12.1291 4.41728C12.1291 4.56421 12.1875 4.70512 12.2914 4.80901C12.3953 4.91291 12.5362 4.97128 12.6831 4.97128H16.2831L10.0381 11.2123C9.98669 11.2631 9.94581 11.3236 9.91782 11.3902C9.88983 11.4568 9.87528 11.5284 9.875 11.6007C9.87473 11.6729 9.88873 11.7446 9.9162 11.8114C9.94368 11.8783 9.98408 11.9391 10.0351 11.9903V11.9903Z" fill="white"/>
                                                </g>
                                                <defs>
                                                <clipPath id="clip0">
                                                <rect width="22.027" height="22.032" fill="white"/>
                                                </clipPath>
                                                </defs>
                                            </svg>
                                            <div className="icon_name">Full Screen</div>
                                        </a>
                                    </li>
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (
                                            <li>
                                                <a href="#." className="TileMenu" onClick={tileView}>
                                                    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clipPath="url(#clip0)">
                                                        <path d="M3.28045e-06 21.4119C-0.000528529 21.5749 0.0636198 21.7313 0.178364 21.847C0.293108 21.9627 0.449068 22.0281 0.612003 22.0289H9.158C9.23907 22.0291 9.31936 22.0132 9.39427 21.9822C9.46919 21.9512 9.53726 21.9058 9.59458 21.8485C9.6519 21.7912 9.69735 21.7231 9.72831 21.6482C9.75927 21.5733 9.77514 21.493 9.775 21.4119V12.8709C9.77514 12.7898 9.75927 12.7096 9.72831 12.6346C9.69735 12.5597 9.6519 12.4916 9.59458 12.4343C9.53726 12.377 9.46919 12.3316 9.39427 12.3006C9.31936 12.2697 9.23907 12.2538 9.158 12.2539H0.617003C0.536212 12.2539 0.456219 12.2699 0.38164 12.301C0.307061 12.332 0.239372 12.3776 0.182477 12.4349C0.125581 12.4923 0.0806063 12.5604 0.0501461 12.6352C0.0196858 12.71 0.00434322 12.7901 0.00500328 12.8709V21.4119H3.28045e-06ZM1.229 13.4829H8.55V20.7999H1.229V13.4829Z" fill="white"/>
                                                        <path d="M12.252 21.4119C12.2514 21.5749 12.3156 21.7313 12.4303 21.847C12.5451 21.9627 12.701 22.0281 12.864 22.0289H21.41C21.491 22.0291 21.5713 22.0132 21.6462 21.9822C21.7211 21.9512 21.7892 21.9058 21.8465 21.8485C21.9039 21.7912 21.9493 21.7231 21.9803 21.6482C22.0112 21.5733 22.0271 21.493 22.027 21.4119V12.8709C22.0271 12.7898 22.0112 12.7096 21.9803 12.6346C21.9493 12.5597 21.9039 12.4916 21.8465 12.4343C21.7892 12.377 21.7211 12.3316 21.6462 12.3006C21.5713 12.2697 21.491 12.2538 21.41 12.2539H12.869C12.7882 12.2539 12.7082 12.2699 12.6336 12.301C12.559 12.332 12.4913 12.3776 12.4344 12.4349C12.3775 12.4923 12.3326 12.5604 12.3021 12.6352C12.2716 12.71 12.2563 12.7901 12.257 12.8709V21.4119H12.252ZM13.481 13.4829H20.802V20.7999H13.481V13.4829Z" fill="white"/>
                                                        <path d="M3.28045e-06 9.15802C-0.000528529 9.32096 0.0636198 9.47743 0.178364 9.59311C0.293108 9.70879 0.449068 9.77423 0.612003 9.77503H9.158C9.23907 9.77516 9.31936 9.75926 9.39427 9.7283C9.46919 9.69734 9.53726 9.65193 9.59458 9.59461C9.6519 9.53729 9.69735 9.46921 9.72831 9.39429C9.75927 9.31937 9.77514 9.23908 9.775 9.15802V0.617005C9.77514 0.535943 9.75927 0.455655 9.72831 0.380738C9.69735 0.305821 9.6519 0.237741 9.59458 0.180421C9.53726 0.123101 9.46919 0.0776837 9.39427 0.0467232C9.31936 0.0157627 9.23907 -0.00013089 9.158 8.11852e-07H0.617003C0.536212 -1.88452e-06 0.456219 0.0159908 0.38164 0.0470589C0.307061 0.078127 0.239372 0.123671 0.182477 0.181031C0.125581 0.238391 0.0806063 0.306458 0.0501461 0.381287C0.0196858 0.456117 0.00434322 0.536216 0.00500328 0.617005V9.15802H3.28045e-06ZM1.229 1.229H8.55V8.54602H1.229V1.229Z" fill="white"/>
                                                        <path d="M12.252 9.15802C12.2514 9.32096 12.3156 9.47743 12.4303 9.59311C12.5451 9.70879 12.701 9.77423 12.864 9.77503H21.41C21.491 9.77516 21.5713 9.75926 21.6462 9.7283C21.7211 9.69734 21.7892 9.65193 21.8465 9.59461C21.9039 9.53729 21.9493 9.46921 21.9803 9.39429C22.0112 9.31937 22.0271 9.23908 22.027 9.15802V0.617005C22.0271 0.535943 22.0112 0.455655 21.9803 0.380738C21.9493 0.305821 21.9039 0.237741 21.8465 0.180421C21.7892 0.123101 21.7211 0.0776837 21.6462 0.0467232C21.5713 0.0157627 21.491 -0.00013089 21.41 8.11852e-07H12.869C12.7882 -1.88452e-06 12.7082 0.0159908 12.6336 0.0470589C12.559 0.078127 12.4913 0.123671 12.4344 0.181031C12.3775 0.238391 12.3326 0.306458 12.3021 0.381287C12.2716 0.456117 12.2563 0.536216 12.257 0.617005V9.15802H12.252ZM13.481 1.229H20.802V8.54602H13.481V1.229Z" fill="white"/>
                                                        </g>
                                                        <defs>
                                                        <clipPath id="clip0">
                                                        <rect width="22.026" height="22.027" fill="white"/>
                                                        </clipPath>
                                                        </defs>
                                                    </svg>
                                                    <div className="icon_name">TileView</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                        {/*Top  Meeting Menu */}

                        {/* Meeting Videos Body */}
                        <div className="meeing_video_body">
                            <div className="participant-list-wrapper">
                                <div>
                                    <h2> Participant List
                                        <a className="participant-listClose" href="#." onClick={closeMeetingParticipants}>
                                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M11 1L1 11M1 1L11 11" stroke="#656185" strokeWidth="1.5"/>
                                          </svg>
                                       </a>
                                   </h2>
                                    <ul className="participant-list">
                                        <div className="='parent'">
                                        {
                                            remoteParticipantList && remoteParticipantList.map((track) => (
                                                <div className="users" key={track._id}>{track._displayName.split('#')[1]} 
                                                    <a href="#." onClick={() => presentToMeeting(track._id,'show')}>
                                                        <svg width="20" id={track._id} className="presting_student" height="20" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M28.125 0.8125H1.875C1.37772 0.8125 0.900805 1.01004 0.549175 1.36167C0.197544 1.71331 0 2.19022 0 2.6875V20.5C0 20.9973 0.197544 21.4742 0.549175 21.8258C0.900805 22.1775 1.37772 22.375 1.875 22.375H13.125V24.25H9.375V25.1875H20.625V24.25H16.875V22.375H28.125C28.6223 22.375 29.0992 22.1775 29.4508 21.8258C29.8025 21.4742 30 20.9973 30 20.5V2.6875C30 2.19022 29.8025 1.71331 29.4508 1.36167C29.0992 1.01004 28.6223 0.8125 28.125 0.8125ZM15.9375 24.25H14.0625V22.375H15.9375V24.25ZM29.0625 20.5C29.0625 20.7486 28.9637 20.9871 28.7879 21.1629C28.6121 21.3387 28.3736 21.4375 28.125 21.4375H1.875C1.62636 21.4375 1.3879 21.3387 1.21209 21.1629C1.03627 20.9871 0.9375 20.7486 0.9375 20.5V2.6875C0.9375 2.43886 1.03627 2.2004 1.21209 2.02459C1.3879 1.84877 1.62636 1.75 1.875 1.75H28.125C28.3736 1.75 28.6121 1.84877 28.7879 2.02459C28.9637 2.2004 29.0625 2.43886 29.0625 2.6875V20.5Z" fill="black"/>
                                                            <path d="M1.875 17.6875H28.125V2.6875H1.875V17.6875ZM2.8125 3.625H27.1875V16.75H2.8125V3.625Z" fill="black"/>
                                                            <path d="M15 20.5C15.5178 20.5 15.9375 20.0803 15.9375 19.5625C15.9375 19.0447 15.5178 18.625 15 18.625C14.4822 18.625 14.0625 19.0447 14.0625 19.5625C14.0625 20.0803 14.4822 20.5 15 20.5Z" fill="black"/>
                                                        </svg>
                                                    </a>
                                                </div>
                                            ))
                                        }
                                        </div>
                                    </ul>
                                </div>
                            </div>
                            <div className="user_chat_box">
                                <div className="user_chat_box_top">
                                   <h3>Meeting Chat</h3>
                                   <a className="CloseChat" href="#." onClick={closeMeetingChat}>
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M11 1L1 11M1 1L11 11" stroke="#656185" strokeWidth="1.5"/>
                                      </svg>
                                   </a>
                                </div>
                                <div className="user_chat_box_message" id="user_chat_panel">
                                   <div className="user_chat_item" id="chat_data">
                                        <div className="user_chat_item_inr" id="remote_chat">
                                        </div>
                                   </div>
                                </div>
                                <div className="user_chat_box_btm_main">
                                   <div className="user_chat_box_btm">
                                      <input type="text" id="send_mesage" placeholder="Type message" autoComplete="off" onChange={(e) => newChatMessage(e.target.value)}/> 
                                      <button className="send_btn" onClick={manageChat}>
                                         <svg xmlns="http://www.w3.org/2000/svg" id="send_message_svg" width="30.548" height="30.548" viewBox="0 0 47.548 46.669">
                                            <g id="Icon_feather-send" data-name="Icon feather-send" transform="translate(23.335 -2.121) rotate(45)">
                                              <path id="Path_1217" data-name="Path 1217" d="M33,3,16.5,19.5" fill="none" stroke="#d0d7da" strokeLinejoin="round" strokeLinejoin="round" strokeWidth="3"/>
                                              <path id="Path_1218" data-name="Path 1218" d="M33,3,22.5,33l-6-13.5L3,13.5Z" fill="none" stroke="#d0d7da" strokeLinejoin="round" strokeLinejoin="round" strokeWidth="3"/>
                                            </g>
                                          </svg>
                                      </button>
                                   </div>     
                                </div>
                            </div>
                            <div className="document-list-wrapper">
                                <div>
                                    <h2> Document List
                                        <a className="CloseChat" href="#." onClick={closeMeetingDocuments}>
                                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M11 1L1 11M1 1L11 11" stroke="#656185" strokeWidth="1.5"/>
                                          </svg>
                                       </a>
                                    </h2>
                                    <ul className="document-list">
                                        <div className="parent">
                                            {
                                                documentList && documentList.map((doc,i) => (
                                                    <div className="users" key={i}> <span>{doc.documentTitle}</span>
                                                        <div className="actions">
                                                            <a href={doc.url} target="_blank">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 22.038 22.038">
                                                                    <g id="Icon_feather-download" data-name="Icon feather-download" transform="translate(-3.5 -3.5)">
                                                                        <path id="Path_1" data-name="Path 1" d="M24.538,22.5v4.453a2.226,2.226,0,0,1-2.226,2.226H6.726A2.226,2.226,0,0,1,4.5,26.953V22.5" transform="translate(0 -4.641)" fill="none" stroke="#000" strokeLinejoin="round" strokeLinejoin="round" strokeWidth="2"/>
                                                                        <path id="Path_2" data-name="Path 2" d="M10.5,15l5.566,5.566L21.632,15" transform="translate(-1.547 -2.708)" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                                                                        <path id="Path_3" data-name="Path 3" d="M18,17.859V4.5" transform="translate(-3.481)" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                                                                    </g>
                                                                </svg>
                                                            </a>
                                                            {
                                                                localStorage.getItem('user_role') === "Teacher" && (
                                                                    <a href="#." onClick={() => deleteDocument(doc.documentId)}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 15.635 20.102">
                                                                            <path id="Icon_material-delete-forever" data-name="Icon material-delete-forever" d="M8.617,22.369A2.24,2.24,0,0,0,10.85,24.6h8.934a2.24,2.24,0,0,0,2.234-2.234V8.967H8.617Zm2.747-7.951,1.575-1.575,2.379,2.368,2.368-2.368,1.575,1.575-2.368,2.368,2.368,2.368-1.575,1.575-2.368-2.368L12.95,20.727l-1.575-1.575,2.368-2.368Zm7.862-8.8L18.109,4.5H12.526L11.409,5.617H7.5V7.85H23.135V5.617Z" transform="translate(-7.5 -4.5)"/>
                                                                        </svg>
                                                                    </a>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </ul>
                                </div>
                                <div className="user_chat_box_btm_main">
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (
                                            <div className="user_chat_box_btm">
                                                <label htmlFor="meeting_document" className="btn">Upload Document</label>
                                                <input type="file" id="meeting_document" style={{visibility:"hidden"}} onChange={uploadHandler} onClick={(event)=> {event.target.value = null}}/>
                                                {
                                                    componentStatus && componentStatus.status === "OK" &&
                                                    <p className="text-success">{componentStatus.message}</p>
                                                }
                                                {
                                                    componentStatus && componentStatus.status === "error" &&
                                                    <p className="text-danger">{componentStatus.message}</p>
                                                }
                                                {
                                                    componentStatus && componentStatus.status === "processing" &&
                                                    <p className="text-warning">{componentStatus.message}</p>
                                                }
                                            </div>
                                        )
                                    }     
                                </div>
                            </div>
                            <div className="whiteboard-wrapper d-none">                               
                                <Whiteboard whiteboardhandler={whiteboardHandler} roomName={roomName} />
                            </div>
                            <div className="cl_user_list" >
                            {/*<div className="cl_user_list_box"> 
                                    <div className="cl_user_list_box_videos">
                                        <img src={person} alt=""/>
                                    </div>
                                    <div className="cl_user_list_box_control">
                                        <div className="mute_icon">
                                            <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9.89962 9.83939L7.43401 7.21961C7.64144 6.67252 7.74743 6.08824 7.74618 5.49868V4.46791C7.75476 4.38776 7.73371 4.30719 7.68745 4.24311C7.64119 4.17903 7.57331 4.1364 7.49803 4.12415H7.24988C7.17454 4.13628 7.10659 4.17887 7.06031 4.24298C7.01402 4.3071 6.99303 4.38773 7.00173 4.46791V5.49868C7.00166 5.86533 6.94499 6.2295 6.83398 6.57678L6.41908 6.13629C6.47179 5.92828 6.49947 5.71404 6.50146 5.49868V2.06206C6.50146 0.92353 5.82997 0 5.00115 0C4.17233 0 3.50084 0.92353 3.50084 2.06206V3.03659L0.710644 0.0725381C0.686564 0.0454728 0.656577 0.0250719 0.623317 0.0131537C0.590056 0.00123562 0.554539 -0.00185039 0.51989 0.0041707C0.48524 0.0101918 0.452517 0.0251566 0.424596 0.0477064C0.396675 0.0702562 0.374412 0.0997308 0.35976 0.133527L0.0530455 0.675974C0.0118838 0.751084 -0.00603723 0.83794 0.0017957 0.924388C0.00962862 1.01084 0.0428248 1.09253 0.0967223 1.15798L9.29066 10.9253C9.31471 10.9524 9.34466 10.9729 9.3779 10.9848C9.41113 10.9968 9.44663 10.9999 9.48128 10.9939C9.51592 10.988 9.54866 10.9731 9.5766 10.9506C9.60454 10.9281 9.62684 10.8987 9.64154 10.8649L9.94876 10.3225C9.98942 10.2466 10.0066 10.1592 9.99774 10.0725C9.98892 9.98585 9.9546 9.90428 9.89962 9.83939V9.83939ZM6.24587 9.96608H5.37089V9.2407C5.55256 9.20442 5.72927 9.14437 5.89697 9.06197L5.11331 8.23043C5.00768 8.24329 4.90109 8.24469 4.79518 8.23463C3.92269 8.11794 3.25219 7.18966 3.05814 6.04745L2.2452 5.18332V5.33048C2.2452 7.25536 3.24475 8.97209 4.62049 9.23281V9.96871H3.74551C3.67018 9.98084 3.60222 10.0234 3.55594 10.0875C3.50966 10.1517 3.48866 10.2323 3.49736 10.3125V10.6562C3.48879 10.7364 3.50983 10.817 3.55609 10.881C3.60235 10.9451 3.67023 10.9877 3.74551 11H6.24587C6.32115 10.9877 6.38903 10.9451 6.43529 10.881C6.48155 10.817 6.5026 10.7364 6.49402 10.6562V10.3125C6.50341 10.2319 6.48273 10.1506 6.43639 10.0859C6.39004 10.0212 6.32169 9.97821 6.24587 9.96608V9.96608Z" fill="white"/>
                                            </svg>
                                        </div>
                                        <h4>test Name</h4>
                                    </div> 
                                </div>*/}
                            </div> 
                            <div className="cl_main_meeting_box">
                                {/* {
                                    screenShared && (
                                        <div className="new_jitsi_component"> <JitsiComponent newRoomName={newRoomName} userName={userName} userRole={userRole}/> </div>
                                    )
                                } */}
                                <div className="cl_main_home_box">
                                    <div className="cl_main_home_box_video">
                                        <span className="local_video_mute_img Name_value d-none">{initialName}</span>
                                        <span className="local_video_mute_img1 Name_value d-none"><img src={userProfileImage} /></span>
                                    </div>
                                    <div className="cl_user_list_box_control">
                                        <div className="mute_icon">
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0)">
                                                <path d="M6.03011 12.0591H8.44211V2.41211H6.03011V12.0591ZM2.41211 12.0591H4.82411V7.23611H2.41211V12.0591ZM9.64711 5.42711V12.0591H12.0591V5.42711H9.64711Z" fill="#18DE74"/>
                                                <path d="M6.03011 4.82422H8.44211V14.4712H6.03011V4.82422ZM2.41211 4.82422H4.82411V9.64822H2.41211V4.82422ZM9.64711 11.4562V4.82422H12.0591V11.4562H9.64711Z" fill="#18DE74"/>
                                                </g>
                                                <defs>
                                                <clipPath id="clip0">
                                                <rect width="14.471" height="14.471" fill="white"/>
                                                </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <h4>{userName}</h4>
                                    </div>
                                    {/* {
                                        isSubtitle && (
                                        <div className="cl_main_noti_box d-none">
                                            {
                                                isAudioMuted === false && (
                                                    <h4 style={{ margin: '10px' }}> You: {subtitle}</h4>
                                                )
                                            }
                                            <h4>{subtitleDisplay.userName} : {subtitleDisplay.subtitle}</h4>
                                        </div>
                                        )
                                    } */}
                                    {
                                        isSubtitle && (
                                        <div className="cl_main_noti_box d-none">
                                            {
                                                captions && captions.map((singleCaption,i) => (
                                                    <h4 style={{ margin: '10px' }}>{singleCaption.username} : {singleCaption.captions}</h4>
                                                ))
                                            }
                                        </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        {/* Meeting Videos Body */}

                        {/* Bottom Meeting Menu */}
                        <div className="top_meeting_videos bottom_meeing_menu">
                            <div className="meeting_menu meeting_menu_bottom_left">
                                <ul>
                                    <li>
                                        <a href="#." onClick={deviceChanges}>
                                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.7653 16.0423C13.4134 16.0423 14.047 15.8501 14.5859 15.49C15.1248 15.1299 15.5448 14.6181 15.7928 14.0193C16.0409 13.4205 16.1058 12.7616 15.9793 12.126C15.8529 11.4903 15.5408 10.9064 15.0825 10.4481C14.6242 9.9898 14.0403 9.67769 13.4046 9.55125C12.7689 9.42481 12.11 9.4897 11.5112 9.73773C10.9124 9.98576 10.4006 10.4058 10.0406 10.9447C9.68047 11.4836 9.48828 12.1172 9.48828 12.7653C9.48828 13.6344 9.83354 14.4679 10.4481 15.0825C11.0626 15.697 11.8962 16.0423 12.7653 16.0423V16.0423Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M20.85 16.044C20.7042 16.3734 20.6606 16.7389 20.7248 17.0933C20.789 17.4477 20.958 17.7747 21.21 18.032L21.276 18.098C21.686 18.5079 21.9164 19.0639 21.9165 19.6436C21.9166 20.2234 21.6864 20.7795 21.2765 21.1895C20.8666 21.5995 20.3106 21.8299 19.7309 21.83C19.1511 21.8301 18.595 21.5999 18.185 21.19L18.119 21.124C17.8637 20.8758 17.541 20.7083 17.1912 20.6421C16.8413 20.576 16.4797 20.6142 16.1514 20.752C15.8231 20.8898 15.5426 21.1212 15.3448 21.4172C15.147 21.7133 15.0407 22.061 15.039 22.417V22.603C15.039 23.1825 14.8088 23.7383 14.399 24.148C13.9893 24.5578 13.4335 24.788 12.854 24.788C12.2745 24.788 11.7187 24.5578 11.309 24.148C10.8992 23.7383 10.669 23.1825 10.669 22.603V22.503C10.661 22.1412 10.5441 21.7903 10.3336 21.4959C10.1231 21.2016 9.82875 20.9776 9.489 20.853C9.15965 20.7072 8.79414 20.6636 8.43973 20.7278C8.08532 20.792 7.75832 20.961 7.501 21.213L7.435 21.279C7.23335 21.4878 6.99214 21.6544 6.72543 21.769C6.45873 21.8835 6.17187 21.9439 5.8816 21.9464C5.59133 21.9489 5.30346 21.8936 5.0348 21.7837C4.76613 21.6738 4.52205 21.5115 4.31679 21.3062C4.11153 21.101 3.94921 20.8569 3.83929 20.5882C3.72938 20.3195 3.67407 20.0317 3.67661 19.7414C3.67914 19.4511 3.73946 19.1643 3.85405 18.8976C3.96863 18.6309 4.13519 18.3896 4.344 18.188L4.41 18.122C4.65917 17.8668 4.82763 17.5439 4.89435 17.1935C4.96107 16.8432 4.92309 16.4809 4.78515 16.152C4.64721 15.8231 4.41543 15.5422 4.11875 15.3442C3.82207 15.1463 3.47365 15.0401 3.117 15.039H2.935C2.3555 15.039 1.79974 14.8088 1.38997 14.399C0.980205 13.9893 0.75 13.4335 0.75 12.854C0.75 12.2745 0.980205 11.7187 1.38997 11.309C1.79974 10.8992 2.3555 10.669 2.935 10.669H3.035C3.39677 10.661 3.74772 10.5441 4.04205 10.3336C4.33639 10.1231 4.56045 9.82875 4.685 9.489C4.83078 9.15965 4.87439 8.79414 4.81022 8.43973C4.74604 8.08532 4.57701 7.75832 4.325 7.501L4.257 7.436C3.84698 7.02611 3.61657 6.47012 3.61648 5.89035C3.61639 5.31058 3.84661 4.75452 4.2565 4.3445C4.66639 3.93448 5.22238 3.70407 5.80215 3.70398C6.38192 3.70389 6.93798 3.93411 7.348 4.344L7.414 4.41C7.67132 4.66201 7.99832 4.83104 8.35273 4.89522C8.70714 4.95939 9.07265 4.91578 9.402 4.77H9.489C9.81294 4.63164 10.0892 4.40128 10.2835 4.10745C10.4777 3.81363 10.5815 3.46925 10.582 3.117V2.935C10.582 2.3555 10.8122 1.79974 11.222 1.38997C11.6317 0.980205 12.1875 0.75 12.767 0.75C13.3465 0.75 13.9023 0.980205 14.312 1.38997C14.7218 1.79974 14.952 2.3555 14.952 2.935V3.035C14.9538 3.39111 15.0604 3.73882 15.2585 4.03477C15.4565 4.33073 15.7373 4.56183 16.0659 4.69928C16.3944 4.83672 16.7561 4.87443 17.1059 4.80769C17.4557 4.74096 17.7781 4.57274 18.033 4.324L18.099 4.258C18.3006 4.04919 18.5419 3.88263 18.8086 3.76805C19.0753 3.65346 19.3621 3.59314 19.6524 3.59061C19.9427 3.58807 20.2305 3.64338 20.4992 3.75329C20.7679 3.86321 21.012 4.02553 21.2172 4.23079C21.4225 4.43605 21.5848 4.68013 21.6947 4.9488C21.8046 5.21746 21.8599 5.50533 21.8574 5.7956C21.8549 6.08587 21.7945 6.37273 21.68 6.63943C21.5654 6.90614 21.3988 7.14735 21.19 7.349L21.124 7.415C20.872 7.67232 20.703 7.99932 20.6388 8.35373C20.5746 8.70814 20.6182 9.07365 20.764 9.403V9.49C20.9023 9.81329 21.1323 10.089 21.4255 10.283C21.7187 10.4771 22.0624 10.581 22.414 10.582H22.6C22.8908 10.5758 23.1799 10.6277 23.4504 10.7347C23.7209 10.8417 23.9673 11.0016 24.1752 11.205C24.383 11.4085 24.5482 11.6514 24.6609 11.9196C24.7737 12.1877 24.8317 12.4756 24.8317 12.7665C24.8317 13.0574 24.7737 13.3453 24.6609 13.6134C24.5482 13.8816 24.383 14.1245 24.1752 14.328C23.9673 14.5314 23.7209 14.6913 23.4504 14.7983C23.1799 14.9053 22.8908 14.9572 22.6 14.951H22.5C22.1485 14.9522 21.8051 15.0562 21.5121 15.2502C21.219 15.4443 20.9892 15.7199 20.851 16.043L20.85 16.044Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <div className="icon_name">Setting</div>
                                        </a>
                                    </li>
                                    <li className='d-none'>
                                        <a href="#." onClick={togglesecurity}>
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
                                            <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19.7631 3.746C19.1857 3.54517 18.6616 3.21577 18.2302 2.78268C17.7989 2.34959 17.4716 1.82413 17.2731 1.246C17.1511 0.883357 16.9185 0.568089 16.608 0.344572C16.2975 0.121054 15.9247 0.000542988 15.5421 0H5.45506C5.07295 0.000260087 4.70052 0.120189 4.39005 0.342947C4.07959 0.565705 3.84669 0.880104 3.72406 1.242C3.52555 1.82013 3.19825 2.34559 2.76689 2.77868C2.33553 3.21177 1.81139 3.54117 1.23406 3.742C0.872321 3.86692 0.558693 4.10182 0.337067 4.41382C0.115441 4.72582 -0.00309105 5.0993 -0.0019406 5.482V8.034C-0.00587358 11.205 0.916696 14.3081 2.65239 16.9619C4.38809 19.6158 6.86129 21.7047 9.76806 22.972C9.99889 23.0716 10.2477 23.123 10.4991 23.123C10.7505 23.123 10.9992 23.0716 11.2301 22.972C14.0099 21.7655 16.3949 19.8022 18.1131 17.306C19.9969 14.5814 21.0035 11.3464 20.9981 8.034V5.482C20.9984 5.09998 20.8795 4.72739 20.6579 4.41619C20.4363 4.10499 20.1232 3.8707 19.7621 3.746H19.7631ZM19.6441 8.034C19.649 11.0717 18.7258 14.0385 16.9981 16.537C15.4237 18.8244 13.2383 20.6234 10.6911 21.729C10.6304 21.7552 10.5651 21.7687 10.4991 21.7687C10.433 21.7687 10.3677 21.7552 10.3071 21.729C7.64285 20.5666 5.37623 18.6513 3.7857 16.2183C2.19517 13.7853 1.35001 10.9407 1.35406 8.034V5.482C1.35347 5.38216 1.3841 5.28464 1.44165 5.20306C1.4992 5.12149 1.58081 5.05993 1.67506 5.027C2.44793 4.75777 3.14949 4.31638 3.72672 3.7362C4.30396 3.15602 4.74176 2.45223 5.00706 1.678C5.03875 1.58418 5.09896 1.50261 5.17929 1.4447C5.25962 1.38678 5.35603 1.35542 5.45506 1.355H15.5421C15.6411 1.35542 15.7375 1.38678 15.8178 1.4447C15.8982 1.50261 15.9584 1.58418 15.9901 1.678C16.2554 2.45223 16.6932 3.15602 17.2704 3.7362C17.8476 4.31638 18.5492 4.75777 19.3221 5.027C19.4163 5.05993 19.4979 5.12149 19.5555 5.20306C19.613 5.28464 19.6436 5.38216 19.6431 5.482L19.6441 8.034Z" fill="white"/>
                                                <path d="M13.2567 8.81341H13.2127V6.96641C13.2127 6.24701 12.9269 5.55707 12.4182 5.04838C11.9095 4.53969 11.2196 4.25391 10.5002 4.25391C9.78078 4.25391 9.09085 4.53969 8.58215 5.04838C8.07346 5.55707 7.78769 6.24701 7.78769 6.96641V8.81341H7.74168C7.32758 8.81394 6.93059 8.97867 6.63777 9.27149C6.34495 9.56431 6.18022 9.9613 6.17969 10.3754V14.1074C6.18048 14.8788 6.48719 15.6183 7.03253 16.1639C7.57787 16.7094 8.31732 17.0163 9.08868 17.0174H11.9077C12.679 17.0163 13.4185 16.7094 13.9639 16.1639C14.5092 15.6183 14.8159 14.8788 14.8167 14.1074V10.3764C14.8164 9.96247 14.6521 9.56552 14.3597 9.27254C14.0673 8.97957 13.6706 8.81447 13.2567 8.81341ZM9.08469 6.96641C9.08469 6.59113 9.23377 6.23121 9.49913 5.96585C9.76449 5.70049 10.1244 5.55141 10.4997 5.55141C10.875 5.55141 11.2349 5.70049 11.5002 5.96585C11.7656 6.23121 11.9147 6.59113 11.9147 6.96641V8.81441H9.08469V6.96641ZM13.5217 14.1074C13.5212 14.5348 13.3512 14.9445 13.049 15.2467C12.7468 15.5489 12.337 15.7189 11.9097 15.7194H9.09068C8.66332 15.7189 8.25361 15.5489 7.95142 15.2467C7.64922 14.9445 7.47921 14.5348 7.47868 14.1074V10.3764C7.47868 10.3061 7.50661 10.2387 7.5563 10.189C7.606 10.1393 7.6734 10.1114 7.74368 10.1114H13.2567C13.327 10.1114 13.3944 10.1393 13.4441 10.189C13.4938 10.2387 13.5217 10.3061 13.5217 10.3764V14.1074Z" fill="white"/>
                                                <path d="M10.5006 11.8145C10.3284 11.8145 10.1634 11.8828 10.0417 12.0046C9.91995 12.1263 9.85156 12.2913 9.85156 12.4635V13.6895C9.85156 13.8618 9.92005 14.0272 10.0419 14.1491C10.1638 14.271 10.3292 14.3395 10.5016 14.3395C10.6739 14.3395 10.8393 14.271 10.9612 14.1491C11.0831 14.0272 11.1516 13.8618 11.1516 13.6895V12.4635C11.1516 12.3781 11.1347 12.2935 11.102 12.2146C11.0692 12.1358 11.0212 12.0641 10.9608 12.0038C10.9003 11.9436 10.8285 11.8958 10.7495 11.8633C10.6706 11.8308 10.586 11.8142 10.5006 11.8145Z" fill="white"/>
                                                </svg>
                                            <div className="icon_name">test</div>
                                        </a>
                                    </li>
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (

                                            <li>
                                                <a href="#." onClick={handleMuteAllParticipant}>
                                                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clipPath="url(#clip0)">
                                                        <path id="muteall_participants1" d="M20.7673 11.342L24.0554 14.63C24.119 14.6937 24.1548 14.78 24.1548 14.87C24.1548 14.96 24.119 15.0464 24.0554 15.11C23.9917 15.1737 23.9054 15.2094 23.8153 15.2094C23.7253 15.2094 23.639 15.1737 23.5753 15.11L20.2874 11.822L16.9994 15.11C16.9357 15.1737 16.8494 15.2094 16.7593 15.2094C16.6693 15.2094 16.583 15.1737 16.5193 15.11C16.4557 15.0464 16.4199 14.96 16.4199 14.87C16.4199 14.78 16.4557 14.6937 16.5193 14.63L19.8073 11.342L16.5193 8.05402C16.4878 8.0225 16.4628 7.98508 16.4458 7.9439C16.4287 7.90272 16.4199 7.85859 16.4199 7.81402C16.4199 7.76945 16.4287 7.72531 16.4458 7.68413C16.4628 7.64295 16.4878 7.60554 16.5193 7.57402C16.5509 7.5425 16.5883 7.5175 16.6295 7.50044C16.6706 7.48339 16.7148 7.47461 16.7593 7.47461C16.8039 7.47461 16.848 7.48339 16.8892 7.50044C16.9304 7.5175 16.9678 7.5425 16.9994 7.57402L20.2874 10.862L23.5733 7.57702C23.637 7.51337 23.7233 7.47761 23.8134 7.47761C23.9034 7.47761 23.9897 7.51337 24.0533 7.57702C24.117 7.64067 24.1528 7.727 24.1528 7.81702C24.1528 7.90703 24.117 7.99336 24.0533 8.05701L20.7673 11.342Z" fill="white" stroke="white" strokeWidth="0.6"/>
                                                        <path id="muteall_participants2" d="M2.90078 6.16238H5.10078L13.2748 0.413378C13.3594 0.353875 13.4587 0.318745 13.5619 0.311816C13.6651 0.304887 13.7683 0.326426 13.8601 0.374085C13.9519 0.421744 14.0289 0.493693 14.0826 0.582089C14.1363 0.670485 14.1648 0.771935 14.1648 0.875378V21.8074C14.1648 21.9108 14.1363 22.0123 14.0826 22.1007C14.0289 22.1891 13.9519 22.261 13.8601 22.3087C13.7683 22.3563 13.6651 22.3779 13.5619 22.3709C13.4587 22.364 13.3594 22.3289 13.2748 22.2694L5.10078 16.5214H2.90078C2.21122 16.5214 1.5499 16.2475 1.0623 15.7599C0.574709 15.2723 0.300781 14.6109 0.300781 13.9214L0.300781 8.76238C0.300781 8.07282 0.574709 7.4115 1.0623 6.9239C1.5499 6.43631 2.21122 6.16238 2.90078 6.16238V6.16238ZM0.978781 13.9214C0.979311 14.431 1.18198 14.9195 1.54231 15.2799C1.90264 15.6402 2.3912 15.8428 2.90078 15.8434H5.25478C5.31341 15.8434 5.37105 15.8586 5.42205 15.8875C5.47306 15.9164 5.51569 15.9581 5.54578 16.0084L13.4858 21.5894V1.09338L5.54678 6.67538C5.51669 6.7257 5.47406 6.76735 5.42305 6.79627C5.37205 6.82519 5.31441 6.84039 5.25578 6.84038H2.90078C2.3912 6.84091 1.90264 7.04357 1.54231 7.4039C1.18198 7.76423 0.979311 8.2528 0.978781 8.76238V13.9214Z" fill="white" stroke="white" strokeWidth="0.6"/>
                                                        </g>
                                                        <defs>
                                                        <clipPath id="clip0">
                                                        <rect width="24.488" height="22.683" fill="white"/>
                                                        </clipPath>
                                                        </defs>
                                                    </svg>
                                                    <div className="icon_name">MuteAll</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                    <li>
                                        <a href="#." onClick={() => whiteboardHandler(true)}>
                                            <svg width="25" height="21" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.3733 12.9473H18.2363V14.4293H22.3733V12.9473Z" fill="white" stroke="white" strokeWidth="0.4"/>
                                                <path d="M24.0592 20.2312V0.199219H0.199219V19.9902H1.23122V16.1322H23.0312V20.2322L24.0592 20.2312ZM1.22822 1.23122H23.0282V15.1512H1.22822V1.23122Z" fill="white" stroke="white" strokeWidth="0.4"/>
                                            </svg>
                                            <div className="icon_name">Whiteboard</div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#." onClick={meetingDocumentsHandler}>
                                            <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20.958 4.7H13.088L10.839 1.934C10.6051 1.64449 10.3098 1.41053 9.9745 1.24901C9.63918 1.08749 9.27218 1.00244 8.9 1H3.52C2.85163 1.00552 2.21235 1.27416 1.74066 1.74772C1.26898 2.22128 1.00287 2.86161 1 3.53L1 19.507C1.00392 20.1746 1.27052 20.8138 1.74213 21.2863C2.21373 21.7589 2.85241 22.0268 3.52 22.032H20.963C21.6317 22.0265 22.2713 21.7576 22.743 21.2836C23.2148 20.8096 23.4807 20.1687 23.483 19.5V7.2C23.4772 6.53442 23.2085 5.89813 22.7355 5.42982C22.2625 4.96152 21.6236 4.69918 20.958 4.7V4.7ZM2.043 19.5V3.53C2.04481 3.13791 2.20069 2.76224 2.47701 2.48406C2.75333 2.20587 3.12793 2.04746 3.52 2.043H8.9C9.11812 2.04565 9.33288 2.09705 9.52858 2.19342C9.72427 2.2898 9.89593 2.42871 10.031 2.6L11.736 4.7H6.186C5.5204 4.69918 4.88146 4.96152 4.40847 5.42982C3.93549 5.89813 3.66681 6.53442 3.661 7.2V20.989H3.52C3.12758 20.9845 2.75268 20.8258 2.47631 20.5472C2.19994 20.2686 2.04429 19.8924 2.043 19.5V19.5ZM22.434 19.5C22.4307 19.8914 22.2744 20.2661 21.9986 20.5439C21.7229 20.8217 21.3494 20.9808 20.958 20.987H4.7V7.2C4.70683 6.81105 4.86663 6.44046 5.14477 6.1685C5.42291 5.89653 5.797 5.7451 6.186 5.747H20.958C21.3457 5.74643 21.7179 5.89861 21.9942 6.17057C22.2705 6.44253 22.4285 6.81237 22.434 7.2V19.5Z" fill="white" stroke="white" strokeWidth="0.2"/>
                                                <path d="M14.3341 10.0772C14.2856 10.0245 14.2267 9.9825 14.1611 9.95375C14.0955 9.925 14.0247 9.91016 13.9531 9.91016C13.8815 9.91016 13.8106 9.925 13.7451 9.95375C13.6795 9.9825 13.6206 10.0245 13.5721 10.0772L10.5151 13.3592C10.4684 13.4092 10.432 13.4679 10.408 13.532C10.384 13.5961 10.3729 13.6642 10.3753 13.7326C10.3777 13.801 10.3936 13.8682 10.4221 13.9304C10.4505 13.9926 10.4909 14.0486 10.5411 14.0952C10.5905 14.1417 10.6488 14.178 10.7123 14.2019C10.7759 14.2258 10.8436 14.2369 10.9115 14.2345C10.9794 14.232 11.0461 14.2162 11.1078 14.1878C11.1695 14.1595 11.225 14.1191 11.2711 14.0692L13.4151 11.7582V17.4582C13.421 17.5926 13.4785 17.7195 13.5756 17.8125C13.6728 17.9055 13.8021 17.9574 13.9366 17.9574C14.0711 17.9574 14.2004 17.9055 14.2975 17.8125C14.3947 17.7195 14.4522 17.5926 14.4581 17.4582V11.7582L16.6181 14.0692C16.6678 14.1217 16.7276 14.1636 16.7939 14.1923C16.8603 14.221 16.9318 14.2359 17.0041 14.2362C17.1053 14.2357 17.2042 14.2058 17.2887 14.1501C17.3733 14.0943 17.4398 14.0152 17.4801 13.9224C17.5205 13.8296 17.533 13.727 17.5161 13.6272C17.4993 13.5274 17.4537 13.4346 17.3851 13.3602L14.3341 10.0772Z" fill="white" stroke="white" strokeWidth="0.2"/>
                                            </svg>
                                            <span id="count_badge" value="" className="count-badge">{meeetingDocumentCount}</span>
                                            <div className="icon_name">Documents</div>
                                        </a>
                                    </li>
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (
                                            <li>
                                                <a href="#." onClick={() => setIsSubtitle(!isSubtitle)}>
                                                <svg width="24" height="23" viewBox="0 0 443 461" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path id="subtitle_svg" d="M162.763 262.792H208.583C206.517 286.108 199.25 304.443 186.78 317.798C174.31 331.153 158.484 337.831 139.299 337.831C115.393 337.831 96.615 329.272 82.9648 312.154C69.3147 295.036 62.4896 271.72 62.4896 242.206C62.4896 213.577 69.3516 190.593 83.0755 173.254C96.799 155.914 113.991 147.245 134.651 147.245C156.491 147.245 173.609 153.664 186.005 166.503C198.401 179.341 205.558 197.566 207.477 221.177H162.542C161.804 211.733 159.184 204.428 154.684 199.263C150.183 194.098 144.169 191.516 136.643 191.516C128.232 191.516 121.702 195.98 117.053 204.908C112.405 213.836 110.081 226.932 110.081 244.198C110.081 251.281 110.45 257.479 111.188 262.792C111.925 268.104 113.253 273.232 115.172 278.176C117.09 283.119 120.042 286.919 124.026 289.576C128.01 292.232 132.88 293.56 138.635 293.56C152.655 293.56 160.697 283.304 162.763 262.792ZM320.367 262.792H365.966C363.9 286.108 356.669 304.443 344.273 317.798C331.878 331.153 316.088 337.831 296.904 337.831C272.997 337.831 254.219 329.272 240.569 312.154C226.919 295.036 220.094 271.72 220.094 242.206C220.094 213.577 226.956 190.593 240.68 173.254C254.404 155.914 271.595 147.245 292.255 147.245C314.095 147.245 331.214 153.664 343.609 166.503C356.005 179.341 363.162 197.566 365.081 221.177H319.924C319.334 211.733 316.752 204.428 312.177 199.263C307.602 194.098 301.626 191.516 294.247 191.516C285.836 191.516 279.306 195.98 274.658 204.908C270.009 213.836 267.685 226.932 267.685 244.198C267.685 251.281 268.054 257.479 268.792 262.792C269.53 268.104 270.858 273.232 272.776 278.176C274.694 283.119 277.609 286.919 281.52 289.576C285.43 292.232 290.263 293.56 296.018 293.56C303.249 293.56 308.894 290.756 312.952 285.148C317.01 279.541 319.482 272.089 320.367 262.792ZM399.833 236.451C399.833 205.904 398.69 183.252 396.402 168.495C394.115 153.738 389.651 141.859 383.01 132.857C382.125 131.676 381.129 130.643 380.022 129.758C378.915 128.872 377.329 127.766 375.263 126.438C373.197 125.109 372.017 124.298 371.721 124.003C359.03 114.706 307.602 110.057 217.438 110.057C125.207 110.057 72.8194 114.706 60.276 124.003C59.5382 124.593 58.247 125.441 56.4023 126.548C54.5577 127.655 53.0082 128.688 51.7539 129.647C50.4996 130.606 49.4297 131.676 48.5443 132.857C41.9036 141.711 37.4766 153.48 35.263 168.163C33.0495 182.846 31.9427 205.609 31.9427 236.451C31.9427 267.145 33.0495 289.834 35.263 304.517C37.4766 319.2 41.9036 331.043 48.5443 340.044C49.4297 341.225 50.5365 342.332 51.8646 343.365C53.1927 344.398 54.7053 345.431 56.4023 346.464C58.0994 347.497 59.3906 348.382 60.276 349.12C66.7691 353.99 84.4405 357.605 113.29 359.966C142.14 362.327 176.856 363.508 217.438 363.508C307.455 363.508 358.883 358.712 371.721 349.12C372.459 348.53 373.714 347.718 375.484 346.685C377.255 345.652 378.768 344.619 380.022 343.586C381.276 342.553 382.273 341.372 383.01 340.044C389.799 331.19 394.299 319.458 396.513 304.849C398.727 290.24 399.833 267.44 399.833 236.451ZM442.333 68V408H-11V68H442.333Z" fill="#FFFFFF"/>
                                                    <line x1="-12.9289" y1="7.92893" x2="433.071" y2="453.929" stroke="white" strokeWidth="20"/>
                                                </svg>      
                                                    <div className="icon_name">Captions</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                    <li className="icon">
                                        <a href="#." onClick={(videoQualityToggle)}>
                                            <svg viewBox="0 -73 512.00002 512" width="23" height="23" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="m484.570312 0h-457.140624c-15.148438 0-27.429688 12.28125-27.429688 27.429688v310.855468c0 15.148438 12.28125 27.429688 27.429688 27.429688h457.140624c15.148438 0 27.429688-12.28125 27.429688-27.429688v-310.855468c0-15.148438-12.28125-27.429688-27.429688-27.429688zm-393.140624 347.429688h-45.714844c-3.679688.003906-7.320313-.730469-10.707032-2.167969-1.632812-.691407-3.191406-1.542969-4.652343-2.542969-2.917969-1.972656-5.425781-4.488281-7.398438-7.40625-2.011719-2.964844-3.410156-6.304688-4.113281-9.816406-.375-1.808594-.5625-3.648438-.558594-5.496094v-45.714844c0-5.050781 4.09375-9.140625 9.144532-9.140625 5.046874 0 9.140624 4.089844 9.140624 9.140625v45.714844c-.003906.613281.058594 1.226562.183594 1.828125.117188.597656.292969 1.183594.53125 1.746094.226563.539062.507813 1.058593.832032 1.546875.328124.484375.699218.9375 1.113281 1.351562.421875.421875.882812.800782 1.371093 1.132813.492188.335937 1.011719.617187 1.554688.851562 1.128906.464844 2.339844.695313 3.558594.6875h45.714844c5.046874 0 9.140624 4.089844 9.140624 9.140625 0 5.050782-4.09375 9.144532-9.140624 9.144532zm0-310.859376h-45.714844c-.632813 0-1.265625.066407-1.882813.191407-.566406.117187-1.117187.289062-1.648437.515625-.542969.230468-1.066406.511718-1.5625.839844-.476563.324218-.921875.691406-1.335938 1.097656-.421875.414062-.800781.871094-1.132812 1.359375-.339844.503906-.632813 1.035156-.867188 1.59375-.230468.539062-.402344 1.097656-.523437 1.671875-.125.617187-.1875 1.246094-.191407 1.875v45.714844c0 5.046874-4.09375 9.140624-9.140624 9.140624-5.050782 0-9.144532-4.09375-9.144532-9.140624v-45.714844c0-1.871094.1875-3.738282.566406-5.570313.363282-1.753906.898438-3.464843 1.59375-5.117187.695313-1.636719 1.550782-3.203125 2.550782-4.671875 2.976562-4.394531 7.15625-7.835938 12.039062-9.910157 1.660156-.703124 3.382813-1.238281 5.148438-1.601562 1.820312-.371094 3.671875-.554688 5.53125-.558594h45.714844c5.046874 0 9.140624 4.09375 9.140624 9.144532 0 5.046874-4.09375 9.140624-9.140624 9.140624zm146.285156 182.859376h-18.285156v36.570312c0 5.050781-4.09375 9.144531-9.144532 9.144531-5.050781 0-9.140625-4.09375-9.140625-9.144531v-36.570312h-45.714843c-3.339844 0-6.414063-1.816407-8.019532-4.742188-1.605468-2.925781-1.492187-6.496094.300782-9.3125l64-100.570312c1.753906-2.757813 4.847656-4.367188 8.109374-4.226563 3.265626.140625 6.207032 2.011719 7.71875 4.910156 1.511719 2.894531 1.359376 6.378907-.394531 9.136719l-55.066406 86.519531h29.066406v-18.289062c0-5.046875 4.089844-9.140625 9.140625-9.140625 5.050782 0 9.144532 4.09375 9.144532 9.140625v18.289062h18.285156c5.050781 0 9.140625 4.089844 9.140625 9.140625 0 5.050782-4.089844 9.144532-9.140625 9.144532zm125.320312 30.105468c2.378906 2.296875 3.332032 5.695313 2.492188 8.890625-.835938 3.199219-3.332032 5.695313-6.527344 6.53125-3.199219.835938-6.597656-.117187-8.890625-2.492187l-57.539063-57.535156v51.070312c0 5.050781-4.09375 9.144531-9.140624 9.144531-5.050782 0-9.144532-4.09375-9.144532-9.144531v-146.285156c0-5.050782 4.09375-9.144532 9.144532-9.144532 5.046874 0 9.140624 4.09375 9.140624 9.144532v51.070312l57.539063-57.535156c3.585937-3.464844 9.289063-3.414062 12.816406.113281 3.523438 3.523438 3.574219 9.226563.109375 12.816407l-66.679687 66.675781zm130.679688 70.464844c.003906 1.871094-.191406 3.738281-.578125 5.566406-.355469 1.757813-.886719 3.472656-1.582031 5.121094-.695313 1.636719-1.550782 3.203125-2.550782 4.671875-2.976562 4.394531-7.15625 7.835937-12.039062 9.910156-1.660156.699219-3.382813 1.238281-5.148438 1.601563-1.820312.367187-3.671875.554687-5.53125.558594h-45.714844c-5.046874 0-9.140624-4.09375-9.140624-9.144532 0-5.050781 4.09375-9.140625 9.140624-9.140625h45.714844c.632813 0 1.265625-.066406 1.882813-.195312.566406-.113281 1.117187-.285157 1.648437-.511719.542969-.230469 1.066406-.511719 1.5625-.839844.476563-.324218.921875-.691406 1.335938-1.097656.421875-.414062.800781-.871094 1.132812-1.363281.339844-.5.632813-1.03125.867188-1.589844.230468-.539063.402344-1.097656.523437-1.671875.125-.617188.1875-1.246094.191407-1.875v-45.714844c0-5.050781 4.09375-9.140625 9.140624-9.140625 5.050782 0 9.144532 4.089844 9.144532 9.140625zm0-228.570312c0 5.046874-4.09375 9.140624-9.144532 9.140624-5.046874 0-9.140624-4.09375-9.140624-9.140624v-45.714844c.003906-.613282-.058594-1.226563-.183594-1.828125-.117188-.601563-.292969-1.183594-.53125-1.746094-.226563-.542969-.507813-1.058594-.832032-1.546875-.328124-.484375-.699218-.9375-1.113281-1.351562-.421875-.421876-.882812-.800782-1.371093-1.132813-.492188-.335937-1.011719-.621094-1.554688-.851563-1.128906-.464843-2.339844-.699218-3.558594-.6875h-45.714844c-5.046874 0-9.140624-4.09375-9.140624-9.140624 0-5.050782 4.09375-9.144532 9.140624-9.144532h45.714844c3.679688-.007812 7.320313.730469 10.707032 2.167969 1.632812.691406 3.191406 1.542969 4.652343 2.542969 2.917969 1.972656 5.425781 4.484375 7.398438 7.402344 2.011719 2.96875 3.410156 6.308593 4.113281 9.820312.375 1.808594.5625 3.648438.558594 5.496094zm0 0"/></svg>
                                            <div className="icon_name">Video Quality</div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="meeting_menu meeting_menu_center">
                                <ul>
                                    <li>
                                        <a href="#." onClick={muteHandler}>
                                            
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="44" height="44" fill=""/>
                                                <circle className="circle_background" cx="22" cy="22" r="22" fill="#464958"/>
                                                <path  id="local_audio"  d="M22.5004 25.125C23.5853 25.125 24.6258 24.6904 25.393 23.9168C26.1601 23.1432 26.5911 22.094 26.5911 21V14.125C26.5911 13.031 26.1601 11.9818 25.393 11.2082C24.6258 10.4346 23.5853 10 22.5004 10C21.4155 10 20.375 10.4346 19.6078 11.2082C18.8407 11.9818 18.4097 13.031 18.4097 14.125V21C18.4097 22.094 18.8407 23.1432 19.6078 23.9168C20.375 24.6904 21.4155 25.125 22.5004 25.125V25.125ZM29.3182 18.25H28.6364C28.4556 18.25 28.2822 18.3224 28.1543 18.4514C28.0265 18.5803 27.9547 18.7552 27.9547 18.9375V21C27.9538 21.7684 27.7935 22.5282 27.484 23.2304C27.1744 23.9325 26.7226 24.5616 26.1575 25.0771C25.5924 25.5927 24.9265 25.9832 24.2027 26.2236C23.479 26.464 22.7133 26.549 21.955 26.4731C20.5821 26.2968 19.322 25.6158 18.4162 24.5606C17.5103 23.5055 17.0225 22.1503 17.0461 20.7549V18.9375C17.0461 18.7552 16.9743 18.5803 16.8464 18.4514C16.7186 18.3224 16.5452 18.25 16.3644 18.25H15.6826C15.5018 18.25 15.3283 18.3224 15.2005 18.4514C15.0726 18.5803 15.0008 18.7552 15.0008 18.9375V20.6633C14.9743 22.5311 15.6136 24.3465 16.8022 25.7792C17.9909 27.2119 19.6501 28.1668 21.478 28.4702V29.9369H19.0915C19.0019 29.9369 18.9132 29.9547 18.8304 29.9893C18.7477 30.0239 18.6725 30.0746 18.6092 30.1385C18.5459 30.2024 18.4957 30.2782 18.4614 30.3617C18.4272 30.4452 18.4096 30.5347 18.4097 30.625V31.3125C18.4097 31.4948 18.4815 31.6697 18.6094 31.7986C18.7373 31.9276 18.9107 32 19.0915 32H25.9093C26.0901 32 26.2635 31.9276 26.3914 31.7986C26.5193 31.6697 26.5911 31.4948 26.5911 31.3125V30.625C26.5911 30.4427 26.5193 30.2678 26.3914 30.1389C26.2635 30.0099 26.0901 29.9375 25.9093 29.9375H23.5234V28.4867C25.3168 28.2362 26.9599 27.3405 28.1501 25.9647C29.3403 24.5889 29.9973 22.8257 30 21V18.9375C30 18.7552 29.9282 18.5803 29.8003 18.4514C29.6725 18.3224 29.499 18.25 29.3182 18.25Z" fill="white"/>
                                                <path className="line d-none "d="M31 34L23.5 25.375L11 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                            <div className="icon_name">Microphone</div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#." onClick={onVideoMuteStateChanged}>
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path id="local_video" className="active_svg" d="M22 0C26.3512 0 30.6047 1.29028 34.2225 3.70767C37.8404 6.12506 40.6602 9.56099 42.3253 13.581C43.9905 17.6009 44.4261 22.0244 43.5773 26.292C42.7284 30.5596 40.6331 34.4796 37.5564 37.5564C34.4796 40.6331 30.5596 42.7284 26.292 43.5773C22.0244 44.4261 17.6009 43.9905 13.581 42.3253C9.56099 40.6602 6.12506 37.8404 3.70767 34.2225C1.29028 30.6047 0 26.3512 0 22C0 16.1652 2.31785 10.5695 6.44365 6.44365C10.5695 2.31785 16.1652 0 22 0V0Z" fill="#287BD7"/>
                                                <path className="line1 d-none "d="M31 34L23.5 25.375L11 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                <path className="normal_svg" d="M14.143 28.5881C13.5806 28.594 13.039 28.3763 12.6371 27.9828C12.2352 27.5894 12.0061 27.0525 12 26.4901V18.1001C12.0027 17.8215 12.0604 17.5461 12.1696 17.2898C12.2788 17.0334 12.4374 16.8011 12.6364 16.6061C12.8354 16.4111 13.0709 16.2572 13.3294 16.1532C13.5879 16.0492 13.8644 15.9972 14.143 16.0001H24.143C24.4216 15.9972 24.6981 16.0492 24.9566 16.1532C25.2151 16.2572 25.4506 16.4111 25.6496 16.6061C25.8486 16.8011 26.0072 17.0334 26.1164 17.2898C26.2256 17.5461 26.2833 17.8215 26.286 18.1001V19.7641L30.967 17.4721C31.0768 17.4177 31.1985 17.392 31.3209 17.3972C31.4432 17.4025 31.5623 17.4385 31.667 17.5021C31.7695 17.5645 31.854 17.6524 31.9123 17.7572C31.9707 17.862 32.0009 17.9802 32 18.1001V26.4901C32.0011 26.6 31.9753 26.7084 31.925 26.8061C31.8378 26.9731 31.6888 27.0993 31.5098 27.1578C31.3307 27.2163 31.1359 27.2024 30.967 27.1191L26.286 24.8191V26.4901C26.2834 26.7688 26.2259 27.0442 26.1167 27.3006C26.0076 27.557 25.8489 27.7894 25.6499 27.9844C25.4509 28.1795 25.2153 28.3334 24.9567 28.4373C24.6982 28.5412 24.4217 28.5932 24.143 28.5901L14.143 28.5881Z" fill="#fff"/>
                                            </svg>
                                            <div className="icon_name">Camera</div>
                                        </a>
                                    </li>
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (
                                            <li>
                                                <a href="#." onClick={switchVideohandler}>
                                                    <svg width="48" height="44" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path id="switch_video" className="active_svg" d="M25.5527 44C37.703 44 47.5527 34.1503 47.5527 22C47.5527 9.84974 37.703 0 25.5527 0C13.4025 0 3.55273 9.84974 3.55273 22C3.55273 34.1503 13.4025 44 25.5527 44Z" fill="#464958"/>
                                                        <path className="normal_svg" d="M27.5527 15H16.5527C15.4482 15 14.5527 15.8954 14.5527 17V23C14.5527 24.1046 15.4482 25 16.5527 25H27.5527C28.6573 25 29.5527 24.1046 29.5527 23V17C29.5527 15.8954 28.6573 15 27.5527 15Z" fill="white"/>
                                                        <path className="normal_svg" d="M27.5527 15.5H16.5527C15.7243 15.5 15.0527 16.1716 15.0527 17V23C15.0527 23.8284 15.7243 24.5 16.5527 24.5H27.5527C28.3812 24.5 29.0527 23.8284 29.0527 23V17C29.0527 16.1716 28.3812 15.5 27.5527 15.5Z" stroke="#424649"/>
                                                        <path className="normal_svg" d="M35.5527 21H25.5527C24.4482 21 23.5527 21.8954 23.5527 23V28C23.5527 29.1046 24.4482 30 25.5527 30H35.5527C36.6573 30 37.5527 29.1046 37.5527 28V23C37.5527 21.8954 36.6573 21 35.5527 21Z" fill="white"/>
                                                        <path className="normal_svg" d="M35.5527 21.5H25.5527C24.7243 21.5 24.0527 22.1716 24.0527 23V28C24.0527 28.8284 24.7243 29.5 25.5527 29.5H35.5527C36.3812 29.5 37.0527 28.8284 37.0527 28V23C37.0527 22.1716 36.3812 21.5 35.5527 21.5Z" stroke="#424649"/>
                                                        <path className="normal_svg" d="M35.5527 32L28.8027 24.125L17.5527 11" stroke="white" strokeWidth="2"/>
                                                        <path className="normal_svg" d="M34.4607 33.343L27.3697 25.152L15.5527 11.5" stroke="#424649" strokeWidth="2"/>
                                                    </svg>
                                                    <div className="icon_name">Screen Share</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (

                                            <li>
                                                <a href="#." onClick={clickrecoding}>
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path id="recording_svg" className="active_svg"  d="M22 0C26.3512 0 30.6047 1.29028 34.2225 3.70767C37.8404 6.12506 40.6602 9.56099 42.3253 13.581C43.9905 17.6009 44.4261 22.0244 43.5773 26.292C42.7284 30.5596 40.6331 34.4796 37.5564 37.5564C34.4796 40.6331 30.5596 42.7284 26.292 43.5773C22.0244 44.4261 17.6009 43.9905 13.581 42.3253C9.56099 40.6602 6.12506 37.8404 3.70767 34.2225C1.29028 30.6047 0 26.3512 0 22C0 16.1652 2.31785 10.5695 6.44365 6.44365C10.5695 2.31785 16.1652 0 22 0V0Z" fill="#464958"/>
                                                        <path className="normal_svg" d="M22 26.3281C22.7911 26.3281 23.5645 26.0935 24.2223 25.654C24.8801 25.2145 25.3928 24.5898 25.6955 23.8589C25.9983 23.128 26.0775 22.3237 25.9231 21.5478C25.7688 20.7718 25.3878 20.0591 24.8284 19.4997C24.269 18.9403 23.5563 18.5593 22.7804 18.405C22.0044 18.2506 21.2002 18.3299 20.4693 18.6326C19.7384 18.9354 19.1136 19.4481 18.6741 20.1058C18.2346 20.7636 18 21.537 18 22.3281C18 23.389 18.4214 24.4064 19.1716 25.1566C19.9217 25.9067 20.9391 26.3281 22 26.3281Z" fill="white"/>
                                                        <path className="normal_svg" fillRule="evenodd" clipRule="evenodd" d="M32 22.3281C32 24.3059 31.4135 26.2393 30.3147 27.8838C29.2159 29.5283 27.6541 30.81 25.8268 31.5669C23.9996 32.3238 21.9889 32.5218 20.0491 32.136C18.1093 31.7501 16.3275 30.7977 14.9289 29.3992C13.5304 28.0007 12.578 26.2188 12.1922 24.279C11.8063 22.3392 12.0043 20.3286 12.7612 18.5013C13.5181 16.674 14.7998 15.1122 16.4443 14.0134C18.0888 12.9146 20.0222 12.3281 22 12.3281C23.3132 12.3281 24.6136 12.5868 25.8268 13.0893C27.0401 13.5919 28.1425 14.3285 29.0711 15.2571C29.9997 16.1856 30.7363 17.288 31.2388 18.5013C31.7413 19.7145 32 21.0149 32 22.3281V22.3281ZM30 22.3281C30 23.9104 29.5308 25.4571 28.6518 26.7727C27.7727 28.0883 26.5233 29.1137 25.0615 29.7192C23.5997 30.3247 21.9911 30.4831 20.4393 30.1744C18.8874 29.8657 17.462 29.1038 16.3432 27.985C15.2243 26.8662 14.4624 25.4407 14.1537 23.8888C13.845 22.337 14.0035 20.7285 14.609 19.2667C15.2145 17.8048 16.2398 16.5554 17.5554 15.6764C18.871 14.7973 20.4178 14.3281 22 14.3281C24.1217 14.3281 26.1566 15.171 27.6569 16.6713C29.1572 18.1716 30 20.2064 30 22.3281Z" fill="white"/>
                                                        <path className="normal_svg" d="M32 31.8281L25.25 23.9531L14 10.8281" stroke="white" strokeWidth="2"/>
                                                        <path className="normal_svg" d="M30.908 33.1711L23.817 24.9801L12 11.3281" stroke="#424649" strokeWidth="2"/>
                                                    </svg>
                                                    <div className="icon_name">Recording</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                            <div className="meeting_menu meeting_menu_bottom_right">
                                <ul>
                                    {
                                        localStorage.getItem('user_role') === "Teacher" && (
                                            <li>
                                                <a href="#." onClick={meetingParticipants}>
                                                    <svg width="27" height="23" viewBox="0 0 27 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5.37891 19.68V19.159C5.37891 19.201 5.38491 19.183 5.39091 18.788C5.48091 13.968 6.16791 12.573 11.0669 11.693C11.3653 11.999 11.7266 12.2367 12.1257 12.3896C12.5248 12.5426 12.9524 12.6072 13.3789 12.579C13.807 12.6083 14.2364 12.5442 14.6373 12.3912C15.0382 12.2382 15.4011 12 15.7009 11.693C20.6519 12.585 21.3009 13.993 21.3769 18.949C21.372 19.0629 21.3767 19.1769 21.3909 19.29V19.679C21.3909 19.679 20.2149 22.057 13.3789 22.057C6.54291 22.057 5.37891 19.68 5.37891 19.68ZM9.14491 6.149C9.14491 3.305 9.76791 1 13.3789 1C16.9899 1 17.6169 3.305 17.6169 6.149C17.6169 8.993 15.7249 11.3 13.3789 11.3C11.0329 11.3 9.14491 8.993 9.14491 6.149Z" stroke="white" strokeWidth="1.2"/>
                                                        <path d="M1 17.1921V16.8801C1 16.9041 1 16.8621 1.006 16.6051C1.065 12.6001 1.545 11.4561 5.184 10.7311C5.39462 10.9734 5.65802 11.1643 5.95395 11.2889C6.24987 11.4136 6.57044 11.4687 6.891 11.4501H7.034C6.24325 11.8181 5.56671 12.393 5.076 13.1141C4.195 14.4371 3.992 16.2211 3.951 18.8321C1.5 18.3051 1 17.1921 1 17.1921ZM4.059 6.19206C4.059 3.88206 4.568 2.01406 7.5 2.01406C7.93431 2.0087 8.36752 2.05911 8.789 2.16406C8.21231 3.40874 7.94702 4.77501 8.016 6.14506C8.00662 7.47624 8.37411 8.78291 9.076 9.91406C8.60486 10.2141 8.05855 10.3749 7.5 10.3781C5.6 10.3781 4.059 8.50406 4.059 6.19306V6.19206Z" stroke="white" strokeWidth="1.2"/>
                                                        <path d="M26.0762 17.192V16.88C26.0762 16.904 26.0762 16.862 26.0702 16.605C26.0122 12.6 25.5312 11.456 21.8922 10.732C21.6815 10.9744 21.4182 11.1653 21.1222 11.2899C20.8263 11.4145 20.5057 11.4697 20.1852 11.451H20.0422C20.8328 11.8187 21.5093 12.3933 22.0002 13.114C22.8762 14.437 23.0842 16.222 23.1252 18.832C25.5762 18.305 26.0762 17.192 26.0762 17.192ZM23.0172 6.19203C23.0172 3.88103 22.5072 2.01303 19.5742 2.01303C19.1405 2.00785 18.708 2.05826 18.2872 2.16303C18.8639 3.40771 19.1292 4.77398 19.0602 6.14403C19.0703 7.47657 18.7028 8.78473 18.0002 9.91703C18.4716 10.216 19.0179 10.3758 19.5762 10.378C21.4762 10.378 23.0172 8.50403 23.0172 6.19303V6.19203Z" stroke="white" strokeWidth="1.2"/>
                                                    </svg>
                                                    <span id="count_badge" value="" className="count-badge" style={{background:'gray'}}>{userColLength}</span>
                                                    <div className="icon_name">Participants</div>
                                                </a>
                                            </li>
                                        )
                                    }
                                    <li>
                                        <a href="#." onClick={(e) => {e.preventDefault();chatHandler();}}>
                                            <span className="circle"></span>
                                            <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0 14.62C0.000136377 14.7468 0.0351783 14.8712 0.101287 14.9794C0.167395 15.0877 0.26202 15.1756 0.374794 15.2337C0.487568 15.2917 0.614141 15.3176 0.740647 15.3085C0.867152 15.2994 0.988709 15.2556 1.092 15.182L4.892 12.472C5.20844 12.2456 5.58793 12.1243 5.977 12.125H14.332C15.0393 12.1245 15.7174 11.8433 16.2176 11.3433C16.7178 10.8433 16.9992 10.1653 17 9.458V0.691002C17 0.507737 16.9272 0.331978 16.7976 0.202391C16.668 0.072803 16.4923 0 16.309 0H2.667C1.95991 0.000794036 1.28201 0.282037 0.782023 0.782024C0.282036 1.28201 0.000794036 1.95991 0 2.667L0 14.62ZM1.382 2.667C1.38253 2.32636 1.51808 1.99982 1.75895 1.75895C1.99982 1.51808 2.32636 1.38253 2.667 1.382H15.616V9.458C15.6155 9.79864 15.4799 10.1252 15.239 10.366C14.9982 10.6069 14.6716 10.7425 14.331 10.743H5.976C5.29939 10.7405 4.63904 10.9504 4.088 11.343L1.382 13.274V2.667Z" fill="white"/>
                                                <path d="M23.583 8.02637C23.5822 7.31928 23.301 6.64138 22.801 6.14139C22.301 5.6414 21.6231 5.36017 20.916 5.35938H19.07C18.8867 5.35938 18.711 5.43218 18.5814 5.56177C18.4518 5.69136 18.379 5.8671 18.379 6.05037C18.379 6.23363 18.4518 6.4094 18.5814 6.53899C18.711 6.66857 18.8867 6.74138 19.07 6.74138H20.915C21.2558 6.74191 21.5825 6.8776 21.8234 7.11868C22.0643 7.35977 22.1997 7.68656 22.2 8.02737V18.6384L19.494 16.7074C18.943 16.3147 18.2826 16.1048 17.606 16.1074H9.25099C8.91018 16.1068 8.58349 15.9712 8.34259 15.7301C8.10169 15.489 7.96625 15.1622 7.96599 14.8214V14.1934C7.96599 14.0101 7.89318 13.8343 7.7636 13.7048C7.63401 13.5752 7.45826 13.5024 7.27499 13.5024C7.09173 13.5024 6.91596 13.5752 6.78638 13.7048C6.65679 13.8343 6.58398 14.0101 6.58398 14.1934V14.8124C6.58478 15.5195 6.86603 16.1974 7.36601 16.6973C7.866 17.1973 8.5439 17.4786 9.25099 17.4794H17.606C17.9951 17.4786 18.3746 17.6 18.691 17.8264L22.491 20.5364C22.5944 20.6096 22.7159 20.653 22.8422 20.662C22.9686 20.6709 23.095 20.645 23.2077 20.587C23.3203 20.529 23.4149 20.4412 23.4811 20.3332C23.5472 20.2252 23.5825 20.1011 23.583 19.9744V8.02637V8.02637Z" fill="white"/>
                                                <path d="M4.96835 5.14568H12.9513C13.1346 5.14568 13.3104 5.07287 13.44 4.94328C13.5695 4.8137 13.6423 4.63794 13.6423 4.45467C13.6423 4.27141 13.5695 4.09565 13.44 3.96606C13.3104 3.83648 13.1346 3.76367 12.9513 3.76367H4.96835C4.78508 3.76367 4.60932 3.83648 4.47974 3.96606C4.35015 4.09565 4.27734 4.27141 4.27734 4.45467C4.27734 4.63794 4.35015 4.8137 4.47974 4.94328C4.60932 5.07287 4.78508 5.14568 4.96835 5.14568Z" fill="white"/>
                                                <path d="M4.96835 8.37027H12.9513C13.1346 8.37027 13.3104 8.29748 13.44 8.16789C13.5695 8.0383 13.6423 7.86254 13.6423 7.67928C13.6423 7.49601 13.5695 7.32025 13.44 7.19066C13.3104 7.06107 13.1346 6.98828 12.9513 6.98828H4.96835C4.78508 6.98828 4.60932 7.06107 4.47974 7.19066C4.35015 7.32025 4.27734 7.49601 4.27734 7.67928C4.27734 7.86254 4.35015 8.0383 4.47974 8.16789C4.60932 8.29748 4.78508 8.37027 4.96835 8.37027Z" fill="white"/>
                                            </svg>
                                            <span id="count_badge" value="" className="count-badge">{chatUnreadMessageCount}</span>
                                            <div className="icon_name">Live Chat</div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#." >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.9139 18.0478C12.9139 18.2283 12.8603 18.4049 12.76 18.555C12.6597 18.7051 12.5171 18.8222 12.3503 18.8913C12.1835 18.9604 11.9999 18.9785 11.8228 18.9432C11.6457 18.908 11.483 18.821 11.3553 18.6934C11.2276 18.5657 11.1407 18.403 11.1054 18.2259C11.0702 18.0488 11.0883 17.8652 11.1574 17.6984C11.2265 17.5315 11.3435 17.389 11.4937 17.2886C11.6438 17.1883 11.8203 17.1348 12.0009 17.1348C12.243 17.1348 12.4753 17.231 12.6465 17.4022C12.8177 17.5734 12.9139 17.8056 12.9139 18.0478Z" fill="white"/>
                                                <path d="M12 24C9.62663 24 7.30655 23.2962 5.33316 21.9776C3.35977 20.6591 1.8217 18.7849 0.913451 16.5922C0.00519943 14.3995 -0.232441 11.9867 0.230582 9.65892C0.693605 7.33115 1.83649 5.19295 3.51472 3.51472C5.19295 1.83649 7.33115 0.693605 9.65892 0.230582C11.9867 -0.232441 14.3995 0.00519943 16.5922 0.913451C18.7849 1.8217 20.6591 3.35977 21.9776 5.33316C23.2962 7.30655 24 9.62663 24 12C23.9966 15.1815 22.7312 18.2318 20.4815 20.4815C18.2318 22.7312 15.1815 23.9966 12 24V24ZM12 1.50001C9.9233 1.50001 7.89323 2.11582 6.16652 3.26957C4.4398 4.42333 3.09399 6.06321 2.29927 7.98183C1.50455 9.90045 1.29662 12.0117 1.70176 14.0485C2.1069 16.0853 3.10693 17.9562 4.57538 19.4246C6.04384 20.8931 7.91476 21.8931 9.95156 22.2983C11.9884 22.7034 14.0996 22.4955 16.0182 21.7007C17.9368 20.906 19.5767 19.5602 20.7304 17.8335C21.8842 16.1068 22.5 14.0767 22.5 12C22.4968 9.21621 21.3896 6.54734 19.4211 4.57889C17.4527 2.61045 14.7838 1.50318 12 1.50001V1.50001Z" fill="white"/>
                                                <path d="M11.9992 14.1018C11.8175 14.1018 11.6433 14.0296 11.5148 13.9011C11.3864 13.7727 11.3142 13.5984 11.3142 13.4168V12.4938C11.315 12.0686 11.4472 11.6542 11.6929 11.3072C11.9385 10.9602 12.2855 10.6977 12.6862 10.5558C13.1843 10.3686 13.6196 10.045 13.9423 9.62193C14.2651 9.19891 14.4622 8.69357 14.5112 8.16375C14.5112 7.49753 14.2465 6.85859 13.7754 6.3875C13.3043 5.91641 12.6654 5.65176 11.9992 5.65176C11.333 5.65176 10.694 5.91641 10.2229 6.3875C9.75184 6.85859 9.48718 7.49753 9.48718 8.16375C9.48718 8.34542 9.41502 8.51966 9.28656 8.64812C9.1581 8.77659 8.98386 8.84875 8.80219 8.84875C8.62051 8.84875 8.44629 8.77659 8.31783 8.64812C8.18936 8.51966 8.11719 8.34542 8.11719 8.16375C8.11719 7.13405 8.52624 6.14652 9.25435 5.41841C9.98246 4.6903 10.97 4.28125 11.9997 4.28125C13.0294 4.28125 14.0169 4.6903 14.745 5.41841C15.4731 6.14652 15.8822 7.13405 15.8822 8.16375C15.8323 8.97749 15.5467 9.75912 15.0601 10.4133C14.5736 11.0675 13.9072 11.5659 13.1422 11.8478C13.0082 11.8948 12.8921 11.9824 12.8101 12.0983C12.728 12.2142 12.684 12.3527 12.6842 12.4948V13.4168C12.6842 13.5984 12.612 13.7727 12.4836 13.9011C12.3551 14.0296 12.1809 14.1018 11.9992 14.1018Z" fill="white"/>
                                                </svg>
                                            <div className="icon_name">Meeting Info</div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#." onClick={unload}>
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44Z" fill="#FF3D3D"/>
                                                <path d="M16.8929 24.488C16.8416 24.5393 16.801 24.6001 16.7732 24.6671C16.7455 24.7341 16.7312 24.806 16.7312 24.8785C16.7312 25.0249 16.7894 25.1654 16.8929 25.269C16.9965 25.3725 17.137 25.4307 17.2834 25.4307C17.4299 25.4307 17.5704 25.3725 17.6739 25.269L20.9879 21.955C21.0391 21.9034 21.0795 21.8422 21.1069 21.775C21.1193 21.7363 21.1274 21.6964 21.1309 21.656C21.14 21.6259 21.1464 21.5952 21.1499 21.564C21.1465 21.5239 21.1384 21.4843 21.1259 21.446C21.1224 21.4151 21.116 21.3847 21.1069 21.355C21.0781 21.2863 21.0364 21.2238 20.9839 21.171L17.6739 17.861C17.5704 17.7574 17.4299 17.6992 17.2834 17.6992C17.137 17.6992 16.9965 17.7574 16.8929 17.861C16.7894 17.9645 16.7312 18.105 16.7312 18.2515C16.7312 18.3979 16.7894 18.5384 16.8929 18.642L19.2619 21.012H9.55193C9.41416 21.0237 9.28581 21.0868 9.19229 21.1886C9.09877 21.2905 9.04688 21.4237 9.04688 21.562C9.04688 21.7003 9.09877 21.8335 9.19229 21.9353C9.28581 22.0372 9.41416 22.1002 9.55193 22.112H19.2669L16.8929 24.488Z" fill="white" stroke="white" strokeWidth="0.5"/>
                                                <path d="M28.907 11C28.8333 11.0036 28.7598 11.0113 28.687 11.023C28.6514 11.0109 28.6144 11.0032 28.577 11L16.945 11C16.2925 11.0113 15.6711 11.2808 15.217 11.7494C14.7628 12.218 14.5129 12.8475 14.522 13.5V18.5C14.519 18.5655 14.5293 18.6309 14.5523 18.6923C14.5754 18.7536 14.6106 18.8097 14.6558 18.8571C14.7011 18.9045 14.7555 18.9422 14.8158 18.968C14.8761 18.9937 14.9409 19.007 15.0065 19.007C15.072 19.007 15.1369 18.9937 15.1972 18.968C15.2574 18.9422 15.3118 18.9045 15.3571 18.8571C15.4024 18.8097 15.4376 18.7536 15.4606 18.6923C15.4836 18.6309 15.494 18.5655 15.491 18.5V13.5C15.4854 13.1084 15.6353 12.7306 15.9079 12.4494C16.1804 12.1682 16.5534 12.0066 16.945 12H26.215L22.575 13.609C22.1941 13.7816 21.8714 14.061 21.6462 14.4134C21.4209 14.7657 21.3028 15.1758 21.306 15.594V31H16.944C16.6692 30.9871 16.4 30.9177 16.1533 30.796C15.9065 30.6744 15.6875 30.5031 15.51 30.293L15.49 24.493C15.4919 24.3624 15.4418 24.2364 15.3509 24.1427C15.26 24.0489 15.1356 23.9951 15.005 23.993V23.993C14.8748 23.9956 14.7509 24.0497 14.6604 24.1434C14.5699 24.2371 14.5201 24.3628 14.522 24.493L14.544 30.32C14.5432 30.451 14.5694 30.5808 14.621 30.7013C14.6726 30.8217 14.7485 30.9302 14.844 31.02C15.1105 31.3151 15.4339 31.5532 15.7948 31.72C16.1557 31.8869 16.5466 31.9791 16.944 31.991H21.306V32.832C21.3009 33.1118 21.3511 33.3899 21.4536 33.6503C21.5561 33.9107 21.7089 34.1484 21.9032 34.3497C22.0976 34.5511 22.3297 34.7121 22.5864 34.8237C22.843 34.9353 23.1192 34.9952 23.399 35C23.6828 35.0004 23.9635 34.9411 24.223 34.826L29.73 32.391C30.1109 32.2184 30.4335 31.939 30.6588 31.5866C30.884 31.2343 31.0022 30.8242 30.999 30.406V13.159C31.0067 12.5956 30.791 12.0521 30.3989 11.6474C30.0068 11.2428 29.4703 11.01 28.907 11V11ZM30.03 30.406C30.0319 30.6304 29.9685 30.8505 29.8476 31.0396C29.7267 31.2287 29.5535 31.3786 29.349 31.471L23.842 33.906C23.703 33.9685 23.5523 34.0006 23.4 34C23.0975 33.9947 22.8095 33.8698 22.599 33.6525C22.3885 33.4353 22.2727 33.1435 22.277 32.841V15.594C22.2751 15.3696 22.3384 15.1495 22.4593 14.9604C22.5802 14.7713 22.7535 14.6214 22.958 14.529L28.465 12.094C28.6039 12.0315 28.7546 11.9994 28.907 12C29.2094 12.0053 29.4975 12.1302 29.708 12.3475C29.9185 12.5647 30.0343 12.8565 30.03 13.159V30.406Z" fill="white" stroke="white" strokeWidth="0.5"/>
                                                <path d="M23.4817 21.8359C23.3354 21.8362 23.1952 21.8944 23.0917 21.9979C22.9882 22.1014 22.93 22.2416 22.9297 22.3879V24.5969C22.9232 24.6731 22.9326 24.7498 22.9573 24.8221C22.982 24.8945 23.0215 24.9609 23.0732 25.0172C23.1249 25.0735 23.1877 25.1185 23.2577 25.1492C23.3277 25.18 23.4033 25.1959 23.4797 25.1959C23.5562 25.1959 23.6318 25.18 23.7018 25.1492C23.7718 25.1185 23.8346 25.0735 23.8863 25.0172C23.938 24.9609 23.9775 24.8945 24.0022 24.8221C24.0268 24.7498 24.0362 24.6731 24.0297 24.5969V22.3879C24.0297 22.2422 23.9721 22.1024 23.8695 21.999C23.7668 21.8956 23.6274 21.837 23.4817 21.8359V21.8359Z" fill="white" stroke="white" strokeWidth="0.5"/>
                                            </svg>
                                            <div className="icon_name">Leave Call</div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* <!-- Bottom  Meeting Menu */}
                    </div>
                </>
            ) : (
                <Prelaunch mediaDevices={allMediaDevices} prelaunchMediaHandler={prelaunchMediaHandler} setPrelaunchScreen={setPrelaunchScreen} />
            )
        }    
        </>
    )
}

export default MeetingUI
