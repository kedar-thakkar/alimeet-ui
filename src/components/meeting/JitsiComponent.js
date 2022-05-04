import React,{Component} from 'react'

class JitsiComponent extends Component {

    //domain = 'localhost:8080';
    //domain = 'dockermeet.memoriadev.com';
    domain = 'dev.alibiz.net';
    api = {};

    constructor(props) {
        super(props);
       
        this.state = {
            room: props.newRoomName,
            user: {
                name: props.userName
            },
            isVideoMuted: false,
            userRole: props.userRole,
        }
    }

    startMeet = () => {
        const options = {
            roomName: this.state.room,
            width: '100%',
            height: 500,
            configOverwrite: { 
                startWithAudioMuted: true  },
            parentNode: document.querySelector('#jitsi-iframe'),
            userInfo: {
                displayName: this.state.user.name
            }
        }
        this.api = new window.JitsiMeetExternalAPI(this.domain, options);

        this.api.addEventListeners({
            videoMuteStatusChanged: this.handleVideoStatus
        });

       // this.executeCommand('toggleShareScreen');
       //this.api.executeCommand('toggleVideo');
    }

    handleVideoStatus = (video) => {
        console.log("handleVideoStatus", video); // { muted: true }
        if(video.muted==true){
            console.log("Checckccckkkk")
            video.muted=false
            this.setState({isVideoMuted:false})
        }
    }

    executeCommand(command) {
        this.api.executeCommand(command);
       
        if(command == 'toggleShareScreen'){
            if(this.state.isVideoMuted){
                this.setState({ isVideoMuted: true});
            }
        }
    }

    componentDidMount() {
        if (window.JitsiMeetExternalAPI) {
            this.startMeet();

            setTimeout(() => {
                //alert('this.state.userRole ==> '+this.state.userRole);
                if(this.state.userRole === "Teacher"){
                   this.api.executeCommand('toggleShareScreen');
                }
            }, 15000)
        } else {
            alert('JitsiMeetExternalAPI not loaded');
        }
    }

    render() {
        const { isAudioMuted, isVideoMuted } = this.state;
        return (
            <div>
            <header className="nav-bar">
                <p className="item-left heading">Jitsi React</p>
            </header>
            <div id="jitsi-iframe"></div>
            <div class="item-center">
                 
            </div>
            <div class="item-center d-flex justify-content-center">
                <span>&nbsp;&nbsp;</span>
                {/* <i onClick={ () => this.executeCommand('toggleVideo') } className={`fa fa-2x grey-color ${isVideoMuted ? 'fa-video-slash' : 'fa-video'}`} aria-hidden="true" title="Start / Stop camera"></i>
                <i onClick={ () => this.executeCommand('toggleShareScreen') } className="fa fa-film fa-2x grey-color" aria-hidden="true" title="Share your screen"></i> */}
            </div>
            </div>
        );
    }
}

export default JitsiComponent;
