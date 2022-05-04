import React, { useEffect, useState } from 'react';
import CheckLoginStatus from '../common/loginStatus';
import Navbar from '../common/navbar';
import DatePicker from "react-datepicker";
import moment from 'moment'
import TagsInput from 'react-tagsinput'
import Axios from 'axios'
import { ENDPOINTURL } from '../common/endpoints';
import { randomString } from '../randomString';
import { Link } from 'react-router-dom';
import { ValidateMeetingTitle ,Validateinvites} from '../validation';
const queryString = require('query-string');
let meetingTime = "";
let totalEmails = 0;
function NewScheduleMeeting(props) {

    //Storing Values in useState
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingStartTime, setMeetingStartTime] = useState('');
    const [meetingEndTime, setMeetingEndTime] = useState('');
    const [invites, setInvites] = useState([]);
    const [inputEmail, setInputEmail] = useState("");
    const [newEnteredEmail, setNewEnteredEmail] = useState("");
    const [meetingDescription, setMeetingDescription] = useState("");
    const [error, setError] = useState("");
    const [meetingId, setMeetingId] = useState("");
    const [emailSuggestions, setEmailSuggestion] = useState([]);    
    const { editmeeting } = queryString.parse(props.location.search);
    const [meetingTitleErr, setMeetingTitleErr] = useState('');
    const [invitesErr, setInvitesErr] = useState('');
    const [componentStatus, setComponentStatus] = useState("");   

    //Declare Variable For Styling Navbar
    const navbarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%'
    }

    //When this component needs to do something after render.
    useEffect(() => {
        const response = CheckLoginStatus();
        if (response === false) {
            props.history.push('/');
        } else {
            dateHandler();
        }
    }, [])

    //When This component needs to do something after render editmeeting.
    useEffect(() => {
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
            sess_emails = sess_emails.filter((email) => email !== user_email);
            setInvites(sess_emails)   
        }
    }, [])

    //For Set StartMeeting and EndMeeting DateandTime
    const dateHandler = (e) => {
        try {
            if (!e) {
                e = new Date();
            }
            let year = e.getFullYear();
    
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
        } catch (error) {
            props.history.push("/error")
        }
    }

    //When user Save created Meeting
    const submitHandler = async (e) => {
        const meetingTitleRes = ValidateMeetingTitle(meetingTitle);
        const invitesRes = Validateinvites(invites);
        if(meetingTitleRes.status && invitesRes.status){
            setMeetingTitleErr("")
            setInvitesErr("")
            // e.preventDefault();        
            const roomName = randomString(15);
            const token = localStorage.getItem('auth_token')
            const user_id = localStorage.getItem("user_id");
            let userEmail = localStorage.getItem("user_email");
            let invitedEmails = invites;
            invitedEmails.push(userEmail);
            // props.history.push("/user/meeting/meetinglist")
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
            setInvitesErr(invitesRes.error);                      
        }       
    }

    //For Handling Users By email
    const emailHandler = (e) => {
        if(totalEmails >= e.length){
            console.log("this is emails: ", e);
            setInvites(e)
            totalEmails = e.length;
            return ;
        }
        totalEmails = e.length
        let token = localStorage.getItem('auth_token');
        let arr_len = e.length;
        let new_email = (e[arr_len - 1]);
        if (!new_email) {
            setInvites(e);
            return null;
        }
        new_email = new_email.split(',');
        new_email.map(async (email) => {
            let userEmail = email.replaceAll(' ', '');
            if (userEmail) {
                try {
                    const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${userEmail}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                    setInvites(invites => [...invites, userEmail]);
                } catch (error) {
                    setError(`${userEmail} is not a registered user.`);
                }
            } else {
                setInvites(e);
            }
            setNewEnteredEmail('')
            setInputEmail('')
        })
    }

    //When user want to edit Meeting 
    const editSessionHandler = async (e) => {
        e.preventDefault();
        let token = localStorage.getItem('auth_token');
        const roomName = randomString(15);
        const user_id = localStorage.getItem("user_id");
        let userEmail = localStorage.getItem("user_email");
        let invitedEmails = invites;
        invitedEmails.push(userEmail);
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
    }

    //For Email Suggestion
    const getEmailSuggestion = async (entered_email) => {
        if (entered_email.length === 0) {
            setEmailSuggestion([]);
            return;
        }
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getUserDataByEmail/${entered_email}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (data.data) {
                let response = data.data;
                let emailArr = [];
                response.map(data => {
                    emailArr.push(data.email)
                })
                setEmailSuggestion(emailArr);
            }
        } catch (error) {
            props.history.push("/error")
        }

    }

    //For Adding Email From Suggestion
    const addEmailFromSuggesstion = async (email) => {
        const token = localStorage.getItem("auth_token");
        const new_email = email;
        console.log('invities: ', invites)
        if (new_email) {
            try {
                const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${new_email}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                if (data.id) {
                    setInvites(invites => [...invites, new_email]);
                }
            } catch (error) {
                setError(`${new_email} is not a registered user.`);
            }
        }
        setNewEnteredEmail('')
        setInputEmail('')
    }

    //When This component needs to do something after render newEnteredEmail .
    useEffect(() => {
        if (newEnteredEmail || newEnteredEmail.length === 0) {
            setInputEmail(newEnteredEmail)
            getEmailSuggestion(newEnteredEmail);
        }
    }, [newEnteredEmail])

    return (
        <>
        <div>
            <Navbar style={navbarStyle} />            
        </div>
        <div className="schedule-meeting-container">
            <div className="schedule-meeting-form-container">
                <form>
                    {
                        componentStatus && componentStatus.status === "OK" &&
                        <p className="text-success">{componentStatus.message}</p>
                    }
                    {
                        componentStatus && componentStatus.status === "error" &&
                        <p className="text-danger">{componentStatus.message}</p>
                    }
                    <h3>강의 상세</h3>                   
                    <div className="form-group">
                        <label>제목</label>
                        <input type="text" className="form-control" placeholder="강의 제목 입력" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} />
                        <small className="error">{meetingTitleErr}</small>
                    </div>
                    <div className="form-group">
                        <label>일시</label>
                        <DatePicker className="form-control" onChange={dateHandler} value={meetingStartTime} showTimeSelect dateFormat="MMMM d, yyyy h:mm aa" />
                    </div>
                    <div className="form-group">
                        <label>수강생</label>
                        {/* <input type="text" className="form-control" /> */}
                        <TagsInput
                            value={invites}
                            inputProps={
                                {
                                    className: 'react-tagsinput-input',
                                    placeholder: '이메일 입력',
                                    onChange: (e) => setNewEnteredEmail(e.target.value),
                                    value: newEnteredEmail
                                }
                            }                    
                            onChange={emailHandler}
                        />                       
                        {
                            emailSuggestions && emailSuggestions.map(email => (
                                <button className="blue_btn" type="button" onClick={() => addEmailFromSuggesstion(email)}>{`Add ${email}`}</button>
                            ))
                        }
                        <div className="text-danger">{error}</div>
                        <small className="error">{invitesErr}</small>
                    </div>
                    <div className="form-group">
                        <label>설명</label>
                        <textarea type="text" className="form-control" placeholder="강의에 관한 설명 입력" value={meetingDescription} onChange={(e) => setMeetingDescription(e.target.value)} />
                    </div>
                    <div className="form-action">
                    <Link to="/user/meeting/meetinglist">
                        <button type="button" className="form-control form-cancel-btn">취소</button>
                    </Link>
                    {
                        editmeeting === "true" ?
                            <button className="form-control form-submit-btn" type="submit" onClick={editSessionHandler}>최신 정보</button> :
                            <button id="ClientButton" className="login_btn" onClick={submitHandler} value="로그인">로그인</button>
                            // <button className="form-control form-submit-btn" onClick={submitHandler}>저장</button>
                    }
                </div>
                </form>
            </div>
        </div>
        </>
    )
}

export default NewScheduleMeeting;
