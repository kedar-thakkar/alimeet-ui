import React, { useState, useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import { ENDPOINTURL } from '../components/common/endpoints';
import Axios from 'axios';
import DatePicker from "react-datepicker";
import $ from 'jquery';
import { FaBeer, FaCalendar } from 'react-icons/fa';


function Adminmeetings(props) {

  const [Meetings, setMeetings] = useState('');
  const [date, setDate] = useState("");  
  const token = localStorage.getItem("auth_token");
  const [role, setRole] = useState("");
  const [searchData, setSearchData] = useState('');
  const [serchResult,setserchResult]=useState('');
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])

  let months_arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dateHandler = async (e) => {
    
    console.log(e);
    let date = e.getDate();

    if (date < 10) {
      date = "0" + date;
      console.log("Date: " + date)
    }

    let month = e.getMonth();
    let monthIndex = e.getMonth() + 1;
    month = months_arr[month];
    if (monthIndex < 10) {
      monthIndex = "0" + monthIndex;
      console.log("monthIndex: " + monthIndex)
    }

    const year = e.getFullYear();

    setDate(month + " " + date + " " + year);

    let userId = localStorage.getItem("user_id");

    localStorage.setItem("selectedDate",year+"-"+monthIndex+"-"+date);
    let selectedDate = localStorage.getItem("selectedDate");

    try {

      const meetingResponse = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getAllMeetingListByDate?meetingDate=${selectedDate}&userId=${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    
        if (meetingResponse.status == "200") {
            setserchResult('');
            setMeetings(meetingResponse.data.data);
        }

    } catch (error) {
      throw error;
    }
  } 


const getSearchUsers= async (res)=>{
  const token = localStorage.getItem("auth_token");
  let selectedDate = localStorage.getItem("selectedDate");
  const serchdata = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getAllMeetingListByDate?meetingDate=${selectedDate}&searchText=${res}`, {
      headers: {
          "Authorization": `Bearer ${token}`
      }
  })
  setMeetings('');
  if (serchdata.status == "200") {
    setserchResult(serchdata.data.data);
  }

  setStudents([])
  setTeachers([])
}


const getMeetingInvites =(invites) => {
    let emailString = "";
    invites.map(email => {
    emailString = emailString + email + ", "
})
emailString = emailString.slice(0,-2)
return emailString;
}

const deletehandler = async (meetingId) => {
    localStorage.setItem('deleteMeeting', meetingId);
    $('.custom-alert').removeClass('d-none');     
}  

const edithandler = async (session) => {   
    localStorage.setItem("edit_session", JSON.stringify(session));
    props.history.push("/user/meeting/schedulemeeting?editmeeting=true");
}

useEffect(() => {
    $(".react-datepicker__input-container").css("display", "none")
    dateHandler(new Date()); 
},[])

    return (
        <>
        <div className='custom-alert d-none'>
          <div className='custom-alert-wrapper'>
          <div className='custom-alert-content'>
            <h3><b>강의 삭제!</b></h3><br/>
            <p style={{ fontSize: '16px' }}>이강의를 삭제 합니다. <br />삭제된 강의는 다시 복원 할 수 없습니다. <br />삭제를 진행 하겠습니까? </p>
            <div className="custom-alert-button">
            <button className='btn blue_btn' onClick={async () => {
               let meetingId = localStorage.getItem('deleteMeeting');
                const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/deleteMeeting?meetingId=${meetingId}`, {}, {
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                })
                if (data === "Meeting Successfully Deleted !") {
                  $('.custom-alert').addClass('d-none');
                  dateHandler(new Date());
                } 

              }}>확인</button>
              <button className='btn gray_btn' onClick={() => $('.custom-alert').addClass('d-none')}>취소</button>
            </div>
          </div>
        </div>
        </div>
        <div className="right_meeting_box" style={{ float: "right"}}>

                    <div className="search_box" >
                        <input type="text" value={searchData} placeholder="강의 찾기" onChange={(e) => {
                            setSearchData(e.target.value)
                            getSearchUsers(e.target.value)
                        }
                        } />
                    </div>
                    </div>
            
                <h2 onClick={() => { $("#choose-date").click(); }} style={{ margin: '10px 0 30px 0' }}>
                  <span style={{ position: 'relative', bottom: "5px", marginRight: "5px" }}><FaCalendar /></span>{date}
                </h2>
                <DatePicker id="choose-date" onChange={dateHandler} />
                        <table class="table table-bordered table-striped table-light">
                            <thead>
                                <tr className='text-center'>
                                    <th scope="col">Meeting Name</th>
                                    <th scope="col">Start Time</th>
                                    <th scope="col">End Time</th>
                                    <th scope="col">Created On</th>
                                    <th scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                              
                                {
                                    Meetings && Meetings.map((Meeting, index) => (
                                        <tr className='text-center' key={index}>
                                            <td>{Meeting.meetingTitle}</td>
                                            <td>{Meeting.startTime}</td>
                                            <td>{Meeting.endTime}</td>
                                            <td>{Meeting.createdOn}</td>
                                            <td style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '300px'}}>
                                                <button className="btn btn-info" onClick= {() => edithandler(Meeting)}><i className="fa fa-pencil-square-o"></i></button>                                               
                                                <button className="btn btn-info" onClick={() => deletehandler(Meeting.meetingId)}><i className="fa fa-trash-o"></i></button>
                                                <a href={`/user/meeting/MeetingUI/${Meeting.roomName}`} className="btn btn-info">Join</a> 
                                            </td>
                                        </tr>
                                    ))
                                } 
                                {console.log(serchResult)}
                                {
                                  serchResult&&serchResult.map((res,index)=>(
                                    <tr className='text-center' key={index}>
                                            <td>{res.meetingTitle}</td>
                                            <td>{res.startTime}</td>
                                            <td>{res.endTime}</td>
                                            <td>{res.createdOn}</td>
                                            <td style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '300px'}}>
                                                <button className="btn btn-info" onClick= {() => edithandler(res)}><i className="fa fa-pencil-square-o"></i></button>                                               
                                                <button className="btn btn-info" onClick={() => deletehandler(res.meetingId)}><i className="fa fa-trash-o"></i></button>
                                                <a href={`/user/meeting/MeetingUI/${res.roomName}`} className="btn btn-info">Join</a> 
                                            </td>
                                        </tr>
                                  ))
                                }                               
                            </tbody>
                        </table>
        </>
    )
 }
export default Adminmeetings;
