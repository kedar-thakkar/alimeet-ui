// React System Libraries
import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import queryString from "query-string"
import $ from 'jquery';
import { Link } from 'react-router-dom';

// Customised Libraries or components
import '../../css/new-style.css';
import { ValidateEmail, ValidatePassword } from '../validation';
import { ENDPOINTURL } from '../common/endpoints';
import LoginLogo from '../../images/login_logo.svg';
import userprofile from '../../images/user_avatar.png';
import LoginBackGround from '../../images/login_bg.svg';
import ForgotPassword from '../forgotPassword/forgot_password';

function LatestLogin(props) {

    //Storing Values in useState
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameErr, setNameErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [loginStatus, setLoginStatus] = useState("");
    const [passModel, setPassModel] = useState(false);
    const [meetingData, setMeetingData] = useState('');
    const [roomName, setRoomName] = useState('');

    let { meetingId, isRedirect } = queryString.parse(window.location.search);

    // When sending request for authenticate user login
    const submitHandler = async () => {
        const usernameRes = ValidateEmail(email);
        const passwordRes = ValidatePassword(password);

        if (usernameRes.status && passwordRes.status) {            
            setNameErr("")
            setPasswordErr("")
            setLoginStatus({
                status: "processing",
                message: "Processing..."
            })
            try {
                const loginResponse = await Axios.post(`${ENDPOINTURL}/alimeet/authenticate`, {
                    username: email,
                    password: password
                });

                if (loginResponse.data.Status === "200") {
                    setLoginStatus({
                        status: "OK",
                        message: "성공적으로 로그인"
                    })
                    
                    //Set email And auth_token
                    localStorage.setItem("user_id", loginResponse.data.data.id);
                    localStorage.setItem("auth_token", loginResponse.data.data.token);
                    localStorage.setItem("user_name", loginResponse.data.data.userName);
                    localStorage.setItem("user_role", loginResponse.data.data.role);
                    localStorage.setItem("user_email", loginResponse.data.data.email);
                    localStorage.setItem("initial_name", loginResponse.data.data.initialName);
                    if(loginResponse.data.data.url){
                        localStorage.setItem("user_profile_image",loginResponse.data.data.url);
                    }else{
                        localStorage.setItem("user_profile_image","");
                    }
                    let role = localStorage.getItem('user_role');

                    // Redirect to specific page after login successfully.
                    if (role === 'Admin') {
                        props.history.push("/Adminpanelmain");
                    } else {                    
                        if (meetingId) {
                            let link = $('#meeting-link').attr('href');
                            window.location.replace(link);
                        } else {
                            props.history.push("/user/meeting/meetinglist");
                        }
                    }
                }else {
                    setLoginStatus({
                        status: "error",
                        message: loginResponse.data.message
                    })                                             
                }               
            } catch (error) {                
                props.history.push("/error");
            }
        } else {     
            setNameErr(usernameRes.error);
            setPasswordErr(passwordRes.error);           
        }
    }

    //Geting User Details (NOT USING NOW)
    const getUserDetails = async () => {
        const token = localStorage.getItem("auth_token");
        const email = localStorage.getItem("user_email");
        try {
            const userProfile = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (userProfile.data.Status === "200") {
                localStorage.setItem("user_id", userProfile.data.id);
                localStorage.setItem("user_name", userProfile.data.userName);
                localStorage.setItem("user_role", userProfile.data.role);
                let role = localStorage.getItem('user_role');
                if(userProfile.data.url){
                    localStorage.setItem("user_profile_image",userProfile.data.url);
                }else{
                    localStorage.setItem("user_profile_image",userprofile);
                }
                if (role === 'Admin') {
                    props.history.push("/Adminpanelmain")
                } else {                    
                    if (meetingData) {
                        let link = $('#meeting-link').attr('href');
                        window.location.replace(link);
                    } else {
                        props.history.push("/user/meeting/meetinglist")
                    }
                }
            }else{
                setLoginStatus({
                    status: "error",
                    message: userProfile.data.message
                });
            }
        } catch (error) {
            props.history.push("/error")
        }
    }

    //For Opening ForgotPassword Modal
    const forgotPassword = (e) => {
        try {
            e.preventDefault();
            props.history.push("/forgotpassword")
                        
        } catch (error) {
            props.history.push("/error")
        }        
    }

    //For Getting Meeting Details
    const getMeetingDetails = async () => {
        try {
            const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/register/getMeetingById?meetingId=${meetingId}`);
            setMeetingData(JSON.stringify(data));            
            setRoomName(data.roomName)
        } catch (error) {
            props.history.push("/error")
        }
    }

    // Handle validation
    const handleChange=(e)=>{
        e.preventDefault();
        switch (e.target.name) {
            case 'email':
                if(e.target.value.length !== 0){
                    setNameErr('');
                    setEmail(e.target.value);
                }
            break;
            case 'password':                     
                if(e.target.value.length !== 0){
                    setPasswordErr('');
                    setPassword(e.target.value);
                }
            break;
            default:
            break;
        }
    };
    
    //For Making Changes During User Action EntirePage
    useEffect(() => {
        try {
            //For Clering Privous User Details From LocalStorage
            localStorage.clear();           

            //Redirect User to Specific Meeting Link URL
            if (meetingId && isRedirect === 'true') {
                getMeetingDetails();
            }

            //Allow User to Login When Pressing EnterKey
            $("#pwd").keyup(function(event) {
                if (event.keyCode === 13) {
                $("#ClientButton").click();
                }
            });
        } catch (error) {
            props.history.push("/error")
        }       
    }, []);

    return (
        <>
        <div className="d-none">
            <a href={`/user/meeting/exampleUI?room=${roomName}`} id="meeting-link"></a>
        </div>
        {
           passModel && passModel === true ? (
                <ForgotPassword setPassModel={setPassModel} history={props.history} />
            ) : (
                <div className="client_login_main">
                    <div className="client_login">
                        <div className="client_login_left">
                            <div className="client_login_right_img">
                                <img src={LoginBackGround} alt="" />
                            </div> 
                        </div>
                        <div className="client_login_right">
                            <div className="client_login_header">
                                <div className="client_login_logo">
                                    <img src={LoginLogo} alt="" />
                                </div>
                            </div>                            
                            <div className="client_login_content">
                                <div className="client_content_login_box">
                                    <h2>로그인</h2>
                                    <div className="login-api-status text-center my-3">
                                    {
                                        loginStatus && loginStatus.status === "OK" &&
                                        <p className="text-success">{loginStatus.message}</p>
                                    }
                                    {
                                        loginStatus && loginStatus.status === "error" &&
                                        <p className="text-danger">{loginStatus.message}</p>
                                    }
                                    </div>
                                    <div className="client_login_content_form_box">
                                        <label>아이디(이메일)</label>
                                        <input type="email" name="email" placeholder="아이디(이메일)" onChange={(e) => handleChange(e)} />
                                        <small className="error">{nameErr}</small>
                                    </div>
                                    <div className="client_login_content_form_box">
                                        <label>비밀번호</label>
                                        <input type="password" id="pwd" name="password" autoComplete="" placeholder="비밀번호 입력" onChange={(e) => handleChange(e)} />
                                        <small className="error">{passwordErr}</small> 
                                        <div className="client_login1" onClick={(e) => forgotPassword(e)}>비밀번호 찾기?</div>                                          
                                    </div>                                        
                                    <div className="client_login_content_form_box">
                                        <button id="ClientButton" className="login_btn" onClick={submitHandler} value="로그인">로그인</button>
                                        <small>아직 회원이 아니신가요? 클릭 <Link to="/signup"> 여기 </Link>가입!</small>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            )
        }
    </>
    )
}
export default LatestLogin
