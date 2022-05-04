import React, { useEffect, useState } from 'react';
import CheckLoginStatus from '../common/loginStatus';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import DatePicker from "react-datepicker";
import $ from 'jquery';
import { FaCalendar } from 'react-icons/fa';

function Search(props) {
    const [date, setDate] = useState("");
    const [meetingList, setMeetingList] = useState([]);
    const token = localStorage.getItem("auth_token");
    let userId = localStorage.getItem("user_id");
    let months_arr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
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
    }, []) 
 
    return(
        <div className="cl_meeting_list">
        <div className="wrapper">
            <div className="cl_meeting_list_otr">
                <div onClick={() => { $("#choose-date").click(); }} className="cl_meeting_box"><FaCalendar/>
                    <DatePicker id="choose-date" onChange={dateHandler} />{date}                                  
                </div>
                <div className="cl_search_box">
                    <input type="text"/>
                    <button type="submit"></button>
                </div>
            </div>
        </div>
    </div> 
    )
}
export default Search;