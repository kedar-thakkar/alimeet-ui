import React, { useEffect, useState } from 'react';
import CheckLoginStatus from '../common/loginStatus';
import DatePicker from "react-datepicker";
import '../../css/new-style.css';
import Select from 'react-select';
import NewNavbar from '../common/newNavbar';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import { randomString } from '../randomString';
import moment from 'moment'
import { Link } from 'react-router-dom';
import { ValidateMeetingTitle , Validateinvites} from '../validation';
const queryString = require('query-string');
let meetingTime = "";
let totalEmails = 0;

function ScheduleMeeting(props){

    //Storing Values in useState
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
    
    let sessionEditemails = []
    //When This component needs to do something after render editmeeting.
    useEffect(() => {
        //When this component needs to do something after render to check LoginStatus.
        const response = CheckLoginStatus();
        if (response === false) {
            props.history.push('/');
        } else {
            dateHandler();
        }

        getEmailSuggestion("Student");

        //EditMeeting
        if (editmeeting === 'true') {
            let edit_session = localStorage.getItem("edit_session");            
            edit_session = JSON.parse(edit_session);            
            setMeetingId(edit_session.meetingId);
            setMeetingTitle(edit_session.meetingTitle)
            setMeetingDescription(edit_session.meetingDesc)
            setMeetingStartTime(edit_session.modifiedOn)
            meetingTime = edit_session.startTime;            
            let user_email = localStorage.getItem("user_email");
            let sess_emails = edit_session.invites;            
            
            sess_emails.map(email => {
                if(email.length !== 0 ){
                    sessionEditemails.push({ value: email, label: email })                   
                }                   
            })
            setSelectedMeetingInvites(sessionEditemails);                      
        }
    }, [])

    //For Email Suggestion
    const getEmailSuggestion = async (user_role) => {
        if (user_role.length === 0) {
            setMeetingInvities([]);
            return;
        }
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Student`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })           
            if (data.data) {
                let response = data.data;                
                let inviteResult = [];
                response.map(data => {
                    if(data.email.length !== 0 ){
                        inviteResult.push({ value: data.email, label: data.email })                        
                    }                   
                })
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
                const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/saveMeeting`, {
                    meetingEntity: {
                        "roomName": roomName,
                        "meetingTitle": meetingTitle,
                        "meetingDesc": meetingDescription,
                        "invites": invitedEmails,
                        "startTime": meetingStartTime,
                        "endTime": meetingEndTime,
                        "user": {
                            "id": user_id
                        }
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })                  
                if(data === "Save Successfully"){
                    setComponentStatus({
                        status: "OK",
                        message: "Save Successfully"
                    })
                    props.history.push("/user/meeting/meetinglist")                   
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "Meeting not saved"
                    })
                }       
            } catch (error) {
                props.history.push("/error")
            }
        }else {     
            setMeetingTitleErr(meetingTitleRes.error);
            setInvitesErr(invitesRes.error)                             
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
                const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/editMeeting`, {
                    meetingEntity: {
                        "roomName": roomName,
                        "meetingId": meetingId,
                        "meetingTitle": meetingTitle,
                        "meetingDesc": meetingDescription,
                        "invites": invitedEmails,
                        "startTime": meetingStartTime,
                        "endTime": meetingEndTime,
                        "user": {
                            "id": user_id
                        }
                    }
                }, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })            
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
    const dateHandler = (e) => {       
        if (!e) {
            e = new Date();
        }
        let year = e.getFullYear()

        let month = e.getMonth() + 1
        if (month < 10) {
            month = "0" + month;
        }

        let date = e.getDate();
        if (date < 10) {
            date = "0" + date;
        }

        let hour = e.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }

        let minutes = e.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        let seconds = e.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        } else {
            seconds = parseInt(seconds);
            seconds = (seconds).toFixed(3);
        }
        
        if (seconds === "0.000") {
            seconds = "00.000";
        }

        let selected_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds
        setMeetingStartTime(selected_time)

        let endtime = moment(e).add(30, "minutes")
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
        setMeetingEndTime(selected_end_time);          
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
        // console.log("selectedMeetingInvites",selectedMeetingInvites)        
    }

    return(
        <div className="classroom_list"> 
        <NewNavbar />   
        <div className="cl_edit_content">
            <div className="wrapper">
                <div className="cl_edit_content_box">
                    <div className="cl_edit_title">
                        <h2>강의 상세</h2>
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
                    <div className="cl_lecture_details">
                        <div className="client_login_content_form_box">
                            <label>제목</label>
                            <input type="text" placeholder="수어 베이직 강의" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}/>
                            <small className="error">{meetingTitleErr}</small>
                        </div>
                        <div className="client_login_content_form_box">
                            <label>일시</label>
                            <DatePicker className="form-control" onChange={dateHandler} value={meetingStartTime} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
                        </div>                      
                        <div className="client_login_content_form_box">
                            <label>일시</label>
                            {
                                editmeeting === "true" ? 
                                <Select 
                                    id = "meeting_invitie"                               
                                    defaultValue={sessionEditemails}
                                    isMulti
                                    name="colors"
                                    options={meetingInvities}
                                    onChange = {emailHandler}
                                    className="basic-multi-select"
                                    classNamePrefix="select"                                                           
                                /> :
                                <Select 
                                    id = "meeting_invitie"                               
                                    defaultValue={[meetingInvities[0]]}
                                    isMulti
                                    name="colors"
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
                        <Link to="/user/meeting/meetinglist">
                            <button type="button" className="cl_cancel_btn">취소</button>
                        </Link>
                        {
                            editmeeting === "true" ?                            
                            <button type="button" className="cl_save_btn" onClick={editSessionHandler}>최신 정보</button> : 
                            <button type="button" className="cl_save_btn" onClick={submitHandler}>저장</button>
                           
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
