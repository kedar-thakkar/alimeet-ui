/* global chrome */

import React, { useRef, useState, useEffect } from 'react';
import "../meeting/Wany/css/magnific-popup.css";
import "../meeting/Wany/css/slick.css";
// import "../meeting/Wany/css/style.css";
import $ from 'jquery';
import "../meeting/Wany/css/fonts/stylesheet.css";
import audia_off from '../meeting/Wany/images/audia_off.svg';
import audia_on from '../meeting/Wany/images/audia_on.svg';
import unmuteall from '../meeting/Wany/images/unmuteall.svg';
import blackboard from '../meeting/Wany/images/blackboard.svg';
import call_end from '../meeting/Wany/images/call_end.svg';
import favicon from '../meeting/Wany/images/favicon.png';
import frm_down_arrow from '../meeting/Wany/images/frm_down_arrow.svg';
import img from '../meeting/Wany/images/img.jpg';
import logo from '../meeting/Wany/images/logo.png';
import login_logo from '../meeting/Wany/images/login_logo.png';
import mail_icon from '../meeting/Wany/images/mail_icon.svg';
import message from '../meeting/Wany/images/message.svg';
import mute from '../meeting/Wany/images/mute.svg';
import sparticipants from '../meeting/Wany/images/participants.svg';
import password_icon from '../meeting/Wany/images/password_icon.svg';
import question from '../meeting/Wany/images/question.svg';
import recording_icon from '../meeting/Wany/images/recording_icon.svg';
import recording_iconOn from '../meeting/Wany/images/recording_iconOn.svg';
import screen_share_icon from '../meeting/Wany/images/screen_share_icon.svg';
import setting from '../meeting/Wany/images/setting.svg';
import shield from '../meeting/Wany/images/shield.svg';
import stop_screen_share_icon from '../meeting/Wany/images/stop_screen_share_icon.svg';
import tileview from '../meeting/Wany/images/tileview.svg';
import user_group from '../meeting/Wany/images/user-group.svg';
import user_list from '../meeting/Wany/images/user-list.svg';
import videos_img from '../meeting/Wany/images/videos_img.jpg';
import videos_off_icon from '../meeting/Wany/images/videos_off_icon.svg';
import videos_on_icon from '../meeting/Wany/images/videos_on_icon.svg';
import fullscreen from '../meeting/Wany/images/full-screen.svg';
import resolution from '../meeting/Wany/images/resolution.svg';
import Fabricwhiteboard from './fabricwhiteboard';
import videoOffImg from './images/img.jpg'
import subtitleImg from '../../images/subtitles.svg'
import activeSubtitleImg from '../../images/active-subtitle.svg'
import {
    Col, Form, FormGroup, Label,
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,   
} from "reactstrap";
import { data, map } from 'jquery';
import Chat from './chat';
import Axios from 'axios';
import io from 'socket.io-client';
import queryString from "query-string"
import { ENDPOINJITSITURL } from '../common/endpointJitsi';
import { ENDPOINSOCKETURL, ENDPOINTURL } from '../common/endpoints';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Prelaunch from '../meeting/prelaunch';
import axios from 'axios';
import STTClassComponent from '../STTClassComponent';
import DocumentUpload from '../documentUpload';
import { ReactMediaRecorder } from 'react-media-recorder';
import Recorder from '../Recorder';
import Whiteboard from './whiteboard';

let connection = null;
let isJoined = false;
let room = null;
let localTracks = [];
let remoteTracks = [];
let isVideo = true;
let participantsList = [];
let participants = [];
let socket = '';
let userIdArr = [];
let deviceMobile = false;
let sharescreen = false;
let screenRecording = false;
let isAudioMuted = false;
let isVideoMuted = false;
let { roomName, meetingData } = queryString.parse(window.location.search);
let globleRole = localStorage.getItem('user_role');
// WebRTC methods
let peers = {};
let pendingCandidates = {}
if (roomName) {
    roomName = roomName.toLowerCase();
}
let userAudio;
let userVideo;
let AudioImage = '';

//Start teacher video
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var pcConfig = {
'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
}]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
offerToReceiveAudio: true,
offerToReceiveVideo: true
};

//Stop teacher video
function ExampleUI(props) {
    useEffect(() => {

        
        let videos_img = localStorage.getItem('user_profile_image');
        setImage(videos_img);
        // var url = {videos_img}
        // var image = new image
        let userType = localStorage.getItem('user_role');
        setRole(userType);
    }, [])

    const {
        className
    } = props;

    const [image , setImage] = useState("")
    const [modal, setModal] = useState(false);
    const [modalpwd, setModalpwd] = useState(false);
    const [modalsecurity, setModalsecurity] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [role, setRole] = useState("");
    const [videoMuted, setVideoMuted] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [scrollHandler, setScrollHandler] = useState(true);
    const [currentMeetingId, setCurrentMeetingId] = useState('');
    const [prelaunchScreen, setPrelaunchScreen] = useState(true);
    const [allMediaDevices, setAllMediaDevices] = useState([]);
    const [documentToggleModal, setDocumentToggleModal] = useState(false);
    const [meetingPassword, setMeetingPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRes, setpasswordRes] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [isSubtitle, setIsSubtitle] = useState(false);
    const [subtitleDisplay, setSubtitleDiplay] = useState('');
    const [recordingHandler, setRecordingHandler] = useState('');
    const [recordAction, setRecordAction] = useState('start');
    const [userColLength, setUserColLength] = useState(0);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [attendanceId, setAttendenceId] = useState('');
    const [isDeviceMobile, setIsDeviceMobile] = useState(false);
    const [documentList, setDocumentList] = useState([])
    const [remoteParticipantList, setRemoteParticipantList] = useState([]);
    const [showParticipantList, setShowParticipantList] = useState(false);
    const [value1, setValue1] = useState(25);
    const videoRef = useRef(null);

    const setModalIsOpenToTrue = () => {
        setModalIsOpen(true)
    }
    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false)
    }

    /* global $, JitsiMeetJS */
    // const local_username = localStorage.getItem("name");
    const options = {
        serviceUrl: 'https://dockermeet.memoriadev.com/http-bind',
        hosts: {
            domain: 'dockermeet.memoriadev.com',
            muc: 'conference.dockermeet.memoriadev.com'
        },
    }

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
            label: 'High defi.'
        }
    ];

    function valuetext(value) {
        return `${value}`;
    }

    function valueLabelFormat(value) {
        return marks.findIndex((mark) => mark.value === value) + 1;
    }

    const confOptions = {
        openBridgeChannel: true
    };
    const classes = useStyles();
    const toggle = () => setModal(!modal);
    const togglepwd = () => {
        setModalpwd(!modalpwd);
        props.history.push("/user/meeting/meetinglist");
    }
    const togglesecurity = () => setModalsecurity(!modalsecurity);
    const fullScreenView = (elem) => {
        console.log(elem)
        $(`.${elem}`).toggleClass('fullscreen');
    }   
    
    function handleMuteAllParticipant() {       
            console.log("vaishakhi called mute everyone");           
            $('#muteall').addClass('muteAll');
            $('.unmute').removeClass('d-none');
            socket.emit("mute-everyone");          
    };
 
    function handleUnMuteAllParticipant() {
        console.log("called Unmute everyone");           
        $('#muteall').removeClass('muteAll');
        $('.unmute').addClass('d-none');
        socket.emit("unmute-everyone");     
    };

    const handleChange = (event, newValue) => {
        console.log('handleChange ----------------------------------> ', newValue)
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

  
    $(".student_audio_status1").click(function(){
        // participants = await room.getParticipants();
        // participantsList = participants;
        // console.log("participantsList", participantsList._id);
        // const participant = track.getParticipantId();
        // console.log(participant)
        // if (!remoteTracks[id]) {
        //     return;
        // }
        // const element = $(`#remote-user-${id}`);
        // if (element) {
        //     console.log(element);
        console.log("student_audio_status1");             
        RemotemuteHandler(); 
        $(".user_audia_icon ").addClass("student_audio_status2")        
    });

    $(".student_audio_status2").click(function(){
        console.log("Remove student_audio_status1");               
        RemoteunmuteHandler();
        $(".user_audia_icon ").removeClass("student_audio_status2")          
    });

    const modal1 = (
        <div className={classes.slides}>
            <Slider
                defaultValue={value1}
                valueLabelFormat={valueLabelFormat}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-restrict"
                onChange={handleChange}
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
            />
        </div>
    );

    /**
     * Handles local tracks.
     * @param tracks Array with JitsiTrack objects
     */
    function onLocalTracks(tracks) {
        localTracks = tracks;
		try {
			for (let i = 0; i < localTracks.length; i++) {
				localTracks[i].addEventListener(
					JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
					audioLevel => console.log(`Audio Level local: ${audioLevel}`));
				localTracks[i].addEventListener(
					JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
					() => console.log('local track muted changes'));
				localTracks[i].addEventListener(
					JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
					() => console.log('local track stoped'));
				localTracks[i].addEventListener(
					JitsiMeetJS.errors.track.TRACK_IS_DISPOSED,
					() => console.log('TRACK_IS_DISPOSED'));
				localTracks[i].addEventListener(
					JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
					deviceId =>
						console.log(
							`track audio output device was changed to ${deviceId}`));
				if (localTracks[i].getType() === 'video') {					
					$('.main_meeting_videos').append(`<video autoplay='1' class='local-video' id='localVideo${i}' style='pointer-events: none' />`);
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

        if(globleRole !== "Teacher") {
            $('#teacherLocal').css('display','none');
        }

		} catch (error) {
			console.log(error);
        }
        remoteExtaVideo()
    }

    function remoteExtaVideo(){
        let tags = $(".local-video");
        if(tags.length > 1){
            $(".local-video")[1].remove();
        }
    }

    /**
     * Handles remote tracks
     * @param track JitsiTrack object
     */
    function onRemoteTrack(track) {
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

        if (participantName[0] === 'Admin' || participantName[0] === 'admin') {
            // track.attach($(`#${id}`)[0]);
            return;
        }

        if (role === "Teacher" || role === "teacher" || role === "Admin") {
            if (track.getType() === 'video') {
                //For Audio and Video img append             
                userVideo = track.isMuted();

                //track audio status get, then store it locat varialble 
                $('.user_meeting_inr_box_otr').append(`   
                    <div class="user_col" id='remote-user-${participant}'>                               
                        <img src=${videoOffImg}  class="d-none" id='${participant}img' alt=""/>                               
                        <video autoplay='1' class="${participant}video" id='${participant}video${idx}' onclick="$('#${participant}video${idx}').toggleClass('fullscreen');"></video>    
                        <div class="user_name ${participant}-username-wrapper" >
                            <span ${participant}-username">${participantName[1]}
                            </span>
                            <a href="#." class="user_audia_icon student_audio_status1 active" >
                                <img src=${AudioImage} class="audio-img-${participant}" id='${participant}audio${idx}' style="width: 30px;"/>
                            </a>
                        </div>                                
                    </div> 
                `);
               
                //Student side => To show default img if Video is muted
                if(userVideo === true){                    
                    $(`#${participant}img`).removeClass('d-none');
                    $(`#${participant}video${idx}`).addClass('d-none');                     
                }  
            } else {
                userAudio = track.isMuted();                  
                if(userAudio === false){
                    AudioImage = `${audia_on}`; 
                }else{
                    AudioImage = `${audia_off}`;                      
                }
                $('body').append(
                    `<audio autoplay='1' id='${participant}audio${idx}' />`);
            }
            track.attach($(`#${id}`)[0]);
        } else {
            if (participantName[0] === 'Teacher' || participantName[0] === 'teacher') {					
                if (track.getType() === 'video') {
                    userVideo = track.isMuted();

                    $('.user_meeting_inr_box_otr').append(`   
                    <div class="user_col" id='remote-user-${participant}'>                               
                        <img src=${videoOffImg}  class="d-none" id='${participant}img' alt=""/>                              
                        <video autoplay='1' class="${participant}video" id='${participant}video${idx}' onclick="$('#${participant}video${idx}').toggleClass('fullscreen');"></video>    
                        <div class="user_name ${participant}-username-wrapper" >
                            <span ${participant}-username">${participantName[1]} ( ${participantName[0]} )</span>
                            <a href="#." class="user_audia_icon active">
                                <img src=${AudioImage} class="audio-img-${participant}" style="width: 30px;"/>
                            </a>
                        </div>                                
                    </div>
                    `);
                    
                    //Teacher side => To show default img if Video is muted
                    if(userVideo === true){                    
                        $(`#${participant}img`).removeClass('d-none');
                        $(`#${participant}video${idx}`).addClass('d-none');                     
                    }
                } else {
                    userAudio = track.isMuted();                  
                    if(userAudio === false){
                        AudioImage = `${audia_on}`; 
                    }else{
                        AudioImage = `${audia_off}`;                      
                    }
                    $('body').append(
                        `<audio autoplay='1' id='${participant}audio${idx}' />`);
                }
                track.attach($(`#${id}`)[0]);

            }
        }
        if (deviceMobile === true) {
            $(".user_col video").css({"object-fit": "cover"});
         }
        getTotalRemoteUsers()
    }

    let mobileCheck = function () {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    useEffect(() => {
        let resopnse = mobileCheck();
        if (resopnse === true) {
            setPrelaunchScreen(false);
            checkInAttendence();
            setIsDeviceMobile(true)
            startmeeting();
            getDocumentList();
            deviceMobile = true;
        }
    }, [])


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

    const getTotalRemoteUsers = () => {
        const remoteUser = room.getParticipants()
        const remoteUsersLength = remoteUser.length;

        setUserColLength(remoteUsersLength)
        setRemoteParticipantList(remoteUser);
    }

    const presentStudentToAll = (id, action) => {     
        $(`#btn_${id}`).toggleClass('active')
        let res = $(`#btn_${id}`).hasClass('active')
        if (res) {
            localStorage.setItem(id, 'yes')
        } else {
            localStorage.setItem(id, 'no')
        }
        socket.emit('show-student', { id, action })
    }

    const chatHandler = () => {
        $('.meeting_videos_bg').toggleClass('small')
        $('.mn_inr_header').toggleClass('small')
        $('.chat-box-sec').toggleClass('show')
        $('.circle').removeClass('active')
    }

    /* SOCKET CODE START */

    useEffect(() => {
        // socket = io(ENDPOINSOCKETURL);
        socket = io("http://localhost:5000");
        socket.emit('join', { room: roomName });
        let meeting = JSON.parse(meetingData);
        if (meeting) {
            localStorage.setItem('active_meeting_id', meeting.meetingId);
            setCurrentMeetingId(meeting.meetingId)
            setMeetingTitle(meeting.meetingTitle);
        }
        if (meeting.meetingPassword) {
            setModalpwd(true);
        }
        startmeeting();        
        checkForPassword()
      
    }, [])   

    const checkForPassword = () => {
        (
            <>
                {/* <Button color="danger" onClick={togglepwd}>aaaa</Button> */}
            </>
        )
    }     
	
	    var localVideo = document.querySelector('#teacherLocal');
        var remoteVideo = document.querySelector('#remoteVideo');

        let sendOffer = (sid) => {
            console.log('Send offer');
            peers[sid].createOffer().then(
                (sdp) => setAndSendLocalDescription(sid, sdp),
                (error) => {
                    console.error('Send offer failed: ', error);
                }
            );
        };

        let sendData = (data, roomName) => {

            socket.emit('data', { data: data, roomName: roomName });
            //socket.emit('data', data, roomName);
        };
    
        let addPendingCandidates = (sid) => {
            if (sid in pendingCandidates) {
                pendingCandidates[sid].forEach(candidate => {
                    peers[sid].addIceCandidate(new RTCIceCandidate(candidate))
                });
            }
        }


    useEffect(() => {
        if (socket) {
            socket.on('subtitle-data', ({ subtitle, userName }) => {                
                let userRole = localStorage.getItem('user_role');
                if (userRole === 'Student') {
                    if (subtitle && userName && isAudioMuted === false) {
                        setIsSubtitle(true);
                    }else{
                        setIsSubtitle(false);
                    }
                }
               
                if(isAudioMuted === false){
                    $(".subtitle-container").removeClass("d-none");
                    setSubtitleDiplay({
                        subtitle: subtitle,
                        userName: userName
                    });
                  }
            })

            socket.on('on-endcall', () => {
                console.log("endcall");
                checkOutAttendence();
            })

            socket.on('on-handle-whiteboard', ({ action }) => {
                if (action === "open") {
                    $(`.whiteboard-wrapper`).addClass("show");
                    $('body').addClass('white_board_on');
                    $('.main_meeting_videos').addClass('student_user');
                } else {
                    $(`.whiteboard-wrapper`).removeClass("show");
                    $('.main_meeting_videos').removeClass('student_user');
                    $('body').removeClass('white_board_on');
                }

            })

            socket.on('screen-share-on', () => {            
                console.log('inside screen-share-on');
				showTeacherScreen('Student');

            })

            socket.on('on-show-student', ({ id, action }) => {               
                const allParticipants = room.getParticipants();
                allParticipants.map((participants) => {
                    if (id === participants._id) {
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
                })
                console.log("student id: ", id)
            });

            socket.on('on-mute-everyone', () => {
                isAudioMuted = false
                muteHandler();
                console.log("on-mute-everyone");
                $('.icon2').addClass('ToggleIconBoxActive');                
            });
           
            socket.on("on-unmute-everyone", () => {
                isAudioMuted = true
                muteHandler();
                console.log("on-unmute-everyone");
                $('.icon2').removeClass('ToggleIconBoxActive');
               
            })
        }
    }, [])

    useEffect(() => {                
        if (subtitle && isSubtitle && !isAudioMuted) {
            let userName = localStorage.getItem('user_name');
            socket.emit('subtitle', { subtitle, userName });
        } else {
            socket.emit('subtitle', { subtitle: '', userName: '' });
        }
    }, [subtitle])

    useState(() => {
        if (isSubtitle) {
            socket.emit('subtitle', { subtitle: '', userName: '' });
        }
    }, [isSubtitle])

    useEffect(() => {
        console.log("currentMeetingId", currentMeetingId)
    }, [currentMeetingId])

    function showUserToAll(track) {       
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
            $('.user_meeting_inr_box_otr').append(`   
                    <div class="user_col new_user_video new_user_video_${participant}" id='remote-user-${participant}' onclick="$('#${participant}video${idx}').toggleClass('fullscreen');">                               
                        <img src=${videoOffImg}  class="d-none" id='${participant}img' alt=""/>                               
                        <video autoplay='1' class="${participant}video" id='${participant}video${idx}'></video>    
                        <div class="user_name ${participant}-username-wrapper" >
                            <span ${participant}-username">${participantName[1]} ( ${participantName[0]} )</span>
                            <a href="#." class="user_audia_icon active">
                                <svg height="18" width="18" viewBox="0 0 22 22" >
                                    <path class="user_unmute" fill-rule="evenodd" clip-rule="evenodd" d="M16 6a4 4 0 00-8 0v6a4.002 4.002 0 003.008 3.876c-.005.04-.008.082-.008.124v1.917A6.002 6.002 0 016 12a1 1 0 10-2 0 8.001 8.001 0 007 7.938V21a1 1 0 102 0v-1.062A8.001 8.001 0 0020 12a1 1 0 10-2 0 6.002 6.002 0 01-5 5.917V16c0-.042-.003-.083-.008-.124A4.002 4.002 0 0016 12V6zm-4-2a2 2 0 00-2 2v6a2 2 0 104 0V6a2 2 0 00-2-2z"></path>
                                    <path class="user_mute" fill-rule="evenodd" clip-rule="evenodd" d="M7.333 8.65V11a3.668 3.668 0 002.757 3.553.928.928 0 00-.007.114v1.757A5.501 5.501 0 015.5 11a.917.917 0 10-1.833 0c0 3.74 2.799 6.826 6.416 7.277v.973a.917.917 0 001.834 0v-.973a7.297 7.297 0 003.568-1.475l3.091 3.092a.932.932 0 101.318-1.318l-3.091-3.091.01-.013-1.311-1.311-.01.013-1.325-1.325.008-.014-1.395-1.395a1.24 1.24 0 01-.004.018l-3.61-3.609v-.023L7.334 5.993v.023l-3.909-3.91a.932.932 0 10-1.318 1.318L7.333 8.65zm1.834 1.834V11a1.833 1.833 0 002.291 1.776l-2.291-2.292zm3.682 3.683c-.29.17-.606.3-.94.386a.928.928 0 01.008.114v1.757a5.47 5.47 0 002.257-.932l-1.325-1.325zm1.818-3.476l-1.834-1.834V5.5a1.833 1.833 0 00-3.644-.287l-1.43-1.43A3.666 3.666 0 0114.667 5.5v5.19zm1.665 1.665l1.447 1.447c.357-.864.554-1.81.554-2.803a.917.917 0 10-1.833 0c0 .468-.058.922-.168 1.356z"></path>
                                </svg>
                            </a>
                        </div>                                
                    </div> 
                `);
        } else {
            $('body').append(
                `<audio autoplay='1' class="new_user_audio_${participant}" id='${participant}audio${idx}' />`);
        }
        track.attach($(`#${id}`)[0]);
        getTotalRemoteUsers()
    }

    function participantListHandler() {       
        setShowParticipantList(!showParticipantList);
    }

    async function checkInAttendence() {
        let meeting = JSON.parse(meetingData);
        const userId = localStorage.getItem('user_id');
        const meetingId = meeting.meetingId;
        const token = localStorage.getItem("auth_token");
        try {
            const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/attendance/addCheckInTime?meetingId=${meetingId}&userId=${userId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            setAttendenceId(data.attendanceId);
        } catch (error) {
        }
    }
    /* SOCKET CODE END */

    function prelaunchMediaHandler(audioId, videoId) {
        console.log("audioId: ", audioId)
        console.log("videoId: ", videoId)
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
        checkInAttendence();
        getDocumentList();
        setModalIsOpen(false)
        connection.connect();
    }

    /**
     * That function is executed when the conference is joined
     */
    async function onConferenceJoined() {
        try {
            participants = await room.getParticipants();
            console.log('conference joined!');
            isJoined = true;
			room.on(
            JitsiMeetJS.errors.track.TRACK_IS_DISPOSED,
            trackDisposed);
            for (let i = 0; i < localTracks.length; i++) {
                room.addTrack(localTracks[i]);
            }
            participantsList = participants;
            console.log("participantsList", participantsList);
        } catch (error) {
            console.log('Exception Throwsssss onConferenceJoined');
        }
    }

    /**
     * That function is executed when the conference is joined
     */
     async function trackDisposed() {
        console.log('trackDisposed called');       
    }

    /**
     *
     * @param id
     */
    function onUserLeft(id) {
        console.log('user left');
        try {
            if (!remoteTracks[id]) {
                return;
            }
            const tracks = remoteTracks[id];
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].detach($(`#${id}${tracks[i].getType()}`));
            }            
            const element = $(`#remote-user-${id}`);
            if (element) {
                console.log(element);
                element.remove();
            }
        } catch (error) {
            console.log('Exception Throwsssss');
        }
    }

    /**
     * That function is called when connection is established successfully
     */
    function onConnectionSuccess() {
        room = connection.initJitsiConference(roomName, confOptions);
        room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
        room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
            const participant = track.getParticipantId();
            const element = $(`#remote-user-${participant}`);
            if (element) {
                element.remove();
            }
            console.log(`track removed!!!${track}`);
            getTotalRemoteUsers()

            if (track.videoType === "desktop" || !track.videoType) {
                if (!track.isLocal()) {
                    const participant = track.getParticipantId();
                    const element = $(`#remote-user-${participant}`);
                    if (element) {
                        element.remove();
                    }
                }
            }
        });
        room.on(
            JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            onConferenceJoined);
        room.on(
            JitsiMeetJS.errors.track.TRACK_IS_DISPOSED,
            trackDisposed);
        room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
            console.log('user join');
            remoteTracks[id] = [];
        });
        room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
        room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
            console.log(`${track.getType()} - ${track.isMuted()}`);

            if (track.getType() === 'video') {
                const participant = track.getParticipantId();                
                const videotagid = participant + track.getType();
                const imgtagid = participant + 'img';
                console.log("videotagid", videotagid)
                console.log("imgtagid", imgtagid)
                if (!track.isMuted()) {
                    $(`.${videotagid}`).removeClass('d-none')
                    $(`#${imgtagid}`).addClass('d-none')
                } else {
                    $(`.${videotagid}`).addClass('d-none')
                    $(`#${imgtagid}`).removeClass('d-none')
                }
            } else {
                const participant = track.getParticipantId();
                console.log("audio-img-" + participant)
                if (track.isMuted()) {
                    $(`.audio-img-${participant}`).attr("src", `${audia_off}`)
                } else {
                    $(`.audio-img-${participant}`).attr("src", `${audia_on}`)
                }
            }
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
        room.join();
        let userRole = localStorage.getItem('user_role');
        let userName = localStorage.getItem('user_name');
        room.setDisplayName(userRole + '#' + userName);
        room.setReceiverVideoConstraint('1080');
        console.log('ROOM: ',room)
    }

    /**
     * This function is called when the connection fail.
     */
    function onConnectionFailed() {
        console.error('Connection Failed!');
    }

    /**
     * This function is called when the connection fail.
     */
    function onDeviceListChanged(devices) {
        console.info('current devices', devices);
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
        const videoElement = document.getElementById(elementId + "video");
        const audioElement = document.getElementById(elementId + "audio");
        videoElement && videoElement.remove();
        audioElement && audioElement.remove();
    }

    /**
     * This function is called when we left the meeting.
     */
    async function unload(value) {
        try {
            for (let i = 0; i < localTracks.length; i++) {
                localTracks[i].dispose();
            }
            console.log('room', room);
            console.log('connection', connection);

            room.leave();
            connection.disconnect();
            return true            
        } catch (error) {
            console.log(error.message)
        }
    }

    let getLocalStream = () => {
        navigator.mediaDevices.getUserMedia({audio: false, video: true})
            .then((stream) => {
                console.log('Stream found : ', roomName);
                localStream = stream;
                //alert('localStream 1 ==> ',localStream);
                document.querySelector('#teacherLocal').srcObject = stream;

                if(globleRole === "Teacher") {
                    const newRemoteStreamElem = document.createElement('video');
                    newRemoteStreamElem.autoplay = true;
                    newRemoteStreamElem.srcObject = stream;
    
                    document.querySelector('#teacherLocal').appendChild(newRemoteStreamElem);
                }
                
                // Connect after making sure thzat local stream is availble
                //socket.connect();
                socket.emit('create-or-join', { roomName });
            })
            .catch(error => {
                console.error('Stream not found: ', error);
            });
    }

    function showTeacherScreen(source) {
        getLocalStream();

    }

    let setAndSendLocalDescription = (sid, sessionDescription) => {
        peers[sid].setLocalDescription(sessionDescription);
        console.log('Local description set');
        sendData({sid, type: sessionDescription.type, sdp: sessionDescription.sdp}, roomName);
    };
    
    let onIceCandidate = (event) => {
        if (event.candidate) {
            console.log('ICE candidate');
            sendData({
                type: 'candidate',
                candidate: event.candidate
            }, roomName);
        }
    };

    let onAddStream = (event) => {
        console.log('Add stream');
        const newRemoteStreamElem = document.createElement('video');
        newRemoteStreamElem.autoplay = true;
        newRemoteStreamElem.srcObject = event.stream;
        document.querySelector('#remoteStreams').appendChild(newRemoteStreamElem);
    };

    let sendAnswer = (sid) => {
        console.log('Send answer');
        peers[sid].createAnswer().then(
            (sdp) => setAndSendLocalDescription(sid, sdp),
            (error) => {
                console.error('Send answer failed: ', error);
            }
        );
    };

    let createPeerConnection = () => {
        const pc = new RTCPeerConnection(pcConfig);
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onAddStream;
		pc.addStream(localStream);
        console.log('PeerConnection created');
        return pc;
    };

    let handleSignalingData = (data) => {
        console.log(data)
        if(data) {
            try {
                const sid = data.data.sid;
                delete data.data.sid;
                switch (data.data.type) {
                    case 'offer':
                        peers[sid] = createPeerConnection();
                        peers[sid].setRemoteDescription(new RTCSessionDescription(data.data));
                        sendAnswer(sid);
                        addPendingCandidates(sid);
                        break;
                    case 'answer':
                        peers[sid].setRemoteDescription(new RTCSessionDescription(data.data));
                        break;
                    case 'candidate':
                        if (sid in peers) {
                            peers[sid].addIceCandidate(new RTCIceCandidate(data.candidate));
                        } else {
                            if (!(sid in pendingCandidates)) {
                                pendingCandidates[sid] = [];
                            }
                            pendingCandidates[sid].push(data.candidate)
                        }
                        break;
                }
            } catch(e){
                console.log('error => '+e);
            }
        }
    };

    /**
     *This function is called when we share the screen.
     */ 
    function switchVideo() { // eslint-disable-line no-unused-vars
        isVideo = !isVideo;
        if(!isVideo) {
			$('.user_meeting_inr_box_otr').html('');
            $('.user_meeting_inr_box_otr').html(`
            <div id="teacherLocal"><img src=${videoOffImg}  class="d-none" alt=""/></div>
            <div id="remoteStreams"></div>`);
    
            if(globleRole !== "Teacher") {
                $('#teacherLocal').css('display','none');
            }
			
            showTeacherScreen('Teacher');
        }
        
        if (localTracks[1]) {
            localTracks[1].dispose();
            localTracks.pop();
        }
        JitsiMeetJS.createLocalTracks({
            devices: [isVideo ? 'video' : 'desktop']
        })
            .then(tracks => {
                if(tracks[0].videoType === 'desktop'){
                    let data = 'Shared';
                } else {
                    $('#teacherLocal video').remove();
                }
                
                localTracks.push(tracks[0]);
                localTracks[1].addEventListener(
                    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                    () => console.log('local track muted'));
                localTracks[1].addEventListener(
                    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                    () => {
                        if (tracks[0].videoType === 'desktop' && isVideo === false) {
                            $('.icon3').removeClass('ToggleIconBoxActive');
                            isInitiator = false;  
                            $('#teacherLocal').remove();							
                            switchVideo();
                        }
                    }
                );
                localTracks[1].attach($('#localVideo1')[0]);
                room.addTrack(localTracks[1]);
            })
            .catch(error => {               
                console.log(error.message)                
            });
    }

    /**
     *
     * @param selected
     */
    function changeAudioOutput(selected) { // eslint-disable-line no-unused-vars
        try {
            JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
        } catch (error) {
            alert(error.message);
        }
    }

    // $(window).bind('beforeunload', checkOutAttendence);
    // $(window).bind('unload', checkOutAttendence);
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
    function startmeeting() {
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
        console.log("deviceMobile =========> ", deviceMobile)
        if (prelaunchScreen === false || deviceMobile === true) {
            connection.connect();
            console.log('If prelaunchScreen ================> ', prelaunchScreen);           
        } else {
            console.log('Else prelaunchScreen ================> ', prelaunchScreen);
        }
        JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video']})
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

    function checkIsScreenShared(){
        let status = false;
        const participants = room.getParticipants();    
        participants.map(participant => {
            let tracks = participant._tracks;
            tracks.map(track => { 
                if(track.videoType === "desktop"){
                    status = true;
                }
            })
        })    
        return status;    
     }

    /**
     * That function is executed when the track is muted
     */   
    function muteHandler() {
        console.log("isAudioMuted",isAudioMuted)
        for (let i = 0; i < localTracks.length; i++) {
            if (localTracks[i].type === "audio") {
                try {
                    if (isAudioMuted === true) {
                        localTracks[i].unmute();
                        isAudioMuted = false;
                        console.log("Your Audio is unmuted");
                    } else {
                        localTracks[i].mute();
                        isAudioMuted = true;                        
                        console.log("Your Audio is muted");
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

      /**
         *
         * @param id
         */  
    function RemotemuteHandler() {       
        console.log("called muteparticipants"); 
        socket.emit("mute-everyone");
    }

    function RemoteunmuteHandler() {       
        console.log("called mute everyone"); 
        socket.emit("unmute-everyone");
    }
 
    /**
    * That function is executed when the video is muted
    */    
    async function onVideoMuteStateChanged(e) {
        console.log("onVideoMuteStateChanged")
        for (let i = 0; i < localTracks.length; i++) {
            if (localTracks[i].type === "video") {
                try {
                    if (isVideoMuted === true) {
                        localTracks[i].unmute();
						isVideoMuted = false;
                        console.log("Your video is unmuted");
                        $('.local_video_mute_img').addClass('d-none');
                        $('.local-video').removeClass('d-none');
						$('#teacherLocal img').addClass('d-none')
                        $('#teacherLocal video').removeClass('d-none');
                    } else {
                        localTracks[i].mute();
						isVideoMuted = true;
                        console.log("Your video is muted");
                        $('.local_video_mute_img').removeClass('d-none');
                        $('.local-video').addClass('d-none');
						$('#teacherLocal img').removeClass('d-none');
                        $('#teacherLocal video').addClass('d-none');
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    function whiteboardhandler(action) {
        if (localStorage.getItem('user_role') === "Teacher") {
            if (action === true) {
                socket.emit('handle-whiteboard', { action: 'open' });
            } else {
                socket.emit('handle-whiteboard', { action: 'close' });
            }
        }
        if (action === true) {
            $(`.whiteboard-wrapper`).addClass("show")
        } else {
            $(`.whiteboard-wrapper`).removeClass("show")
        }
    }

    function clickonVideoMuteStateChanged() {
        $('.icon1').toggleClass('ToggleIconBoxActive');
        onVideoMuteStateChanged();
    }

    function clickmuteHandler() {
        $('.icon2').toggleClass('ToggleIconBoxActive');
        muteHandler();
    }

    function clickswitchVideo() {
        $('.icon3').toggleClass('ToggleIconBoxActive');
        switchVideo();
    }

    function clickrecoding() {
        $('.icon4').toggleClass('ToggleIconBoxActive');
        if (screenRecording === false) {
            setRecordingHandler('start');
            setRecordAction('stop');
        } else {
            setRecordingHandler('stop');
            setRecordAction('start');
        }
        screenRecording = !screenRecording;
    }

    const addPassword = async () => {       
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


    const checkOutAttendence = async () => {     
        const token = localStorage.getItem("auth_token");
        try {
            const data = await Axios.post(`${ENDPOINTURL}/alimeet/attendance/addCheckOutTime?attendanceId=${attendanceId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            console.log(data)
            if (data.data === "Attendance Check-out Successfully !") {            
                socket.emit('endcall');
                const response = await unload();
                console.log("response response: ", response)
                if (response) {                   
                    window.location.href  = "/user/meeting/meetinglist"
                }
            }
        } catch (error) {
        }
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

    const getDocumentList = async () => {
        const token = localStorage.getItem("auth_token");
        let meeting = JSON.parse(meetingData);
        // console.log("meetingId",meeting)
        try {
            const data = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=${meeting.meetingId}&source=Documents&userId=0`,
                    {}, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

            // console.log(data.data)
            setDocumentList(data.data)           
            // console.log(data.data.length);
            var doc = data.data.length;  
            $("#count_badge").empty();
                document.getElementById("count_badge").innerHTML += doc;            
        } catch (error) {
            console.log(error.message)   
        }
    }
   
     useEffect(() => {    
        let interval = setInterval(() => {      
        getDocumentList();         
        }, 5000);
    }, [])

    const modalsecurity1 = (
        <div>
            <p>You can add a password to your meeting. Participants will need to provide the password before they are allowed to join the meeting.</p>
            <br></br>
            <Label>Password</Label>
            <Input type="email" name="password" id="password" placeholder="Add Meeting Password" onChange={(e) => setMeetingPassword(e.target.value)} />
        </div>
    );

    // console.log("isSubtitle =========> ", isSubtitle)
    if(!isSubtitle){
        $(".subtitle-container").addClass('d-none');
        $("#subtitle_img").attr("src",subtitleImg);
    }else{
        $("#subtitle_img").attr("src",activeSubtitleImg);
    }
    // console.log("subtitleDisplay.userName ====> ",subtitleDisplay.userName);

    const modalSetting = <Prelaunch changeAudioOutput={changeAudioOutput} mediaDevices={allMediaDevices} prelaunchMediaHandler={prelaunchMediaHandler} setPrelaunchScreen={setPrelaunchScreen} modal=
        {true} />;

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
                        {
                            (isSubtitle && subtitleDisplay.userName && isAudioMuted === false) &&
                            <div className="subtitle-container">
                                <p style={{ margin: '10px' }}> You: {subtitle}</p>
                                <p>{subtitleDisplay.userName} : {subtitleDisplay.subtitle}</p>
                            </div>
                        }                      
                        {
                            showParticipantList && (
                                <div className="participant-list-container">
                                    <div className="participant-list">
                                        {
                                            remoteParticipantList && remoteParticipantList.map((track) => (
                                                <div className="participant" key={track._id}>
                                                    <div>{track._displayName.split('#')[1]}</div>
                                                    {
                                                        localStorage.getItem(track._id) === 'yes' ?
                                                            <button onClick={() => presentStudentToAll(track._id, 'show')} id={`btn_${track._id}`} className="blue_btn btn_participant active"></button> :
                                                            <button onClick={() => presentStudentToAll(track._id, 'show')} id={`btn_${track._id}`} className="blue_btn btn_participant"></button>
                                                    }
                                                </div>
                                            ))
                                        }

                                        <div class="participant-list-control">
                                            <button className="blue_btn" onClick={() => participantListHandler()}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        <div class={`alimeet_section ${localStorage.getItem('user_role') === "Student" ? 'student_page' : ''}`  }>
                            <div class="mn_inr_header">
                                <div class="mn_inr_header_left">
                                    <img src={login_logo}></img>
                                </div>
                                <div class="metting_name_content">{meetingTitle}</div>
                                <div class="mn_inr_header_right" onClick={() => { $('.mn_inr_header .mn_inr_header_right').toggleClass('OpenMobileDropDown') }}>
                                    <ul>
                                        {
                                            (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Admin") && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={user_list} onClick={() => setDocumentToggleModal(true)} alt="" />
                                                    </div>
                                                    <span id="count_badge" value="" class="count-badge">0</span>
                                                    <div class="help_name">
                                                        Upload Document
                                                    </div>
                                                </li>
                                            )
                                        }
                                        {
                                            localStorage.getItem('user_role') === "Student" && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={user_list} onClick={() => setDocumentToggleModal(true)} alt="" />
                                                    </div>
                                                    <span id="count_badge" value="" class="count-badge">0</span>
                                                    <div class="help_name">
                                                        Document List
                                                    </div>
                                                </li>
                                            )
                                        }
                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={sparticipants} onClick={() => participantListHandler()} alt="" />
                                                    </div>
                                                    <div class="help_name">
                                                        Participant List
                                                    </div>
                                                </li>
                                            )
                                        }
                                        <li>
                                            <div class="icon">
                                                <img src={message} onClick={(e) => {
                                                    e.preventDefault();
                                                    chatHandler();
                                                }} alt="" />
                                                <span className="circle"></span>
                                            </div>
                                            <div class="help_name">
                                                Message
                                            </div>
                                        </li>
                                        <li>
                                            <div class="icon TileView">
                                                <img src={tileview} onClick={() => {
                                                    $('.meeting_videos_user_box').toggleClass('user_box_list')
                                                    $("body").toggleClass('TileChange')
                                                    console.log(remoteTracks.length)
                                                }} alt="" />
                                            </div>
                                            <div class="help_name">
                                                TileView
                                            </div>
                                        </li>
                                        <li>
                                            <div class="icon">
                                                <img src={question} alt="" />
                                            </div>
                                            <div class="help_name">
                                                Help
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="whiteboard-wrapper">                               
                                <Whiteboard whiteboardhandler={whiteboardhandler} roomName={roomName} />
                            </div>
                            <div class="meeting_videos_bg">
                                <div class="meeting_videos_user_box user_box_list">
                                    <div class={`user_meeting_inr_box_otr user${userColLength}`}>
                                    </div>
                                    {/* <!-- Open Popup Html --> */}
                                    <div id="test-modal" class="white-popup-block mfp-hide">
                                        <div class="popup_videos_box">
                                            <a class="popup-modal-dismiss close_icon" href="#">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 1L1 11M1 1L11 11" stroke="#656185" stroke-width="1.5"></path>
                                                </svg>
                                            </a>
                                            <h1>Open Popup</h1>
                                            <p>You won't be able to dismiss this by usual means (escape or click button), but you can close it programatically based on user choices or actions.</p>
                                        </div>
                                    </div>
                                    {/* <!-- Open Popup Html --> */}
                                </div>
                                <div class="main_meeting_videos">
                                    <div class="user_box_list">
                                        <div class="user_meeting_inr_box_otr">                                           
                                        </div>                                      
                                    </div>
                                    <img src={image} class='local_video_mute_img d-none' alt=""></img>
                                </div>
                            </div>
                            <div class="call_inr_otr">
                                <div class="mn_inr_header_right call_inr_top" onClick={() => { $('.mn_inr_header_right.call_inr_top').toggleClass('OpenMobileDropDown') }}>
                                    <ul>
                                        {
                                            isDeviceMobile === false && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={setting} onClick={setModalIsOpenToTrue} alt="" />
                                                        <Modal isOpen={modalIsOpen} >
                                                            <ModalBody><h1 style={{ textAlign: 'center' }}>Setting</h1></ModalBody>
                                                            <ModalBody>
                                                                {modalSetting}
                                                            </ModalBody>
                                                            <ModalFooter>                                                               
                                                                <Button color="primary" onClick={setModalIsOpenToFalse}>Cancel</Button>
                                                            </ModalFooter>
                                                        </Modal>
                                                    </div>
                                                    <div class="help_name">
                                                        Setting
                                                    </div>
                                                </li>
                                            )
                                        }
                                        <li>
                                            <div class="icon">
                                                <img src={blackboard} onClick={() => whiteboardhandler(true)} alt="" />
                                            </div>
                                            <div class="help_name">
                                                Whiteboard
                                            </div>
                                        </li>
                                        {
                                            (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Admin") && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={shield} textAlign="center" onClick={togglesecurity} alt="" />
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
                                                    </div>
                                                    <div class="help_name">
                                                        Password
                                                    </div>
                                                </li>
                                            )}
                                            {
                                                (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Admin") && (
                                                    <li>
                                                        <div class="icon">
                                                            <img src={mute} id="muteall" onClick={handleMuteAllParticipant} alt=""/> 
                                                            <img src={unmuteall} class="unmute d-none" onClick={handleUnMuteAllParticipant} alt=""/>  
                                                        </div>
                                                        <div class="help_name">
                                                            Mute All
                                                        </div>
                                                    </li>
                                                )
                                            }
                                        <li>
                                            <div class="icon">
                                                <img src={fullscreen} onClick={switchBigScreen} alt="" />
                                            </div>
                                            <div class="help_name"> Full Screen </div>
                                        </li>
                                        <li>
                                            <div class="icon">
                                                <img src={resolution} onClick={toggle} alt="" />
                                            </div>
                                            <div class="help_name">
                                                Video Quality
                                            </div>
                                            <Modal isOpen={modal} modalTransition={{ timeout: 700 }} backdropTransition={{ timeout: 1300 }}
                                                toggle={toggle} className={className}>
                                                <div toggle={toggle} class="upload_title_box2">
                                                    <div class="upload_video">Video Quality</div>
                                                    <a class="popup-modal-dismiss close_icon" onClick={toggle} href="#">
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11 1L1 11M1 1L11 11" stroke="#656185" stroke-width="1.5"></path>
                                                        </svg>
                                                    </a>
                                                </div>
                                                <ModalBody>
                                                    {modal1}
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="primary" onClick={toggle}>OK</Button>
                                                </ModalFooter>
                                            </Modal>
                                        </li>
                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <div class="icon">
                                                        <img src={subtitleImg} id="subtitle_img" alt="" onClick={() => setIsSubtitle(!isSubtitle)} />
                                                    </div>
                                                    <div class="help_name"> Subtitle </div>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </div>
                                <div class="mn_inr_header_right call_inr_center">
                                    <ul>
                                        <li>
                                            <div class="icon1 ToggleIconBox" onClick={clickonVideoMuteStateChanged}>
                                                <div class="videos_on">
                                                    <img src={videos_on_icon} alt="" />
                                                    <div class="help_name">Stop Video</div>
                                                </div>
                                                <div class="videos_off">
                                                    <img src={videos_off_icon} alt="" />
                                                    <div class="help_name">Start Video</div>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div class="icon2 ToggleIconBox">
                                                <div class="videos_on" onClick={clickmuteHandler}>
                                                    <img src={audia_on} alt="" />
                                                    <div class="help_name">Mute Audio</div>
                                                </div>
                                                <div class="videos_off" onClick={clickmuteHandler}>
                                                    <img src={audia_off} alt="" />
                                                    <div class="help_name">Start Audio</div>
                                                </div>
                                            </div>
                                        </li>
                                        {
                                            localStorage.getItem('user_role') === "Teacher" && (
                                                <li>
                                                    <div class="icon3 ToggleIconBox" onClick={clickswitchVideo}>
                                                        <div class="videos_off">
                                                            <img src={stop_screen_share_icon} alt="" />
                                                            <div class="help_name">Stop Screen</div>
                                                        </div>
                                                        <div class="videos_on">
                                                            <img src={screen_share_icon} alt="" />
                                                            <div class="help_name">Screen Share</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        }
                                        {
                                            (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Admin") && (
                                                <li>
                                                    <div class="icon4 ToggleIconBox" onClick={clickrecoding}>
                                                        <div class="videos_off">
                                                            <img src={recording_iconOn} alt="" />
                                                            <div class="help_name">Stop Recording</div>
                                                        </div>
                                                        <div class="videos_on">
                                                            <img src={recording_icon} alt="" />
                                                            <div class="help_name">Start Recording</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </div>
                                <div class="mn_inr_header_right">
                                    <ul>
                                        <li>
                                            <button class="icon" style={{border: "transparent", background: "transparent"}}> 
                                                <img src={call_end} alt="" onClick={checkOutAttendence} />
                                            </button>
                                            <div class="help_name">End Meeting</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="chat-box-sec" style={{ zIndex: '5' }}>
                            <Chat meetingId={currentMeetingId} roomName={roomName} />
                        </div>
                    </>
                ) : (
                    <Prelaunch changeAudioOutput={changeAudioOutput} mediaDevices={allMediaDevices} prelaunchMediaHandler={prelaunchMediaHandler} setPrelaunchScreen={setPrelaunchScreen} />
                )
            }
        </>
    )
}
export default ExampleUI;
