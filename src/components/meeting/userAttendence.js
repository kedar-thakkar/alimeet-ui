import React, { useEffect, useState } from 'react';
import NewNavbar from '../common/newNavbar';
import { useParams } from 'react-router-dom'
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import CheckLoginStatus from '../common/loginStatus';
import { Link } from 'react-router-dom';
import moment from 'moment'
function UserAttendence(props) {

    const { id } = useParams();
    const [data, setData] = useState([]);   
    const [myMeetingId, setMyMeetingId] = useState('');
    const [componentStatus, setComponentStatus] = useState("");    
    let meetingId = '';
    let userId = '';
    
    useEffect(() => {
        const res = CheckLoginStatus();
        const user_role = localStorage.getItem('user_role');
        if (res && (user_role === 'Teacher' || user_role === 'Admin')) {   
            let urldata = id;
            urldata = urldata.split("MID")
            setMyMeetingId(urldata[1]);    
            userId = urldata[0]
            meetingId = urldata[1]
            getAttendenceData();
        } else {
            props.history.push('/')
        }
    }, []) 
  
   
    const getAttendenceData = async () => {
        if(!userId || !meetingId){
            return;
        }
        setComponentStatus({
            status: "processing",
            message: "Processing..."
        })              
        try {
            const token = localStorage.getItem("auth_token");            
            const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/attendance/getAllUserAttendanceByMeetingId?meetingId=${meetingId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            setData(data.data);
            setComponentStatus({
                status: "",
                message: ""
            })
        } catch (error) {
            setComponentStatus({
                status: "error",
                message: "뭔가 잘못 됐어"
            })
        }
    }
    return (
        <>
            <div class="classroom_list">
            <NewNavbar/>
            <div class="cl_attendance_list">
                <div class="wrapper">
                    <div class="cl_attendance_list_box">                        
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
                            <h2><Link to={`/user/meeting/attendence/${myMeetingId}`}>강의 출석</Link></h2>                           
                        }           
                        <div class="attendance_table_box">
                        {
                            data.length > 0 ? (
                            <table>
                                <tr>
                                    <th>강의명</th>
                                    <th>이메일</th>
                                    <th>체크인</th>
                                    <th>체크아웃</th>
                                    <th>총 시간</th>
                                </tr>
                                {
                                    data && data.map((attendence) => (
                                        <tr>

                                            <td>{attendence.userName}</td>
                                            <td>{attendence.email}</td>
                                            <td>{attendence.checkInTime!=null?moment(attendence.checkInTime).format('DD MMM YY hh:mm'):null}</td>
                                            <td>{attendence.checkOutTime!=null?moment(attendence.checkOutTime).format('DD MMM YY hh:mm'):null}</td>
                                            <td>{attendence.totalTime}</td>

                                        </tr>
                                    ))
                                }
                            </table>
                             ) : (
                                <div className="attendance_table_box">
                                    <h2>No Records Found.</h2>
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

export default UserAttendence;
