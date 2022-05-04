// React System Libraries
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import DatePicker from "react-datepicker";
import { FaCalendar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import moment from 'moment'

// Customised Libraries or components
import NewNavbar from '../common/newNavbar';
import CheckLoginStatus from '../common/loginStatus';
import { ENDPOINTURL } from '../common/endpoints';

function MeetingList(props) {
    
    // //Storing default values in useState
    const [meetingList, setMeetingList] = useState([]);
    const [date, setDate] = useState("");
    const [componentStatus, setComponentStatus] = useState("");
    
    // Global Variables
    const months_arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("auth_token");
    let filterDate = "";
    let searchText = "";

    // To Get Today Meeting List when page load
    useEffect(() => {
        //Validate user is logged in to access the website
        const isUserLoggedIn = CheckLoginStatus();        
        if (isUserLoggedIn === false) {
            props.history.push("/");
        }

        //To hiding Data Calander inputBox
        $(".react-datepicker__input-container").css("display", "none");

        //To Get Current Date
        const presentTime = new Date();
        const year = presentTime.getFullYear();
        let month = presentTime.getMonth();
        const curr_date = presentTime.getDate();
        filterDate = year + "-" + (month + 1) + "-" + curr_date;

        month = months_arr[month];
        setDate(month + " " + curr_date + " " + year);

        //Get Meeting-List Data for Current Date
        try {
            //get Logged User meeting Data
            getMeetingData(userId); 
        } catch (error) {
            props.history.push("/error");
        }       
    }, [])

    // To get logged in user meeting data
    const getMeetingData = async (userId) => {
        try {
            
            searchText = $("#search").val();

            //Start Loader to loadData
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })

            //For Getting curruntDate Meeting
            if(userId){
                const requestParams = {
                    meetingDate:filterDate,
                    userId:userId,
                    search:searchText
                };
                const meetingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/getMeetingListByDateAPI`, requestParams ,{
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (meetingResponse.status == "200") {
                    setMeetingList('');
                    setMeetingList(meetingResponse.data.data);
                    setComponentStatus({
                        status: "",
                        message: ""
                    });
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "뭔가 잘못 됐어"
                    });
                }
            }else{
                setComponentStatus({
                    status: "error",
                    message: "잘못된 입력"
                });
            }
        }catch(error){
            props.history.push("/error")
        }
    }

    // Get confirmation popup when user delete popup
    const deleteSessionHandler = async (meetingId) => {
        if (role === "Teacher") {
            localStorage.setItem('deleteMeeting', meetingId);
            $('.custom-alert').removeClass('d-none');
        }else {
            alert("Sorry!! You are Not aurthorized");
        }
    }

    // Delete meeting
    const deleteMeeting = async(meetingId) => {
        try{
            if(meetingId){
                const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/deleteMeeting?meetingId=${meetingId}`, {}, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (data === "Meeting Successfully Deleted !") {
                    $('.custom-alert').addClass('d-none')
                    dateHandler(new Date());
                }
            }else{
                setComponentStatus({
                    status: "error",
                    message: "회의를 삭제하는 동안 문제가 발생했습니다."
                })
            }
        }catch(error){
            props.history.push("/error");
        }
    }
     
    //For filter meeting Data based on selected date
    const dateHandler = async (e) => {
        let year = e.getFullYear();
        let month = e.getMonth();
        let date = e.getDate();
        let monthIndex = e.getMonth() + 1;

        /*if (date < 10) {
            date = "0" + date;
        }
        if (monthIndex < 10) {
            monthIndex = "0" + monthIndex;            
        }*/

        // Override selected date as filter
        filterDate = year + '-' + monthIndex + '-' + date;

        // Set Date to show on screen
        month = months_arr[month];
        setDate(month + " " + date + " " + year);
        try {
            getMeetingData(userId);
        } catch (error) {
            props.history.push("/error");
        }
    }

    //When User Edit Meeting
    const editSession = (session) => {
        if(role === "Teacher") {
            localStorage.setItem("edit_session", JSON.stringify(session));
            props.history.push("/user/meeting/schedulemeeting?editmeeting=true");
        }else {
            alert("Sorry!! You are Not aurthorized");
        }
    }

    // When User Search by meeting title using search box
    const searchMeetingHandler = async () => {
        //To Get Current Date
        const presentTime = new Date();
        const year = presentTime.getFullYear();
        let month = presentTime.getMonth();
        const curr_date = presentTime.getDate();
        filterDate = year + "-" + (month + 1) + "-" + curr_date;

        // Call Date Handler to Update Meeting Data based on user search
        getMeetingData(userId);
    }
  
    return(
    <>
    <div className='custom-alert d-none'>
        <div className='custom-alert-wrapper'>
            <div className='custom-alert-content'>
                <h3><b>강의 삭제!</b></h3><br />
                <p style={{ fontSize: '16px' }}>이강의를 삭제 합니다. <br />삭제된 강의는 다시 복원 할 수 없습니다. <br />삭제를 진행 하겠습니까? </p>
                <div className="custom-alert-button">
                    <button className='cl_save_btn' onClick={() => {
                        let meetingId = localStorage.getItem('deleteMeeting');
                        deleteMeeting(meetingId);
                    }}>확인</button>
                    <button className='cl_save_btn' onClick={() => $('.custom-alert').addClass('d-none')}>취소</button>
                </div>
            </div>
        </div>
    </div>
    <div className="classroom_list">
        <NewNavbar />     
        <div className="cl_meeting_list">
            <div className="wrapper">
                <div className="cl_meeting_list_otr">
                    <div className="cl_meeting_box">
                        <h2 onClick={() => { $("#choose-date").click(); }}>
                            <span style={{ position: 'relative', bottom: "5px", marginRight: "5px" }} className="cl_meeting_box"><FaCalendar/></span>{date}
                        </h2>
                        <DatePicker id="choose-date" onChange={dateHandler} />
                    </div>
                    <div className="cl_search_box">
                        <input type="text" name="search" id="search" />
                        <button onClick={searchMeetingHandler}></button>
                    </div>
                </div>
            </div>
        </div> 
        <div className="cl_meeting_content">
            <div className="wrapper">
                <div className="cl_meeting_title">                    
                    {
                        componentStatus && componentStatus.status === "OK" &&
                        <h2 className="text-success">{componentStatus.message}</h2>
                    }
                    {
                        componentStatus && componentStatus.status === "error" &&
                        <h2 className="text-danger">{componentStatus.message}</h2>
                    }
                    {
                        componentStatus && componentStatus.status === "processing" &&
                        <h2 className="text-warning">{componentStatus.message}</h2>
                    }
                    {
                        componentStatus && componentStatus.status === "" &&
                        <h2>강의 목록</h2>
                    }                   
                    {
                        (role === "Teacher" || role === "Admin") && (   
                            <Link to="/user/meeting/schedulemeeting" className="cl_button" style={{ whiteSpace: 'nowrap', marginLeft: "20px"}}>강의 등록</Link>  
                        )
                    }
                </div>
                {
                     meetingList && meetingList.map((meeting,i) => (
                        <div key={meeting.meetingId+i} className="cl_meeting_edit_box">
                            <div className="cl_meeting_edit_top_row">
                                <h4>{meeting.meetingTitle}</h4>
                                {
                                    role === "Teacher" && (
                                        <div className="cl_meeting_edit_icon">
                                            <a href="#." onClick={() => deleteSessionHandler(meeting.meetingId)}>
                                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.6009 11.2494L1.35156 0L0.00169565 1.34987L11.2511 12.5992L12.6009 11.2494Z" fill="#42526E"/>
                                                    <path d="M1.34829 12.599L12.5977 1.34961L11.2478 -0.000257475L-0.00157247 11.2491L1.34829 12.599Z" fill="#42526E"/>
                                                </svg>
                                            </a>                               
                                            <a href={`/user/meeting/attendence/${meeting.meetingId}`} >
                                                <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.157 1.294H10.348V0.647C10.348 0.475405 10.2798 0.310838 10.1585 0.189502C10.0372 0.0681659 9.8726 0 9.701 0C9.52941 0 9.36484 0.0681659 9.2435 0.189502C9.12217 0.310838 9.054 0.475405 9.054 0.647V1.294H3.881V0.647C3.881 0.475405 3.81283 0.310838 3.6915 0.189502C3.57016 0.0681659 3.4056 1.36345e-08 3.234 1.36345e-08C3.0624 1.36345e-08 2.89784 0.0681659 2.7765 0.189502C2.65517 0.310838 2.587 0.475405 2.587 0.647V1.294H1.779C1.30743 1.29426 0.855244 1.48164 0.521703 1.815C0.188162 2.14835 0.000529775 2.60043 0 3.072L0 10.349C0.000793434 10.8633 0.205441 11.3563 0.569089 11.7199C0.932738 12.0836 1.42572 12.2882 1.94 12.289H5.174C5.34559 12.289 5.51016 12.2208 5.6315 12.0995C5.75283 11.9782 5.821 11.8136 5.821 11.642C5.821 11.4704 5.75283 11.3058 5.6315 11.1845C5.51016 11.0632 5.34559 10.995 5.174 10.995H1.94C1.7684 10.995 1.60384 10.9268 1.4825 10.8055C1.36117 10.6842 1.293 10.5196 1.293 10.348V5.174H11.643C11.643 5.34559 11.7112 5.51016 11.8325 5.6315C11.9538 5.75283 12.1184 5.821 12.29 5.821C12.4616 5.821 12.6262 5.75283 12.7475 5.6315C12.8688 5.51016 12.937 5.34559 12.937 5.174V3.074C12.937 2.60191 12.7495 2.14916 12.4157 1.81535C12.0818 1.48154 11.6291 1.294 11.157 1.294V1.294Z" fill="#42526E"/>
                                                    <path d="M9.78581 6.69531C9.16221 6.69531 8.55261 6.88023 8.0341 7.22669C7.51559 7.57314 7.11146 8.06558 6.87282 8.64171C6.63418 9.21785 6.57174 9.85181 6.6934 10.4634C6.81506 11.0751 7.11535 11.6369 7.55631 12.0778C7.99726 12.5188 8.55907 12.8191 9.17069 12.9407C9.78232 13.0624 10.4163 12.9999 10.9924 12.7613C11.5686 12.5227 12.061 12.1185 12.4074 11.6C12.7539 11.0815 12.9388 10.4719 12.9388 9.84831C12.938 9.01233 12.6056 8.21081 12.0144 7.61968C11.4233 7.02855 10.6218 6.69611 9.78581 6.69531V6.69531ZM11.2438 9.31631L9.66681 11.1353C9.62314 11.1855 9.56963 11.2262 9.50961 11.255C9.44958 11.2837 9.38431 11.2998 9.31781 11.3023H9.30081C9.23712 11.3023 9.17404 11.2898 9.11519 11.2654C9.05634 11.2411 9.00286 11.2053 8.95781 11.1603L8.10881 10.3113C8.01784 10.2203 7.96674 10.097 7.96674 9.96831C7.96674 9.83966 8.01784 9.71628 8.10881 9.62531C8.19978 9.53434 8.32316 9.48324 8.45181 9.48324C8.58046 9.48324 8.70384 9.53434 8.79481 9.62531L9.27581 10.1063L10.5108 8.68131C10.5958 8.58708 10.7144 8.52994 10.8411 8.52215C10.9678 8.51436 11.0925 8.55655 11.1884 8.63966C11.2844 8.72277 11.3439 8.84018 11.3543 8.96668C11.3646 9.09319 11.325 9.21871 11.2438 9.31631V9.31631Z" fill="#42526E"/>
                                                </svg>
                                            </a>
                                            <a href="#." onClick={() => editSession(meeting)} > 
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7.135 2.69252L2.154 7.80852L0 14.0005L6.192 11.9815L11.173 7.00052L7.135 2.69252ZM13.462 2.29252L11.712 0.538523C11.559 0.36899 11.3721 0.233459 11.1634 0.140695C10.9547 0.0479317 10.7289 0 10.5005 0C10.2721 0 10.0463 0.0479317 9.8376 0.140695C9.62891 0.233459 9.44202 0.36899 9.289 0.538523L7.808 2.01952L11.846 6.19252L13.461 4.57752C13.6272 4.42173 13.7605 4.23421 13.8531 4.02605C13.9457 3.81789 13.9956 3.5933 14 3.36552C13.9616 2.9519 13.7696 2.56767 13.462 2.28852V2.29252Z" fill="#42526E"/>
                                                </svg>
                                            </a>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="cl_meeting_edit_sec_row">
                            <div className="cl_meeting_left">
                                {
                                    (moment(meeting.endTime).format('YYYY-MM-DD') < moment(new Date()).format('YYYY-MM-DD')) && (
                                        <a className="cl_meeting_buton cl_meeting_buton_blur disabled"  href={`/user/meeting/MeetingUI/${meeting.roomName}`}>강의 참여</a>
                                    )
                                }
                                {
                                     (moment(meeting.endTime).format('YYYY-MM-DD') >= moment(new Date()).format('YYYY-MM-DD')) && (
                                        <a className="cl_meeting_buton cl_meeting_buton_blur"  href={`/user/meeting/MeetingUI/${meeting.roomName}`}>강의 참여</a>
                                    )
                                }
                                {
                                    (role === "Teacher" || role === "Admin") && (
                                        <a className="cl_meeting_buton cl_meeting_buton_gry"  href={`/ViewRecording?meetingId=${meeting.meetingId}`}>녹음보기</a>
                                    
                                    )
                                }
                               
                            </div>
                            <h5>{moment(meeting.startTime).format('DD MMM YY')} {moment(meeting.startTime).format('kk:mm')}  -  {moment(meeting.endTime).format('DD MMM YY')} {moment(meeting.endTime).format('kk:mm')}</h5>
                        </div>
                        </div>
                    ))
                }
            </div>
        </div> 
    </div>
    </>
    )
}
export default MeetingList;
