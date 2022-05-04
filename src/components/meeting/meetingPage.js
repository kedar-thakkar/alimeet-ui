import React, { Fragment, Component, useState, useEffect } from 'react';
import $ from "jquery";

function MeetingPage(props) {
  console.log('MeetingPage Function called ');

  // const [meetingModerator, setMeetingModerator] = useState("");
  // const [cameraOptions, setCameraOptions] = useState("");


  // useEffect(() => {

  //   setMeeting.cameraDeviceId(meeting.cameraOptions && meeting.cameraOptions[0])

  // }, [meeting.cameraOptions])

  // useEffect(() => {
 
  //   setMeeting.micDeviceId(meeting.microphoneOptions && meeting.microphoneOptions[0])

  // }, [meeting.microphoneOptions])


  // useEffect(() => {

  // }, []) 



  const moderator =
    props &&
    props.location &&
    props.location.state &&
    props.location.state.moderator;
  if (moderator) {

    // this.setState({
    //   meetingModerator: moderator,
    // });
    setMeeting.meetingModerator(moderator);
  }


  const [meeting, setMeeting] = useState({
    isValid: true,
    sessionId: "",
    isModeratorAlert: true,
    recordingStatus: false,
    isModerator: false,
    isAudioMuted: false,
    isVideoMuted: false,
    isJoined: false,
    participantArray: [],
    participantListAudio: [],
    currentUser: {},
    participantsList: [],
    messages: [],
    message: "",
    unreadCount: 0,
    isScreenSharingOn: false,
    hasMoreThanOneParticipant: false,
    participantElement: [],
    isLocalStreaming: false,
    idTrackMap: new Map(),
    smallScreensMap: new Map(),
    idDisplayNameMap: new Map(),
    connectionFailed: false,
    screenShareOnBigScreen: false,
    leaveMeetingWarning: false,
    showConnectionStatus: true,
    hideParticipantTiles: false,
    startAudioMuted: false,
    startVideoMuted: false,
    isPreLaunch: true,
    showConnectionFailedModal: false,
    connectionFailedCountdownSeconds: 15,
    isBigScreenHolderMuted: false,
    speakerOnScreen: null,
    isTileView: false,
    idAvatarColorMap: new Map(),
    isInviteComponentVisible: false,
    isMutedNotify: false,
    moderatorName: "",
    muteButtonClick: false,
    cameraOptions: [],
    microphoneOptions: [],
    cameraDeviceId: [],
    micDeviceId: [],
    meetingModerator: [],
    uploadModal: false,
    documentSideBar: false,
    documentList: [],
    photos: [],
    documentLoading: false,
    documentMessage: "",
    wasAdded: false,
    docBadge: 0,
  })

  // const initialState = {
  //   isValid: true,
  //   sessionId: "",
  //   isModeratorAlert: true,
  //   recordingStatus: false,
  //   isModerator: false,
  //   isAudioMuted: false,
  //   isVideoMuted: false,
  //   isJoined: false,
  //   participantArray: [],
  //   participantListAudio: [],
  //   currentUser: {},
  //   participantsList: [],
  //   messages: [],
  //   message: "",
  //   unreadCount: 0,
  //   isScreenSharingOn: false,
  //   hasMoreThanOneParticipant: false,
  //   participantElement: [],
  //   isLocalStreaming: false,
  //   idTrackMap: new Map(),
  //   smallScreensMap: new Map(),
  //   idDisplayNameMap: new Map(),
  //   connectionFailed: false,
  //   screenShareOnBigScreen: false,
  //   leaveMeetingWarning: false,
  //   showConnectionStatus: true,
  //   hideParticipantTiles: false,
  //   startAudioMuted: false,
  //   startVideoMuted: false,
  //   isPreLaunch: true,
  //   showConnectionFailedModal: false,
  //   connectionFailedCountdownSeconds: 15,
  //   isBigScreenHolderMuted: false,
  //   speakerOnScreen: null,
  //   isTileView: false,
  //   idAvatarColorMap: new Map(),
  //   isInviteComponentVisible: false,
  //   isMutedNotify: false,
  //   moderatorName: "",
  //   muteButtonClick: false,
  //   cameraOptions: [],
  //   microphoneOptions: [],
  //   cameraDeviceId: [],
  //   micDeviceId: [],
  //   meetingModerator: [],
  //   uploadModal: false,
  //   documentSideBar: false,
  //   documentList: [],
  //   photos: [],
  //   documentLoading: false,
  //   documentMessage: "",
  //   wasAdded: false,
  //   docBadge: 0,
  // } 


  let isVideo = true;
  let thisconnection = null;
  let isJoined = false;
  let room = null;
  let localTracks = [];
  let isVideoAvailable = false;
  let isAudioAvailable = false;
  let myJitsiId;
  let displayName;
  let profilePicture;
  let participantsDetails = [];


  const getMediaDevices = (devices) => {
    devices.forEach((device, idx) => {
      if (device.kind === "videoinput") {         
        let cameraOptions = [...meeting.cameraOptions];
        console.log('cameraOptions =============> ',cameraOptions);
        cameraOptions = cameraOptions.filter((cam) => cam.value !== "");
        cameraOptions.push({
          label: device.label,
          value: device.deviceId,
          key: idx,
          kind: "videoinput",
        });

        setMeeting({ cameraOptions }, () => {
          setMeeting({
            cameraDeviceId: cameraOptions && cameraOptions[0],
          });
        }); 

        //setMeeting.cameraDeviceId(meeting.cameraOptions && meeting.cameraOptions[0])

      }
      if (device.kind === "audioinput") {
        let microphoneOptions = [...meeting.microphoneOptions];
        microphoneOptions = microphoneOptions.filter((mic) => mic.value !== "");
        microphoneOptions.push({
          label: device.label,
          value: device.deviceId,
          key: idx,
          kind: "audioinput",
        });
        setMeeting({ microphoneOptions }, () => {
          setMeeting({
            micDeviceId: microphoneOptions && microphoneOptions[0],
          });
        });

       //setMeeting.micDeviceId(meeting.microphoneOptions && meeting.microphoneOptions[0])
      }
    });
    handleDisposeTracks();
  };

  const handleDisposeTracks = (disposeType) => {

    console.log('disposeType ===================> ', disposeType);
    if (disposeType === "videoinput") {
      if (videoTrackLocal) videoTrackLocal.dispose();
    } else if (disposeType === "audioinput") {
      if (audioTrackLocal) audioTrackLocal.dispose();
    }
    for (let i = 0; i < localTracks.length; i++) {
      try {
        if (localTracks[i]) {
          localTracks[i].dispose();
        }
      } catch (error) {
        console.log("error while disposing::handleDisposeTracks" + error);
      }
    }
   createLocalTracks();
  };


  /** Create local audio and video tracks */
  function createLocalTracks() {
    const { cameraDeviceId, micDeviceId } = meeting;
    window.JitsiMeetJS.createLocalTracks({
      devices: ["audio", "video"],
      cameraDeviceId: cameraDeviceId,
      micDeviceId: micDeviceId,
    })
      .then(onLocalTracks)
      .catch((error) => {
        console.log(error);
        //this.writeLog("track-creation-event", error.message, "error");
        window.JitsiMeetJS.createLocalTracks({ devices: ["audio"] })
          .then(onLocalTracks)
          .catch((error) => {
            console.log(error);
            //this.writeLog("track-creation-event", error.message, "error");
            window.JitsiMeetJS.createLocalTracks({ devices: ["video"] })
              .then(onLocalTracks)
              .catch((error) => {
                console.log(error);
                //this.writeLog("track-creation-event", error.message, "error");
              });
          });
      });
  };


  /**
   * Handles local tracks.
   * @param tracks Array with JitsiTrack objects
   */
  var selfParticipantId = null;
  var streamCommandReceived = false;
  const onLocalTracks = async (tracks) => {
    // if (
    //   meeting.cameraOptions[0] === "" &&
    //   meeting.microphoneOptions[0] === ""
    // ) {
      window.JitsiMeetJS.mediaDevices.enumerateDevices(getMediaDevices);
    //}
    localTracks = tracks;

    for (let i = 0; i < localTracks.length; i++) {
      localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        (audioLevel) => console.log(`Audio Level local: ${audioLevel}`)
      );

      localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log("local track stopped")
      );
      localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
        (deviceId) =>
          console.log(`track audio output device was changed to ${deviceId}`)
      );

      if (localTracks[i].getType() === "video") {
        localTracks[i].addEventListener(
          window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          this.localVideoTrackMuteChangedEventHandler
        );
        this.videoTrackLocal = localTracks[i];
        this.setState({ videoTrackLocalState: localTracks[i] });
        this.attachTrack(this.videoTrackLocal, "prelaunch-localvideo");
        this.conditionalSwitchBigScreen(
          this.videoTrackLocal,
          selfParticipantId
        );
        //this.writeLog("local-video-track-created", "success", "info");
      } else {
        localTracks[i].addEventListener(
          window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          // eslint-disable-next-line no-loop-func
          () => {
            if (!this.state.isAudioMuted) {
              if (!this.state.muteButtonClick) {
                this.setState({ isAudioMuted: true, isMutedNotify: true }, () =>
                  setTimeout(() => {
                    this.setState({ isMutedNotify: false });
                  }, 5000)
                );
              }
            }
          }
        );
        audioTrackLocal = localTracks[i];
        const audio = `<audio autoplay='1' muted='true' id='localAudio0' />`;
        setMeeting({
          audio: audio,
          audioTrackLocalState: localTracks[i],
        });
        this.state.startAudioMuted && this.onAudioMuteStateChanged();
        this.audioTrackLocal.attach(document.getElementById(`localAudio0`));
        //this.writeLog("local-audio-track-created", "success", "info");
        //If user takes time to click on Camera/Microphone permission dialog,
        //and command start_recording has passed, it will not get audio track stream
        //so start recording again if command was received but wasn't able to start recording
       
      }

      //If user takes time to click on Camera/Microphone permission dialog,
      //then conference will be joined without tracks,
      //so adding tracks if conference has already joined.
      if (meeting.isJoined) {
        console.log("adding track on createlocaltrack event");
        room.addTrack(this.localTracks[i]).then(() => {
          // this.writeLog(
          //   `local-${this.localTracks[i].getType()}-track-pushed`,
          //   "in-createtrack-method",
          //   "info"
          // );
        });
      }
    }
  };



  /////Jitsi connections////////////// 
  window.JitsiMeetJS.init();

  window.JitsiMeetJS.setLogLevel(window.JitsiMeetJS.logLevels.ERROR);

  const options = {
    serviceUrl: 'https://dockermeet.memoriadev.com/http-bind',
    hosts: {
      domain: 'dockermeet.memoriadev.com',
      muc: 'conference.dockermeet.memoriadev.com'
    }
  }

  var connection = new window.JitsiMeetJS.JitsiConnection(null, null, options);

  window.JitsiMeetJS.mediaDevices.enumerateDevices(getMediaDevices);

  connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, onConnectionSuccess);
  connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_FAILED, onConnectionFailed);
  connection.addEventListener(window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnect);
  connection.connect();




  //For successfull Connection 
  function onConnectionSuccess() {
    const confOptions = {
      openBridgeChannel: true
    }
    room = connection.initJitsiConference("abcdef", confOptions);
    room.on(window.JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(
      window.JitsiMeetJS.events.connectionQuality.LOCAL_STATS_UPDATED,
      (statsObject) => {
        console.log(statsObject);
      }
    )
    room.on(
      window.JitsiMeetJS.events.connectionQuality.REMOTE_STATS_UPDATED,
      (id, statsObject) => {

        console.log(statsObject);
      }
    )
    room.on(window.JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);

    room.join();
    room.myUserId();
    console.log('userid' + room.myUserId());
    console.log('CONNECTION_ESTABLISHED');
  }

  //For Failed Connection 
  function onConnectionFailed() {
    console.log('CONNECTION_FAILED');
  }

  //For disconnect Connection 
  function disconnect() {
    console.log('CONECTION_DISCONNECTED');
  }

  //For Conference Joined
  function onConferenceJoined() {
    console.log('CONFERENCE_JOINED');
  }

  let hasOtherParticipantSharedScreen = false;
  let videoTrackLocal = null;
  let audioTrackLocal = null;

  // function onRemoteTrack(){  
  //   console.log('remotetrack');
  // };

  //For RemoteTract 
  function onRemoteTrack(track) {
    const participant = track.getParticipantId();
    const id = participant + track.getType();
    if (track.isLocal()) {
      let selfParticipantId = null;
      selfParticipantId = participant;
      if (track.getType() === "video") {
        //const newVideo = `<video className='remote-video-styles video-flip small-screen' poster=${cameraOffPoster}  autoplay id='${id}' />`;
        const newVideo = `<video className='remote-video-styles video-flip small-screen' autoplay id='${id}' />`;

        // setState({ localSmallScreen: newVideo }, () => {        
        //   if (videoTrackLocal) {
        //     attachTrack(videoTrackLocal, id);
        //   }
        // }); 

        setMeeting.localSmallScreen(newVideo)

        if (videoTrackLocal) {
          attachTrack(videoTrackLocal, id);
        }

      }
      return;
    }
    console.log("remote track added" + track);
    // // setState({ hasMoreThanOneParticipant: true });
    setMeeting.hasMoreThanOneParticipant(true);

    // setState({
    //   participantArray: [initialState.participantArray, participant],
    // });

    let participant_arr = meeting.participantArray;
    participant_arr = participant_arr.push(participant);
    setMeeting.participantArray(participant_arr);

    track.addEventListener(
      window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      (audioLevel) => console.log("Audio Level remote: ", audioLevel)
    );
    track.addEventListener(
      window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
      () => console.log('remote track muted'));
    track.addEventListener(
      window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
      () => console.log("remote track stoped")
    );
    track.addEventListener(
      window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      (deviceId) =>
        console.log("track audio output device was changed to ", deviceId)
    );

    let remoteUser = this.room.getParticipantById(participant)._displayName;
    if (track.getType() === "video") {
      setTimeout(() => {
        track.addEventListener(
          window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          this.remoteVideoTrackMuteChangedEventHandler
        );
        let map = meeting.idTrackMap ? meeting.idTrackMap : new Map();
        map.set(participant, track);
        // setState({ idTrackMap: map });
        setMeeting.idTrackMap(map);

        detachTrack(videoTrackLocal, "localVideo1");

        if (!track.muted) {
          let newVideo = `<video className= 'remote-video-styles small-screen' autoplay id='${id}' />`;
          let smallScreensMap = meeting.smallScreensMap;
          smallScreensMap.set(participant, newVideo);
          participant &&
            // this.setState(
            //   { smallScreensMap: smallScreensMap },
            //   () => document.getElementById(id) && attachTrack(track, id)
            // );

            meeting.smallScreensMap(smallScreensMap)
            document.getElementById(id) && attachTrack(track, id)
        }

        track.videoType === "camera"
          ? this.setState(
            { screenShareOnBigScreen: false, hideParticipantTiles: false },
            () => document.getElementById(id) && attachTrack(track, id)
          )
          : this.setState(
            { screenShareOnBigScreen: true, hideParticipantTiles: true },
            () => {
              //this.pinParticipant(participant);
              hasOtherParticipantSharedScreen = true;
            }
          );

        conditionalSwitchBigScreen(track, participant);
        // writeLog(
        //   `remote-${track.videoType}-track`,
        //   `added-for-${remoteUser}`,
        //   "info"
        // );
      }, 1000);
    } else {
      track.addEventListener(
        window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        (track) => {
          console.log(
            "audio muted for user " +
            meeting.idDisplayNameMap.get(track.ownerEndpointId)
          );
        }
      );

      let map = meeting.idAudioTrackMap
        ? meeting.idAudioTrackMap
        : new Map();
      map.set(participant, track);
      this.setState({ idAudioTrackMap: map });
      const newAudio = `<audio autoplay='1' id='${id}' />`;
      // this.setState({
      //   participantListAudio: [...initialState.participantListAudio, newAudio],
      // });
      
      let audio_arr = meeting.participantListAudio;
      audio_arr.push(newAudio);
      setMeeting.participantListAudio(audio_arr);




      //this.writeLog("remote-audio-track", `added-for-${remoteUser}`, "info");
      track.attach(document.getElementById(id));
    }
  }

  //For conditional Switch Big screen
  function conditionalSwitchBigScreen(track, id) {
    if (this.pinnedParticipant) {
      // pinParticipant(this.pinnedParticipant);
      return;
    }
    switchBigScreen(track, id);
  }

  //For Switch Big screen
  function switchBigScreen(track, id) {
    let participant = track ? track.getParticipantId() : null;
    try {
      let prevTrack =
        this.state.speakerOnScreen === this.selfParticipantId
          ? this.videoTrackLocal
          : this.state.idTrackMap.get(this.state.speakerOnScreen);
      prevTrack && this.detachTrack(prevTrack, "localVideo1");

      if (
        (id === this.selfParticipantId && this.state.isVideoMuted) ||
        !track ||
        track.muted
      ) {
        this.setState({ isBigScreenHolderMuted: true });
      } else if (track) {
        track && track.videoType === "camera"
          ? this.setState({ screenShareOnBigScreen: false })
          : this.setState({ screenShareOnBigScreen: true });
        this.setState({ isBigScreenHolderMuted: false }, () => {
          try {
            track && this.attachTrack(track, "localVideo1");
            this.room.selectParticipant(id);
          } catch (error) {
            //Honeybadger.notify(error)
            console.log("couldn't select for high quality video");
          }
        });
      }

      this.setState({ speakerOnScreen: id }, () =>
        this.state.speakerOnScreen === this.selfParticipantId
          ? this.setState({ hasMoreThanOneParticipant: false })
          : this.setState({ hasMoreThanOneParticipant: true })
      );
      this.state.isTileView && this.tileAttachVideo();
    } catch (error) {
      console.log(error.message);
      //Honeybadger.notify(error)
      // this.writeLog(
      //   "switch-big-screen",
      //   "Failed to switch big screen for" + participant,
      //   "error"
      // );
    }
  }

  //WriteLog
  // function writeLog(event, log, type) {
  //   let logEntry = {
  //     email: meeting.currentUser.email,
  //     event,
  //     log,
  //     type,
  //   };
  //   // try {
  //   //   logEventApi(this.props.match.params.meetingId, logEntry);
  //   // } catch (error) {
  //   //   Honeybadger.notify(error)
  //   //   console.log(error);
  //   // }
  // }

  //adding html video container only if its not already present in containers list
  const attachTrack = async (track, id) => {
    track && detachTrack(track, id);
    track && (await track.attach(document.getElementById(id)));
  }

  //removing all the html video elements from track's container list
  const detachTrack = async (track, id) => {
    if (track && track.containers) {
      track.containers.forEach((container) => {
        if (container && container.id === id) {
          track.detach(document.getElementById(id));
        }
      });
    }
  };





  return (
    <>
      <h2>MeetingPage</h2>
      <div>
        {/* <video
          autoPlay="1"
          id="localVideo1"
        /> */}
        {/* <video className='remote-video-styles video-flip' autoPlay="1" id='aa' />                                       */}
      </div>


    </>
  )
}


export default MeetingPage;
