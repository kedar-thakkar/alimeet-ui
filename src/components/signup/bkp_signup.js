import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import login_logo from "../../images/login_logo.svg";
import { ValidateEmail, ValidatePassword, ValidateRole, ValidateUsername } from '../validation';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import PrivacyPolicy from './privacyPolicy';

function SignUp(props) {
  //State Variables
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [conpassword, setConpassword] = useState('');
  const [role, setRole] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirmpasswordErr, setConfirmpasswordErr] = useState('');
  const [roleErr, setRoleErr] = useState('');
  const [policy, setPolicy] = useState(true);
  const [signupStatus, setSignUpStatus] = useState("Account Created Successfully!!!");
  const [componentStatus, setComponentStatus] = useState("");
 
  useEffect(() => {
    if (localStorage.getItem('user_role') === 'Admin') {
      setRole('Admin');
    }
  }, [])

  // When sending request for signup New user
  const submitHandler = async () => {    
    setSignUpStatus({
      status: "processing",
      message: "Processing..."
    })
    
    const emailRes = ValidateEmail(email);
    const usernameRes = ValidateUsername(username);
    const passwordRes = ValidatePassword(password);
    const confirmpasswordRes = ValidatePassword(password);    
    const roleRes = ValidateRole(role);

    if (emailRes.status && usernameRes.status && passwordRes.status && confirmpasswordRes.status && roleRes.status) {
      setNameErr("")
      setEmailErr("")
      setPasswordErr("")
      setConfirmpasswordErr("")
      setRoleErr("")
      setComponentStatus({
        status: "processing",
        message: "Processing..."
      }) 
      try {
        const { data } = await Axios.post(` ${ENDPOINTURL}/alimeet/register/registerUser?action=add`, {
          userName: username,
          role: role,
          email: email,
          password: password,
          conpassword: conpassword,
        })

        if (data === "registrationConfirmation") {
          setSignUpStatus({
            status: "OK",
            message: "Account Created Successfully !!!"
          })
          setTimeout(async () => {
            // redirecting to login page.
            props.history.push("/")
          }, [2000])

        } else {
          setSignUpStatus({
            status: "error",
            message: "Email Already Exists !"
          })
        }
      } catch (error) {
        setComponentStatus({
          status: "error",
          message: data.data
        }) 
      }
    } else {    
      setNameErr(usernameRes.error);
      setEmailErr(emailRes.error);
      setPasswordErr(passwordRes.error); 
      setConfirmpasswordErr(confirmpasswordRes.error)     
      setRoleErr(roleRes.error);
    }
  }

  return (
    policy && policy === true ? (
      <PrivacyPolicy setPolicy={setPolicy} history={props.history} />
    ) : (
      <div className="login_section sign_up_section">
        <div className="login_otr">
          <div className="logo">
            <a href="#."><img src={login_logo} alt="" /></a>
          </div>
          <div className="login_box">
            <div className="title">
              <h2>회원가입</h2>
              <div className="text-center mt-2">
                {
                  signupStatus && signupStatus.status === "OK" &&
                  <p className="text-success">{signupStatus.message}</p>
                }
                {
                  signupStatus && signupStatus.status === "error" &&
                  <p className="text-danger">{signupStatus.message}</p>
                }
              </div>
            </div>
            <div className="form_box">
              <div className="input_box input_col_2">
                <label>이름</label>
                <input type="text" placeholder="이름 입력" onChange={(e) => setUsername(e.target.value)} />
                <small className="error">{nameErr}</small>
              </div>
              <div className="input_box input_col_2">
                <label>아이디(이메일)</label>
                <input type="text" placeholder="이메일 입력" onChange={(e) => setEmail(e.target.value)} />
                <small className="error">{emailErr}</small>
              </div>
              <div className="input_box input_col_2">
                <label>비밀번호</label>
                <input type="password" placeholder="암호 입력" onChange={(e) => setPassword(e.target.value)} />
                <small className="error">{passwordErr}</small>
              </div>
              <div className="input_box input_col_2">
                <label>비밀번호 확인</label>
                <input type="password" placeholder="확인 암호를 입력합니다" onChange={(e) => setConpassword(e.target.value)} />
                <small className="error">{confirmpasswordErr}</small>
              </div>
              {
                localStorage.getItem('user_role') == 'Admin' && (
                  <div className="input_box input_col_2">
                    <label>권한선택</label>
                    <select onChange={(e) => setRole(e.target.value)}>
                      <option value="">역할 선택</option>
                      <option value="Teacher">강사</option>
                      <option value="Student">수강생</option>
                    </select>
                    <small className="error">{roleErr}</small>
                  </div>
                )
              }
              {
                localStorage.getItem('user_role') !== 'Admin' && (
                  <div className="input_box input_col_2">
                    <label>권한선택</label>
                    <select onChange={(e) => setRole(e.target.value)}>
                      <option value="">역할 선택</option>
                      <option value="Student">수강생</option>
                    </select>
                    <small className="error">{roleErr}</small>
                  </div>
                )
              }
              <div className="input_box">
                <div className="submit_btn">
                  <input type="submit" value="회원가입 하기" onClick={() => {
                    if (password === conpassword) {
                      submitHandler();
                    } else {
                      setPasswordErr("Password Donot Match")
                    }
                  }} />
                </div>
              </div>
            </div>
          </div>
          <div className="bottom_sub_text">
            <p>이미 사용자? 클릭 <Link to="/">여기</Link>로그인하려면</p>
          </div>
        </div>
      </div >
    )
  )
}

export default SignUp;
