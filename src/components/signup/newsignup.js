// React System Libraries
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';

// Customised Libraries or components
import '../../css/new-style.css';
import { ENDPOINTURL } from '../common/endpoints';
import LoginLogo from '../../images/login_logo.svg';
import LoginPage from '../../images/login.png';
import { ValidateEmail, ValidatePassword, ValidateRole, ValidateUsername } from '../validation';
import PrivacyPolicy from './privacyPolicy';

function NewSignup(props) {
    //State Variables
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [conpassword, setConpassword] = useState('');
    const [role, setRole] = useState('Student');
    const [nameErr, setNameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [confirmpasswordErr, setConfirmpasswordErr] = useState('');
    const [roleErr, setRoleErr] = useState('');
    const [policy, setPolicy] = useState(true);
    const [componentStatus, setComponentStatus] = useState("");
    
    // Set User Role to local storage
    useEffect(() => {
        if (localStorage.getItem('user_role') === 'Admin') {
          setRole('Admin');
        }
    }, [])

    // When sending request for signup New user
    const submitHandler = async () => {
        const emailRes = ValidateEmail(email);
        const usernameRes = ValidateUsername(username);
        const passwordRes = ValidatePassword(password);
        const confirmpasswordRes = ValidatePassword(password);    
        const roleRes = ValidateRole(role);

        if (emailRes.status && usernameRes.status && passwordRes.status && confirmpasswordRes.status && roleRes.status) {
            setNameErr("");
            setEmailErr("");
            setPasswordErr("");
            setConfirmpasswordErr("");
            setRoleErr("");

            setComponentStatus({
                status: "processing",
                message: "Processing..."
            }); 
            try {
                let registerAction = 'add';
                if(localStorage.getItem('user_role') == 'Admin'){
                    registerAction = 'addByAdmin';
                }

                const signupResponse = await Axios.post(`${ENDPOINTURL}/alimeet/register/registerUser?action=${registerAction}`, {
                    userName: username,
                    role: role,
                    email: email,
                    password: password,
                    conpassword: conpassword
                });

                if (signupResponse.data.Status === "200") {
                    setComponentStatus({
                        status: "OK",
                        message: signupResponse.data.message
                    });

                    if(localStorage.getItem('user_role') == 'Admin'){
                        setTimeout(async () => {
                            props.history.push(`./adminpanelmain`)
                        }, [1000]);
                    } else {
                        setTimeout(async () => {
                            props.history.push(`/mailsend?email=${email}`)
                        }, [1000]);
                    }
                   
                } else {
                    setComponentStatus({
                        status: "error",
                        message: signupResponse.data.message
                    });
                }
            } catch (error) {
                setComponentStatus({
                    status: "error",
                    message: "문제가 발생했습니다."
                });
            }
        } else {
            setNameErr(usernameRes.error);
            setEmailErr(emailRes.error);
            setPasswordErr(passwordRes.error); 
            setConfirmpasswordErr(confirmpasswordRes.error)     
            setRoleErr(roleRes.error);
        }
    }

    //For Handling Error on fields
    const handleChange=(e)=>{
        e.preventDefault();
        switch (e.target.name) {
            case 'username':
                if(e.target.value.length !== 0){
                    setNameErr('');
                    setUsername(e.target.value);
                }
              break;
            case 'email':
                if(e.target.value.length !== 0){
                    setEmailErr('');
                    setEmail(e.target.value);
                }
              break;
            case 'password':                     
                if(e.target.value.length !== 0){
                    setPasswordErr('');
                    setPassword(e.target.value);
                }
              break;
            case 'confirmpassword':                     
                if(e.target.value.length !== 0){
                    setConfirmpasswordErr('');
                    setConpassword(e.target.value);
                }
              break;
            case 'role':                     
                if(e.target.value.length !== 0){
                    setRoleErr('');
                    setRole(e.target.value);
                }
              break;
            default:
            break;
        }
    }

    return( 
        policy && policy === true ? (
            <PrivacyPolicy setPolicy={setPolicy} history={props.history} />
          ) : (      
        <div className="client_login_main client_select_main ">
        <div className="client_login">
            <div className="client_login_left">
                <div className="client_login_right_img">
                    <img src={LoginPage} alt=""/>
                </div> 
            </div>
            <div className="client_login_right">
                <div className="client_login_header">
                    <div className="client_login_logo">
                        <img src={LoginLogo} alt=""/>
                    </div>
                </div>
                <div className="client_login_content">
                    <div className="client_content_login_box">
                        <h2>회원가입</h2>
                        {
                            componentStatus && componentStatus.status === "OK" &&
                            <p className="text-success">{componentStatus.message}</p>
                        }
                        {
                             componentStatus && componentStatus.status === "error" &&
                            <p className="text-danger">{componentStatus.message}</p>
                        } 
                        {
                             componentStatus && componentStatus.status === "processing" &&
                             <p className="text-warning">{componentStatus.message}</p>
                        }
                        <div className="client_login_content_form_box">
                            <label>이름</label>
                            <input type="text" name="username" placeholder="이름 입력" onChange={(e) => handleChange(e)} />
                            <small className="error">{nameErr}</small>                           
                        </div>
                        <div className="client_login_content_form_box">
                            <label>아이디(이메일)</label>
                            <input type="text" name="email" placeholder="이메일 입력" onChange={(e) => handleChange(e)} />
                            <small className="error">{emailErr}</small>                            
                        </div>
                        <div className="client_login_content_form_box">
                            <label>비밀번호</label>
                            <input type="password" name="password" placeholder="암호 입력" onChange={(e) => handleChange(e)} />
                            <small className="error">{passwordErr}</small>
                        </div>
                        <div className="client_login_content_form_box">
                            <label>비밀번호 확인</label>
                            <input type="password" name="confirmpassword" placeholder="확인 암호를 입력합니다" onChange={(e) => handleChange(e)} />
                            <small className="error">{confirmpasswordErr}</small>                            
                        </div>
                        {
                            localStorage.getItem('user_role') == 'Admin' && (
                                <div className="client_login_content_form_box">
                                    <label>권한선택</label>
                                    <select name="role" onChange={(e) => handleChange(e)}>
                                    <option value="">역할 선택</option>
                                    <option value="Admin">관리자</option> 
                                    <option value="Teacher">강사</option>
                                    <option value="Student">수강생</option>
                                    </select>
                                    <small className="error">{roleErr}</small>
                                </div>
                            )
                        }
                        {
                            localStorage.getItem('user_role') !== 'Admin' && (
                                <div className="client_login_content_form_box">
                                    <label>권한선택</label>
                                    <select name="role" onChange={(e) => handleChange(e)}>
                                    <option defaultValue value="Student">수강생</option>
                                    </select>
                                    <small className="error">{roleErr}</small>
                                </div>
                            )
                        }
                        <div className="client_login_content_form_box">
                            <input type="submit" value="가입하기" id="ClientButton" onClick={() => {
                                if (password === conpassword) {
                                submitHandler();
                                } else {
                                setPasswordErr("비밀번호가 일치하지 않습니다")
                                }
                            }}/>
                            <small>이미 회원이신가요?<Link to="/">여기</Link>로그인하려면</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
)
}
export default NewSignup
