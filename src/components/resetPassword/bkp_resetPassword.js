import React, { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { ENDPOINTURL } from '../common/endpoints';
import Axios from 'axios';

function ResetPassword({location,history}) {    
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
                        message: "Enter new password"
                    })
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "New password and confirm password are not same"
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
                                history.push('/')
                            }, [1000])
                        } 
                    } catch (error) {
                        setComponentStatus({
                            status: "error",
                            message: data.data
                        })               
                    }            
                }else{
                    setComponentStatus({
                        status: "error",
                        message: "Password and confirm password do not match."
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

    return (
        <>
            <div className='pass-model-wrapper'>
                <div className="pass-model-content">
                    <div className='text-center'>
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
                    </div>
                    <div className="form_box">
                        <div className="input_box">
                            <label>비밀번호</label>
                            <input type="password" value={password} placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="input_box">
                            <label>비밀번호 확인</label>
                            <input type="password" value={confirmPassword} placeholder="확인 암호를 입력합니다" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <div className="input_box">
                            <div className="submit_btn">
                                <input type="submit" value="제출" onClick={submitHandler}/>
                                <Link to='/' className="blue_btn ml-3">뒤</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

export default ResetPassword;