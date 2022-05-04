import React, { useEffect, useState } from 'react';
import NewNavbar from '../common/newNavbar';
import '../../css/new-style.css';
import userprofile from '../../images/Userprofile.png';
import CheckLoginStatus from '../common/loginStatus';
import queryString from "query-string"
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import { Link } from 'react-router-dom';
import $ from 'jquery';

let user_role = localStorage.getItem("user_role");

function EditProfile(props) {

    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [id, setId] = useState('')
    const [componentStatus, setComponentStatus] = useState("");
    const [profileImg, setProfileImg] = useState('');    
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");
    var formData = new FormData();
    let { editprofile } = queryString.parse(window.location.search);
    
    //Manage user profile Details
    const submitHandler = async () => {
        try {
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            });

            const editUserResponse = await Axios.post(`${ENDPOINTURL}/alimeet/user/editUserAPI?userId=${id}&userName=${name}&role=${role}&password=${password}`, {}, {
                headers: {
                "Authorization": `Bearer ${token}`
                }
            });

            if (editUserResponse.data.Status === "200"){
                setComponentStatus({
                    status: "OK",
                    message: editUserResponse.data.message
                });

                if(user_role == "Admin"){
                    props.history.push('/Adminpanelmain')
                }else{
                    props.history.goBack();
                }
            }else{
                setComponentStatus({
                    status: "error",
                    message: editUserResponse.data.message
                });
            }
        } catch (error) {
            props.history.push("/error")
        }
    }

    // Getting User Details.
    const getUserDetails = async (email) => {
        const token = localStorage.getItem("auth_token");
        try {
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })
            const userProfileResponse = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
                headers: {
                "Authorization": `Bearer ${token}`
                }
            });

            if(userProfileResponse.data.Status == "200"){
                setComponentStatus({
                    status: "",
                    message: ""
                });

                setName(userProfileResponse.data.data.userName);
                setPassword(userProfileResponse.data.data.password);
                setEmail(userProfileResponse.data.data.email)
                setRole(userProfileResponse.data.data.role);
                setId(userProfileResponse.data.data.id);

                //update user profile from loaclstorage       
                setProfileImg(localStorage.getItem("user_profile_image"))
            }else{
                setComponentStatus({
                    status: "error",
                    message: userProfileResponse.data.message
                })
            }
        } catch (error) {
            props.history.push("/error")
        }
    }

    // Save Profile Picture code
    const getsaveuserprofileHandler = async (e) => {
        try {
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })
            const updateProfileResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/addAllDocuments?meetingId=0&source=Profile&userId=${id}`,
            formData, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (updateProfileResponse.data.Status == "200") {
                setComponentStatus({
                    status: "OK",
                    message: updateProfileResponse.data.message
                });

                localStorage.setItem("user_profile_image",updateProfileResponse.data.data[0].url);
                setProfileImg(updateProfileResponse.data.data[0].url);
            }else{
                setComponentStatus({
                    status: "error",
                    message: updateProfileResponse.data.message
                })
            }
        } catch (error) {
            props.history.push("/error")
        }
    }

    // Upload Profile Picture Code...
    const uploadHandler = (e) => {       
        formData = new FormData();
        formData.append('files', e.target.files[0])        
        getsaveuserprofileHandler();
    }

    useEffect(() => {
        //update user profile from loaclstorage       
        setProfileImg(localStorage.getItem("user_profile_image"))        

        //ValidateUser is loggedIn 
        const login_status = CheckLoginStatus();
        if (login_status === false) {
          props.history.push("/")
        }

        //Get User Details to display EditProfile page  
        let { editprofile } = queryString.parse(window.location.search);    
        if (editprofile === "true") {
            let localUserRole = localStorage.getItem('user_role');
            if (localUserRole === "Admin") {
                let { email } = queryString.parse(window.location.search);
                getUserDetails(email);
            }else{
                props.history.push("/");
            }
        } else {
            let email = localStorage.getItem('user_email');
            getUserDetails(email)
        }
    }, [editprofile]);

    return(
        <>
        <div className="classroom_list">
        <NewNavbar/> 
            <div className="cl_meeting_content">
                <div className="wrapper">
                    <div className="cl_meeting_title pofile_main_box">                       
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
                            <h2>Profile</h2>
                        }
                        <div className="pofile_inr_page_box">
                            <div className="cl_list_pofile_img">
                                <img src={profileImg ? profileImg : userprofile} alt="" />
                                <input type="file" name="img" className="profile_uploder_img" accept="image/*" onChange={uploadHandler} />

                                <span className="cl_list_pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="34px" height="34px" viewBox="0 0 34 34" version="1.1">
                                        <title>Icon/Profile_Camera</title>
                                        <desc>Created with Sketch.</desc>
                                        <g id="Ali-Meets" stroke="none" fill="none">
                                            <g id="Edit-Profile" transform="translate(-419.000000, -335.000000)">
                                                <g id="Group-32" transform="translate(325.000000, 190.000000)">
                                                    <g id="Profile" transform="translate(35.000000, 103.000000)">
                                                        <g id="Icon-/-Profile_Camera" transform="translate(59.000000, 42.000000)">
                                                            <g>
                                                                <circle id="Oval-11" fill="#5EBBB6" cx="17" cy="17" r="17"/>
                                                                <g id="Group" transform="translate(6.375000, 8.500000)" stroke="#FFFFFF">
                                                                    <path d="M12.5428932,0.5 L8.70710678,0.5 L5.87377345,3.33333333 L2,3.33333333 C1.17157288,3.33333333 0.5,4.00490621 0.5,4.83333333 L0.5,15 C0.5,15.8284271 1.17157288,16.5 2,16.5 L19.25,16.5 C20.0784271,16.5 20.75,15.8284271 20.75,15 L20.75,4.83333333 C20.75,4.00490621 20.0784271,3.33333333 19.25,3.33333333 L15.3762266,3.33333333 L12.5428932,0.5 Z" id="Rectangle-34"/>
                                                                    <circle id="Oval-12" cx="10.625" cy="9.20833333" r="3.04166667"/>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                </span>
                            </div>
                            <span>{name} : <small>{role}</small></span>
                        </div>
                        <div className="pofile_upload_details">
                            <div className="client_login_content_form_box client_login_content_form_box_col_6">
                                <label>이름</label>
                                <input type="text" value={name} placeholder="이름을 입력하시오" onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="client_login_content_form_box client_login_content_form_box_col_6">
                                <label>아이디(이메일)</label>
                                <input type="text" value={email} placeholder="이메일 입력" disabled />
                            </div>
                            <div className="client_login_content_form_box client_login_content_form_box_col_6">
                                <label>비밀번호</label>
                                <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            {
                                (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Student") && (   
                                <div className="client_login_content_form_box client_login_content_form_box_col_6">
                                    <label>Select Role</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} disabled>
                                        <option value="Select Your Role">Select Your Role</option>
                                        <option value={role} >현재: {role === "Teacher" ? "선생님" : "수강생"}</option>                                
                                    </select>
                                </div>  
                                )
                            } 
                            {
                            localStorage.getItem('user_role') === "Admin" && (
                                <div className="client_login_content_form_box client_login_content_form_box_col_6">
                                    <label>Select Role</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} >
                                        <option value="Select Your Role">Select Your Role</option>
                                        <option value="Student">수강생</option>
                                        <option value="Teacher">선생님</option>
                                    </select>
                                </div>
                                )
                            }
                            <div className="submit_btn_box">
                                <input type="submit" className="cl_save_btn" id="ClientButton" value="프로필 저장" onClick={submitHandler} />
                                {/* <Link to='/user/meeting/meetinglist' className="cl_save_btn">뒤</Link> */}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}

export default EditProfile