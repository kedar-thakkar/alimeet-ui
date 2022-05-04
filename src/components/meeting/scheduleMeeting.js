// React System Libraries
import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import Axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import $ from 'jquery';
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

// Customised Libraries or components
import '../../css/new-style.css';
import { ENDPOINTURL } from '../common/endpoints';
import { randomString } from '../randomString';
import CheckLoginStatus from '../common/loginStatus';
import NewNavbar from '../common/newNavbar';
import { ValidateMeetingTitle , Validateinvites} from '../validation';

import {ExcelRenderer} from 'react-excel-renderer';
import { findAllInRenderedTree } from 'react-dom/test-utils';

// Global Variables declarations
const queryString = require('query-string');
let meetingTime = "";
let totalEmails = 0;

function ScheduleMeeting(props){

    //Storing Values in useState
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingRoomName, setMeetingRoomName] = useState('');
    const [meetingStartTime, setMeetingStartTime] = useState();
    const [meetingEndTime, setMeetingEndTime] = useState(); 
    const [meetingDescription, setMeetingDescription] = useState("");    
    const [meetingId, setMeetingId] = useState("");
    const { editmeeting } = queryString.parse(props.location.search);
    const [meetingTitleErr, setMeetingTitleErr] = useState('');
    const [invitesErr, setInvitesErr] = useState('');
    const [startDateError, setMeetingStartDateError] = useState('');
    const [endDateError, setMeetingEndDateError] = useState('');
    const [componentStatus, setComponentStatus] = useState("");
    const [meetingInvities, setMeetingInvities] = useState([]);
    const [selectedMeetingInvites, setSelectedMeetingInvites] = useState([]);
    const [selectedInvites, setselectedInvites] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    let sessionEditemails = [];

    
    const [state, setState] = useState([]);
    
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
            
            // Title and Dates
            setMeetingId(edit_session.meetingId);
            setMeetingTitle(edit_session.meetingTitle);
            setMeetingDescription(edit_session.meetingDesc);
            setMeetingRoomName(edit_session.roomName);
            
            // Start and end time
            setStartDate(new Date(parseInt(edit_session.startMeetingTime)).getTime());
            setEndDate(new Date(parseInt(edit_session.endMeetingTime)).getTime());

            // Manage to send for meeting as Kedar needs it to send in this format
            dateHandler(new Date(parseInt(edit_session.startMeetingTime)),'startdate');
            dateHandler(new Date(parseInt(edit_session.endMeetingTime)),'enddate');
            
            // Set Invites

            fillInvities(edit_session.invites);

            // let sess_emails = edit_session.invites;
            // sess_emails.map(email => {
            //     if(email.length !== 0 ){
            //         sessionEditemails.push({ value: email, label: email })                   
            //     }                   
            // });

            //console.log(sessionEditemails)            
        }
    }, []);
    
    const fillInvities = (arrMeeting) => {
        arrMeeting.map(email => {
            if(email.length !== 0 ){
                sessionEditemails.push({ value: email, label: email })                   
            }                   
        });
        
        emailHandler(sessionEditemails);
    } 

    const importFileHandler = (event) => {
        setInvitesErr('');
        let fileObj = event.target.files[0];
        
        if( event.target.files[0].type  ==='application/vnd.ms-excel' || event.target.files[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
            //setResponse('uploading excel...'); 
            ExcelRenderer(fileObj, (err, resp) => {
                if(err){
                      console.log(err);            
                }
                else{
                    let expArr = ['name', 'email'];
                    if(JSON.stringify(resp.rows[0]) === JSON.stringify(['name', 'email']) )
                    {
                        setState({
                            cols: resp.cols, 
                            rows: resp.rows 
                        });

                        let totalRows= resp.rows;                                                
                        var i ;
                        for(i=1; i < totalRows.length; i++){
                            if(totalRows[i][1].length !== 0 ){
                                if(!selectedMeetingInvites.some(item => totalRows[i][1] === item))
                                {
                                    selectedMeetingInvites.push(totalRows[i][1])
                                   // sessionEditemails.push({ value: totalRows[i][1], label: totalRows[i][1] })  
                                }
                            }
                        }

                        //console.log(selectedMeetingInvites);
                        //Add Item in se ssionEditemails List
                        fillInvities(selectedMeetingInvites);
                          
                    }
                    else {
                        setInvitesErr('Invalid file template!'); 
                    }
                }
            });  
        }
        else{
            setInvitesErr('Invalid file format!'); 
            $('#excel-form-reset').onClick();
        }
    }

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
            let role = localStorage.getItem('user_role');
            let invitesSuggestions;

            if (role === 'Admin') {
                invitesSuggestions = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/both`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            } else {
                invitesSuggestions = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Student`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
            
            
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
        const meetingStartDate = $("#meeting_startdate").val();
        const meetingEndDate = $("#meeting_enddate").val();
        if(meetingTitleRes.status && invitesRes.status && meetingStartDate && meetingEndDate){
            setMeetingTitleErr("");
            setInvitesErr("");
            setMeetingStartDateError("");
            setMeetingEndDateError("");
            
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
            if(!meetingStartDate){
                setMeetingStartDateError("회의 시작 날짜 선택");
            }
            if(!meetingEndDate){
                setMeetingEndDateError("회의 종료 날짜 선택");
            }
        }
    }
    
    //When user want to edit Meeting 
    const editSessionHandler = async (e) => {
        e.preventDefault();
        let invitedEmails = selectedMeetingInvites;
        const meetingTitleRes = ValidateMeetingTitle(meetingTitle);
        const invitesRes = Validateinvites(invitedEmails.length);
        const meetingStartDate = $("#meeting_startdate").val();
        const meetingEndDate = $("#meeting_enddate").val();
        let token = localStorage.getItem('auth_token');
        const user_id = localStorage.getItem("user_id");
        let userEmail = localStorage.getItem("user_email");
        invitedEmails.push(userEmail);
        if(meetingTitleRes.status && invitesRes.status && meetingStartDate && meetingEndDate){
            setMeetingTitleErr("");
            setInvitesErr("");
            setMeetingStartDateError("");
            setMeetingEndDateError("");
            try {
                const editMeetingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/editMeetingAPI`, {
                    meetingEntity: {
                        "roomName": meetingRoomName,
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
            setInvitesErr(invitesRes.error);
            if(!meetingStartDate){
                setMeetingStartDateError("회의 시작 날짜 선택");
            }
            if(!meetingEndDate){
                setMeetingEndDateError("회의 종료 날짜 선택");
            }
        }
    } 

    //For Set StartMeeting and EndMeeting DateandTime
    const dateHandler = async (e,date_type) => {
        // Set Selected Date to useState
        if(date_type == "startdate"){
            setStartDate(e.getTime());
        }
        if(date_type == "enddate"){
            setEndDate(e.getTime());
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
            setMeetingStartDateError("");
        }

        if(date_type == "enddate"){
            let selected_end_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds;
            setMeetingEndTime(selected_end_time);
            setMeetingEndDateError("");
        }
    }

    //For Handling Users By email
    const emailHandler = (e) => {
        console.log("list",e);
        let selectedMeetingInvites = []; 
        let selectedInvites = [];     
        totalEmails = e.length;
        if(e.length !== 0){
            e && e.map((singleinvitie,i) => (
                selectedMeetingInvites.push(singleinvitie.value)
                
            ))
            e && e.map((singleinvitie,i) => (
                selectedInvites.push({ value: singleinvitie.value, label: singleinvitie.label }) 
                
            ))
           
            setSelectedMeetingInvites(selectedMeetingInvites); 
            setselectedInvites(selectedInvites); 
            console.log("select list",selectedMeetingInvites);
            console.log("select invites",selectedInvites);         
        }else{
            setselectedInvites(selectedInvites); 
        }  
    }
    
    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
        return currentDate.getTime() < selectedDate.getTime();
    };

    const filterPassedTime1 = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
        return startDate < selectedDate.getTime();
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
                                id="meeting_startdate"
                                selected={startDate}
                                showTimeSelect
                                minDate={new Date()}
                                maxDate={endDate!=null ? endDate : null}
                                onChange={(date) => dateHandler(date,'startdate')}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                filterTime={filterPassedTime}
                                placeholderText="회의 시작 날짜 선택"
                            />
                        </div>
                        <small className="error">{startDateError}</small>
                        <div className="client_login_content_form_box">
                            <label>종료일</label>
                            <DatePicker
                                id="meeting_enddate"
                                showTimeSelect
                                selected={endDate}
                                minDate={startDate!=null ? startDate : new Date()}
                                //minTime={startDate}
                                onChange={(date) => dateHandler(date,'enddate')}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                filterTime={filterPassedTime1}
                                placeholderText="회의 종료 날짜 선택"
                            />
                        </div>
                        <small className="error">{endDateError}</small>
                        <div className="client_login_content_form_box">
                            <label>학생 등록</label>
                            <form onSubmit={importFileHandler} className="d-none">
                                <input type='file' id="excel-file-input" onChange={importFileHandler}/> 
                                <input type='submit'/>
                                <input type='reset' id="excel-form-reset"/>
                            </form>
                            <button className="cl_save_btn export-margin" onClick={() => $('#excel-file-input').click()}>엑셀 가져오기</button>
                            
                            {
                                editmeeting === "true" ? 
                                <Select 
                                    id = "meeting_invitie"                               
                                    value={selectedInvites ? selectedInvites :meetingInvities.map(ele => ele)}
                                    isMulti
                                    name="meeeting_invites"
                                    options={meetingInvities}
                                    onChange = {emailHandler}
                                    className="basic-multi-select"
                                    classNamePrefix="select"                                                           
                                /> :
                                <Select 
                                    id = "meeting_invitie"                               
                                    value={selectedInvites ? selectedInvites :meetingInvities.map(ele => ele)}
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
                            <label>설명</label>
                            <textarea value={meetingDescription} placeholder="강의에 관한 설명 입력" onChange={(e) => setMeetingDescription(e.target.value)} ></textarea>
                        </div>
                        <div className="submit_btn_box">
                            <Link to="/user/meeting/meetinglist"><button type="button" className="cl_cancel_btn">취소</button></Link>
                            {
                                editmeeting === "true" ?                            
                                <button type="button" className="cl_save_btn" onClick={editSessionHandler}>저장</button> : 
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
