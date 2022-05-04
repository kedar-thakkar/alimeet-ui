import React, { useState ,useEffect} from 'react';
import '../../css/new-style.css';
import LoginLogo from '../../images/login_logo.svg';
import LoginPage from '../../images/login.png';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { ENDPOINTURL } from '../common/endpoints';
import Axios from 'axios';

function ResetPassword({location,history,props}) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')   
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [componentStatus, setComponentStatus] = useState("");

    const submitHandler = async () => {
        setComponentStatus({
            status: "processing",
            message: "Processing..."
        }) 
        try {
            if(!password || !confirmPassword){
                if(!password){
                    setComponentStatus({
                        status: "error",
                        message: "새로운 암호를 입력하세요"
                    })
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "새 암호에 대해 및 암호 확인"
                    })
                }            
            }else{
                if(password === confirmPassword){
                    try {
                        const data = await Axios.get(`${ENDPOINTURL}/alimeet/register/resetPassword?email=${email}&password=${password}&oldPassword=${token}`)               
                        if(data === "Wrong Password !"){
                            setComponentStatus({
                                status: "error",
                                message: data.data
                            })
                        }else{
                            setComponentStatus({
                                status: "OK",
                                message: data.data
                            }) 
                            setTimeout(() => {
                                // history.push('/')
                            }, [1000])
                        } 
                    } catch (error) {
                        setComponentStatus({
                            status: "error",
                            message: "문제가 발생했습니다."
                        })               
                    }            
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "비밀번호 및 비밀번호 확인이 일치하지 않습니다."
                    })            
                }      
            }
        } catch (error) {
            
        } 
    }

    useEffect(() => { 
        try {
            const { email, token } = queryString.parse(location.search);       
            if (!email || !token) {
                history.push('/')
            } else {
                setEmail(email);
                setToken(token);          
            }
        } catch (error) {
            props.history.push("/error")
        }     
    }, []) 
    return(

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
                        <h2>암호를 재설정</h2>
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
                            <label>비밀번호</label>
                            <input type="password" value={password} placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />                                                       
                        </div>
                        <div className="client_login_content_form_box">
                            <label>비밀번호 확인</label>
                            <input type="password" value={confirmPassword} placeholder="확인 암호를 입력합니다" onChange={(e) => setConfirmPassword(e.target.value)} />                                                     
                        </div>                  
                        <div className="submit_btn_box">                          
                            <input type="submit"  className="cl_save_btn" value="제출" onClick={submitHandler}/>
                            <Link to='/' className="cl_save_btn">뒤</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default ResetPassword;

