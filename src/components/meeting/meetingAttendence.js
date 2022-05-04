// React System Libraries
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import moment from 'moment'
// Customised Libraries or components
import NewNavbar from '../common/newNavbar';
import { useParams } from 'react-router-dom';
import { ENDPOINTURL } from '../common/endpoints';
import CheckLoginStatus from '../common/loginStatus';

function MeetingAttendence(props) {
    // Get Meeting Id if found
    let segment_str = window.location.pathname; // return segment1/segment2/segment3/segment4
    let segment_array = segment_str.split( '/' );
    let id = segment_array.pop();
    const [meetingAttendence, setMeetingAttendence] = useState([]);
    const [componentStatus, setComponentStatus] = useState("");
    const user_id = localStorage.getItem('user_id');
    const user_role = localStorage.getItem('user_role');
    let userAttendence = 0;
    let userAttendenceMeetingId = 0;
    let meetId = localStorage.getItem('active_meeting_id');

    useEffect(() => {
        const res = CheckLoginStatus();
        if (res && (user_role === 'Teacher' || user_role === 'Admin')) {
            
            if(id && id != "attendence"){
                userAttendenceMeetingId = id;
            }else{
                userAttendence = user_id;
            }
            console.log(userAttendenceMeetingId);
            // Meeting Attendence Data
            getAttendenceData();
        } else {
            props.history.push('/');
        }
    }, []);

    const getAttendenceData = async () => {
        setComponentStatus({
            status: "processing",
            message: "Processing..."
        }) 
        try {
            const token = localStorage.getItem("auth_token");
            //const attendanceResponse = await Axios.get(`${ENDPOINTURL}/alimeet/attendance/viewAttendanceAPI?meetingId=${userAttendenceMeetingId}&userId=${userAttendence}`, {
            const attendanceResponse = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getAllMeetingList`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (attendanceResponse.data.Status === "200") {
                setMeetingAttendence(attendanceResponse.data.data);
                setComponentStatus({
                    status: "",
                    message: ""
                });
            }else{
                alert("Something went wrong while retrving attendence data. Please try again after sometime");
                props.history.push("/user/meeting/meetinglist");
            }
        } catch (error) {
            setComponentStatus({
                status: "error",
                message: "뭔가 잘못 됐어"
            })
        }
    }
    return(
        <>
        <div className="classNameroom_list">
            <NewNavbar/>
            <div className="cl_attendance_list">
                <div className="wrapper">
                    <div className="cl_attendance_list_box">
                        <h2>강의 출석</h2>
                        <div className="attendance_table_box">
                        {
                            meetingAttendence.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>강의명</th>
                                        <th>이메일</th>
                                        <th>시작 시간</th>
                                        <th>종료 시간</th>
                                        {/* <th>총 시간</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    meetingAttendence && meetingAttendence.map((attendence,i) => (
                                        <tr key={i}>
                                            <td><Link to={`/user/meeting/userAttendence/${attendence.user.id}MID${attendence.meetingId}`}>{attendence.meetingTitle}</Link></td>
                                            
                                            {/* <td>{attendence.userName}</td> */}
                                            <td>{attendence.user.email}</td>
                                            <td>{moment(attendence.startTime).format('DD MMM YY')}  {moment(attendence.startTime).format('kk:mm')}</td>
                                            <td>{moment(attendence.endTime).format('DD MMM YY')}  {moment(attendence.endTime).format('kk:mm')}</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </table>
                             ) : (
                                <div className="attendance_table_box">
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
                                        <h2><Link to="/user/meeting/meetinglist">강의 출석</Link></h2>
                                    }
                                </div>
                            )
                        }
                        </div>
                    </div>
                </div>
            </div>
        </div>        
        </>
    )
}
export default MeetingAttendence;
