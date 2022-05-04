import React, { useEffect, useState } from 'react';
import Navbar from '../common/navbar';
import UserProfile1 from '../../images/userprofile1.png'
import { Link } from 'react-router-dom';
import $ from 'jquery';
import DatePicker from "react-datepicker";
import { FaBeer, FaCalendar } from 'react-icons/fa';
import Axios from 'axios';
import CheckLoginStatus from '../common/loginStatus';
import { ENDPOINTURL } from '../common/endpoints';


function MeetingList(props) {
 
  const [date, setDate] = useState("");
  const [meetingList, setMeetingList] = useState([]);
  const [role, setRole] = useState("");
  

  const token = localStorage.getItem("auth_token");
  // console.log("Token: ", token)

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
    $(".react-datepicker__input-container").css("display", "none")

    const presentTime = new Date();
    const date = presentTime.getDate();
    let month = presentTime.getMonth();
    month = months_arr[month];
    const year = presentTime.getFullYear();

    setDate(month + " " + date + " " + year);

    getUserDetails();


    const login_status = CheckLoginStatus();
    console.log(login_status)
    if (login_status === false) {
      props.history.push("/")
    }
  }, [])


  useEffect(() => {

    setTimeout(async () => {
      let date = new Date();

      let year = date.getFullYear();
      let curr_date = date.getDate();
      let month = date.getMonth() + 1;

      // setDate(month + " " + curr_date + " " + year);

      let userId = localStorage.getItem("user_id");

      try {
        const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getMeetingListByDate?meetingDate=${year}-${month}-${curr_date}&userId=${userId}`, {
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
    }, [1000])

  }, []);

  const getUserDetails = async () => {

    const email = localStorage.getItem("user_email");

    try {
      const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (data) {
        //console.log(data)
        // let json_data = JSON.parse(data)
        localStorage.setItem("user_id", data.id);
        localStorage.setItem("user_name", data.userName);
        localStorage.setItem("user_role", data.role);
        setRole(data.role);
      }



    } catch (error) {
      throw error
    }

  }


  const deleteSessionHandler = async (meetingId) => {
    if (role === "Teacher") {
      localStorage.setItem('deleteMeeting', meetingId);
      $('.custom-alert').addClass('show');

      // if (window.confirm("You are about to delete the session \n Once the session is deleted, you cannot recover this session.\n Do you wish to proceed?")) {

      //   const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/deleteMeeting?meetingId=${meetingId}`, {}, {
      //     headers: {
      //       "Authorization": `Bearer ${token}`
      //     }
      //   })
      //   if (data === "Meeting Successfully Deleted !") {
      //     dateHandler(new Date());
      //   }

      // }




    }
    else {
      alert("Sorry!! You are Not aurthorized");
    }
  }

  const editSession = (session) => {
    // console.log()
    if (role === "Teacher") {
      localStorage.setItem("edit_session", JSON.stringify(session));
      props.history.push("/user/meeting/schedulemeeting?editmeeting=true")
    }
    else {
      alert("Sorry!! You are Not aurthorized");
    }
  }

  // const meetingSession = (session) => {
  //   // localStorage.setItem("meeting_session", JSON.stringify(session));
  //   props.history.push("/user/meeting/exampleMeeting")
  // }


  

  return (
    <>
      <Navbar />

      <div className='custom-alert'>
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
                  $('.custom-alert').removeClass('show')
                  dateHandler(new Date());
                }

              }}>확인</button>
              <button className='btn gray_btn' onClick={() => $('.custom-alert').removeClass('show')}>취소</button>
            </div>
          </div>
        </div>
      </div>

      <div className="meeting_section">
        <div className="meeting_list_otr">
          <div className="meeting_top_bar">
            <div className="meeting_date_col">
              <div className="meeting_date_box">

                <h2 onClick={() => { $("#choose-date").click(); }}>
                  <span style={{ position: 'relative', bottom: "5px", marginRight: "5px" }}><FaCalendar /></span>{date}
                </h2>
                <DatePicker id="choose-date" onChange={dateHandler} />

              </div>
            </div>
            <div className="right_meeting_box">
              <div className="search_box">
                <input type="text" placeholder="강의 찾기" />
              </div>
              {
                (role === "Teacher" || role === "Admin") && (
                  <Link to="/user/meeting/schedulemeeting" className="green_btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
                      <g fill="none" fillRule="evenodd">
                        <g fill="#FFF" fillRule="nonzero">
                          <g>
                            <g>
                              <g>
                                <g>
                                  <path d="M36 24.714L31.714 24.714 31.714 29 30.286 29 30.286 24.714 26 24.714 26 23.286 30.286 23.286 30.286 19 31.714 19 31.714 23.286 36 23.286z" transform="translate(-1045 -139) translate(282 120) translate(1) translate(736)" />
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
				          	강의 등록
                  </Link>
                )
              }
            </div>
          </div>

          <div className="meeting_box_otr">

            {
              meetingList && meetingList.length === 0 && (
                <div>
                  <h2 align="center">예정된 강의가 없습니다.</h2>
                </div>
              )
            }

            {
              meetingList && meetingList.map((meeting, index) => (
                <div className="meeting_box_inr" key={`${index}`}>
                  <div className="meeting_box_inr_left">
                    <h5>{meeting.meetingTitle}</h5>
                    <div className="join_meeting_inr_col">
                      <div className="time_box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19">
                          <g fill="none" fillRule="evenodd" opacity=".199">
                            <g>
                              <g>
                                <g>
                                  <g>
                                    <g>
                                      <g>
                                        <g>
                                          <path fill="#000" fillRule="nonzero" d="M9.992 1.736c-4.6 0-8.325 3.889-8.325 8.68 0 4.792 3.725 8.681 8.325 8.681 4.608 0 8.341-3.889 8.341-8.68 0-4.792-3.733-8.68-8.341-8.68zM10 17.361c-3.683 0-6.667-3.108-6.667-6.944 0-3.837 2.984-6.945 6.667-6.945s6.667 3.108 6.667 6.945c0 3.836-2.984 6.944-6.667 6.944z" transform="translate(-336 -292) translate(282 120) translate(0 78) translate(30 30) translate(23 26) translate(0 37)" />
                                          <path d="M0 0L20 0 20 20.833 0 20.833z" transform="translate(-336 -292) translate(282 120) translate(0 78) translate(30 30) translate(23 26) translate(0 37)" />
                                          <path fill="#000" fillRule="nonzero" d="M10.417 6.076L9.167 6.076 9.167 11.285 13.542 14.019 14.167 12.951 10.417 10.634z" transform="translate(-336 -292) translate(282 120) translate(0 78) translate(30 30) translate(23 26) translate(0 37)" />
                                        </g>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </svg>
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                      {/* <div className="join_pofile">
                        <div className="join_pofile_img">
                          <img src={UserProfile1} alt="" />
                        </div>
                        <div className="join_pofile_img">
                          <img src={UserProfile1} alt="" />
                        </div>
                        <div className="join_pofile_img">
                          <img src={UserProfile1} alt="" />
                        </div>
                        <div className="join_pofile_img">
                          <img src={UserProfile1} alt="" />
                        </div>
                      </div> */}
                    </div>
                  </div>
                  <div className="meeting_btn ml-3">
                    <a href={`/user/meeting/exampleUI?roomName=${meeting.roomName}&meetingData=${JSON.stringify(meeting)}`}>
                      <button className="green_btn" target="blank">
                        강의 참여
					          </button>
                    </a>
                    {

                      meeting.user.id === parseInt(localStorage.getItem("user_id")) && (
                        <button className="gray_btn" style={{
                          marginLeft: "20px",
                          background: "#ff3434",
                          border: "1px solid #ff3434",
                          borderColor: "#ff3434"
                        }} onClick={() => deleteSessionHandler(meeting.meetingId)}>삭제</button>
                      )
                    }
                    {
                      role === "Teacher" && (
                        <button className="blue_btn" id="editsession" style={{
                          marginLeft: "20px"
                        }} onClick={() => editSession(meeting)}>수정</button>
                      )}
                      {
                        (role === "Teacher" || role === "Admin") && (
                          <Link to={`/ViewRecording?meetingId=${meeting.meetingId}`} className="sky_btn" style={{
                            marginLeft: "20px"
                          }}>                           
                            녹음보기
                          </Link>
                        )
                      }


                      {
                        (role === "Teacher" || role === "Admin") && (
                          <Link to={`/user/meeting/attendence/${meeting.meetingId}`} className="blue_btn" style={{
                            marginLeft: "20px"
                          }}>                           
                            녹음보기
                          </Link>
                        )
                      }             
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

