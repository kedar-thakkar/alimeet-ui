import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/navbar';
import DatePicker from "react-datepicker";
import TagsInput from 'react-tagsinput'
import moment from 'moment'
import { randomString } from '../randomString';
import Axios from 'axios'
import $ from 'jquery'
import CheckLoginStatus from '../common/loginStatus';
import { ENDPOINTURL } from '../common/endpoints';


function ScheduleMeeting(props) {
  const queryString = require('query-string');

  const [startDate, setStartDate] = useState(new Date());

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDesc, setMeetingDesc] = useState("");
  const [meetingStartTime, setMeetingStartTime] = useState("");
  const [meetingEndTime, setMeetingEndTime] = useState("");
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState("");

  const [inputEmail, setInputEmail] = useState("");
  const [newEnteredEmail, setNewEnteredEmail] = useState("");


  const [meetingId, setMeetingId] = useState("");

  const [defaultInvities, setDefaultInvities] = useState([
    "kwonjinha0324@gmail.com",
    "kyeom8844@hanmail.net",
    "55kkh@hanmail.net",
    "2kms4321@gmail.com",
    "silvia34@naver.com",
    "hanneul94@gmail.com",
    "pys701110@hanmail.net",
    "dsbae59@nate.com",
    "ahnhelena@gmail.com",
    "tinyheart519@gmail.com",
    "dasol6860@naver.com",
    "wnlsgh123@naver.com",
    "jungcodes@naver.com",
    "haeunhye99@gmail.com",
    "hwang00210@gmail.com"
  ]);



  const token = localStorage.getItem("auth_token");

  // checking for edit or create new session 
  const { editmeeting } = queryString.parse(props.location.search);





  useEffect(() => {
    // $(".react-tagsinput-input").attr("placeholder", "이메일 입력")

    const login_status = CheckLoginStatus();
    if (login_status === false) {
      props.history.push("/")
    }

  }, [])

  useEffect(() => {

    $(".react-tagsinput-input").on("keyup", () => {
      let val = $(".react-tagsinput-input").val()
      setInputEmail(val);
    })

    meetingTimeHandler(new Date());

    if (editmeeting) {
      let edit_session = localStorage.getItem("edit_session");
      edit_session = JSON.parse(edit_session);

      setMeetingId(edit_session.meetingId);
      setMeetingTitle(edit_session.meetingTitle)
      setMeetingDesc(edit_session.meetingDesc)

      let user_email = localStorage.getItem("user_email");
      let sess_emails = edit_session.invites;
      sess_emails = sess_emails.filter((email) => email !== user_email);

      console.log(sess_emails);

      setInvites(sess_emails)
      // console.log(edit_session)
    }


  }, [])


  useEffect(() => {
    console.log("meetingStartTime: ", meetingStartTime);
    console.log("meetingEndTime: ", meetingEndTime);
  }, [meetingEndTime, meetingStartTime])

  const meetingTimeHandler = (e) => {
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
    }
    seconds = parseInt(seconds);
    seconds = (seconds).toFixed(3);
    if (seconds === "0.000") {
      seconds = "00.000";
    }

    let selected_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds
    setMeetingStartTime(selected_time);

    // console.log(selected_time)

    let endtime = moment(e).add(30, "minutes")
    endtime = endtime._d

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
    }
    end_seconds = parseInt(end_seconds);
    end_seconds = (end_seconds).toFixed(3);
    if (end_seconds === "0.000") {
      end_seconds = "00.000";
    }



    let selected_end_time = end_year + "-" + end_month + "-" + end_date + "T" + end_hour + ":" + end_minutes + ":" + end_seconds;
    setMeetingEndTime(selected_end_time);
  }




  const submitHandler = async () => {


    // console.log("invites: ", invites);
    // console.log("meetingStartTime: ", meetingStartTime);
    // console.log("meetingEndTime: ", meetingEndTime);

    const roomName = randomString(15);
    const invites_arr = JSON.stringify(invites);
    const user_id = localStorage.getItem("user_id");
    // console.log("Room Name: ", roomName);

    let userEmail = localStorage.getItem("user_email");
    let invitedEmails = invites;
    invitedEmails.push(userEmail);
    props.history.push("/user/meeting/meetinglist")
    try {
      const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/saveMeeting`, {
        meetingEntity: {
          "roomName": roomName,
          "meetingTitle": meetingTitle,
          "meetingDesc": meetingDesc,
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
      
      


      // console.log(data)
    } catch (error) {

    }
  }


  const editSessionHandler = async () => {

    const roomName = randomString(15);
    const invites_arr = JSON.stringify(invites);
    const user_id = localStorage.getItem("user_id");
    // console.log("Room Name: ", roomName);

    let userEmail = localStorage.getItem("user_email");
    let invitedEmails = invites;
    invitedEmails.push(userEmail);

    try {
      const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/meeting/editMeeting`, {
        meetingEntity: {
          "roomName": roomName,
          "meetingId": meetingId,
          "meetingTitle": meetingTitle,
          "meetingDesc": meetingDesc,
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

      // if (data) {
      // console.log(data);
      let role = localStorage.getItem('user_role');

      if (role === 'Admin') {
        props.history.push("/Adminpanelmain")
      } else {
        props.history.push("/user/meeting/meetinglist")
      }

      // }

      // console.log(data)
    } catch (error) {

    }

  }

  return (
    <>
      <Navbar />


      <div className="sign_up_section schedule_meeting ">
        <div className="login_otr">

          <div className="login_box">
            <Link to="/user/meeting/meetinglist" className="back_to_sessioin">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.469 0L0.648878 8.27679L0 8.96356L0.648878 9.65033L8.469 17.9271L9.92275 16.5536L3.72902 9.99816H17.9935V7.99816H3.66364L9.92275 1.37354L8.469 0Z" fill="#A9AFC2"></path>
              </svg>
				      메인 페이지로
			      </Link>
            <div className="title">
              <h2>강의 상세</h2>
            </div>
            <div className="schedule_meeting_otr">
              <div className="schedule_meeting_col">
                <div className="form_box">
                  <div className="input_box">
                    <label>제목</label>
                    <input type="text" placeholder="강의 제목 입력" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} />
                  </div>
                  <div className="input_box">
                    <label>일시</label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={(e) => {
                          setStartDate(e);

                          // 2019-01-21T05:47:08.644 
                          // 2021-09-01T13:30:00:00
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
                          }
                          seconds = parseInt(seconds);
                          seconds = (seconds).toFixed(3);
                          if (seconds === "0.000") {
                            seconds = "00.000";
                          }

                          let selected_time = year + "-" + month + "-" + date + "T" + hour + ":" + minutes + ":" + seconds
                          setMeetingStartTime(selected_time);

                          // console.log(selected_time)

                          let endtime = moment(e).add(30, "minutes")
                          endtime = endtime._d

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
                          }
                          end_seconds = parseInt(end_seconds);
                          end_seconds = (end_seconds).toFixed(3);
                          if (end_seconds === "0.000") {
                            end_seconds = "00.000";
                          }



                          let selected_end_time = end_year + "-" + end_month + "-" + end_date + "T" + end_hour + ":" + end_minutes + ":" + end_seconds;
                          setMeetingEndTime(selected_end_time);


                        }}
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="date-picker-custom"
                      />
                    </div>
                  </div>
                  <div className="input_box" style={{ position: 'relative' }}>
                    <label>수강생</label>
                    <TagsInput value={invites} inputProps={
                      {
                        className: 'react-tagsinput-input',
                        placeholder: '이메일 입력',
                        value: newEnteredEmail,
                        onChange: (e) => setNewEnteredEmail(e.target.value)
                      }
                    } onChange={(e) => {

                      setError("");
                      console.log(e)

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

                            setInvites(e);

                          } catch (error) {
                            setError(`${new_email} is not a registered user.`);
                          }
                        } else {
                          setInvites(e);
                        }
                      })
                      setNewEnteredEmail('')

                    }} onChangeInput={(e) => {
                      console.log(e)
                    }} />

                    {
                      inputEmail && (
                        <button className="blue_btn" onClick={() => {

                          // console.log(inputEmail.split(','));
                          let emailArr = inputEmail.split(',');

                          setError("");
                          emailArr.map(async (email) => {
                            let userEmail = email.replaceAll(' ', '');
                            if (userEmail) {
                              try {
                                const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${userEmail}`, {
                                  headers: {
                                    "Authorization": `Bearer ${token}`
                                  }
                                })

                                if (data.id) {
                                  setInvites(invites => [...invites, userEmail]);
                                }



                              } catch (error) {
                                setError(`${email} is not a registered user.`);

                                setInputEmail("");
                                $(".react-tagsinput-input").attr("value", "");

                                throw error;
                              }
                              setInputEmail("");

                            }
                          })
                          setNewEnteredEmail('')
                        }}>{`Add ${inputEmail}`}</button>
                      )
                    }
                    <div className="text-danger">{error}</div>

                  </div>

                  <div className="side_btn">
                    {/* <button className="blue_btn" onClick={() => {

                      defaultInvities.map(async (email) => {

                        try {
                          const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
                            headers: {
                              "Authorization": `Bearer ${token}`
                            }
                          })

                          if (data.id) {
                            setInvites(invites => [...invites, email]);
                          }

                        } catch (error) {
                          setError(`${email} is not a registered user.`);
                        }

                      })

                    }}>기본 참가자 추가</button> */}
                  </div>

                  <div className="side_btn_box">
                    <div className="side_btn">
                      <Link to="/user/meeting/meetinglist" className="gray_btn">취소</Link>
                    </div>
                    <div className="side_btn">
                      {
                        meetingId ? <button className="blue_btn" onClick={editSessionHandler}>편집하다</button> : <button className="blue_btn" onClick={submitHandler}>저장</button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="schedule_meeting_col">
                <div className="form_box">
                  <div className="input_box">
                    <label>설명</label>
                    <textarea placeholder="강의에 관한 설명 입력" value={meetingDesc} onChange={(e) => setMeetingDesc(e.target.value)}></textarea>
                    <span>입력가능 글자수:</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )

}

export default ScheduleMeeting;