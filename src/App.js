import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NewSignup from './components/signup/newsignup';
import exampleMeeting from './components/meeting/exampleMeeting';
import preLaunch from './components/meeting/prelaunch';
import "./css/fonts/stylesheet.css"
import "react-datepicker/dist/react-datepicker.css";
import 'react-tagsinput/react-tagsinput.css'
import "./css/mdb.min.css"
import "./css/magnific-popup.css"
import "./css/slick.css"
// import "./css/style.css"
import "./App.css"
import Jitsi from './components/meeting/jitsi';
import EditProfile from './components/profile/editProfile';
import MeetingList from './components/meeting/meetingList';
import ScheduleMeeting from './components/meeting/scheduleMeeting';
import VerifyNewAccount from './components/verifyAccount';
import Videoresize from './components/meeting/Videoresize';
import ResetPassword from './components/resetPassword/resetPassword';
import Whiteboard from './components/meeting/whiteboard';
import Fabricwhiteboard from './components/meeting/fabricwhiteboard'
import adminpanel from './components/adminpanel';
import Adminmeetings from './components/Adminmeetings';
import Adminpanelmain from './components/adminpanelmain';
import STT from './components/STTComponent';
import ScreenRecording from './components/meeting/screenRecording';
import DocumentUpload from './components/documentUpload';
import Recorder from './components/Recorder';
import ViewRecording from './components/meeting/viewRecording';
import ExampleUI from './components/meeting/exampleUI';
import MeetingUI from './components/meeting/meetingUI';
import TestRecorder from './components/testRecorder';
import latestLogin from './components/login/latestLogin';
import MeetingAttendence from './components/meeting/meetingAttendence';
import NewWhiteBoard from './components/meeting/newWhiteboard';
import UserAttendence from './components/meeting/userAttendence';
import NewScheduleMeeting from './components/meeting/newScheduleMeeting';
import Error from './components/errorPage/error';
import MailSend from "./components/signup/mailsend";
import ForgotPassword from './components/forgotPassword/newforgotPassword';
import NewNavbar from './components/common/newNavbar';
import Search from './components/common/search';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          {/* <Route path="/" exact component={Login} /> */}
          {/*<Route path="/" exact component={NewLogin}/>*/}
          <Route path="/" exact component={latestLogin}/>
          {/* <Route path="/signup" component={SignUp} /> */}
          <Route path="/signup" component={NewSignup} />
          {/* <Route path="/admin/register" component={SignUp} /> */}
          <Route path="/error" component={Error} />
          <Route path="/user/profile/editprofile" component={EditProfile} />
          <Route path="/navbar" component={NewNavbar} />
          <Route path="/search" component={Search} />

          <Route path="/user/meeting/jitsi" component={Jitsi} />
          {/* <Route path="/user/meeting/meetinglist" component={MeetingList} />  */}
          <Route path="/user/meeting/meetinglist" component={MeetingList} /> 
          {/* <Route path="/user/meeting/exampleMeeting" component={exampleMeeting} />           */}
          <Route path="/ViewRecording" component={ViewRecording} />
          
          <Route path="/user/meeting/schedulemeeting" component={ScheduleMeeting} />
          <Route path="/user/meeting/newschedulemeeting" component={NewScheduleMeeting} />
          

	        <Route path="/user/meeting/prelaunch" component={preLaunch} />
	        <Route path="/user/account/verifyaccount" component={VerifyNewAccount} />
 	        <Route path="/resetpassword" component={ResetPassword} />
	        <Route path="/Videoresize" component={Videoresize}/>  

          <Route path="/Whiteboard" component={Whiteboard}/>
          <Route path="/Fabricwhiteboard" component={Fabricwhiteboard}/>
          <Route path="/newwhiteboard" component={NewWhiteBoard}/>
          <Route path="/mailsend" component={MailSend}/>
          <Route path="/forgotpassword" component={ForgotPassword}/>                 

          {/* <Route path="/user/meeting/ExampleUI" component={ExampleUI}/> */}
          <Route path="/user/meeting/MeetingUI" component={MeetingUI}/>
          <Route path="/user/meeting/MeetingUI/:id" component={MeetingUI}/>
          <Route path="/Adminpanelmain" component={Adminpanelmain}/>
          <Route path="/screen-recording"component={ScreenRecording}/>
          <Route path="/documentupload"component={DocumentUpload}/>
          <Route path="/Recorder"component={Recorder}/>
          <Route path="/testrecorder"component={TestRecorder}/>
          <Route path="/user/meeting/attendence"component={MeetingAttendence}/>
          <Route path="/user/meeting/attendence/:id"component={MeetingAttendence}/>
          <Route path="/user/meeting/userAttendence/:id"component={UserAttendence}/>

        </Switch>
      </div>
    </Router>
  );
}

export default App; 