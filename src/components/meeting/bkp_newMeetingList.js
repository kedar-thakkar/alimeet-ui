import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import DatePicker from "react-datepicker";
import { FaCalendar } from 'react-icons/fa';
import Axios from 'axios';
import CheckLoginStatus from '../common/loginStatus';
import { ENDPOINTURL } from '../common/endpoints';
import NewNavbar from '../common/newNavbar';
import Search from '../common/search';

function NewMeetingList(props) {

    const [date, setDate] = useState("");
    const [meetingList, setMeetingList] = useState([]);    
    // const [role, setRole] = useState("");
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");
    let userId = localStorage.getItem("user_id"); 
    let months_arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [componentStatus, setComponentStatus] = useState("");

    //For Date Handleing
    const dateHandler = async (e) => {        
        let date = e.getDate();
        if (date < 10) {
            date = "0" + date;           
        }
        let month = e.getMonth();
        let monthIndex = e.getMonth() + 1;
        month = months_arr[month];
        if (monthIndex < 10) {
            monthIndex = "0" + monthIndex;            
        }
        const year = e.getFullYear();
        setDate(month + " " + date + " " + year);
        let userId = localStorage.getItem("user_id");

        try {
            const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getMeetingListByDate?meetingDate=${year}-${monthIndex}-${date}&userId=${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (data) {
                setMeetingList(data);
            }
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        //Validate user is logged in to access the website
        const login_status = CheckLoginStatus();        
        if (login_status === false) {
            props.history.push("/")
        }

        $(".react-datepicker__input-container").css("display", "none")

        //To Get Current Date
        const presentTime = new Date();
        const curr_date = presentTime.getDate();
        let month = presentTime.getMonth();
        month = months_arr[month];
        const year = presentTime.getFullYear();
        setDate(month + " " + curr_date + " " + year)        
        
        // getUserDetails();
        
         //Get Meeting-List Data for Current Date
        try {
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })            
            getMeetingData(userId); 
        } catch (error) {
            props.history.push("/error")
        }       
    }, [])   

    //to get logged in user meeting data
    const getMeetingData = async (userId) => {
        let date = new Date();
        let year = date.getFullYear();
        let curr_date = date.getDate();
        let month = date.getMonth() + 1;
        const data = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getMeetingListByDate?meetingDate=${year}-${month}-${curr_date}&userId=${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });       
        if (data.data) {
            setMeetingList(data.data);                    
        }else{
            setComponentStatus({
                status: "error",
                message: "뭔가 잘못 됐어"
            })
        }     
    }

    //For Getting User Details(commented out because not using)
    // const getUserDetails = async () => {
    //     const email = localStorage.getItem("user_email");
    //     try {
    //         const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
    //             headers: {
    //                 "Authorization": `Bearer ${token}`
    //             }
    //         });
    //         if (data) {               
    //             localStorage.setItem("user_id", data.id);
    //             localStorage.setItem("user_name", data.userName);
    //             localStorage.setItem("user_role", data.role);
    //             setRole(data.role);
    //         }
    //     } catch (error) {
    //         throw error
    //     }
    // }

    //When User Delete Meeting
    const deleteSessionHandler = async (meetingId) => {
        if (role === "Teacher") {
            localStorage.setItem('deleteMeeting', meetingId);
            $('.custom-alert').addClass('show');
        }else {
            alert("Sorry!! You are Not aurthorized");
        }
    }

    //delete meeting
    const deleteMeeting = async(meetingId) => {        
        const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/deleteMeeting?meetingId=${meetingId}`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (data === "Meeting Successfully Deleted !") {
            $('.custom-alert').removeClass('show')
            dateHandler(new Date());
        }
    }

    //When User Edit Meeting
    const editSession = (session) => {
        if(role === "Teacher") {
            if(session.startTime > new Date() ){
                localStorage.setItem("edit_session", JSON.stringify(session));
                props.history.push("/user/meeting/schedulemeeting?editmeeting=true")
            }else{
                alert("You can't Edit PastDate Meeting");
            }            
            
        }else {
            alert("Sorry!! You are Not aurthorized");
        }
    }

    return (
        <>
            <div className='custom-alert'>
                <div className='custom-alert-wrapper'>
                    <div className='custom-alert-content'>
                        <h3><b>강의 삭제!</b></h3><br />
                        <p style={{ fontSize: '16px' }}>이강의를 삭제 합니다. <br />삭제된 강의는 다시 복원 할 수 없습니다. <br />삭제를 진행 하겠습니까? </p>
                        <div className="custom-alert-button">
                            <button className='cl_save_btn' onClick={() => {
                               let meetingId = localStorage.getItem('deleteMeeting');
                               deleteMeeting(meetingId);
                            }}>확인</button>
                            <button className='cl_save_btn' onClick={() => $('.custom-alert').removeClass('show')}>취소</button>
                        </div>
                    </div>
                </div>
            </div>
            <NewNavbar/>
            <Search/>
            <div className="meeting-list">
                <div className="meeting-list-head">
                    <h1>강의 목록</h1>
                </div>
                <div className="meeting-list-toolbar">
                    <div>
                        <h2 onClick={() => { $("#choose-date").click(); }}>
                            <span style={{ position: 'relative', bottom: "5px", marginRight: "5px" }}><FaCalendar/></span>{date}
                        </h2>
                        <DatePicker id="choose-date" onChange={dateHandler} />
                    </div>
                    <div className="meeting-list-searchbox">
                        <input type='text' className="form-control" placeholder="Search" /> 
                        {
                        (role === "Teacher" || role === "Admin") && (   
                            <Link to="/user/meeting/schedulemeeting" className="blue_btn" style={{ whiteSpace: 'nowrap', marginLeft: "20px"}}>강의 등록</Link>  
                        )
                        }  
                    </div>
                </div>
                <div className="meeting-list-meetings">
                    {
                        meetingList && meetingList.map((meeting,i) => (
                            <div className="meeting-list-meeting" key={i}>
                                <div className="meeting-list-data">
                                    <div className="meeting-list-name">
                                        <h2 key={i}>{meeting.meetingTitle}</h2>
                                    </div>
                                    <div className="meeting-list-time">
                                        <p>{meeting.startTime} - {meeting.endTime}</p>
                                    </div>
                                </div>
                                <div className="meeting-list-actions">
                                    <div className="meeting-list-left">
                                        <a className="meeting-list-button blue" href={`/user/meeting/exampleUI?roomName=${meeting.roomName}&meetingData=${JSON.stringify(meeting)}`}>
                                            강의 참여
                                        </a>
                                        {
                                            (role === "Teacher" || role === "Admin") && (
                                                <Link to={`/ViewRecording?meetingId=${meeting.meetingId}`} className="meeting-list-button green" href={`/user/meeting/exampleUI?roomName=${meeting.roomName}&meetingData=${JSON.stringify(meeting)}`}>
                                                    녹음보기
                                                </Link>
                                            )
                                        }
                                    </div>
                                    {
                                       role === "Teacher" && (
                                        <div className="meeting-list-right">                                   
                                            <i onClick={() => editSession(meeting)} className='fa fa-pencil meeting-list-circular-button'>
                                                <span className="tool-top">수정</span>
                                            </i>                                     
                                            <Link to={`/user/meeting/attendence/${meeting.meetingId}`}>
                                                <i className='fa fa-calendar meeting-list-circular-button'>
                                                    <span className="tool-top">출석</span>
                                                </i>
                                            </Link> 
                                            <i onClick={() => deleteSessionHandler(meeting.meetingId)} className='fa fa-trash meeting-list-circular-button'>
                                                <span className="tool-top">삭제</span>
                                            </i>                                        
                                        </div>
                                        )
                                    }
                                </div>                               
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default NewMeetingList;