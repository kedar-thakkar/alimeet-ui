import React, { useState, useEffect } from 'react';
import '../../css/new-style.css';
import LoginLogo from '../../images/login_logo.svg';
import userprofile from '../../images/Userprofile.png';
import DropdownComponent from "../common/dropdown";
import CheckLoginStatus from '../common/loginStatus';

function NewNavbar(props) {
    let dropdown_items = [
        {
          name: "프로필",
          link: "/user/profile/editprofile"
        },
        {
          name: "로그아웃",
          link: "/"
        }
    ]

    // Make Page Active based on selected page
    let meetingPage, attendencePage, ViewRecording = "";
    const pageName = window.location.pathname.split("/");
    if(pageName[1] && pageName[1] == "ViewRecording"){
        ViewRecording = "active";
    }else if(pageName[3] == "attendence" || pageName[3] == "userAttendence"){
        attendencePage = "active";
    }else if(pageName[3] == "meetinglist"){
        meetingPage = "active";
    }else{
        meetingPage = "active";
    }

    const [dropdownHandler, setDropdownHandler] = useState(false);        
    let user_name = localStorage.getItem("user_name");
    let user_role = localStorage.getItem("user_role");
    let initialName = localStorage.getItem("initial_name");

    useEffect(() => {
        // validate user is logged in to access
        const isUserLoggedIn = CheckLoginStatus();
        if(isUserLoggedIn === false) {
            window.location.href = "/";
        }
    });
    
    //For redirecting Home page From any other Page
    const loginstatus = (e) => {
        e.preventDefault();
        //Validate user is logged in to access the website
        const login_status = CheckLoginStatus();        
        if (login_status === true) {
            if(user_role == "Admin"){
                window.location.href = "/Adminpanelmain";
            }else{
                window.location.href = "/user/meeting/meetinglist";
            }
            // props.history.push("/user/meeting/meetinglist")
        }else{
            window.location.href = "/" ;
            // props.history.push("/")
        }
    }

    return(
        <div className="cl_list_header">
        <div className="wrapper">
            <div className="cl_list_head">
                <div className="cl_logo">                   
                    <img src={LoginLogo} onClick={loginstatus} alt=""/>                   
                </div>
                <div className="cl_list_middle_box">
                    <ul>
                        <li>
                        {
                            user_role === "Admin" && (
                                <a href="/Adminpanelmain" className={meetingPage}>
                                    <span>
                                        <svg width="33" height="29" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M26.0042 8.55664H23.5572C23.253 8.55664 22.9612 8.67749 22.7461 8.89259C22.531 9.1077 22.4102 9.39944 22.4102 9.70364C22.4102 10.0078 22.531 10.2996 22.7461 10.5147C22.9612 10.7298 23.253 10.8506 23.5572 10.8506H26.0042C26.3084 10.8506 26.6001 10.7298 26.8152 10.5147C27.0303 10.2996 27.1512 10.0078 27.1512 9.70364C27.1512 9.39944 27.0303 9.1077 26.8152 8.89259C26.6001 8.67749 26.3084 8.55664 26.0042 8.55664V8.55664Z" fill="#CFECF8"/>
                                            <path d="M20.4439 7.18853H26.5609C26.8651 7.18853 27.1568 7.06769 27.3719 6.85258C27.587 6.63748 27.7079 6.34574 27.7079 6.04153C27.7079 5.73733 27.587 5.44558 27.3719 5.23048C27.1568 5.01537 26.8651 4.89453 26.5609 4.89453H20.4439C20.1397 4.89453 19.8479 5.01537 19.6328 5.23048C19.4177 5.44558 19.2969 5.73733 19.2969 6.04153C19.2969 6.34574 19.4177 6.63748 19.6328 6.85258C19.8479 7.06769 20.1397 7.18853 20.4439 7.18853V7.18853Z" fill="#CFECF8"/>
                                            <path d="M30.06 14.667C30.7744 14.6026 31.4389 14.2736 31.923 13.7444C32.4072 13.2153 32.6761 12.5242 32.677 11.807V2.872C32.6762 2.10968 32.3727 1.37888 31.8332 0.840302C31.2937 0.301726 30.5623 -0.00053003 29.8 6.97742e-07H20.3C19.5385 0.000794849 18.8085 0.303636 18.2701 0.842068C17.7316 1.3805 17.4288 2.11054 17.428 2.872V6.637H5.489C4.72754 6.6378 3.9975 6.94063 3.45907 7.47907C2.92063 8.0175 2.61779 8.74754 2.617 9.509V21C2.61702 21.3261 2.67283 21.6497 2.782 21.957H1.723C1.26654 21.9575 0.828898 22.139 0.505945 22.4615C0.182991 22.7841 0.00105815 23.2215 0 23.678C0.00132359 24.9472 0.506092 26.164 1.40354 27.0615C2.30099 27.9589 3.51782 28.4637 4.787 28.465H27.887C29.1562 28.4637 30.373 27.9589 31.2705 27.0615C32.1679 26.164 32.6727 24.9472 32.674 23.678C32.6735 23.2212 32.4918 22.7832 32.1688 22.4602C31.8458 22.1372 31.4078 21.9555 30.951 21.955H29.9C30.0072 21.6481 30.0614 21.3251 30.06 21V14.667ZM19.338 2.867C19.3383 2.61327 19.4392 2.37001 19.6186 2.19059C19.798 2.01118 20.0413 1.91027 20.295 1.91H29.8C30.0537 1.91027 30.297 2.01118 30.4764 2.19059C30.6558 2.37001 30.7567 2.61327 30.757 2.867V11.802C30.7567 12.0557 30.6558 12.299 30.4764 12.4784C30.297 12.6578 30.0537 12.7587 29.8 12.759H20.934C20.7547 12.7592 20.579 12.8098 20.427 12.905L18.5 14.116L19.3 11.444C19.3266 11.3548 19.3401 11.2621 19.34 11.169L19.338 2.867ZM27.89 26.55H4.787C4.05858 26.5491 3.35762 26.2719 2.82566 25.7743C2.2937 25.2767 1.97039 24.5957 1.921 23.869H30.756C30.7066 24.5957 30.3833 25.2767 29.8513 25.7743C29.3194 26.2719 28.6184 26.5491 27.89 26.55ZM9.127 14.743C9.127 14.5284 9.19063 14.3186 9.30986 14.1402C9.42908 13.9618 9.59853 13.8227 9.79679 13.7406C9.99505 13.6585 10.2132 13.637 10.4237 13.6788C10.6341 13.7207 10.8275 13.824 10.9792 13.9758C11.131 14.1275 11.2343 14.3209 11.2762 14.5313C11.318 14.7418 11.2965 14.96 11.2144 15.1582C11.1323 15.3565 10.9932 15.5259 10.8148 15.6451C10.6364 15.7644 10.4266 15.828 10.212 15.828C9.92432 15.8277 9.6485 15.7133 9.44508 15.5099C9.24166 15.3065 9.12726 15.0307 9.127 14.743V14.743ZM8.616 18.828C8.616 18.25 9.362 17.743 10.216 17.743C10.6481 17.7367 11.0701 17.8739 11.416 18.133C11.528 18.2132 11.621 18.3171 11.6886 18.4371C11.7561 18.5572 11.7966 18.6906 11.807 18.828V21.955H8.616V18.828ZM13.722 21.955V18.827C13.7139 18.402 13.6099 17.9844 13.4179 17.6052C13.2259 17.226 12.9507 16.895 12.613 16.637L12.565 16.6C12.9156 16.1581 13.1346 15.6264 13.1967 15.0657C13.2589 14.505 13.1617 13.9382 12.9163 13.4303C12.671 12.9224 12.2874 12.4939 11.8096 12.1941C11.3318 11.8942 10.7791 11.7352 10.215 11.7352C9.65091 11.7352 9.09825 11.8942 8.62044 12.1941C8.14263 12.4939 7.75903 12.9224 7.51367 13.4303C7.2683 13.9382 7.17112 14.505 7.23326 15.0657C7.2954 15.6264 7.51436 16.1581 7.865 16.6C7.51195 16.856 7.22302 17.1903 7.02089 17.5766C6.81876 17.963 6.70892 18.391 6.7 18.827V21.954H5.489C5.23561 21.954 4.99255 21.8536 4.813 21.6748C4.63346 21.496 4.53206 21.2534 4.531 21V9.509C4.53126 9.25527 4.63218 9.01201 4.81159 8.83259C4.99101 8.65318 5.23427 8.55226 5.488 8.552H17.423V11.028L16.662 13.566C16.5485 13.9391 16.5517 14.338 16.6713 14.7092C16.791 15.0804 17.0212 15.4061 17.3313 15.6427C17.6413 15.8793 18.0163 16.0154 18.4059 16.0328C18.7955 16.0502 19.1811 15.948 19.511 15.74L21.211 14.679H28.148V21C28.1477 21.2537 28.0468 21.497 27.8674 21.6764C27.688 21.8558 27.4447 21.9567 27.191 21.957L13.722 21.955Z" fill="#CFECF8"/>
                                        </svg>
                                       
                                    </span>
                                    회의
                                </a>
                            )
                        }
                        {
                            user_role === "Teacher" && (
                                <a href="/user/meeting/meetinglist" className={meetingPage}>
                                    <span>
                                        <svg width="33" height="29" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M26.0042 8.55664H23.5572C23.253 8.55664 22.9612 8.67749 22.7461 8.89259C22.531 9.1077 22.4102 9.39944 22.4102 9.70364C22.4102 10.0078 22.531 10.2996 22.7461 10.5147C22.9612 10.7298 23.253 10.8506 23.5572 10.8506H26.0042C26.3084 10.8506 26.6001 10.7298 26.8152 10.5147C27.0303 10.2996 27.1512 10.0078 27.1512 9.70364C27.1512 9.39944 27.0303 9.1077 26.8152 8.89259C26.6001 8.67749 26.3084 8.55664 26.0042 8.55664V8.55664Z" fill="#CFECF8"/>
                                            <path d="M20.4439 7.18853H26.5609C26.8651 7.18853 27.1568 7.06769 27.3719 6.85258C27.587 6.63748 27.7079 6.34574 27.7079 6.04153C27.7079 5.73733 27.587 5.44558 27.3719 5.23048C27.1568 5.01537 26.8651 4.89453 26.5609 4.89453H20.4439C20.1397 4.89453 19.8479 5.01537 19.6328 5.23048C19.4177 5.44558 19.2969 5.73733 19.2969 6.04153C19.2969 6.34574 19.4177 6.63748 19.6328 6.85258C19.8479 7.06769 20.1397 7.18853 20.4439 7.18853V7.18853Z" fill="#CFECF8"/>
                                            <path d="M30.06 14.667C30.7744 14.6026 31.4389 14.2736 31.923 13.7444C32.4072 13.2153 32.6761 12.5242 32.677 11.807V2.872C32.6762 2.10968 32.3727 1.37888 31.8332 0.840302C31.2937 0.301726 30.5623 -0.00053003 29.8 6.97742e-07H20.3C19.5385 0.000794849 18.8085 0.303636 18.2701 0.842068C17.7316 1.3805 17.4288 2.11054 17.428 2.872V6.637H5.489C4.72754 6.6378 3.9975 6.94063 3.45907 7.47907C2.92063 8.0175 2.61779 8.74754 2.617 9.509V21C2.61702 21.3261 2.67283 21.6497 2.782 21.957H1.723C1.26654 21.9575 0.828898 22.139 0.505945 22.4615C0.182991 22.7841 0.00105815 23.2215 0 23.678C0.00132359 24.9472 0.506092 26.164 1.40354 27.0615C2.30099 27.9589 3.51782 28.4637 4.787 28.465H27.887C29.1562 28.4637 30.373 27.9589 31.2705 27.0615C32.1679 26.164 32.6727 24.9472 32.674 23.678C32.6735 23.2212 32.4918 22.7832 32.1688 22.4602C31.8458 22.1372 31.4078 21.9555 30.951 21.955H29.9C30.0072 21.6481 30.0614 21.3251 30.06 21V14.667ZM19.338 2.867C19.3383 2.61327 19.4392 2.37001 19.6186 2.19059C19.798 2.01118 20.0413 1.91027 20.295 1.91H29.8C30.0537 1.91027 30.297 2.01118 30.4764 2.19059C30.6558 2.37001 30.7567 2.61327 30.757 2.867V11.802C30.7567 12.0557 30.6558 12.299 30.4764 12.4784C30.297 12.6578 30.0537 12.7587 29.8 12.759H20.934C20.7547 12.7592 20.579 12.8098 20.427 12.905L18.5 14.116L19.3 11.444C19.3266 11.3548 19.3401 11.2621 19.34 11.169L19.338 2.867ZM27.89 26.55H4.787C4.05858 26.5491 3.35762 26.2719 2.82566 25.7743C2.2937 25.2767 1.97039 24.5957 1.921 23.869H30.756C30.7066 24.5957 30.3833 25.2767 29.8513 25.7743C29.3194 26.2719 28.6184 26.5491 27.89 26.55ZM9.127 14.743C9.127 14.5284 9.19063 14.3186 9.30986 14.1402C9.42908 13.9618 9.59853 13.8227 9.79679 13.7406C9.99505 13.6585 10.2132 13.637 10.4237 13.6788C10.6341 13.7207 10.8275 13.824 10.9792 13.9758C11.131 14.1275 11.2343 14.3209 11.2762 14.5313C11.318 14.7418 11.2965 14.96 11.2144 15.1582C11.1323 15.3565 10.9932 15.5259 10.8148 15.6451C10.6364 15.7644 10.4266 15.828 10.212 15.828C9.92432 15.8277 9.6485 15.7133 9.44508 15.5099C9.24166 15.3065 9.12726 15.0307 9.127 14.743V14.743ZM8.616 18.828C8.616 18.25 9.362 17.743 10.216 17.743C10.6481 17.7367 11.0701 17.8739 11.416 18.133C11.528 18.2132 11.621 18.3171 11.6886 18.4371C11.7561 18.5572 11.7966 18.6906 11.807 18.828V21.955H8.616V18.828ZM13.722 21.955V18.827C13.7139 18.402 13.6099 17.9844 13.4179 17.6052C13.2259 17.226 12.9507 16.895 12.613 16.637L12.565 16.6C12.9156 16.1581 13.1346 15.6264 13.1967 15.0657C13.2589 14.505 13.1617 13.9382 12.9163 13.4303C12.671 12.9224 12.2874 12.4939 11.8096 12.1941C11.3318 11.8942 10.7791 11.7352 10.215 11.7352C9.65091 11.7352 9.09825 11.8942 8.62044 12.1941C8.14263 12.4939 7.75903 12.9224 7.51367 13.4303C7.2683 13.9382 7.17112 14.505 7.23326 15.0657C7.2954 15.6264 7.51436 16.1581 7.865 16.6C7.51195 16.856 7.22302 17.1903 7.02089 17.5766C6.81876 17.963 6.70892 18.391 6.7 18.827V21.954H5.489C5.23561 21.954 4.99255 21.8536 4.813 21.6748C4.63346 21.496 4.53206 21.2534 4.531 21V9.509C4.53126 9.25527 4.63218 9.01201 4.81159 8.83259C4.99101 8.65318 5.23427 8.55226 5.488 8.552H17.423V11.028L16.662 13.566C16.5485 13.9391 16.5517 14.338 16.6713 14.7092C16.791 15.0804 17.0212 15.4061 17.3313 15.6427C17.6413 15.8793 18.0163 16.0154 18.4059 16.0328C18.7955 16.0502 19.1811 15.948 19.511 15.74L21.211 14.679H28.148V21C28.1477 21.2537 28.0468 21.497 27.8674 21.6764C27.688 21.8558 27.4447 21.9567 27.191 21.957L13.722 21.955Z" fill="#CFECF8"/>
                                        </svg>
                                       
                                    </span>
                                    회의
                                </a>
                            )
                        }
                        </li>
                        {
                            user_role != "Student" && (
                            <li>
                                <a href="/ViewRecording" className={ViewRecording}>
                                    <span>
                                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24.3609 3.244C23.6737 3.24374 22.9898 3.33727 22.3279 3.522C21.4668 2.43351 20.3724 1.55204 19.1255 0.942504C17.8786 0.33297 16.5108 0.0108959 15.1229 0C13.2504 0.00455912 11.4254 0.590162 9.8999 1.676C8.53085 2.64973 7.41923 3.94188 6.6609 5.441C4.90233 5.63072 3.27863 6.47236 2.1099 7.8C0.79244 9.29755 0.04596 11.2121 0.00205324 13.2062C-0.0418535 15.2003 0.619632 17.1459 1.8699 18.7C3.02439 20.1411 4.69046 21.081 6.5209 21.324C6.55408 21.3281 6.58746 21.3305 6.6209 21.331L7.7269 21.355V27.885C7.72822 29.1542 8.23299 30.371 9.13044 31.2685C10.0279 32.1659 11.2447 32.6707 12.5139 32.672H20.1729C21.4421 32.6707 22.6589 32.1659 23.5564 31.2685C24.4538 30.371 24.9586 29.1542 24.9599 27.885V24.95C25.2154 24.8018 25.4331 24.5964 25.5959 24.35L28.2999 20.293C29.5933 19.5201 30.6647 18.4256 31.4099 17.116C32.2453 15.6545 32.6829 13.9994 32.6789 12.316C32.6789 7.316 28.9489 3.248 24.3639 3.248L24.3609 3.244ZM20.1679 30.762H12.5089C11.7474 30.7612 11.0174 30.4584 10.479 29.9199C9.94053 29.3815 9.63769 28.6515 9.6369 27.89V16.083C9.63769 15.3215 9.94053 14.5915 10.479 14.0531C11.0174 13.5146 11.7474 13.2118 12.5089 13.211H20.1679C20.4491 13.2106 20.7287 13.2517 20.9979 13.333V16.4H20.6799C20.3334 16.4001 19.9933 16.4942 19.6961 16.6724C19.3988 16.8505 19.1555 17.106 18.992 17.4115C18.8285 17.717 18.751 18.0612 18.7677 18.4074C18.7844 18.7535 18.8947 19.0886 19.0869 19.377L19.6609 20.238L19.6669 20.247L22.3999 24.354C22.5627 24.6004 22.7804 24.8058 23.0359 24.954V27.894C23.0351 28.6555 22.7323 29.3855 22.1938 29.9239C21.6554 30.4624 20.9254 30.7652 20.1639 30.766L20.1679 30.762ZM23.9999 23.292L20.6799 18.317H21.9539C22.2077 18.317 22.4511 18.2162 22.6306 18.0367C22.8101 17.8572 22.9109 17.6138 22.9109 17.36V10.66H25.0809V17.36C25.0809 17.6138 25.1817 17.8572 25.3612 18.0367C25.5407 18.2162 25.7841 18.317 26.0379 18.317H27.3129L26.8199 19.056L23.9999 23.292ZM28.9359 17.292C28.7636 17.0183 28.5247 16.7928 28.2416 16.6367C27.9584 16.4805 27.6403 16.3987 27.3169 16.399H26.9999V10.658C26.9994 10.1503 26.7974 9.66349 26.4384 9.30447C26.0794 8.94546 25.5926 8.74353 25.0849 8.743H22.9149C22.4072 8.74353 21.9204 8.94546 21.5614 9.30447C21.2024 9.66349 21.0004 10.1503 20.9999 10.658V11.369C20.7259 11.3206 20.4482 11.2962 20.1699 11.296H12.5089C11.2397 11.2973 10.0229 11.8021 9.12544 12.6995C8.22799 13.597 7.72322 14.8138 7.7219 16.083V19.445L6.7079 19.423C5.32309 19.1509 4.0803 18.3949 3.20194 17.2903C2.32359 16.1857 1.867 14.8045 1.9139 13.394C1.89982 11.8077 2.47617 10.2729 3.5309 9.088C3.9997 8.54781 4.57629 8.11164 5.22365 7.8075C5.87102 7.50337 6.57483 7.33799 7.2899 7.322C7.47308 7.3201 7.65186 7.26566 7.80501 7.16515C7.95817 7.06464 8.07926 6.92229 8.1539 6.755C8.71593 5.35594 9.67523 4.15201 10.9135 3.29176C12.1517 2.4315 13.6147 1.95255 15.1219 1.914C16.3247 1.93219 17.5053 2.24041 18.5634 2.81249C19.6216 3.38457 20.526 4.20359 21.1999 5.2C21.3232 5.37275 21.5005 5.49961 21.7037 5.56061C21.907 5.62162 22.1248 5.61331 22.3229 5.537C22.9724 5.28641 23.6627 5.15793 24.3589 5.158C27.8879 5.158 30.7589 8.367 30.7589 12.312C30.7662 14.1395 30.1184 15.9092 28.9329 17.3L28.9359 17.292Z" fill="#CFECF8"/>
                                        </svg>
                                    </span>
                                    녹음
                                </a>
                            </li>
                            )
                        }

                        {
                            user_role != "Student" && (
                            <li>
                                <a href="/user/meeting/attendence" className={attendencePage}>
                                    <span>
                                        <svg width="33" height="30" viewBox="0 0 33 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M32.1 18.5365V4.9145C32.0992 4.15304 31.7964 3.423 31.2579 2.88457C30.7195 2.34613 29.9895 2.04329 29.228 2.0425H25.465V0.9575C25.465 0.703556 25.3641 0.460011 25.1846 0.280445C25.005 0.100879 24.7614 0 24.5075 0C24.2536 0 24.01 0.100879 23.8304 0.280445C23.6509 0.460011 23.55 0.703556 23.55 0.9575V2.0425H17.3V0.9575C17.3 0.703556 17.1991 0.460011 17.0196 0.280445C16.84 0.100879 16.5964 0 16.3425 0C16.0886 0 15.845 0.100879 15.6654 0.280445C15.4859 0.460011 15.385 0.703556 15.385 0.9575V2.0425H9.127V0.9575C9.127 0.703556 9.02612 0.460011 8.84655 0.280445C8.66699 0.100879 8.42345 0 8.1695 0C7.91556 0 7.67201 0.100879 7.49245 0.280445C7.31288 0.460011 7.212 0.703556 7.212 0.9575V2.0425H2.872C2.11054 2.04329 1.3805 2.34613 0.842066 2.88457C0.303634 3.423 0.000794151 4.15304 0 4.9145L0 22.5295C0.00105877 23.2908 0.304015 24.0206 0.842419 24.5588C1.38082 25.097 2.11071 25.3997 2.872 25.4005H17.738C18.7309 27.1629 20.3563 28.4823 22.2853 29.0916C24.2142 29.7009 26.3026 29.5546 28.1277 28.6823C29.9528 27.81 31.3784 26.2769 32.1159 24.3932C32.8534 22.5096 32.8477 20.4161 32.1 18.5365V18.5365ZM25.654 15.5205C26.9145 15.7243 28.0788 16.3199 28.9817 17.2228C29.8846 18.1257 30.4802 19.29 30.684 20.5505H25.654V15.5205ZM2.872 23.4865C2.61827 23.4862 2.37501 23.3853 2.19559 23.2059C2.01618 23.0265 1.91526 22.7832 1.915 22.5295V4.9145C1.91526 4.66077 2.01618 4.41751 2.19559 4.23809C2.37501 4.05868 2.61827 3.95777 2.872 3.9575H7.212V5.1065C7.212 5.36045 7.31288 5.60399 7.49245 5.78355C7.67201 5.96312 7.91556 6.064 8.1695 6.064C8.42345 6.064 8.66699 5.96312 8.84655 5.78355C9.02612 5.60399 9.127 5.36045 9.127 5.1065V3.9575H15.382V5.1065C15.382 5.36045 15.4829 5.60399 15.6624 5.78355C15.842 5.96312 16.0856 6.064 16.3395 6.064C16.5934 6.064 16.837 5.96312 17.0166 5.78355C17.1961 5.60399 17.297 5.36045 17.297 5.1065V3.9575H23.55V5.1065C23.55 5.36045 23.6509 5.60399 23.8304 5.78355C24.01 5.96312 24.2536 6.064 24.5075 6.064C24.7614 6.064 25.005 5.96312 25.1846 5.78355C25.3641 5.60399 25.465 5.36045 25.465 5.1065V3.9575H29.23C29.4837 3.95777 29.727 4.05868 29.9064 4.23809C30.0858 4.41751 30.1867 4.66077 30.187 4.9145V15.7245C28.9317 14.5346 27.3237 13.785 25.6053 13.5885C23.8868 13.3921 22.1511 13.7595 20.6597 14.6354C19.1682 15.5113 18.0019 16.8482 17.3364 18.4446C16.6709 20.0411 16.5423 21.8106 16.97 23.4865H2.872ZM24.7 27.5715C23.1751 27.5715 21.7062 26.9969 20.586 25.9622C19.4658 24.9275 18.7767 23.5086 18.656 21.9885C18.5353 20.4684 18.9918 18.9586 19.9346 17.76C20.8774 16.5615 22.2372 15.7622 23.743 15.5215V21.5085C23.743 21.7623 23.8438 22.0057 24.0233 22.1852C24.2028 22.3647 24.4462 22.4655 24.7 22.4655H30.687C30.4575 23.8887 29.7291 25.1838 28.6323 26.1193C27.5354 27.0547 26.1416 27.5695 24.7 27.5715V27.5715Z" fill="#CFECF8"/>
                                        </svg>
                                    </span>
                                    출석
                                </a>
                            </li>
                            )
                        }
                        {/* {
                            user_role === "Teacher" && (
                                <li>
                                    <a href="/ViewRecording" className={ViewRecording}>
                                        <span>
                                            <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M24.3609 3.244C23.6737 3.24374 22.9898 3.33727 22.3279 3.522C21.4668 2.43351 20.3724 1.55204 19.1255 0.942504C17.8786 0.33297 16.5108 0.0108959 15.1229 0C13.2504 0.00455912 11.4254 0.590162 9.8999 1.676C8.53085 2.64973 7.41923 3.94188 6.6609 5.441C4.90233 5.63072 3.27863 6.47236 2.1099 7.8C0.79244 9.29755 0.04596 11.2121 0.00205324 13.2062C-0.0418535 15.2003 0.619632 17.1459 1.8699 18.7C3.02439 20.1411 4.69046 21.081 6.5209 21.324C6.55408 21.3281 6.58746 21.3305 6.6209 21.331L7.7269 21.355V27.885C7.72822 29.1542 8.23299 30.371 9.13044 31.2685C10.0279 32.1659 11.2447 32.6707 12.5139 32.672H20.1729C21.4421 32.6707 22.6589 32.1659 23.5564 31.2685C24.4538 30.371 24.9586 29.1542 24.9599 27.885V24.95C25.2154 24.8018 25.4331 24.5964 25.5959 24.35L28.2999 20.293C29.5933 19.5201 30.6647 18.4256 31.4099 17.116C32.2453 15.6545 32.6829 13.9994 32.6789 12.316C32.6789 7.316 28.9489 3.248 24.3639 3.248L24.3609 3.244ZM20.1679 30.762H12.5089C11.7474 30.7612 11.0174 30.4584 10.479 29.9199C9.94053 29.3815 9.63769 28.6515 9.6369 27.89V16.083C9.63769 15.3215 9.94053 14.5915 10.479 14.0531C11.0174 13.5146 11.7474 13.2118 12.5089 13.211H20.1679C20.4491 13.2106 20.7287 13.2517 20.9979 13.333V16.4H20.6799C20.3334 16.4001 19.9933 16.4942 19.6961 16.6724C19.3988 16.8505 19.1555 17.106 18.992 17.4115C18.8285 17.717 18.751 18.0612 18.7677 18.4074C18.7844 18.7535 18.8947 19.0886 19.0869 19.377L19.6609 20.238L19.6669 20.247L22.3999 24.354C22.5627 24.6004 22.7804 24.8058 23.0359 24.954V27.894C23.0351 28.6555 22.7323 29.3855 22.1938 29.9239C21.6554 30.4624 20.9254 30.7652 20.1639 30.766L20.1679 30.762ZM23.9999 23.292L20.6799 18.317H21.9539C22.2077 18.317 22.4511 18.2162 22.6306 18.0367C22.8101 17.8572 22.9109 17.6138 22.9109 17.36V10.66H25.0809V17.36C25.0809 17.6138 25.1817 17.8572 25.3612 18.0367C25.5407 18.2162 25.7841 18.317 26.0379 18.317H27.3129L26.8199 19.056L23.9999 23.292ZM28.9359 17.292C28.7636 17.0183 28.5247 16.7928 28.2416 16.6367C27.9584 16.4805 27.6403 16.3987 27.3169 16.399H26.9999V10.658C26.9994 10.1503 26.7974 9.66349 26.4384 9.30447C26.0794 8.94546 25.5926 8.74353 25.0849 8.743H22.9149C22.4072 8.74353 21.9204 8.94546 21.5614 9.30447C21.2024 9.66349 21.0004 10.1503 20.9999 10.658V11.369C20.7259 11.3206 20.4482 11.2962 20.1699 11.296H12.5089C11.2397 11.2973 10.0229 11.8021 9.12544 12.6995C8.22799 13.597 7.72322 14.8138 7.7219 16.083V19.445L6.7079 19.423C5.32309 19.1509 4.0803 18.3949 3.20194 17.2903C2.32359 16.1857 1.867 14.8045 1.9139 13.394C1.89982 11.8077 2.47617 10.2729 3.5309 9.088C3.9997 8.54781 4.57629 8.11164 5.22365 7.8075C5.87102 7.50337 6.57483 7.33799 7.2899 7.322C7.47308 7.3201 7.65186 7.26566 7.80501 7.16515C7.95817 7.06464 8.07926 6.92229 8.1539 6.755C8.71593 5.35594 9.67523 4.15201 10.9135 3.29176C12.1517 2.4315 13.6147 1.95255 15.1219 1.914C16.3247 1.93219 17.5053 2.24041 18.5634 2.81249C19.6216 3.38457 20.526 4.20359 21.1999 5.2C21.3232 5.37275 21.5005 5.49961 21.7037 5.56061C21.907 5.62162 22.1248 5.61331 22.3229 5.537C22.9724 5.28641 23.6627 5.15793 24.3589 5.158C27.8879 5.158 30.7589 8.367 30.7589 12.312C30.7662 14.1395 30.1184 15.9092 28.9329 17.3L28.9359 17.292Z" fill="#CFECF8"/>
                                            </svg>
                                        </span>
                                        회의
                                    </a>
                                </li>
                                <li>
                                    <a href="/user/meeting/attendence" className={attendencePage}>
                                        <span>
                                            <svg width="33" height="30" viewBox="0 0 33 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M32.1 18.5365V4.9145C32.0992 4.15304 31.7964 3.423 31.2579 2.88457C30.7195 2.34613 29.9895 2.04329 29.228 2.0425H25.465V0.9575C25.465 0.703556 25.3641 0.460011 25.1846 0.280445C25.005 0.100879 24.7614 0 24.5075 0C24.2536 0 24.01 0.100879 23.8304 0.280445C23.6509 0.460011 23.55 0.703556 23.55 0.9575V2.0425H17.3V0.9575C17.3 0.703556 17.1991 0.460011 17.0196 0.280445C16.84 0.100879 16.5964 0 16.3425 0C16.0886 0 15.845 0.100879 15.6654 0.280445C15.4859 0.460011 15.385 0.703556 15.385 0.9575V2.0425H9.127V0.9575C9.127 0.703556 9.02612 0.460011 8.84655 0.280445C8.66699 0.100879 8.42345 0 8.1695 0C7.91556 0 7.67201 0.100879 7.49245 0.280445C7.31288 0.460011 7.212 0.703556 7.212 0.9575V2.0425H2.872C2.11054 2.04329 1.3805 2.34613 0.842066 2.88457C0.303634 3.423 0.000794151 4.15304 0 4.9145L0 22.5295C0.00105877 23.2908 0.304015 24.0206 0.842419 24.5588C1.38082 25.097 2.11071 25.3997 2.872 25.4005H17.738C18.7309 27.1629 20.3563 28.4823 22.2853 29.0916C24.2142 29.7009 26.3026 29.5546 28.1277 28.6823C29.9528 27.81 31.3784 26.2769 32.1159 24.3932C32.8534 22.5096 32.8477 20.4161 32.1 18.5365V18.5365ZM25.654 15.5205C26.9145 15.7243 28.0788 16.3199 28.9817 17.2228C29.8846 18.1257 30.4802 19.29 30.684 20.5505H25.654V15.5205ZM2.872 23.4865C2.61827 23.4862 2.37501 23.3853 2.19559 23.2059C2.01618 23.0265 1.91526 22.7832 1.915 22.5295V4.9145C1.91526 4.66077 2.01618 4.41751 2.19559 4.23809C2.37501 4.05868 2.61827 3.95777 2.872 3.9575H7.212V5.1065C7.212 5.36045 7.31288 5.60399 7.49245 5.78355C7.67201 5.96312 7.91556 6.064 8.1695 6.064C8.42345 6.064 8.66699 5.96312 8.84655 5.78355C9.02612 5.60399 9.127 5.36045 9.127 5.1065V3.9575H15.382V5.1065C15.382 5.36045 15.4829 5.60399 15.6624 5.78355C15.842 5.96312 16.0856 6.064 16.3395 6.064C16.5934 6.064 16.837 5.96312 17.0166 5.78355C17.1961 5.60399 17.297 5.36045 17.297 5.1065V3.9575H23.55V5.1065C23.55 5.36045 23.6509 5.60399 23.8304 5.78355C24.01 5.96312 24.2536 6.064 24.5075 6.064C24.7614 6.064 25.005 5.96312 25.1846 5.78355C25.3641 5.60399 25.465 5.36045 25.465 5.1065V3.9575H29.23C29.4837 3.95777 29.727 4.05868 29.9064 4.23809C30.0858 4.41751 30.1867 4.66077 30.187 4.9145V15.7245C28.9317 14.5346 27.3237 13.785 25.6053 13.5885C23.8868 13.3921 22.1511 13.7595 20.6597 14.6354C19.1682 15.5113 18.0019 16.8482 17.3364 18.4446C16.6709 20.0411 16.5423 21.8106 16.97 23.4865H2.872ZM24.7 27.5715C23.1751 27.5715 21.7062 26.9969 20.586 25.9622C19.4658 24.9275 18.7767 23.5086 18.656 21.9885C18.5353 20.4684 18.9918 18.9586 19.9346 17.76C20.8774 16.5615 22.2372 15.7622 23.743 15.5215V21.5085C23.743 21.7623 23.8438 22.0057 24.0233 22.1852C24.2028 22.3647 24.4462 22.4655 24.7 22.4655H30.687C30.4575 23.8887 29.7291 25.1838 28.6323 26.1193C27.5354 27.0547 26.1416 27.5695 24.7 27.5715V27.5715Z" fill="#CFECF8"/>
                                            </svg>
                                        </span>
                                        출석
                                    </a>
                                </li>
                            )
                        } */}
                    </ul>
                </div>
                <div className="cl_list_pofile">
                    <div className="cl_list_pofile_img">
                        {
                            localStorage.getItem("user_profile_image") ? (
                                <img src={localStorage.getItem("user_profile_image") ? localStorage.getItem("user_profile_image") : userprofile} style={{ borderRadius: '50%', width: '70px',height: '70px', maxWidth: 'unset', position: 'relative' ,right: '20px' }} alt="" />
                            ) : (
                                <span style={{ width: '65px',height: '65px',background: '#3e97e5',borderRadius: '100%',color: '#fff',display: 'flex',justifyContent: 'center',alignItems: 'center',border: 'solid' }}>{initialName}</span>
                            )
                        }
                    </div>
                    <span>{user_name}<small>{user_role}</small></span>
                    <a onClick={(e) => { e.preventDefault(); setDropdownHandler(!dropdownHandler) }}>
                        {
                            dropdownHandler && (
                                <DropdownComponent items={dropdown_items} />
                            )
                        }
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="9" viewBox="0 0 15 9">
                            <g fill="none" >
                                <g fill="#CFECF8">
                                    <g>
                                        <g>
                                            <g>
                                                <path d="M303.817 20.182c-.245-.243-.64-.243-.884 0l-6.433 6.395-6.433-6.395c-.244-.243-.64-.243-.884 0s-.244.636 0 .879l6.875 6.834c.122.121.282.182.442.182.16 0 .32-.061.442-.182l6.875-6.834c.244-.243.244-.636 0-.879z" transform="translate(-829 -533) translate(496 129) translate(43 359) translate(1 25)"/>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
    )    
}
export default NewNavbar
