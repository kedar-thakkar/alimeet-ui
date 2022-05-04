import { AppAside } from "@coreui/react";
import React, { Fragment, Component } from "react";
import { debounce } from "throttle-debounce";
import logo from "../../../assets/img/brand/Memoria-white.svg";
import recordOff from "../../../assets/img/brand/record.svg";
import screenshareOff from "../../../assets/img/brand/screen-share-24-px.svg";
import tileViewOff from "../../../assets/img/brand/menu.svg";
import message from "../../../assets/img/brand/message.svg";
import question from "../../../assets/img/brand/question.svg";
import audioOn from "../../../assets/img/brand/group.svg";
import videoOn from "../../../assets/img/brand/videocam-24-px.svg";
import participant from "../../../assets/img/brand/user.svg";
import audioOff from "../../../assets/img/brand/audio-off.svg";
import videoOff from "../../../assets/img/brand/video-off.svg";
import recordOn from "../../../assets/img/brand/recode-on.svg";
import screenShareOn from "../../../assets/img/brand/screen-on.svg";
import tileViewOn from "../../../assets/img/brand/tile-view-on.svg";
import documentOff from "../../../assets/img/brand/document.png";
import send_btn from "../../../assets/img/send_btn.png";
import phoneCallEnd from "../../../assets/img/brand/phone-call-end.svg";
import firebaseconfig from "../../../firebaseconfig";
import Honeybadger from '@honeybadger-io/js'

import {
  getMeetingById,
  postChat,
  setChatFlag,
  logEventApi,
  getAccountId,
  getDocumentList,
  deleteDocumentById,
  // addDocument,
  addFiles,
} from "../../../services/MeetingService";
import {
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
import ChatBubble from "../../../containers/ChatBubble";
import Participant from "../../../containers/Participant";
import DocumentView from "../../../containers/DocumentView";
import { RecordRTC, MediaStreamRecorder } from "recordrtc"; // eslint-disable-line no-unused-vars
import {
  shortenString,
  isBrowserChrome,
  getLoggedInUserObject,
  getLoggedInGuestUserObject,
  getRandomColorHex,
  isBrowserEdge,
  isBrowserFirefox,
  isBrowserSafari,
} from "../../../helpers/utils";
import moment from "moment";
import ProfileContext from "../../../context/profileContext";
import ConnectionQualityCard from "./ConnectionQualityCard";
import { detect } from "detect-browser";
import cameraOffPoster from "../../../assets/img/camera-off-poster.png";
import PrelaunchPage from "./PrelaunchPage";
import ReactLoading from "react-loading";
import InviteUser from "./InviteUser";
import { getUserAccount } from "../../../services/LoginService";
import TileView from "../../TileView/TileView";
import UploadImage from "../FileUpload/FileUpload";

class MeetingPage extends Component {
  static contextType = ProfileContext;
  constructor() {
    super();
    this.state = this.initialState;
    this.messageList = React.createRef();
    this.getResultDebounced = debounce(300, this.getResult);
  }

  initialState = {
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
  };

  initOptions = {
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

    disableSimulcast: false,
  };

  options = {
    hosts: {
      domain: process.env.REACT_APP_JITSI_ENDPOINT,
      muc: "conference." + process.env.REACT_APP_JITSI_ENDPOINT, // FIXME: use XEP-0030
    },
    bosh: `https://${process.env.REACT_APP_JITSI_ENDPOINT}/http-bind`, // FIXME: use xep-0156 for that

    // The name of client node advertised in XEP-0115 'c' stanza
    clientNode: "http://jitsi.org/jitsimeet",
  };

  confOptions = {
    openBridgeChannel: true,
    recordingType: File,
  };

  isVideo = true;
  thisconnection = null;
  isJoined = false;
  room = null;
  localTracks = [];
  isVideoAvailable = false;
  isAudioAvailable = false;
  myJitsiId;
  displayName;
  profilePicture;
  participantsDetails = [];

  componentDidMount = async () => {
    const moderator =
      this.props &&
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.moderator;
    if (moderator) {
      this.setState({
        meetingModerator: moderator,
      });
    }
    document.addEventListener("click", this.handleCloseContextMenu);
    this.initialConnectionFailedCountdownSeconds = this.state.connectionFailedCountdownSeconds;
    await this.getMeeting(this.props.match.params.meetingId);

    if (this.meeting) {
      this.meeting.meetingUser.forEach((user) => {
        this.participantsDetails.push(user.users);
      });
    }

    if (this.meeting && this.meeting.hasEnded) {
      if (JSON.parse(localStorage.getItem("guestUser")))
        this.props.history.push("/guest-meeting-ended");
      else this.props.history.push("/meeting-ended");
    }

    if (!window.JitsiMeetJS) {
      return;
    }

    if (
      !(
        isBrowserChrome() ||
        isBrowserSafari() ||
        isBrowserEdge() ||
        isBrowserFirefox()
      )
    ) {
      this.setState({ disableJoinButton: true, isBrowserWarning: true });
    }

    window.JitsiMeetJS.init(this.initOptions);
    this.connection = new window.JitsiMeetJS.JitsiConnection(
      null,
      null,
      this.options
    );
    window.JitsiMeetJS.mediaDevices.enumerateDevices(this.getMediaDevices);

    this.connection.addEventListener(
      window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      this.onConnectionSuccess
    );
    this.connection.addEventListener(
      window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
      this.onConnectionFailed
    );
    this.connection.addEventListener(
      window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      this.disconnect
    );

    window.JitsiMeetJS.mediaDevices.addEventListener(
      window.JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      this.onDeviceListChanged
    );
    window.JitsiMeetJS.setLogLevel(window.JitsiMeetJS.logLevels.ERROR);

    const browser = detect();
    getLoggedInUserObject()
      ? this.setState({ currentUser: getLoggedInUserObject() }, () => {
        this.displayName = this.state.currentUser.userName
          ? this.state.currentUser.userName
          : this.state.currentUser.email;
        const userDetail = this.context;
        this.profilePicture = userDetail.profilePic;
        this.writeLog(
          "environment-check",
          `${browser.name}_${browser.version}_${browser.os}`,
          "info"
        );
      })
      : this.setState(
        {
          currentUser: getLoggedInGuestUserObject(),
          disableJoinButton: true,
          isGuest: true,
        },
        () => {
          this.displayName = this.state.currentUser.email;
          const authenticateUser = localStorage.getItem("accountName");
          console.log("registering guest user intercom");
          try {
            window.Intercom("boot", {
              app_id: "dxhy85mi",
              name: this.state.currentUser.email, // Full name
              email: this.state.currentUser.email, // Email address
              account: authenticateUser,
              is_guest: authenticateUser ? false : true, //tracks if guest user or not
              environment: process.env.REACT_APP_ENVIRONMENT_NAME, //should be Production or Development
            });
            this.writeLog(
              "environment-check",
              `${browser.name}_${browser.version}_${browser.os}`,
              "info"
            );
            this.eventSource = new EventSource(
              process.env.REACT_APP_API_SERVER_BASE_URL +
              "/api/accounts/" +
              getAccountId() +
              "/meetings/" +
              this.meeting.meetingId +
              "/sse-alive-connections?authorization=" +
              localStorage.getItem("authorization").slice(7)
            );
            this.eventSource.onmessage = (messageEvent) =>
              messageEvent.data &&
              parseInt(messageEvent.data) > 0 &&
              this.setState({ disableJoinButton: false }, () =>
                this.eventSource.close()
              );
          } catch (error) {
            Honeybadger.notify(error)
            console.log(
              "error while registering guest user intercom, cause: " + error
            );
          }
        }
      );

    // this.meeting && !this.meeting.hasEnded && this.createLocalTracks();
    firebaseconfig
      .database()
      .ref("local/messages/")
      .orderByChild("mettingId")
      .equalTo(this.props.match.params.meetingId)
      .on("value", (resp) => {
        const messages = this.getMessageData(resp);
        this.setState({ messages }, () => this.scrollChatToBottom());
      });
    firebaseconfig
      .database()
      .ref("local/user-messages/")
      .on("value", (resp) => {
        this.getRecordingFlag(resp);
      });
    firebaseconfig
      .database()
      .ref("local/user-messages/")
      .on("value", (resp) => {
        this.getDocumentData(resp);
      });
    let userDocumentRef = firebaseconfig
      .database()
      .ref("local/user-messages")
      .child(this.props.match.params.meetingId);
    userDocumentRef.update({
      DocumentBadges: { documentListBadge: this.state.documentList.length },
    });
    this.getdocument();
  };
  eventSource;

  getDocumentData = (meetingData) => {
    const allMeeting = meetingData.val();
    if (allMeeting) {
      const currentMeeting = allMeeting[this.props.match.params.meetingId];
      if (
        currentMeeting &&
        currentMeeting.DocumentBadges &&
        currentMeeting.DocumentBadges.documentListBadge !== this.state.docBadge
      ) {
        this.getdocument();
        this.setState({
          docBadge: this.state.documentList.length,
        });
      }
    }
  };

  getProfilePicture = (user) => {
    const selectedParticipant = this.participantsDetails.find(
      (participant) =>
        participant.email === user || participant.userName === user
    );
    const avtarLink = selectedParticipant && selectedParticipant.avatar_url;
    if (avtarLink) {
      return avtarLink;
    } else {
      return;
    }
  };

  getRecordingFlag = (meetingData) => {
    const allMeeting = meetingData.val();
    if (allMeeting) {
      const currentMeeting = allMeeting[this.props.match.params.meetingId];
      if (
        currentMeeting &&
        currentMeeting.meetingFlags &&
        currentMeeting.meetingFlags.isRecordingStarted
      ) {
        this.streamCommandReceived = true;
        this.startLocalStreaming();
      } else if (
        currentMeeting &&
        currentMeeting.meetingFlags &&
        !currentMeeting.meetingFlags.isRecordingStarted
      ) {
        this.stopLocalStreaming();
      }
    }
  };

  getMessageData = (messages) => {
    const resArr = [];
    messages.forEach((childSnapshot) => {
      const item = childSnapshot.val();
      delete item.mettingId;
      resArr.push(item);
    });
    if (resArr.length > 0) {
      const lastMessage = resArr[resArr.length - 1];
      if (lastMessage.sender !== this.displayName) {
        this.setState((prevState) => ({
          unreadCount: prevState.unreadCount + 1,
        }));
      }
    }
    return resArr;
  };

  getMediaDevices = (devices) => {
    devices.forEach((device, idx) => {
      if (device.kind === "videoinput") {
        let cameraOptions = [...this.state.cameraOptions];
        cameraOptions = cameraOptions.filter((cam) => cam.value !== "");
        cameraOptions.push({
          label: device.label,
          value: device.deviceId,
          key: idx,
          kind: "videoinput",
        });
        this.setState({ cameraOptions }, () => {
          this.setState({
            cameraDeviceId: cameraOptions && cameraOptions[0],
          });
        });
      }
      if (device.kind === "audioinput") {
        let microphoneOptions = [...this.state.microphoneOptions];
        microphoneOptions = microphoneOptions.filter((mic) => mic.value !== "");
        microphoneOptions.push({
          label: device.label,
          value: device.deviceId,
          key: idx,
          kind: "audioinput",
        });
        this.setState({ microphoneOptions }, () => {
          this.setState({
            micDeviceId: microphoneOptions && microphoneOptions[0],
          });
        });
      }
    });
    this.handleDisposeTracks();
  };

  handleMediaDevices = (selectedOptions) => {
    const { kind } = selectedOptions;
    if (kind === "audioinput") {
      this.setState({ micDeviceId: selectedOptions }, () => {
        this.handleDisposeTracks("audioinput");
      });
    } else if (kind === "videoinput") {
      this.setState({ cameraDeviceId: selectedOptions }, () => {
        this.handleDisposeTracks("videoinput");
      });
    }
  };

  handleDisposeTracks = (disposeType) => {
    if (disposeType === "videoinput") {
      if (this.videoTrackLocal) this.videoTrackLocal.dispose();
    } else if (disposeType === "audioinput") {
      if (this.audioTrackLocal) this.audioTrackLocal.dispose();
    }
    for (let i = 0; i < this.localTracks.length; i++) {
      try {
        if (this.localTracks[i]) {
          this.localTracks[i].dispose();
        }
      } catch (error) {
        Honeybadger.notify(error)
        console.log("error while disposing::handleDisposeTracks" + error);
      }
    }
    this.meeting && !this.meeting.hasEnded && this.createLocalTracks();
  };

  /** Create local audio and video tracks */
  createLocalTracks = () => {
    const { cameraDeviceId, micDeviceId } = this.state;
    window.JitsiMeetJS.createLocalTracks({
      devices: ["audio", "video"],
      cameraDeviceId: cameraDeviceId.value,
      micDeviceId: micDeviceId.value,
    })
      .then(this.onLocalTracks)
      .catch((error) => {
        Honeybadger.notify(error)
        console.log(error);
        this.writeLog("track-creation-event", error.message, "error");
        window.JitsiMeetJS.createLocalTracks({ devices: ["audio"] })
          .then(this.onLocalTracks)
          .catch((error) => {
            Honeybadger.notify(error)
            console.log(error);
            this.writeLog("track-creation-event", error.message, "error");
            window.JitsiMeetJS.createLocalTracks({ devices: ["video"] })
              .then(this.onLocalTracks)
              .catch((error) => {
                Honeybadger.notify(error)
                console.log(error);
                this.writeLog("track-creation-event", error.message, "error");
              });
          });
      });
  };

  setFlagChangeClick = () => {
    this.setState({
      muteButtonClick: true,
    });
  };

  setStartAudioMuted = () =>
    this.setState(
      {
        startAudioMuted: !this.state.startAudioMuted,
      },
      () => this.onAudioMuteStateChanged()
    );

  setStartVideoMuted = () =>
    this.setState(
      {
        startVideoMuted: !this.state.startVideoMuted,
      },
      () => this.onVideoMuteStateChanged()
    );

  connectMeeting = () => {
    this.setState({ isPreLaunch: false }, () => {
      this.conditionalSwitchBigScreen(this.videoTrackLocal, null);
      this.videoTrackLocal &&
        this.attachTrack(
          this.videoTrackLocal,
          this.selfParticipantId + "video"
        );
    });
    this.meeting && !this.meeting.hasEnded && this.connection.connect();
  };

  cancelLaunch = () =>
    this.props.history.push("/meetings/" + this.meeting.meetingId);

  toggleParticipantTiles = () =>
    this.setState({ hideParticipantTiles: !this.state.hideParticipantTiles });

  toggleBigScreenAvatar = (track) => {
    if (this.state.speakerOnScreen === this.myJitsiId) {
      this.setState(
        { isBigScreenHolderMuted: this.state.isVideoMuted },
        () =>
          this.state.isVideoMuted &&
          this.conditionalSwitchBigScreen(this.videoTrackLocal, this.myJitsiId)
      );
    } else if (this.state.speakerOnScreen === track.ownerEndpointId) {
      this.setState(
        { isBigScreenHolderMuted: track.muted },
        () =>
          !track.muted &&
          this.conditionalSwitchBigScreen(track, track.ownerEndpointId)
      );
    }
  };

  conditionalSwitchBigScreen = (track, id) => {
    if (this.pinnedParticipant) {
      this.pinParticipant(this.pinnedParticipant);
      return;
    }
    this.switchBigScreen(track, id);
  };

  switchBigScreen = (track, id) => {
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
            Honeybadger.notify(error)
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
      Honeybadger.notify(error)
      this.writeLog(
        "switch-big-screen",
        "Failed to switch big screen for" + participant,
        "error"
      );
    }
  };

  //adding html video container only if its not already present in containers list
  attachTrack = async (track, id) => {
    track && this.detachTrack(track, id);
    track && (await track.attach(document.getElementById(id)));
  };

  //removing all the html video elements from track's container list
  detachTrack = (track, id) => {
    if (track && track.containers) {
      track.containers.forEach((container) => {
        if (container && container.id === id) {
          track.detach(document.getElementById(id));
        }
      });
    }
  };

  addClassToElementClassList = (element, styleClass) =>
    element.classList.add(styleClass);

  removeClassFromElementClassList = (element, styleClass) =>
    element.classList.remove(styleClass);

  toggleBorder = (id) => {
    try {
      let prevHtmlElement = this.pinnedParticipant
        ? document.getElementById(this.pinnedParticipant + "video")
        : null;
      let nextHtmlElement = document.getElementById(id + "video");
      if (prevHtmlElement) {
        this.removeClassFromElementClassList(
          prevHtmlElement,
          "pinned-participant-border"
        );
        this.addClassToElementClassList(
          prevHtmlElement,
          "un-pinned-participant-border"
        );
      }
      this.removeClassFromElementClassList(
        nextHtmlElement,
        "un-pinned-participant-border"
      );
      this.addClassToElementClassList(
        nextHtmlElement,
        "pinned-participant-border"
      );
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error.message);
    }
  };

  pinnedParticipant = null;

  pinParticipant = (id) => {
    try {
      this.toggleBorder(id);
      let track =
        id === this.selfParticipantId
          ? !this.state.isScreenSharingOn
            ? this.videoTrackLocal
            : this.desktopTrackLocal
          : this.state.idTrackMap.get(id);

      this.switchBigScreen(track, id);

      this.pinnedParticipant = id;
      console.log("pinning " + this.pinnedParticipant);
      this.writeLog(
        "Pin-participant",
        "Pinning participant with id" + id,
        "info"
      );
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error.message);
      this.writeLog(
        "Pin-participant",
        "Failed to pin participant with id" + id,
        "error"
      );
    }
  };

  unPinParticipant = () => {
    try {
      let track = this.state.idTrackMap.get(this.lastDominantUser);
      this.pinnedParticipant !== this.lastDominantUser &&
        track &&
        this.switchBigScreen(track, this.lastDominantUser);

      let htmlElement = document.getElementById(
        this.pinnedParticipant + "video"
      );
      this.pinnedParticipant = null;
      this.removeClassFromElementClassList(
        htmlElement,
        "pinned-participant-border"
      );
      this.addClassToElementClassList(
        htmlElement,
        "un-pinned-participant-border"
      );
      this.writeLog(
        "UnPin-participant",
        "Un-Pinning participant with id" + this.pinnedParticipant,
        "info"
      );
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error.message);
      this.writeLog(
        "UnPin-participant",
        "Failed to un-pin participant with id" + this.pinnedParticipant,
        "error"
      );
    }
  };

  togglePinParticipant = (e) => {
    try {
      let elementId = e.target && e.target.id;
      let jitsiId = elementId.slice(0, -5);
      this.pinnedParticipant === jitsiId
        ? this.unPinParticipant()
        : this.pinParticipant(jitsiId);
      this.setState({ isTileView: false });
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error.message);
    }
  };

  meeting = {};

  getMeeting = async (meetingId) => {
    try {
      if (
        localStorage.getItem("accountId") !== this.props.match.params.accountId
      ) {
        let loginResponse = await getUserAccount(
          this.props.match.params.accountId,
          getLoggedInUserObject().userUid
        );

        //Replacing logged in user info
        localStorage.setItem(
          "memoriaUser",
          JSON.stringify(loginResponse.data.users)
        );
        localStorage.setItem(
          "authorization",
          loginResponse.headers.authorization
        );
        localStorage.setItem("accountId", loginResponse.data.users.accountId);
        localStorage.setItem("accountName", loginResponse.data.accountName);
        localStorage.setItem(
          "x-authorization",
          loginResponse.headers["x-authorization"]
        );
      }
      this.meeting = await getMeetingById(meetingId);
      this.setState({ meeting: this.meeting, isMeetingLoaded: true });
    } catch (error) {
      Honeybadger.notify(error)
      /** TODO handle errors by status codes and appropriate error messages/actions */
      this.props.history.push("/404");
      console.log(error);
    }
  };

  /**
   * Handles local tracks.
   * @param tracks Array with JitsiTrack objects
   */
  selfParticipantId = null;
  streamCommandReceived = false;
  onLocalTracks = async (tracks) => {
    if (
      this.state.cameraOptions[0].value === "" &&
      this.state.microphoneOptions[0].value === ""
    ) {
      window.JitsiMeetJS.mediaDevices.enumerateDevices(this.getMediaDevices);
    }
    this.localTracks = tracks;

    for (let i = 0; i < this.localTracks.length; i++) {
      this.localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        (audioLevel) => console.log(`Audio Level local: ${audioLevel}`)
      );

      this.localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log("local track stopped")
      );
      this.localTracks[i].addEventListener(
        window.JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
        (deviceId) =>
          console.log(`track audio output device was changed to ${deviceId}`)
      );

      if (this.localTracks[i].getType() === "video") {
        this.localTracks[i].addEventListener(
          window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          this.localVideoTrackMuteChangedEventHandler
        );
        this.videoTrackLocal = this.localTracks[i];
        this.setState({ videoTrackLocalState: this.localTracks[i] });
        this.attachTrack(this.videoTrackLocal, "prelaunch-localvideo");
        this.conditionalSwitchBigScreen(
          this.videoTrackLocal,
          this.selfParticipantId
        );
        this.writeLog("local-video-track-created", "success", "info");
      } else {
        this.localTracks[i].addEventListener(
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
        this.audioTrackLocal = this.localTracks[i];
        const audio = `<audio autoplay='1' muted='true' id='localAudio0' />`;
        this.setState({
          audio: audio,
          audioTrackLocalState: this.localTracks[i],
        });
        this.state.startAudioMuted && this.onAudioMuteStateChanged();
        this.audioTrackLocal.attach(document.getElementById(`localAudio0`));
        this.writeLog("local-audio-track-created", "success", "info");
        //If user takes time to click on Camera/Microphone permission dialog,
        //and command start_recording has passed, it will not get audio track stream
        //so start recording again if command was received but wasn't able to start recording
        if (this.streamCommandReceived && !this.state.isLocalStreaming) {
          await this.startLocalStreaming();
        }
      }

      //If user takes time to click on Camera/Microphone permission dialog,
      //then conference will be joined without tracks,
      //so adding tracks if conference has already joined.
      if (this.isJoined) {
        console.log("adding track on createlocaltrack event");
        this.room.addTrack(this.localTracks[i]).then(() => {
          this.writeLog(
            `local-${this.localTracks[i].getType()}-track-pushed`,
            "in-createtrack-method",
            "info"
          );
        });
      }
    }
  };
  isOrganizer = () =>
    this.meeting.createdBy === this.state.currentUser.email ? "true" : "false";
  meetingStatusSocket;
  showConnectionStatus;
  /**
   * Function is executed when the conference is joined
   */
  onConferenceJoined = async () => {
    console.log("conference joined!!!");
    try {
      this.meetingStatusSocket = new WebSocket(
        process.env.REACT_APP_WEBSOCKET_BASE_URL +
        "meetingstatus?" +
        "acc_id=" +
        this.meeting.accountId +
        "&meeting_id=" +
        this.meeting.meetingId +
        "&user=" +
        this.state.currentUser.email +
        "&isorganizer=" +
        this.isOrganizer() +
        "&endtime=" +
        this.meeting.endTime +
        "&token=" +
        localStorage.getItem("authorization") +
        "&refresh=" +
        localStorage.getItem("x-authorization")
      );

      this.meetingStatusSocket.onclose = (event) => {
        console.log("WebSocket is closed:", event);
        this.writeLog(
          "meetingStatusSocket-connection-closed",
          "WebSocket connection closed",
          "info"
        );
      };

      this.meetingStatusSocket.onerror = (event) => {
        console.log("WebSocket error observed:", event);
        this.recorder = null;
        this.writeLog(
          "meetingStatusSocket-connection-failed",
          "WebSocket error observed",
          "error"
        );
      };
      this.meetingStatusSocket.onopen = (event) => {
        setTimeout(() => this.meetingStatusSocket.send("ping"), 5000);
        this.writeLog(
          "meetingStatusSocket-connection-success",
          "WebSocket connection successful",
          "info"
        );
      };
      this.meetingStatusSocket.onmessage = (message) => {
        setTimeout(() => this.meetingStatusSocket.send("ping"), 20000);
      };
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error.message);
    }

    this.myJitsiId = this.room.myUserId();
    this.isJoined = true;

    //Create localSmallScreen image element, once track is available, it will be switched with video element and track will be attached to same.
    let imageElement = this.getProfilePicture(this.state.currentUser.email)
      ? `<img src=${this.getProfilePicture(
        this.state.currentUser.email
      )} alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
      }' />`
      : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=7b79b3&color=fff&name=${this.state.currentUser.email
      }" alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
      }'/>`;

    this.setState({
      speakerOnScreen: this.myJitsiId,
      localSmallScreen: imageElement,
      isJoined: true,
      showConnectionStatus: true,
    });

    this.showConnectionStatus = setTimeout(() => {
      this.setState({ showConnectionStatus: false });
    }, 1000);
    this.writeLog("conference-joined", `with-id-${this.myJitsiId}`, "info");
    if (this.videoTrackLocal && !this.videoTrackLocal.isMuted()) {
      await this.room
        .addTrack(this.videoTrackLocal)
        .then((track) => {
          this.writeLog(
            "local-video-track-pushed",
            "in-onConferenceJoined",
            "info"
          );
          console.log("Local video track pushed in room");
        })
        .catch((error) => {
          Honeybadger.notify(error)
          console.log(error);
        });
    }
    if (this.audioTrackLocal && !this.audioTrackLocal.isMuted()) {
      await this.room
        .addTrack(this.audioTrackLocal)
        .then((track) => {
          this.writeLog(
            "local-audio-track-pushed",
            "in-onConferenceJoined",
            "info"
          );
          console.log("Local audio track pushed in room");
        })
        .catch((error) => {
          Honeybadger.notify(error)
          console.log(error);
        });
    }
  };

  /**
   * This function is called when connection is established successfully
   */
  lastDominantUser = null;
  connectionStats = null;
  connectionBandwidthQuality = null;

  onConnectionSuccess = () => {
    const roomName =
      "account_" + this.meeting.accountId + "_" + this.meeting.meetingId;
    this.room = this.connection.initJitsiConference(roomName, this.confOptions);
    this.room.on(
      window.JitsiMeetJS.events.conference.TRACK_ADDED,
      this.onRemoteTrack
    );
    this.room.on(
      window.JitsiMeetJS.events.connectionQuality.LOCAL_STATS_UPDATED,
      (statsObject) => {
        //TODO Get local connection quality status, info is crucial in case we want to show our own connection quality with Jitsi server
        let map = this.state.connectionQualityMap
          ? this.state.connectionQualityMap
          : new Map();
        statsObject.name = this.displayName;
        this.connectionBandwidthQuality = statsObject;
        map.set(this.selfParticipantId + "video", statsObject);
        this.setState({ connectionQualityMap: map });
      }
    );
    this.room.on(
      window.JitsiMeetJS.events.connectionQuality.REMOTE_STATS_UPDATED,
      (id, statsObject) => {
        //TODO Get remote user's connection quality status, info is crucial in case we want to show individual user's bandwidth
        let map = this.state.connectionQualityMap
          ? this.state.connectionQualityMap
          : new Map();
        let userMap = this.state.idDisplayNameMap
          ? this.state.idDisplayNameMap
          : new Map();
        statsObject.name = userMap.get(id);
        map.set(id + "video", statsObject);
        this.setState({ connectionQualityMap: map });
      }
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED,
      this.onDominantSpeakerChange
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.TRACK_REMOVED,
      this.onTrackRemoved
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      this.onConferenceJoined
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.USER_JOINED,
      this.onUserJoined
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.USER_LEFT,
      this.onUserLeft
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
      (track) => this.onAudioMuteStateChanged
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.USER_ROLE_CHANGED,
      this.onUserRoleChanged
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
      (userID, displayName) => console.log(userID - displayName)
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
      (userID, audioLevel) => console.log(userID - audioLevel)
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
      () => console.log(this.room.getPhoneNumber() - this.room.getPhonePin())
    );
    this.room.on(
      window.JitsiMeetJS.events.conference.CONNECTION_INTERRUPTED,
      () => {
        console.log("CONNECTION INTERRUPTED");
        this.writeLog(
          "connection-interrupted",
          "connection-interrupted",
          "error"
        );
      }
    );

    // this.room.addCommandListener("localstream", async (data) => {
    //   if (data.value) {
    //     this.streamCommandReceived = true;
    //     await this.startLocalStreaming();
    //   } else {
    //     this.stopLocalStreaming();
    //   }
    // });

    this.room.join();

    console.log(
      this.state.currentUser.userName || this.state.currentUser.email
    );

    /** Sending logged in User's username to Jitsi-meet */
    if (
      !this.state.currentUser ||
      typeof this.state.currentUser.userName == "undefined" ||
      this.state.currentUser.userName === ""
    )
      this.room.setDisplayName(this.state.currentUser.email);
    else this.room.setDisplayName(this.state.currentUser.userName);
  };

  /* Fired when ON_TRACK_REMOVED event occurs */
  onTrackRemoved = (track) => {
    let map = this.state.idTrackMap;
    let id = track.getParticipantId();
    if (map && track.getType() === "video") {
      map.delete(id);
      this.setState({ idTrackMap: map });
      if (this.state.speakerOnScreen === id || track.videoType === "desktop") {
        this.setState({ hideParticipantTiles: false });

        this.unPinParticipant(this.pinnedParticipant);
        this.hasOtherParticipantSharedScreen = false;

        let map = this.state.smallScreensMap;
        let imageElement = this.getProfilePicture(
          this.state.idDisplayNameMap.get(id)
        )
          ? `<img src=${this.getProfilePicture(
            this.state.idDisplayNameMap.get(id)
          )} alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
          }' />`
          : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=${this.state.idAvatarColorMap.get(
            id
          )}&color=fff&name=${this.state.idDisplayNameMap.get(
            id
          )}" alt="Smiley face" className="small-screen" id='${id + "video"}'/>`;
        map.set(id, imageElement);
        id && this.setState({ smallScreensMap: map });
        this.switchScreenIfNotOnlyUser();
      }
    }
    map = this.state.idAudioTrackMap;
    if (map && track.getType() === "audio") {
      map.delete(id);
      this.setState({ idAudioTrackMap: map });
    }
    console.log("track removed!!!", track.ownerEndpointId);
  };

  /* Fired when DOMINANT_SPEAKER_CHANGED event occurs. */
  speakerOnScreen = null;
  onDominantSpeakerChange = (id) => {
    this.lastDominantUser = id;
    if (
      (this.room && this.room.getParticipants().length === 1) ||
      id === this.selfParticipantId ||
      this.pinnedParticipant
    ) {
      return;
    }
    let track = null;
    if (this.lastDominantUser && this.state.idTrackMap) {
      track = this.state.idTrackMap.get(id);
      try {
        this.room.selectParticipant(id);
      } catch (error) {
        Honeybadger.notify(error)
        console.log("couldn't select for high quality video");
      }
    }
    !this.state.isTileView && this.conditionalSwitchBigScreen(track, id);
  };

  //Take a track

  /** Fired when user role is changed */
  onUserRoleChanged = () => {
    // if (this.room.isModerator()) {
    if (
      this.state.currentUser.email === this.state.meetingModerator.createdBy ||
      this.state.currentUser.email === this.state.meeting.createdBy
    ) {
      this.setState({ isModerator: true });
    }
    // this.sendLocalStreamStartPing() //start default audio recording on initiate meeting
    // }
  };

  //Local video track MuteChanged event hadler responsible for switching between avatar and video screens
  localVideoTrackMuteChangedEventHandler = () => {
    this.toggleBigScreenAvatar(this.videoTrackLocal);
    if (this.state.isVideoMuted) {
      let imageElement = this.getProfilePicture(this.state.currentUser.email)
        ? `<img src=${this.getProfilePicture(
          this.state.currentUser.email
        )} alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
        }' />`
        : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=7b79b3&color=fff&name=${this.state.currentUser.email
        }" alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
        }'/>`;
      this.setState({ localSmallScreen: imageElement });
    } else {
      let newVideo = `<video className='remote-video-styles video-flip small-screen' poster=${cameraOffPoster}  autoplay id='${this.myJitsiId + "video"
        }' />`;
      this.setState({ localSmallScreen: newVideo }, () => {
        this.videoTrackLocal &&
          this.attachTrack(this.videoTrackLocal, this.myJitsiId + "video");
        this.conditionalSwitchBigScreen(this.videoTrackLocal, this.myJitsiId);
      });
    }
  };

  //Remote video track MuteChanged event hadler responsible for switching between avatar and video screens
  remoteVideoTrackMuteChangedEventHandler = (track) => {
    let map = this.state.smallScreensMap;
    this.toggleBigScreenAvatar(track);
    if (track.muted) {
      let imageElement = this.getProfilePicture(
        this.state.idDisplayNameMap.get(track.ownerEndpointId)
      )
        ? `<img src=${this.getProfilePicture(
          this.state.idDisplayNameMap.get(track.ownerEndpointId)
        )} alt="Smiley face" className="small-screen" id='${track.ownerEndpointId + "video"
        }' />`
        : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=${this.state.idAvatarColorMap.get(
          track.ownerEndpointId
        )}&color=fff&name=${this.state.idDisplayNameMap.get(
          track.ownerEndpointId
        )}" alt="Smiley face" className="small-screen" id='${track.ownerEndpointId + "video"
        }'/>`;
      map.set(track.ownerEndpointId, imageElement);
      track.ownerEndpointId && this.setState({ smallScreensMap: map });
    }
    if (!track.muted) {
      let newVideo = `<video className= 'remote-video-styles small-screen'   autoplay id='${track.ownerEndpointId + "video"
        }' />`;
      map.set(track.ownerEndpointId, newVideo);
      track.ownerEndpointId &&
        this.setState({ smallScreensMap: map }, () => {
          track && this.attachTrack(track, track.ownerEndpointId + "video");
          this.conditionalSwitchBigScreen(track, track.ownerEndpointId);
        });
    }
  };
  /**
   * Handles remote tracks
   * @param track JitsiTrack object
   */
  onRemoteTrack = (track) => {
    const participant = track.getParticipantId();
    const id = participant + track.getType();
    if (track.isLocal()) {
      this.selfParticipantId = participant;
      if (track.getType() === "video") {
        const newVideo = `<video className='remote-video-styles video-flip small-screen' poster=${cameraOffPoster}  autoplay id='${id}' />`;
        this.setState({ localSmallScreen: newVideo }, () => {
          if (this.videoTrackLocal) {
            this.attachTrack(this.videoTrackLocal, id);
          }
        });
      }

      return;
    }
    console.log("remote track added" + track);
    this.setState({ hasMoreThanOneParticipant: true });

    this.setState({
      participantArray: [...this.state.participantArray, participant],
    });

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
      window.setTimeout(() => {
        track.addEventListener(
          window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
          this.remoteVideoTrackMuteChangedEventHandler
        );
        let map = this.state.idTrackMap ? this.state.idTrackMap : new Map();
        map.set(participant, track);
        this.setState({ idTrackMap: map });

        this.detachTrack(this.videoTrackLocal, "localVideo1");

        if (!track.muted) {
          let newVideo = `<video className= 'remote-video-styles small-screen' poster=${cameraOffPoster} autoplay id='${id}' />`;
          let smallScreensMap = this.state.smallScreensMap;
          smallScreensMap.set(participant, newVideo);
          participant &&
            this.setState(
              { smallScreensMap: smallScreensMap },
              () => document.getElementById(id) && this.attachTrack(track, id)
            );
        }

        track.videoType === "camera"
          ? this.setState(
            { screenShareOnBigScreen: false, hideParticipantTiles: false },
            () => document.getElementById(id) && this.attachTrack(track, id)
          )
          : this.setState(
            { screenShareOnBigScreen: true, hideParticipantTiles: true },
            () => {
              this.pinParticipant(participant);
              this.hasOtherParticipantSharedScreen = true;
            }
          );

        this.conditionalSwitchBigScreen(track, participant);
        this.writeLog(
          `remote-${track.videoType}-track`,
          `added-for-${remoteUser}`,
          "info"
        );
      }, 1000);
    } else {
      track.addEventListener(
        window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        (track) => {
          console.log(
            "audio muted for user " +
            this.state.idDisplayNameMap.get(track.ownerEndpointId)
          );
        }
      );

      let map = this.state.idAudioTrackMap
        ? this.state.idAudioTrackMap
        : new Map();
      map.set(participant, track);
      this.setState({ idAudioTrackMap: map });
      const newAudio = `<audio autoplay='1' id='${id}' />`;
      this.setState({
        participantListAudio: [...this.state.participantListAudio, newAudio],
      });

      this.writeLog("remote-audio-track", `added-for-${remoteUser}`, "info");
      track.attach(document.getElementById(id));
    }

    console.log(track)
  };

  /** Muting of audio tracks */
  onAudioMuteStateChanged = async () => {
    if (this.audioTrackLocal) {
      if (this.state.isAudioMuted) {
        await this.audioTrackLocal.unmute();
        this.writeLog(
          "on-audio-mute-state-changed",
          "Local-audio-unmuted",
          "info"
        );
        this.room &&
          (await this.room
            .addTrack(this.audioTrackLocal)
            .then((track) => {
              this.writeLog(
                "on-audio-mute-state-changed",
                "audio-track-pushed-in-room",
                "info"
              );
              console.log(
                "Local audio track pushed in room from onAudioMuteStateChanged"
              );
            })
            .catch((error) => {
              Honeybadger.notify(error)
              console.log(error);
              this.writeLog(
                "on-audio-mute-state-changed",
                "error-while-adding-track-in-onAudioMuteStateChanged",
                "error"
              );
            }));

        this.setState({ isAudioMuted: false, muteButtonClick: false });
      } else {
        await this.audioTrackLocal.mute();
        this.writeLog(
          "on-audio-mute-state-changed",
          "Local-audio-muted",
          "info"
        );
        this.setState({ isAudioMuted: true });
      }
    }
  };

  /** Muting of video tracks */
  onVideoMuteStateChanged = async () => {
    if (!this.videoTrackLocal) {
      this.videoTrackLocal = await this.createJitsiLocalTrack("video");
    }

    if (this.videoTrackLocal && !this.state.isScreenSharingOn) {
      if (this.state.isVideoMuted) {
        this.setState({ isVideoMuted: false }, async () => {
          await this.videoTrackLocal.unmute();
          this.attachTrack(this.videoTrackLocal, this.myJitsiId + "video");
          this.switchScreenIfNotOnlyUser();
          this.writeLog(
            "on-video-mute-state-changed",
            "Local-video-unmuted",
            "info"
          );
          this.room &&
            (await this.room
              .addTrack(this.videoTrackLocal)
              .then((track) => {
                this.writeLog(
                  "on-video-mute-state-changed",
                  "video-track-pushed-in-room",
                  "info"
                );
                console.log(
                  "Local video track pushed in room from onVideoMuteStateChanged"
                );
              })
              .catch((error) => {
                Honeybadger.notify(error)
                console.log(error);
                this.setState({ isVideoMuted: true });
                this.writeLog(
                  "on-video-mute-state-changed",
                  "error-while-adding-track-in-onAudioMuteStateChanged",
                  "error"
                );
              }));
        });
      } else {
        this.setState({ isVideoMuted: true }, async () => {
          await this.videoTrackLocal.mute();
          this.writeLog(
            "on-video-mute-state-changed",
            "Local-video-muted",
            "info"
          );
        });
      }
    }
  };

  handleChatMessage = (event) => {
    if (event.target.value === " ") return;
    this.setState({ message: event.target.value });
  };

  /**
   * @author Nikhil
   * @param {string} jitsiId Jitsi ParticipantId
   * @param {string} message Incoming text message
   *
   * This function is called when MESSAGE_RECEIVED event is fired.
   */

  /**
   * @author Nikhil
   * @event document#onKeyPress
   * @type {onKeyPress} keypress
   *
   * this function is used to send group Text Messages. It first creates a messageObject
   * using required fields and then it is sent as an argument to Jitsi api sendTextMessage(msg)
   * after stringifying (Jitsi API only accepts text message)
   *
   * setChatFlag api is used to set the {meeting.hasChat} flag to true in the DB
   * postChat api is used to post Chat messages to the api server to store in db
   */
  _sendMessage = () => {
    if (!this.state.messages.length) {
      setChatFlag(this.props.match.params.meetingId).catch((error) => {
        Honeybadger.notify(error)
        console.log(error);
      });
    }
    let currentTime = moment()
      .utc()
      .format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
    if (this.state.message.length) {
      let messageObject = {
        message: this.state.message,
        sender: this.displayName,
        timeInUTC: currentTime,
        senderId:
          this.state.currentUser.userUid || this.state.currentUser.guestUserId,
      };
      let messageBody = {
        message: this.state.message,
        sender: this.displayName,
        receiver: "ALL",
      };
      this.setState(
        {
          message: "",
          messages: [...this.state.messages, messageObject],
        },
        () => this.scrollChatToBottom()
      );
      const newMessage = firebaseconfig
        .database()
        .ref("local/messages/")
        .push();
      newMessage.set({
        messageId: newMessage.key,
        mettingId: this.props.match.params.meetingId,
        ...messageObject,
      });
      let userMessagesRef = firebaseconfig
        .database()
        .ref("local/user-messages")
        .child(this.props.match.params.meetingId)
        .child("meetingMessages");
      userMessagesRef.update({ [newMessage.key]: currentTime });
      postChat(messageBody, this.props.match.params.meetingId).catch(
        (error) => {
          console.log(error, Honeybadger.notify(error));
        }
      );
    }
  };

  lastJoinedUser = null;

  /**Executes when new user joins @param id
   *
   *  @param {string} id Jitsi Participant ID
   * function called on USER_JOINED event
   */
  onUserJoined = async (id) => {
    let idColorMap = this.state.idAvatarColorMap;
    idColorMap.set(id, getRandomColorHex());
    this.setState({ idAvatarColorMap: idColorMap });

    //id-displayName map, for connection quality card component
    let participant = this.room.getParticipantById(id)._displayName;
    let map = this.state.idDisplayNameMap;
    let participants = await this.room.getParticipants();

    participants.forEach((participant) => {
      map.set(participant._id, participant._displayName);
    });

    let imageElement = this.getProfilePicture(participant)
      ? `<img src=${this.getProfilePicture(
        participant
      )} alt="Smiley face" className="small-screen" id='${id + "video"}' />`
      : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=${this.state.idAvatarColorMap.get(id)
        ? this.state.idAvatarColorMap.get(id)
        : 808080
      }&color=fff&name=${participant}" alt="Smiley face" className="small-screen" id='${id + "video"
      }'/>`;
    let smallScreensMap = this.state.smallScreensMap;
    id && smallScreensMap.set(id, imageElement);
    this.setState({
      smallScreensMap: smallScreensMap,
      userName: participant,
      hasUserJoinedAlert: true,
      participantsList: participants,
      idDisplayNameMap: map,
    });

    this.conditionalSwitchBigScreen(null, id);

    //If joined user elected as Moderator, send localStreamStart ping to all participants
    if (this.state.isModerator) {
      if (this.state.isLocalStreaming) {
        this.room.sendCommandOnce("localstream", {
          value: true,
          attributes: {},
          children: [],
        });
      }
    }
    this.writeLog("user-joined", `${participant}-with-id-${id}`, "info");
  };

  switchScreenIfNotOnlyUser = () => {
    if (this.room && this.room.getParticipants().length === 0) {
      if (this.videoTrackLocal) {
        this.setState({ hasMoreThanOneParticipant: false });
        this.switchBigScreen(this.videoTrackLocal, this.myJitsiId);
      }
    } else {
      if (this.room) {
        if (this.state.idTrackMap) {
          let track = this.state.idTrackMap.values().next().value;
          //show avatar if track is null
          try {
            this.room.selectParticipant(track.getParticipantId());
          } catch (error) {
            Honeybadger.notify(error);
            console.log("couldn't select for high quality video");
          }
          if (track) {
            track.videoType === "camera"
              ? this.setState({ screenShareOnBigScreen: false })
              : this.setState({ screenShareOnBigScreen: true });
            this.conditionalSwitchBigScreen(track, track.ownerEndpointId);
          } else {
            this.conditionalSwitchBigScreen(
              track,
              this.state.idDisplayNameMap.keys().next().value
            );
          }
        }
      }
    }
  };

  /**
   *
   * @param id
   */
  onUserLeft = async (id) => {
    this.pinnedParticipant === id && this.unPinParticipant();
    if (
      this.state.speakerOnScreen === id ||
      (this.room && this.room.getParticipants().length === 0)
    ) {
      this.switchScreenIfNotOnlyUser();
    }
    this.removeDiv(id);
    let map = this.state.idDisplayNameMap
      ? this.state.idDisplayNameMap
      : new Map();
    let participants = await this.room.getParticipants();
    participants.forEach((participant) => {
      map.set(participant._id, participant._displayName);
    });
    this.state.smallScreensMap && this.state.smallScreensMap.delete(id);

    this.pinnedParticipant === id && this.unPinParticipant();

    this.setState({ participantsList: participants });

    this.writeLog("user-left", `${id}`, "info");
    this.removeDiv(id);
  };

  /**
   * This function is called when the this.connection fails.
   */

  onConnectionFailed = () => {
    this.setState({ showConnectionFailedModal: true });

    this.connectionFailedTimeout = setInterval(
      this.connectionFailedTimer,
      1000
    );

    console.error("Connection Failed!");
    this.writeLog("connection-failed", "connection-failed", "error");
  };

  initialConnectionFailedCountdownSeconds;
  connectionFailedTimer = () => {
    if (this.state.connectionFailedCountdownSeconds > 0) {
      this.setState({
        connectionFailedCountdownSeconds:
          this.state.connectionFailedCountdownSeconds - 1,
      });
    } else {
      clearInterval(this.connectionFailedTimeout);
      window.location.reload();
    }
  };

  onDeviceListChanged = (devices) => {
    console.info("current devices", devices);
  };

  /**
   *
   * @param selected
   */
  changeAudioOutput = (selected) => {
    // eslint-disable-line no-unused-vars
    window.JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
  };

  /**
   * @author Nikhil
   * @param {string} elementId
   * HTML element ID of the remote element
   *
   * this function removes the dead div elements after user leaves a conference
   */
  removeDiv = (elementId) => {
    const videoElement = document.getElementById(elementId + "video");
    const audioElement = document.getElementById(elementId + "audio");
    videoElement && videoElement.remove();
    audioElement && audioElement.remove();
  };

  /* Local Streaming */
  recorder = null;
  socket = null;
  setConnected = false;
  base64data = null;
  reader = null;

  writeLog = (event, log, type) => {
    let logEntry = {
      email: this.state.currentUser.email,
      event,
      log,
      type,
    };
    try {
      logEventApi(this.props.match.params.meetingId, logEntry);
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error);
    }
  };

  onChunkAvailable = (blob) => {
    this.reader = new FileReader();
    this.reader.readAsDataURL(blob);
    this.reader.onloadend = () => {
      this.base64data = this.reader.result;
      try {
        if (this.setConnected) {
          this.socket.send(this.base64data);
        }
      } catch (error) {
        Honeybadger.notify(error)
        console.log(error);
      }
    };
  };
  initSocketConnection = () => {
    this.socket = new WebSocket(
      process.env.REACT_APP_WEBSOCKET_BASE_URL +
      "stream?" +
      "acc_id=" +
      this.meeting.accountId +
      "&meeting_id=" +
      this.meeting.meetingId +
      "&user=" +
      this.state.currentUser.email +
      "&token=" +
      localStorage.getItem("authorization") +
      "&refresh=" +
      localStorage.getItem("x-authorization")
    );

    this.socket.onclose = (event) => {
      console.log("WebSocket is closed:", event);
      this.writeLog("local-streaming-stopped", "WebSocket-is-closed", "info");
    };

    this.socket.onerror = (event) => {
      console.log("WebSocket error observed:", event);
      this.recorder = null;
      this.stopLocalStreaming();
      this.writeLog(
        "local-streaming-failed",
        "WebSocket-error-observed",
        "error"
      );
    };

    this.socket.onopen = (event) => {
      this.setConnected = true;

      if (this.recorder) {
        this.recorder.startRecording();
        this.setState({ isLocalStreaming: true }, () => {
          this.writeLog("local-streaming-started", "success", "info");
        });
      } else {
        console.log("error while starting local recording");
        this.writeLog(
          "local-streaming-failed",
          "Recorder-has-not-initialized",
          "error"
        );
        this.socket.close();
      }
    };
  };

  startLocalStreaming = () => {
    if (this.recorder || this.state.isLocalStreaming) {
      return;
    }

    try {
      const recordRtc = require("recordrtc");
      if (this.audioTrackLocal && this.audioTrackLocal.stream) {
        this.recorder = recordRtc(this.audioTrackLocal.stream, {
          type: "audio",
          recorderType: MediaStreamRecorder,
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
          checkForInactiveTracks: false,
          timeSlice: 3000,
          ondataavailable: this.onChunkAvailable,
        });
        this.recorder && this.initSocketConnection();
      } else {
        console.log("No stream found for localAudio0 audio element");
        this.writeLog(
          "local-streaming-failed",
          "No-stream-found-for-localAudio0-audio-element",
          "error"
        );
      }
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error);
      this.recorder = null;
      this.socket && this.socket.close();
      this.writeLog("local-streaming-failed", error.message, "error");
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
          Honeybadger.notify(error)
          console.log(error);
        }
        this.setState({
          isLocalStreaming: false,
          isLocalStreamingStopAlert: true,
        });
      });
    this.recorder = null;
  };
  sendLocalStreamStartPing = () => {
    if (this.room) {
      if (this.state.isModerator) {
        let userMessagesRef = firebaseconfig
          .database()
          .ref("local/user-messages")
          .child(this.props.match.params.meetingId);
        userMessagesRef.update({ meetingFlags: { isRecordingStarted: true } });
        this.writeLog(
          "send-local-stream-start-ping",
          "Meeting-recording-start-command-has-been-fired",
          "info"
        );
      } else {
        console.log("No Moderator");
      }
    } else {
      console.log("Not Joined to room yet.");
    }
  };

  sendLocalStreamStopPing = () => {
    if (this.room) {
      if (this.state.isModerator) {
        this.stopLocalStreaming();
        let userMessagesRef = firebaseconfig
          .database()
          .ref("local/user-messages")
          .child(this.props.match.params.meetingId);
        userMessagesRef.update({ meetingFlags: { isRecordingStarted: false } });
        this.writeLog(
          "send-local-stream-stop-ping",
          "Meeting-recording-stop-command-has-been-fired",
          "info"
        );
      } else {
        console.log("No Moderator");
      }
    } else {
      console.log("Not joined to room yet.");
    }
  };

  onClickMeetingDetails = () => {
    this.props.history.push("/meetings/" + this.props.match.params.meetingId);
  };

  hasOtherParticipantSharedScreen = false;
  desktopTrackLocal = null;
  videoTrackLocal = null;
  audioTrackLocal = null;

  /**
   * @param type{'video','audio','desktop'}
   * @returns Jitsi mediaTrack object
   */
  createJitsiLocalTrack = async (type) => {
    const { cameraDeviceId, micDeviceId } = this.state;

    let tracks = await window.JitsiMeetJS.createLocalTracks({
      devices: [type],
      cameraDeviceId: cameraDeviceId.value,
      micDeviceId: micDeviceId.value,
    });

    tracks[0].addEventListener(
      window.JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
      type === "video"
        ? this.localVideoTrackMuteChangedEventHandler
        : () => console.log("Track muted")
    );
    //TODO move code from inline func
    tracks[0].addEventListener(
      window.JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
      type === "desktop"
        ? () => {
          console.log("local track stopped");
          if (this.state.isScreenSharingOn) {
            this.switchVideo();
          }
        }
        : () => console.log("local track stopped")
    );

    return tracks[0];
  };

  shareScreen = async () => {
    //Create desktoptrack and replace with Videotrack
    try {
      //tracks[0].conference = this.room;
      this.desktopTrackLocal = await this.createJitsiLocalTrack("desktop");
      this.videoTrackLocal &&
        this.detachTrack(this.videoTrackLocal, "localVideo1");
      this.videoTrackLocal && (await this.videoTrackLocal.dispose());
      this.videoTrackLocal = null;

      await this.room
        .addTrack(this.desktopTrackLocal)
        .then((track) => {
          console.log("Desktop track pushed in room");
          this.setState({ isScreenSharingOn: true });
          this.writeLog("screen-share", "started-success", "info");
        })
        .catch((error) => {
          Honeybadger.notify(error)
          console.log(error);
          this.writeLog(
            "screen-share-failed",
            "error-while-adding-desktop-track",
            "error"
          );
        });

      // Attach desktopTrack stream to html element "localSmallScreen" along with its class
      let localSmallScreen = document.getElementById(
        this.selfParticipantId + "video"
      );
      this.removeClassFromElementClassList(localSmallScreen, "video-flip");
      this.attachTrack(
        this.desktopTrackLocal,
        this.selfParticipantId + "video"
      );
      this.switchScreenIfNotOnlyUser();
      if (!this.state.hasMoreThanOneParticipant) {
        this.setState({ screenShareOnBigScreen: true });
        this.conditionalSwitchBigScreen(
          this.desktopTrackLocal,
          this.selfParticipantId
        );
      }
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error);
    }
  };

  switchVideo = async () => {
    //Replace desktoptrack with videotrack, create videotrack and assign only if previous videotrack is absent
    try {
      this.detachTrack(this.desktopTrackLocal, "localVideo1");
      this.desktopTrackLocal && (await this.desktopTrackLocal.dispose());
      this.setState({ isScreenSharingOn: false });

      if (this.state.isVideoMuted) {
        let imageElement = this.getProfilePicture(this.state.currentUser.email)
          ? `<img src=${this.getProfilePicture(
            this.state.currentUser.email
          )} alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
          }' />`
          : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=7b79b3&color=fff&name=${this.state.currentUser.email
          }" alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
          }'/>`;
        this.setState({ localSmallScreen: imageElement });
      } else {
        this.videoTrackLocal = await this.createJitsiLocalTrack("video");
        this.room
          .addTrack(this.videoTrackLocal)
          .then((track) => {
            console.log("Camera track pushed in room");
            this.writeLog("screen-share", "stop-success", "info");
          })
          .catch((error) => {
            Honeybadger.notify(error)
            console.log(error);
          });
        let localSmallScreen = document.getElementById(
          this.selfParticipantId + "video"
        );
        this.addClassToElementClassList(localSmallScreen, "video-flip");
        this.attachTrack(
          this.videoTrackLocal,
          this.selfParticipantId + "video"
        );
      }

      // Attach videotrack stream to html element "localSmallScreen" along with its class

      this.switchScreenIfNotOnlyUser();
      if (!this.state.hasMoreThanOneParticipant) {
        this.setState({ screenShareOnBigScreen: false });
        this.conditionalSwitchBigScreen(
          this.videoTrackLocal,
          this.selfParticipantId
        );
      }
    } catch (error) {
      Honeybadger.notify(error)
      console.log(error);
      this.setState({ isScreenSharingOn: false });
    }
  };

  /**
   * This function is called when we disconnect.
   */
  disconnect = () => {
    console.log("disconnect!");
    if (this.connection) {
      this.connection.removeEventListener(
        window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        this.onConnectionSuccess
      );
      this.connection.removeEventListener(
        window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
        this.onConnectionFailed
      );
      this.connection.removeEventListener(
        window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        this.disconnect
      );
    }
  };

  /**
   *
   */
  unload = () => {
    if (this.videoTrackLocal) this.videoTrackLocal.dispose();
    if (this.audioTrackLocal) this.audioTrackLocal.dispose();
    if (this.desktopTrackLocal) this.desktopTrackLocal.dispose();
    for (let i = 0; i < this.localTracks.length; i++) {
      try {
        if (this.localTracks[i]) {
          this.localTracks[i].dispose();
        }
      } catch (error) {
        Honeybadger.notify(error)
        console.log("error while disposing" + error);
      }
    }
    if (this.room) {
      this.room.leave();
    }
    if (this.state.isLocalStreaming) {
      this.stopLocalStreaming();
    }
    this.meetingStatusSocket && this.meetingStatusSocket.close();
    this.connection && this.connection.disconnect();
  };

  componentWillUnmount = () => {
    document.removeEventListener("click", this.handleCloseContextMenu);
    clearTimeout(this.showConnectionStatus);

    this.disconnect();
    this.unload();
    if (localStorage.getItem("guestUser")) {
      console.log("clearing local storage");
      localStorage.clear();
      window.Intercom("shutdown");
    }
    this.setState(this.initialState);
  };

  endCall = async () => {
    if (localStorage.getItem("guestUser")) {
      this.props.history.push("/register");
    }
    this.props.history.push("/meetings/" + this.props.match.params.meetingId);
  };

  onClickRejoinNow = () => {
    clearInterval(this.connectionFailedTimeout);
    window.location.reload();
  };

  chatSideBar = () => {
    this.setState({
      participantSideBar: false,
      chatSideBar: !this.state.chatSideBar,
      documentSideBar: false,
      unreadCount: 0,
    });
  };

  handleInterCom = () => {
    const authenticateUser = localStorage.getItem("accountName");
    this.displayName = this.state.currentUser.email;
    console.log("registering guest user intercom");
    try {
      window.intercomSettings = {
        app_id: "dxhy85mi",
        custom_launcher_selector: ".question-circle",
      };
      window.Intercom("boot", {
        app_id: "dxhy85mi",
        name: this.state.currentUser.email, // Full name
        email: this.state.currentUser.email, // Email address
        account: authenticateUser,
        custom_launcher_selector: ".question-circle",
        is_guest: authenticateUser ? false : true, //tracks if guest user or not
        environment: process.env.REACT_APP_ENVIRONMENT_NAME, //should be Production or Development
      });
    } catch (error) {
      Honeybadger.notify(error)
      console.log(
        "error while registering guest user intercom, cause: " + error
      );
    }
  };

  participantSideBar = () => {
    this.setState({
      chatSideBar: false,
      participantSideBar: !this.state.participantSideBar,
      documentSideBar: false,
    });
  };

  getdocument = async () => {
    try {
      const documentlist = await getDocumentList(
        this.props.match.params.meetingId
      );
      if (documentlist) {
        this.setState(
          {
            documentList: documentlist.data,
          },
          () => {
            let userDocumentRef = firebaseconfig
              .database()
              .ref("local/user-messages")
              .child(this.props.match.params.meetingId);
            userDocumentRef.update({
              DocumentBadges: {
                documentListBadge: this.state.documentList.length,
              },
            });
          }
        );
      }
    } catch (error) {
      Honeybadger.notify(error)
      console.log("error", error);
    }
  };

  documentSideBar = async () => {
    const { documentSideBar } = this.state;
    this.setState({
      chatSideBar: false,
      documentSideBar: !documentSideBar,
      participantSideBar: false,
      documentMessage: "",
      photos: [],
    });
  };

  scrollChatToBottom() {
    if (this.state.chatSideBar) {
      const scrollHeight = this.messageList.current.scrollHeight;
      const height = this.messageList.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      this.messageList.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }

  componentDidUpdate() {
    let jitsiId = this.connectionStats ? this.connectionStats.id : null;
    let map = this.state.connectionQualityMap
      ? this.state.connectionQualityMap
      : new Map();
    let videoMap = this.state.idTrackMap ? this.state.idTrackMap : new Map();
    let videoTrackStatus = videoMap.get(jitsiId)
      ? videoMap.get(jitsiId).muted
        ? "Muted"
        : "Unmuted"
      : "Track not available";
    let audioMap = this.state.idAudioTrackMap
      ? this.state.idAudioTrackMap
      : new Map();
    let audioTrackStatus = audioMap.get(jitsiId)
      ? audioMap.get(jitsiId).muted
        ? "Muted"
        : "Unmuted"
      : "Track not available";
    if (jitsiId === this.selfParticipantId) {
      videoTrackStatus = this.videoTrackLocal
        ? this.state.isVideoMuted
          ? "Muted"
          : "Unmuted"
        : "Track not available";
      audioTrackStatus = this.audioTrackLocal
        ? this.state.isAudioMuted
          ? "Muted"
          : "Unmuted"
        : "Track not available";
    }
    this.connectionStats = {
      id: jitsiId,
      statsObject: map.get(jitsiId + "video"),
      videoTrackStatus: videoTrackStatus,
      audioTrackStatus: audioTrackStatus,
    };
    window.Intercom("update", {
      hide_default_launcher: true,
    });
  }
  toggleEndCallModal = () => {
    this.setState({ leaveMeetingWarning: !this.state.leaveMeetingWarning });
  };

  tileAttachVideo = () => {
    let map = this.state.smallScreensMap;

    for (const [key, value] of this.state.idTrackMap.entries()) {
      const participant = key;
      const track = value;
      const videoType = value.getType();
      const id = participant + videoType;
      // Remote User
      if (track.muted) {
        let imageElement = this.getProfilePicture(
          this.state.idDisplayNameMap.get(track.ownerEndpointId)
        )
          ? `<img src=${this.getProfilePicture(
            this.state.idDisplayNameMap.get(track.ownerEndpointId)
          )} alt="Smiley face" className="small-screen" id='${track.ownerEndpointId + "video"
          }' />`
          : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=${this.state.idAvatarColorMap.get(
            track.ownerEndpointId
          )}&color=fff&name=${this.state.idDisplayNameMap.get(
            track.ownerEndpointId
          )}" alt="Smiley face" className="small-screen" id='${track.ownerEndpointId + "video"
          }'/>`;
        map.set(track.ownerEndpointId, imageElement);
        track.ownerEndpointId && this.setState({ smallScreensMap: map });
      } else {
        let newRemoteVideo = `<video className='remote-video-styles small-screen' autoPlay id='${id}' />`;
        map.set(track.ownerEndpointId, newRemoteVideo);
        track.ownerEndpointId &&
          this.setState({ smallScreensMap: map }, () => {
            track && this.attachTrack(track, id);
          });
      }

      // Local User
      if (this.state.isVideoMuted) {
        let imageElement = this.getProfilePicture(this.state.currentUser.email)
          ? `<img src=${this.getProfilePicture(
            this.state.currentUser.email
          )} alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
          }' />`
          : `<img src="https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=7b79b3&color=fff&name=${this.state.currentUser.email
          }" alt="Smiley face" className="small-screen" id='${this.myJitsiId + "video"
          }'/>`;
        this.setState({ localSmallScreen: imageElement });
      } else if (this.videoTrackLocal) {
        let newLocalVideo = `<video className='remote-video-styles video-flip small-screen' autoplay id='${this.myJitsiId + "video"
          }' />`;
        this.videoTrackLocal &&
          this.setState({ localSmallScreen: newLocalVideo }, () => {
            this.videoTrackLocal &&
              this.attachTrack(this.videoTrackLocal, this.myJitsiId + "video");
          });
      }
      !this.state.isTileView &&
        this.remoteVideoTrackMuteChangedEventHandler(track);
    }
  };

  handleTileView = () => {
    const { isTileView, isBigScreenHolderMuted } = this.state;
    this.setState(
      {
        isTileView: !isTileView,
        isBigScreenHolderMuted: !isBigScreenHolderMuted,
      },
      () => {
        if (this.state.isTileView) {
          var remoteParticipantTimeOut = window.setTimeout(
            () => this.tileAttachVideo(),
            1000
          );
        } else {
          this.tileAttachVideo();
          window.clearTimeout(remoteParticipantTimeOut);
        }
      }
    );
  };

  isCardToggled = false;
  showConnectionQuality = async (e) => {
    let elementId = e.target.id;
    let jitsiId = elementId.slice(0, -5);
    this.isCardToggled = true;
    this.connectionStats = {
      id: jitsiId,
    };
  };

  handleAudioStatus = (jitsiId) => {
    const { participantsList } = this.state;
    const selectParticipant =
      participantsList && participantsList.find((user) => user._id === jitsiId);
    const selectUserTrack = selectParticipant && selectParticipant._tracks;
    if (selectUserTrack && selectUserTrack.length) {
      const userStatus = selectUserTrack[0].muted;
      return userStatus;
    } else {
      return true;
    }
  };

  openInviteComponent = () => this.setState({ isInviteComponentVisible: true });
  closeInviteComponent = () =>
    this.setState({ isInviteComponentVisible: false });

  isReallyLowBandWidthFun = () => {
    const isReallyLowBandWidth =
      this.connectionBandwidthQuality &&
      this.connectionBandwidthQuality.connectionQuality < 50;
    if (isReallyLowBandWidth) {
      return true;
    }
    return false;
  };

  handleShowMore = () => {
    var element = document.getElementById("sc1");
    if (element) {
      element.classList.add("more-users");
    }
    var element2 = document.getElementById("sc2");
    if (element2) {
      element2.classList.remove("more-users");
    }
  };

  handleShowLess = () => {
    var element = document.getElementById("sc1");
    if (element) {
      element.classList.remove("more-users");
    }
    var element2 = document.getElementById("sc2");
    if (element2) {
      element2.classList.add("more-users");
    }
  };

  handleMuteAllParticipant = () => {
    console.log("called mute everyone");
    this.state.participantsList.forEach((participant) => {
      const _participant = this.room.getParticipantById(participant._id);
      console.log(_participant, _participant.getJid())
      this.room.muteParticipant(_participant._id, true);
    })
  };

  handleMuteRemoteParticipant = async (jitsiId) => {
    console.log("called mute individual", jitsiId);
    const { idAudioTrackMap } = this.state;
    const selectTrack = idAudioTrackMap && idAudioTrackMap.get(jitsiId);
    if (selectTrack && !selectTrack.isMuted()) {
      this.room.muteParticipant(jitsiId, true);
    }
  };

  isModalOpen = () => {
    this.setState(
      (prevState) => ({
        uploadModal: !prevState.uploadModal,
      }),
      () => {
        if (!this.state.uploadModal) {
          this.getdocument();
          this.setState({
            documentSideBar: false,
            documentMessage: "",
            photos: [],
          });
        }
      }
    );
  };

  onDrop = (acceptedFiles) => {
    const files = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    const { photos } = this.state;
    const existingFile = files.find(function (file) {
      return photos.find((photo) => photo.name === file.name);
    });
    if (!existingFile) {
      const images = photos.concat(files);
      this.setState({
        photos: images,
      });
    } else {
      this.setState({
        documentLoading: false,
        wasAdded: false,
        documentMessage: `${existingFile.name} is already uploaded`,
      });
    }
  };

  removeFile = (i) => {
    const photoArray = [...this.state.photos]; // make a separate copy of the array
    if (i !== -1) {
      // remove photo from specific index array
      photoArray.splice(i, 1);
      this.setState({ photos: photoArray });
    }
  };

  convertByteArray = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      var fileByteArray = [];
      reader.onload = (event) => { };

      reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) {
          var arrayBuffer = evt.target.result,
            array = new Uint8Array(arrayBuffer);
          for (var i = 0; i < array.length; i++) {
            fileByteArray.push(array[i]);
          }
          resolve(fileByteArray);
        }
      };

      reader.onerror = (err) => {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  newDocumentList = [];
  submitDocument = async () => {
    this.newDocumentList = [];
    this.setState({
      documentLoading: true,
    });
    const { photos } = this.state;
    const formData = new FormData();
    Array.from(photos).forEach((file) => {
      formData.append("files", file);
    });
    await addFiles(
      formData,
      this.props.match.params.meetingId,
      "document"
    ).then((res) => {
      if (res.status === 200) {
        let userDocumentRef = firebaseconfig
          .database()
          .ref("local/user-messages")
          .child(this.props.match.params.meetingId);
        userDocumentRef.update({
          DocumentBadges: { documentListBadge: this.state.documentList.length },
        });
        this.setState(
          {
            documentLoading: false,
            wasAdded: true,
            documentMessage: res.data,
          },
          () => {
            setTimeout(() => {
              this.isModalOpen();
            }, 500);
          }
        );
      } else {
        this.setState({
          documentLoading: false,
          wasAdded: false,
          documentMessage: "Something is wrong",
        });
      }
    });
    // if (photos.length) {
    //   for (let i = 0; i < photos.length; i++) {
    //     const file = photos[i];
    //     const documentList = {};
    //     documentList["documentTitle"] = file.name;
    //     documentList["documentData"] = await this.convertByteArray(file);

    //     documentList["createdOn"] = moment(new Date()).format(
    //       moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
    //     );
    //     documentList["modifiedOn"] = moment(file.lastModified).format(
    //       moment.HTML5_FMT.DATETIME_LOCAL_SECONDS
    //     );
    //     const sameFile = this.state.documentList.find(document => document.documentTitle === file.name);
    //     if(!sameFile){
    //       this.newDocumentList.push(documentList);
    //     }
    //   }
    // }
    // if(this.newDocumentList.length){
    //   try {
    //     const addDocumentRes = await addDocument(this.newDocumentList, this.props.match.params.meetingId)
    //     this.setState({
    //       documentLoading: false,
    //       wasAdded: true,
    //       documentMessage: addDocumentRes.data
    //     })

    // } catch (error) {
    //     /**TODO handle errors by status codes and appropriate error messages/actions */
    //     console.log(error)
    //     this.setState({
    //       documentLoading: false,
    //       wasAdded: false,
    //       documentMessage: 'Something is wrong'
    //     })
    //  }
    // }else{
    //   console.log('else');
    //   this.setState({
    //     documentLoading: false,
    //     wasAdded: false,
    //     documentMessage: 'You uploaded same file'
    //   })
    // }
  };

  deleteDocument = async (id) => {
    this.setState({
      documentLoading: true,
    });
    if (id) {
      try {
        await deleteDocumentById(id);
        this.getdocument();
        this.setState({
          documentLoading: false,
        });
      } catch (error) {
        /**TODO handle errors by status codes and appropriate error messages/actions */
        Honeybadger.notify(error);
        console.log(error);
        this.setState({
          documentLoading: false,
        });
      }
    }
  };

  render() {
    const hasLowBandWidthAlert = this.isReallyLowBandWidthFun() && (
      <h6 className=" oval alert alert-danger">
        {!this.state.isVideoMuted
          ? "You are experiencing a slow connection, please turn off your video for a better experience"
          : "You are experiencing a slow connection"}
      </h6>
    );

    const hasMutedByModeratorNotification = (
      <Fragment>
        {this.state.isMutedNotify && !this.state.muteButtonClick && (
          <h6 className=" oval alert alert-danger">
            You have been muted by moderator. Click to unmute.
          </h6>
        )}
      </Fragment>
    );

    const participantMapVideo = [];
    if (this.state.smallScreensMap) {
      let i = 0;
      for (const [key, value] of this.state.smallScreensMap.entries()) {
        i++;
        if (key !== null) {
          participantMapVideo.push(
            <div
              id={`${i < 16 ? "sc1" : "sc2"}`}
              className={`small-screen-container ${!this.handleAudioStatus(key) && 'mute-active'} ${i > 15 && "more-users"} ${
                // className={`small-screen-container ${i > 15 && "more-users"} ${
                this.state.isTileView && "flex-item"
                }`}
              onClick={this.togglePinParticipant}
              onContextMenu={this.contextMenu}
              onMouseOver={
                !this.state.isTileView
                  ? this.showConnectionQuality
                  : (this.isCardToggled = false)
              }
              onMouseOut={() => (this.isCardToggled = false)}
              dangerouslySetInnerHTML={{ __html: value }}
              key={key}
            ></div>
          );
        }
      }
    }

    const participantAudio =
      this.state.participantListAudio.length > 0
        ? this.state.participantListAudio.map((participantListAudio, i) => (
          <div
            dangerouslySetInnerHTML={{ __html: participantListAudio }}
            key={i}
          ></div>
        ))
        : null;

    const localStreamConstant = this.state.isModerator ? (
      this.state.isLocalStreaming ? (
        <div className="card-menu">
          <div
            className="card-body-icons"
            onClick={this.sendLocalStreamStopPing}
          >
            <div className="h1 text-muted-menu text-center">
              <img src={recordOn} alt="record" className="recording-on" />
            </div>
            <div className="text-value-menu">Record / Transcribe</div>
          </div>
        </div>
      ) : (
          <div className="card-menu">
            <div
              className="card-body-icons"
              onClick={this.sendLocalStreamStartPing}
            >
              <div className="h1 text-muted-menu text-center">
                <img src={recordOff} alt="recordoff" className="recording-on" />
              </div>
              <div className="text-value-menu">Record / Transcribe</div>
            </div>
          </div>
        )
    ) : null;

    const recordingOnAlert = this.state.isLocalStreaming ? (
      <div className="">
        <div className="container justify recording-alert">
          <div className="text-center">
            <h5>
              <i className="fas fa-dot-circle recording-on"></i> Recording Audio
              Only...
            </h5>
          </div>
        </div>
      </div>
    ) : null;

    const hasConferenceJoinedAlert = this.state.showConnectionStatus ? (
      !this.state.connectionFailed ? (
        this.isJoined ? (
          <h5 className=" oval alert alert-success">
            You are connected to the meeting
          </h5>
        ) : (
            <h5 className=" oval alert alert-secondary">
              Connecting to the Meeting..
            </h5>
          )
      ) : (
          <h5 className=" oval alert alert-danger">
            Connection Failed. Retrying...
          </h5>
        )
    ) : null;

    const chatSideBar = this.state.chatSideBar ? (
      <AppAside className="animated fadeIn chatsidebar-outer">
        <div className="tab-content">
          <div className="tab-pane active" id="chat" role="tabpanel">
            <div className="list-group list-group-accent chat_title_outer">
              <div className="list-group-item list-group-item-accent bg-light text-left font-weight-bold text-muted text-uppercase small">
                Chats
              </div>
            </div>
            {/* <div className="list-group-item list-group-item list-group-item-divider">
              <small className="text-muted">
                <i>This is the beginning of your chat history.</i>
              </small>
            </div> */}
            <div
              id="style-chat"
              className="chat-scrollbar"
              ref={this.messageList}
            >
              {this.state.messages
                ? this.state.messages.map((message, i) => (
                  <ChatBubble
                    key={i}
                    message={message}
                    myDisplayName={this.displayName}
                  />
                ))
                : null}
            </div>
            <div id="app-footer">
              <div className="form-group-chat text_submit_text">
                <Input
                  type="text"
                  name="textarea-input"
                  id="textarea-input"
                  rows="3"
                  placeholder="Type Here.."
                  disabled={this.isJoined ? false : true}
                  onChange={this.handleChatMessage}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      this._sendMessage();
                    }
                  }}
                  value={this.state.message}
                />
              </div>
              <div className="text_submit_buttons">
                <Button
                  color="primary"
                  size="sm"
                  className="chat-button"
                  onClick={this._sendMessage}
                >
                  <img src={send_btn} alt="Send Button" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppAside>
    ) : null;

    const participantSideBar = this.state.participantSideBar ? (
      <AppAside className="animated fadeIn participant-outer">
        <div className="tab-content ">
          <div className="tab-pane active" id="chat" role="tabpanel">
            {this.state.isInviteComponentVisible && (
              <div className="list-group-item">
                <InviteUser
                  meeting={this.state.meeting}
                  closeInviteComponent={this.closeInviteComponent}
                />
              </div>
            )}

            <div
              className="list-group-item list-group-item-accent text-left font-weight-bold text-muted small"
              style={{ marginLeft: "12px" }}
            >
              <p>Participants</p>
              {this.state.currentUser.userName && (
                <span
                  className="clickable"
                  onClick={this.openInviteComponent}
                  style={{ color: "green", fontSize: "21px" }}
                >
                  {" "}
                  <i className="fa fa-plus"></i>&nbsp;Invite
                </span>
              )}
            </div>

            <div className="list-group-item list-group-item-accent">
              <div className="avatar-aside participent_img">
                {this.getProfilePicture(this.state.currentUser.email) ? (
                  <img
                    src={this.getProfilePicture(this.state.currentUser.email)}
                    className="img-avatar"
                    alt={cameraOffPoster}
                  />
                ) : (
                    <img
                      className="img-avatar"
                      src={
                        `https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=50&background=7b79b3&color=fff&name=` +
                        this.state.currentUser.email
                      }
                      alt={cameraOffPoster}
                    />
                  )}
              </div>
              <div className="avatar-aside participent_title">
                <div className="participent_title_inr">
                  {shortenString(this.displayName, 20) || "No Username"}
                </div>
                <small className="text-muted mr-3">
                  {this.state.isModerator ? "Moderator" : "Participant"}
                </small>
              </div>
            </div>
            <div className="participant-scrollbar" id="style-participant">
              {this.state.participantsList.length > 0
                ? this.state.participantsList.map((member, i) => {
                  return (
                    <Participant
                      key={i}
                      member={member}
                      meetingModerator={this.state.meeting}
                      isModerator={this.state.isModerator}
                      muteParticipant={this.handleMuteRemoteParticipant}
                      hexCode={
                        this.state.idAvatarColorMap.get(member._id)
                          ? this.state.idAvatarColorMap.get(member._id)
                          : 808080
                      }
                    />
                  );
                })
                : null}
            </div>
            {this.state.isModerator && (
              <div className="participent-footer-mute">
                <Button
                  type="button"
                  onClick={this.handleMuteAllParticipant}
                  className="mute-button-all"
                >
                  Mute Everyone
                </Button>
              </div>
            )}
          </div>
        </div>
      </AppAside>
    ) : null;

    const documentSideBar = this.state.documentSideBar ? (
      <AppAside className="animated fadeIn participant-outer">
        <div className="tab-content ">
          <div className="tab-pane active" id="chat" role="tabpanel">
            <Modal isOpen={this.state.uploadModal} toggle={this.isModalOpen}>
              <ModalHeader toggle={this.isModalOpen}>
                Add New Documents
              </ModalHeader>
              <ModalBody>
                <label className="file-label">Attach Documents</label>
                <UploadImage
                  onDrop={this.onDrop}
                  removeFile={this.removeFile}
                  files={this.state.photos}
                  label="Profile Photo"
                  name="photos"
                />
                <Button
                  color="primary"
                  block
                  disabled={!this.state.photos.length}
                  style={{ backgroundColor: "#00cccc" }}
                  onClick={this.submitDocument}
                >
                  {!this.state.documentLoading ? (
                    "Add Documents"
                  ) : (
                      <>
                        <Spinner color="light" size="sm" type="grow" /> Uploading
                    </>
                    )}
                </Button>{" "}
              </ModalBody>
              {this.state.documentMessage && (
                <ModalFooter>
                  <div className="invite-success-message">
                    <i
                      className={`fas ${this.state.wasAdded
                        ? "fa-check-circle"
                        : "fa-times-circle"
                        }`}
                    ></i>
                    <strong> {this.state.documentMessage}</strong>
                  </div>
                </ModalFooter>
              )}
            </Modal>

            <div
              className="list-group-item list-group-item-accent text-left font-weight-bold text-muted small"
              style={{ marginLeft: "12px" }}
            >
              <p>Documents</p>
              <span
                className="clickable"
                onClick={this.isModalOpen}
                style={{ color: "green", "font-size": "21px" }}
              >
                {" "}
                <i className="fa fa-plus"></i>&nbsp;ADD NEW
              </span>
            </div>

            <div className="participant-scrollbar" id="style-participant">
              {!this.state.documentLoading ? (
                this.state.documentList.length > 0 ? (
                  this.state.documentList.map((document, i) => {
                    return (
                      <DocumentView
                        key={i}
                        document={document}
                        isModerator={this.state.isModerator}
                        deleteDocument={this.deleteDocument}
                      />
                    );
                  })
                ) : null
              ) : (
                  <ReactLoading
                    type="spin"
                    color="#00c6cc"
                    className="loading"
                    height={100}
                    width={100}
                  />
                )}
            </div>
          </div>
        </div>
      </AppAside>
    ) : null;

    const localSmallScreen = this.state.isJoined ? (
      <div
        onClick={this.togglePinParticipant}
        onMouseOver={this.showConnectionQuality}
        onMouseOut={() => (this.isCardToggled = false)}
        className="small-screen-container hidden-icon"
        dangerouslySetInnerHTML={{ __html: this.state.localSmallScreen }}
      />
    ) : null;

    const smallScreenCollapseButton = (
      <i
        onClick={this.toggleParticipantTiles}
        className={` hand fas fa-chevron-circle-${this.state.hideParticipantTiles ? "right" : "left"
          } 
                    small-screen-collapse-button`}
      />
    );

    return this.state.isMeetingLoaded ? (
      this.state.isPreLaunch ? (
        <PrelaunchPage
          handleMediaDevices={this.handleMediaDevices}
          cameraOptions={this.state.cameraOptions}
          microphoneOptions={this.state.microphoneOptions}
          micDeviceId={this.state.micDeviceId}
          cameraDeviceId={this.state.cameraDeviceId}
          meeting={this.state.meeting}
          disableJoinButton={this.state.disableJoinButton}
          setFlagChangeClick={this.setFlagChangeClick}
          startAudioMuted={this.state.startAudioMuted}
          startVideoMuted={this.state.startVideoMuted}
          setStartAudioMuted={this.setStartAudioMuted}
          setStartVideoMuted={this.setStartVideoMuted}
          connectMeeting={this.connectMeeting}
          cancelLaunch={this.cancelLaunch}
          isGuest={this.state.isGuest}
          isBrowserWarning={this.state.isBrowserWarning}
        />
      ) : (
          <Fragment>
            <div className="wrapper_main">
              <div className="mn_inr_header">
                <div className="mn_inr_header_left">
                  <img
                    className="brand-full logo"
                    src={logo}
                    width="150"
                    height="50"
                    alt="Memoria Logo"
                  ></img>

                  <div className="container justify meeting-alert">
                    <div className="text-center">{hasConferenceJoinedAlert}</div>
                  </div>
                  <div className="container justify meeting-alert">
                    <div className="text-center">{hasLowBandWidthAlert}</div>
                  </div>
                  <div className="container justify meeting-alert">
                    <div className="text-center">
                      {hasMutedByModeratorNotification}
                    </div>
                  </div>
                </div>
                <div className="mn_inr_header_right">
                  <ul>
                    <li className={this.state.documentSideBar && "active"}>
                      <img
                        src={documentOff}
                        alt="user-list"
                        onClick={this.documentSideBar}
                        className="aside-menu-toggler d-md-down-none"
                      ></img>
                      {this.state.isJoined &&
                        this.state.documentList &&
                        this.state.documentList.length >= 0 && (
                          <Badge className="count-badge" pill color="primary">
                            {this.state.documentList.length}
                          </Badge>
                        )}
                      {documentSideBar}
                    </li>
                    <li className={this.state.participantSideBar && "active"}>
                      <img
                        src={participant}
                        alt="user-list"
                        onClick={this.participantSideBar}
                        className="aside-menu-toggler d-md-down-none"
                      ></img>
                      {this.state.isJoined &&
                        this.state.participantsList &&
                        this.state.participantsList.length >= 0 && (
                          <Badge className="count-badge" pill color="primary">
                            {/* Adding 1 to the count because logged in user is not part of the participantslist */}

                            {this.state.participantsList.length + 1}
                          </Badge>
                        )}
                      {participantSideBar}
                    </li>

                    <li className={this.state.chatSideBar ? "active" : ""}>
                      <img
                        src={message}
                        alt="message"
                        className="aside-menu-toggler"
                        onClick={this.chatSideBar}
                      ></img>
                      {this.state.unreadCount > 0 && !this.state.chatSideBar && (
                        <Badge className="count-badge" pill color="danger">
                          {this.state.unreadCount}
                        </Badge>
                      )}
                      {chatSideBar}
                    </li>

                    <li>
                      <img
                        src={this.state.isTileView ? tileViewOn : tileViewOff}
                        alt="tileview"
                        onClick={() => this.handleTileView()}
                        className={`fas ${this.state.isTileView
                          ? "fa-th-large fa-th-large-on"
                          : "fa-th-large fa-th-large-off"
                          }  fa-2x th-large`}
                      ></img>
                    </li>

                    <li>
                      <img
                        src={question}
                        alt="question"
                        className="aside-menu-toggler question-circle"
                        onClick={this.handleInterCom}
                      ></img>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="user_iamge_otr">
                <div
                  className={`users_small_img row-override ${this.state.hideParticipantTiles && "hide-side-screen"
                    }${""} ${this.state.hideParticipantTiles && !this.state.isTileView
                      ? "users_small"
                      : "users_small_img"
                    }`}
                >
                  <div className="user_small row-override">
                    <ConnectionQualityCard
                      isOpen={this.isCardToggled}
                      stats={this.connectionStats}
                    ></ConnectionQualityCard>
                    <div className="scrollbar" id="style-1">
                      {localSmallScreen}
                      {!this.state.isTileView && participantMapVideo}
                    </div>
                  </div>
                </div>
                <div
                  className={
                    this.state.hideParticipantTiles
                      ? "user_large_img large_screen_div"
                      : "user_large_img"
                  }
                >
                  {!this.state.isBigScreenHolderMuted &&
                    !this.state.isTileView ? (
                      <video
                        className={`${this.state.screenShareOnBigScreen
                          ? `screen-sharing ${!this.state.hideParticipantTiles &&
                          "sidebar-screen-share"
                          }`
                          : this.state.hasMoreThanOneParticipant ||
                            this.state.isScreenSharingOn
                            ? "video-style"
                            : "video-flip video-style"
                          }
                    `}
                        autoPlay="1"
                        id="localVideo1"
                      />
                    ) : this.state.isTileView && participantMapVideo.length >= 1 ? (
                      <TileView
                        handleShowMore={this.handleShowMore}
                        handleShowLess={this.handleShowLess}
                        participantMapVideo={participantMapVideo}
                      />
                    ) : (this.getProfilePicture(this.state.speakerOnScreen === this.myJitsiId
                      ? this.state.currentUser.email
                      : this.state.idDisplayNameMap.get(
                        this.state.speakerOnScreen
                      )) ? <img
                        src={this.getProfilePicture(this.state.speakerOnScreen === this.myJitsiId
                          ? this.state.currentUser.email
                          : this.state.idDisplayNameMap.get(
                            this.state.speakerOnScreen
                          ))}
                        alt="Smiley face"
                        className="big-screen-avatar"
                        id="localVideo1"
                      /> :
                      <img
                        src={`https://ui-avatars.com/api/?length=1&rounded=true&bold=true&size=165&background=${this.state.idAvatarColorMap.get(
                          this.state.speakerOnScreen
                        )
                          ? this.state.idAvatarColorMap.get(
                            this.state.speakerOnScreen
                          )
                          : "7b79b3"
                          }&color=fff&name=${this.state.speakerOnScreen === this.myJitsiId
                            ? this.state.currentUser.email
                            : this.state.idDisplayNameMap.get(
                              this.state.speakerOnScreen
                            )
                          }`}
                        alt="Smiley face"
                        className="big-screen-avatar"
                        id="localVideo1"
                      />
                      )}
                  <div
                    display="none"
                    dangerouslySetInnerHTML={{ __html: this.state.audio }}
                  ></div>
                  <div display="none">{participantAudio}</div>
                </div>
              </div>

              {/* model endcall */}
              {/* {participantSideBar}
            {chatSideBar} */}
              <Modal
                isOpen={this.state.leaveMeetingWarning}
                toggle={this.toggleEndCallModal}
                size="lg"
                className={"modal-width"}
                contentClassName={"modal-content-override"}
                centered={true}
              >
                <ModalBody className="modal-body-override">
                  Are you sure you want to leave the meeting?
              </ModalBody>
                <ModalFooter className="modal-footer-override">
                  <Button color="secondary" onClick={this.toggleEndCallModal}>
                    Return to Meeting
                </Button>
                  {"  "}
                  <Button
                    color="primary"
                    style={{ width: "27%" }}
                    onClick={this.endCall}
                  >
                    Leave
                </Button>
                </ModalFooter>
              </Modal>

              <Modal
                centered
                size="lg"
                isOpen={this.state.showConnectionFailedModal}
                contentClassName="conn-fail-modal-content"
                backdropClassName="conn-fail-modal-backdrop"
              >
                <ModalBody>
                  <h4 className="text-center">You have been disconnected</h4>
                  <h6 className="text-center">
                    You may want to check your network connection. Reconnecting
                  automatically in{" "}
                    <strong>{this.state.connectionFailedCountdownSeconds}</strong>{" "}
                  seconds
                </h6>
                  <Progress
                    className="conn-fail-progess"
                    value={
                      100 -
                      (100 / this.initialConnectionFailedCountdownSeconds) *
                      this.state.connectionFailedCountdownSeconds
                    }
                    animated
                  />
                  <Button
                    className="conn-fail-modal-button"
                    color="primary"
                    onClick={this.onClickRejoinNow}
                  >
                    Rejoin now
                </Button>
                </ModalBody>
              </Modal>

              {/* end model */}

              <div className="call_mn_otr">
                {recordingOnAlert}
                <div className="call_inr_otr">
                  <div className="call_name">
                    <div className="meeting-card">
                      <div
                        className="meeting-card-body"
                        onMouseOver={this.displayFullMeetingTitle}
                      >
                        <div>
                          <div className="collapsebtn">
                            {smallScreenCollapseButton}
                          </div>
                          <div className="metting_name_content">
                            {this.state.meeting
                              ? shortenString(this.state.meeting.title, 23)
                              : "..Loading"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`card-container-menu call_details col-lg-${this.state.isModerator
                      ? "7"
                      : "6 no-moderator-actions call_details"
                      }`}
                  >
                    <ul>
                      <li>
                        {" "}
                        <div className="card-menu">
                          <div
                            className="card-body-icons bar_menu"
                            onClick={this.onVideoMuteStateChanged}
                          >
                            <div className="h1 text-muted-menu text-center">
                              <img
                                src={
                                  !this.state.isVideoMuted ? videoOn : videoOff
                                }
                                alt=""
                                className={`fas hand ${this.state.isScreenSharingOn ||
                                  !this.state.videoTrackLocalState
                                  ? "disable-action bar_menu"
                                  : "bar_menu"
                                  } fa-video${this.state.isVideoMuted ||
                                    !this.state.videoTrackLocalState
                                    ? "-slash"
                                    : ""
                                  }`}
                              />
                            </div>
                            <div className="text-value-menu">
                              {this.state.isVideoMuted ? "Video Off" : "Video On"}
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="card-menu">
                          <div
                            className="card-body-icons bar_menu"
                            onClick={() => {
                              this.onAudioMuteStateChanged();
                              this.setFlagChangeClick();
                            }}
                          >
                            <div className="h1 text-muted-menu text-center">
                              <img
                                src={
                                  !this.state.isAudioMuted ? audioOn : audioOff
                                }
                                className={`fas hand ${!this.state.audioTrackLocalState
                                  ? "disable-action bar_menu"
                                  : "bar_menu"
                                  } fa-microphone${this.state.isAudioMuted ||
                                    !this.state.audioTrackLocalState
                                    ? "-slash"
                                    : ""
                                  }`}
                                alt=""
                              />
                            </div>
                            <div
                              className={`${this.state.isAudioMuted && "text-mute"
                                } text-value-menu`}
                            >
                              {this.state.isAudioMuted ? "Audio Off" : "Audio On"}
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="card-menu">
                          <div
                            className="card-body-icons bar_menu"
                            onClick={() => {
                              this.state.isScreenSharingOn
                                ? this.switchVideo()
                                : this.shareScreen();
                            }}
                          >
                            <div className="h1 text-muted-menu text-center">
                              <img
                                src={
                                  this.state.isScreenSharingOn
                                    ? screenShareOn
                                    : screenshareOff
                                }
                                alt=""
                                className="bar_menu"
                              />
                            </div>
                            <div className="text-value-menu">
                              {this.state.isScreenSharingOn
                                ? "Stop Screen Share"
                                : "Screen Share"}
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>{localStreamConstant}</li>
                    </ul>
                  </div>
                  <div className="call_ending">
                    <div className="card-menu">
                      <div className="card-body-icons">
                        <div
                          className="h1 text-muted-menu text-ceter text-value-menu end_call"
                          onClick={this.toggleEndCallModal}
                        >
                          <img src={phoneCallEnd} alt="End Meeting" />
                          <div className="text-value-menu">End Meeting</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )
    ) : (
        <ReactLoading
          type="spin"
          color="#FFFFFF"
          className="loading"
        // height={100}
        // width={100}
        />
      );
  }
}

export default MeetingPage; 