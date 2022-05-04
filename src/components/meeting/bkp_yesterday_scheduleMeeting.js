// React System Libraries
import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import Axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Select from 'react-select';

// Customised Libraries or components
import '../../css/new-style.css';
import { ENDPOINTURL } from '../common/endpoints';
import { randomString } from '../randomString';
import CheckLoginStatus from '../common/loginStatus';
import NewNavbar from '../common/newNavbar';
import { ValidateMeetingTitle , Validateinvites} from '../validation';

// Global Variables declarations
const queryString = require('query-string');
let meetingTime = "";
let totalEmails = 0;

function ScheduleMeeting(props){

    //Storing Values in useState
    let currentTime = new Date();
    let currentEndTime = new Date();
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingStartTime, setMeetingStartTime] = useState('');
    const [meetingEndTime, setMeetingEndTime] = useState(''); 
    const [meetingDescription, setMeetingDescription] = useState("");    
    const [meetingId, setMeetingId] = useState("");
    const { editmeeting } = queryString.parse(props.location.search);
    const [meetingTitleErr, setMeetingTitleErr] = useState('');
    const [invitesErr, setInvitesErr] = useState('');
    const [componentStatus, setComponentStatus] = useState("");
    const [meetingInvities, setMeetingInvities] = useState([]);
    const [selectedMeetingInvites, setSelectedMeetingInvites] = useState([]);
    const [startDate, setStartDate] = useState(currentTime);
    const [endDate, setEndDate] = useState(currentEndTime.setHours(currentTime.getHours() + 1));
    let sessionEditemails = [];

    //When This component needs to do something after render editmeeting.
    useEffect(() => {

        // validate user is logged in to access
        const isUserLoggedIn = CheckLoginStatus();
        if(isUserLoggedIn === false) {
            props.history.push('/');
        }

        // Get List active students for meeting
        getEmailSuggestion("Student");

        //EditMeeting
        if (editmeeting === 'true') {
            let edit_session = localStorage.getItem("edit_session");            
            edit_session = JSON.parse(edit_session);
            setMeetingId(edit_session.meetingId);
            setMeetingTitle(edit_session.meetingTitle);
            setMeetingDescription(edit_session.meetingDesc);
            setMeetingStartTime(edit_session.modifiedOn);
            setMeetingEndTime(edit_session.modifiedOn);
            //setStartDate(Date.parse(edit_session.startMeetingTime));
            //setEndDate(edit_session.endMeetingTime);
            meetingTime = edit_session.startTime;
            let user_email = localStorage.getItem("user_email");
            let sess_emails = edit_session.invites;

            sess_emails.map(email => {
                if(email.length !== 0 ){
                    sessionEditemails.push({ value: email, label: email })                   
                }                   
            });
            emailHandler(sessionEditemails);
        }
    }, []);

    //For Email Suggestion
    const getEmailSuggestion = async (user_role) => {
        
        // if no invities selected make clear the array and return
        if (user_role.length === 0) {
            setMeetingInvities([]);
            return;
        }

        // Get All Active students to invite
        try {
            const token = localStorage.getItem("auth_token");
            const invitesSuggestions = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Student`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (invitesSuggestions.data.Status == "200"){
                let response = invitesSuggestions.data.data;
                let inviteResult = [];
                response.map(data => {
                    if(data.email.length !== 0 ){
                        inviteResult.push({ value: data.email, label: data.email });
                    }
                });
                setMeetingInvities(inviteResult)                                
            }
        } catch (error) {
            props.history.push("/error")
        }
    }

    //When user Save created Meeting
    const submitHandler = async (e) => {
        const meetingTitleRes = ValidateMeetingTitle(meetingTitle);
        const invitesRes = Validateinvites(totalEmails);        
        if(meetingTitleRes.status && invitesRes.status){
            setMeetingTitleErr("")
            setInvitesErr("")                     
            
            const roomName = randomString(15);
            const token = localStorage.getItem('auth_token')
            const user_id = localStorage.getItem("user_id");
            let userEmail = localStorage.getItem("user_email");
            let invitedEmails = selectedMeetingInvites;
            invitedEmails.push(userEmail);
            
            try {
                setComponentStatus({
                    status: "processing",
                    message: "Processing..."
                })
                const saveMeetingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/saveMeetingAPI`, {
                    meetingEntity: {
                        "roomName": roomName,
                        "meetingTitle": meetingTitle,
                        "meetingDesc": meetingDescription,
                        "invites": invitedEmails,
                        "startTime": meetingStartTime,
                        "endTime": meetingEndTime,
                        "startMeetingTime": startDate,
                        "endMeetingTime": endDate,
                        "user": {
                            "id": user_id
                        }
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if(saveMeetingResponse.data.Status === "200"){
                    setComponentStatus({
                        status: "OK",
                        message: saveMeetingResponse.data.message
                    });

                    props.history.push("/user/meeting/meetinglist")                   
                }else{
                    setComponentStatus({
                        status: "error",
                        message: saveMeetingResponse.data.message
                    })
                }       
            } catch (error) {
                props.history.push("/error")
            }
        }else{
            setMeetingTitleErr(meetingTitleRes.error);
            setInvitesErr(invitesRes.error);                             
        }
    }
    
    //When user want to edit Meeting 
    const editSessionHandler = async (e) => {
        e.preventDefault();
        let token = localStorage.getItem('auth_token');
        const roomName = randomString(15);
        const user_id = localStorage.getItem("user_id");
        let userEmail = localStorage.getItem("user_email");
        let invitedEmails = selectedMeetingInvites;
        invitedEmails.push(userEmail);
        const meetingTitleRes = ValidateMeetingTitle(meetingTitle);
        const invitesRes = Validateinvites(invitedEmails.length);        
        if(meetingTitleRes.status && invitesRes.status){
            setMeetingTitleErr("")
            setInvitesErr("")     
            try {
                const editMeetingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/editMeetingAPI`, {
                    meetingEntity: {
                        "roomName": roomName,
                        "meetingId": meetingId,
                        "meetingTitle": meetingTitle,
                        "meetingDesc": meetingDescription,
                        "invites": invitedEmails,
                        "startTime": meetingStartTime,
                        "endTime": meetingEndTime,
                        "startMeetingTime": startDate,
                        "endMeetingTime": endDate,
                        "user": {
                            "id": user_id
                        }
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                let role = localStorage.getItem('user_role');
                if (role === 'Admin') {
                    props.history.push("/Adminpanelmain")
                } else {
                    props.history.push("/user/meeting/meetinglist")
                }
            } catch (error) {
                props.history.push("/error")
            }
        }else {     
            setMeetingTitleErr(meetingTitleRes.error);
            setInvitesErr(invitesRes.error)                             
        }  
    } 

    //For Set StartMeeting and EndMeeting DateandTime
    const dateHandler = (e,date_type) => {
        // Set Selected Date to useState
        if(date_type == "startdate"){
            setStartDate(e);
        }
        if(date_type == "enddate"){
            setEndDate(e);
        }

        // Get Timing data from selected by user
        let year = e.getFullYear();
        let month = e.getMonth() + 1;
        let date = e.getDate();
        let hour = e.getHours();
        let minutes = e.getMinutes();
        let seconds = e.getSeconds();
        if (month < 10) {month = "0" + month;}
        if (date < 10) {date = "0" + date;}
        if (hour < 10) {hour = "0" + hour;}
        if (minutes < 10) {minutes = "0" + minutes;}
        if (seconds < 10) {seconds = "0" + seconds;} else {seconds = parseInt(seconds);seconds = (seconds).toFixed(3);}
        if (seconds === "0.000") {seconds = "00.000";}

        if(date_type == "startdate"){
            let selected_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds
            setMeetingStartTime(selected_time);
        }

        if(date_type == "enddate"){
            let selected_end_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds;
            setMeetingEndTime(selected_end_time);
        }

        /*let endtime = moment(e).add(30, "minutes")
        endtime = endtime._d;

        let end_year = endtime.getFullYear();
        let end_month = endtime.getMonth() + 1;
        if (end_month < 10) {
            end_month = "0" + end_month;
        }
        let end_date = endtime.getDate();
        if (end_date < 10) {
            end_date = "0" + end_date;
        }
        let end_hour = endtime.getHours();
        if (end_hour < 10) {
            end_hour = "0" + end_hour;
        }
        let end_minutes = endtime.getMinutes();
        if (end_minutes < 10) {
            end_minutes = "0" + end_minutes;
        }
        let end_seconds = endtime.getSeconds();
        if (end_seconds < 10) {
            end_seconds = "0" + end_seconds;
        } else {
            end_seconds = parseInt(end_seconds);
            end_seconds = (end_seconds).toFixed(3);
        }
        if (end_seconds === "0.000") {
            end_seconds = "00.000";
        }
        let selected_end_time = end_year + "-" + end_month + "-" + end_date + "T" + end_hour + ":" + end_minutes + ":" + end_seconds;
        setMeetingEndTime(selected_end_time);          */
    }

    //For Handling Users By email
    const emailHandler = (e) => {
        let selectedMeetingInvites = [];      
        totalEmails = e.length;
        if(e.length !== 0){
            e && e.map((singleinvitie,i) => (
                selectedMeetingInvites.push(singleinvitie.value)
            ))
            setSelectedMeetingInvites(selectedMeetingInvites);            
        }     
    }

    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
        return currentDate.getTime() < selectedDate.getTime();
    };

    return(
        <div className="classroom_list"> 
        <NewNavbar />   
        <div className="cl_edit_content">
            <div className="wrapper">
                <div className="cl_edit_content_box">
                    <div className="cl_edit_title">
                        <h2>강의 상세</h2>
                    </div>
                    <div className="cl_lecture_details">
                        <div className="client_login_content_form_box">
                            <label>제목</label>
                            <input type="text" name="meeting_title" placeholder="수어 베이직 강의" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}/>
                            <small className="error">{meetingTitleErr}</small>
                        </div>
                        <div className="client_login_content_form_box">
                            <label>시작 시간</label>
                            <DatePicker
                              showTimeSelect
                              selected={startDate}
                              minDate={new Date()}
                              onChange={(date) => dateHandler(date,'startdate')}
                              dateFormat="MMMM d, yyyy h:mm aa"
                              filterTime={filterPassedTime}
                            />                            
                        </div>
                        <div className="client_login_content_form_box">
                            <label>종료일</label>
                            <DatePicker
                              showTimeSelect
                              selected={endDate}
                              minDate={startDate}
                              onChange={(date) => dateHandler(date,'enddate')}
                              dateFormat="MMMM d, yyyy h:mm aa"
                              filterTime={filterPassedTime}
                            />                            
                        </div>
                        <div className="client_login_content_form_box">
                            <label>일시</label>
                            {
                                editmeeting === "true" ? 
                                <Select 
                                    id = "meeting_invitie"                               
                                    defaultValue={sessionEditemails}
                                    isMulti
                                    name="meeeting_invites"
                                    options={meetingInvities}
                                    onChange = {emailHandler}
                                    className="basic-multi-select"
                                    classNamePrefix="select"                                                           
                                /> :
                                <Select 
                                    id = "meeting_invitie"                               
                                    defaultValue={[meetingInvities[0]]}
                                    isMulti
                                    name="meeeting_invites"
                                    options={meetingInvities}
                                    onChange = {emailHandler}
                                    className="basic-multi-select"
                                    classNamePrefix="select"                                                           
                                /> 
                            }                          
                            <small className="error">{invitesErr}</small>                    
                        </div>

                        <div className="client_login_content_form_box">
                            <label>일시</label>
                            <textarea value={meetingDescription} placeholder="강의에 관한 설명 입력" onChange={(e) => setMeetingDescription(e.target.value)} ></textarea>
                        </div>
                        <div className="submit_btn_box">
                            <Link to="/user/meeting/meetinglist"><button type="button" className="cl_cancel_btn">취소</button></Link>
                            {
                                editmeeting === "true" ?                            
                                <button type="button" className="cl_save_btn" onClick={editSessionHandler}>최신 정보</button> : 
                                <button type="button" className="cl_save_btn" onClick={submitHandler}>저장</button>
                            }

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
                    </div>
                </div>
            </div>
        </div>
    </div>  
    )
}
export default ScheduleMeeting;
