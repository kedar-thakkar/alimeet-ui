import React, { useEffect } from 'react';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import CheckLoginStatus from '../common/loginStatus';
const queryString = require('query-string');

function Jitsi({ location, history }) {


  const { roomname } = queryString.parse(location.search);
  console.log(roomname);


  useEffect(() => {

    const login_status = CheckLoginStatus();
    if (login_status === false) {
      history.push("/")
    }

  }, [])

  useEffect(() => {

    const domain = "meets.alibiz.net";
    const options = {
      roomName: roomname,
      width: 1000,
      height: 550,
      parentNode: document.querySelector('#meet'),
      configOverwrite: {},
      interfaceConfigOverwrite: {}
    }
    const api = new window.JitsiMeetExternalAPI(domain, options);
    api.getParticipantsInfo();

  }, [])

  return (
    <div className="text-center">
      <div id="meet"></div>

      <div className="submit_btn mt-5">

        <Link to="/user/profile/editprofile">
          <input type="submit" value="Edit Profile" />
        </Link>
      </div>

    </div>
  )
}

export default Jitsi;