import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../images/logo.png";
import login_logo from "../../images/login_logo.svg";
import select_arrow from "../../images/select_arrow.svg";
// import message_icon from '../../images/message_icon.svg';
import Userprofile from "../../images/Userprofile.png";
import DropdownComponent from "./dropdown";
import Axios from 'axios';
import { ENDPOINTURL } from './endpoints';

function Navbar(props) {
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

  const [dropdownHandler, setDropdownHandler] = useState(false);  
  const [profileList, setProfileList] = useState([])
  const [response, setResponse] = useState("");
  const [profileImg, setProfileImg] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("auth_token");
  let user_name = localStorage.getItem("user_name")
  let user_role = localStorage.getItem("user_role")
  var formData = new FormData();

  const getprofile = async () => {
    try {
      let userId = localStorage.getItem('user_id');
      const data = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=0&source=Profile&userId=${userId}`,
        {}, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })      
      setProfileList(data.data)
      let latestProfilePicture = data.data;
      latestProfilePicture = latestProfilePicture[latestProfilePicture.length - 1];
      latestProfilePicture = latestProfilePicture.url;
      localStorage.setItem("user_profile_image",latestProfilePicture);      
      setProfileImg(latestProfilePicture)
    } catch (error) {
      console.log(error.message)
    }
  }

  const getsaveuserprofileHandler = async (e) => {
    setResponse("Uploading profilePicture...")
    let userId = localStorage.getItem('user_id');
    try {
      const data = await Axios.post
        (`${ENDPOINTURL}/alimeet/document/addDocument?meetingId=0&source=Profile&userId=${userId}`,
          formData, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })     
      if (data.data === "Document Added Successfully!") {
        setResponse(data.data);
        getprofile();
      }  
    } catch (error) {
      setResponse(error.message)
    }
  }

  const uploadHandler = (e) => {      
    formData = new FormData();
    formData.append('files', e.target.files[0])
    getsaveuserprofileHandler();
  }

  useEffect(() => {
    setTimeout(() => {
      getprofile();
    }, [500])
  }, [])

  useEffect(() => {  
    if(props.updateNavProfile || props.updateNavProfile === false){
      setTimeout(() => {
        console.log('changing profile...')
        getprofile();
      }, [500])
    }
  }, [props.updateNavProfile])

  function onLoad() {
    setTimeout(() => setIsLoading(false), 500);
  }


  return (
    <header className="header" style={props.style}>
      <div className="wrapper">
        <div className="header_inr">
          <div className="header_logo">
            <Link to="/user/meeting/meetinglist">
              <img src={login_logo} alt="" />
            </Link>
          </div>
          <div className="header_menu">
            <ul>
              <li><Link to="/user/meeting/meetinglist">강의 목록</Link></li>
              {user_role === 'Admin' &&
                (
                  <li><Link to="/Adminpanelmain">집</Link></li>
                )
              }
            </ul>
          </div>
          <div className="header_right">           
            <div className="header_profile">
              <div className="header_profile_pic">
              <img src={Userprofile} style={{ display: isLoading ? "block" : "none" }}/>
               <img src={profileImg} style={{  display: isLoading ?  "none" : "block", borderRadius: '50%', width: '70px',height: '70px', maxWidth: 'unset', position: 'relative' ,right: '20px' }} onLoad={onLoad} alt="" />
                <input type="file" name="img" style={{
                  position: 'absolute',
                  left: '992px',
                  top: '21px',
                  bottom: '459px',
                  width: '1%',
                  height: '3%',
                  opacity: '',  
                  border: '1px solid red'
                }} className="profile_uploder_img" accept="image/*" onChange={(e) => { e.preventDefault(); uploadHandler() }} />
              </div>
              <div className="header_profile_name">
                <p>{user_name}</p>
                <small>{user_role}</small>
              </div>
              <div className="header_profile_link" style={{ position: "relative" }}>
                <a onClick={(e) => { e.preventDefault(); setDropdownHandler(!dropdownHandler) }}>
                  <img src={select_arrow} alt="" />
                </a>
                {
                  dropdownHandler && (
                    <DropdownComponent items={dropdown_items} />
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )

}
export default Navbar;