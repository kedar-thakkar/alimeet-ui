import React, { useEffect, useState } from 'react';
import Userprofile from "../../images/Userprofile.png";
import Profile_Camera from "../../images/Profile_Camera.svg";
// import "../meeting/Wany/css/style.css";
import Navbar from '../common/navbar';
import CheckLoginStatus from '../common/loginStatus';
import queryString from "query-string"
import Axios from 'axios';
import edit_pofile_bg from "../../images/edit_pofile_bg.jpg";
import profile_edit_img from "../../images/pofile_edit_img.png";
import white_logo from "../../images/white_logo.svg";
import { ENDPOINTURL } from '../common/endpoints';

function EditProfile(props) {

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [id, setId] = useState('')
  const [response, setResponse] = useState("");
  const [profileImg, setProfileImg] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const [updateNavProfile, setUpdateNavProfile] = useState(true);

  const token = localStorage.getItem("auth_token");
  var formData = new FormData();

  let { editprofile } = queryString.parse(window.location.search);

  const submitHandler = async () => {


    try {

      const token = localStorage.getItem("auth_token");

      const data = await Axios.post(`${ENDPOINTURL}/alimeet/user/editUser?userId=${id}&userName=${name}&role=${role}&password=${password}`, {}, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      console.log(data);

      if (data.data === "success") {

        let local_email = localStorage.getItem('user_email');
        if (local_email === email) {
          props.history.push('/user/meeting/meetinglist')
        } else {
          props.history.push('/Adminpanelmain')
        }
      }

    } catch (error) {

    }
  }


  // Get Profile Picture Code

  const getprofile = async () => {

    try {

      const data = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=0&source=Profile&userId=${id}`,
        {}, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      let latestProfilePicture = data.data;
      latestProfilePicture = latestProfilePicture[latestProfilePicture.length - 1];
      latestProfilePicture = latestProfilePicture.url;
      // console.log(latestProfilePicture)
      setProfileImg(latestProfilePicture)    

    } catch (error) {
      console.log(error.message)
    }
  }

  // Save Profile Picture code
  const getsaveuserprofileHandler = async (e) => {

    setResponse("Uploading profilePicture...")
    try {
      const data = await Axios.post
        (`${ENDPOINTURL}/alimeet/document/addDocument?meetingId=0&source=Profile&userId=${id}`,
          formData, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      console.log('My data -------------------', data)



      if (data.data === "Document Added Successfully!") {
        setResponse("Profile Picture Uploaded...");
        getprofile();
        setUpdateNavProfile(!updateNavProfile)
      }

    } catch (error) {
      setResponse(error.message)
    }
  }

  // Upload Profile Picture Code...
  const uploadHandler = (e) => {

    console.log('e.target.files[0] --------------> ', e.target.files[0]);

    formData = new FormData();
    formData.append('files', e.target.files[0])
    getsaveuserprofileHandler();

    // console.log(formData)
  }


  // Edit User Profile API's 

  // Getting User Details.

  const getUserDetails = async (email) => {
    const token = localStorage.getItem("auth_token");

    try {
      const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/meeting/getUserByEmail/${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (data) {
        setName(data.userName);
        setPassword(data.password);
        setEmail(data.email)
        setRole(data.role);
        setId(data.id) 
      }

    } catch (error) {
      throw error
    }

  }


  useEffect(() => {

    const login_status = CheckLoginStatus();
    if (login_status === false) {
      props.history.push("/")
    }
    let { editprofile } = queryString.parse(window.location.search);


    if (editprofile === "true") {

      let localUserRole = localStorage.getItem('user_role');
      if (localUserRole === "Admin") {
        let { email } = queryString.parse(window.location.search);
        getUserDetails(email);
      } else {
        props.history.push("/");
      }


    } else {
      let email = localStorage.getItem('user_email');
      getUserDetails(email)
    }

  }, [])

  useEffect(() => {
    if (id) {
      getprofile()
    }
  }, [id])

  useEffect(() => {
    if (!editprofile) {
      let email = localStorage.getItem('user_email');
      getUserDetails(email)
    }
  }, [editprofile])

  function onLoad() {
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <>

      <Navbar updateNavProfile={updateNavProfile}/>

      <div class="login_section login_add_info edit_profile_section">
        <div class="login_bg_img">
          <img src={edit_pofile_bg} alt="" />
        </div>
        <div class="edit_profile_box_inr">
          <div class="login_otr">
            <div class="logo">
              <a href="#."><img src={white_logo} alt="" /></a>
            </div>
            <div class="login_box">
              <div class="title title_center">
                <h2>프로필 수정</h2>
                <small>{response}</small>
              </div>
              <div class="edit_pofile_box">
                <div class="edit_pofile_box_img">
                   <img src={Userprofile} style={{ display: isLoading ? "block" : "none" }}/>
                    <img src={profileImg}  style={{ display: isLoading ?  "none" : "block"  }} onLoad={onLoad} alt="" />
                  <input type="file" name="img" style={{
                    position: 'absolute',
                    left: '446px',
                    top: '183px',
                    bottom: '459px',
                    width: '17%',
                    height: '13%',
                    opacity: '0',
                    /* outline: 0; */
                    border: '1px solid red'
                  }} classname="profile_uploder_img" accept="image/*" onChange={uploadHandler} />
                  <div className="profile_camera_image_icon">
                    <img src={Profile_Camera} alt="" />
                  </div>
                </div>
                <h4>사진 등록</h4>
              </div>
              <div class="form_box">
                <div class="input_box input_col_2">
                  <label>이름</label>
                  <input type="text" value={name} placeholder="이름을 입력하시오" onChange={(e) => setName(e.target.value)} />
                </div>
                <div class="input_box input_col_2 disabled_input_box">
                  <label>아이디(이메일)</label>
                  <input type="text" value={email} placeholder="이메일 입력" disabled />
                </div>
                <div class="input_box input_col_2">
                  <label>비밀번호</label>
                  <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>                 
                {
                    (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Student") && (   
                    <div class="input_box input_col_2">
                    <label>Select Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} disabled>
                      <option value="Select Your Role">Select Your Role</option>
                      <option value={role} >현재: {role === "Teacher" ? "선생님" : "수강생"}</option>
                      <option value="Teacher">선생님</option>
                      <option value="Student">수강생</option>
                    </select>
                  </div>  
                  )
                } 
                {
                localStorage.getItem('user_role') === "Admin" && (
                  <div class="input_box input_col_2">
                    <label>Select Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} >
                      <option value="Select Your Role">Select Your Role</option>
                      <option value={role} >현재: {role === "Teacher" ? "선생님" : "수강생"}</option>
                      <option value="Teacher">선생님</option>
                      <option value="Student">수강생</option>
                    </select>
                  </div>
                )
                }
                <div class="input_box">
                  <div class="submit_btn small_submit_btn">
                    <input type="submit" value="프로필 저장" onClick={submitHandler} />
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

export default EditProfile;