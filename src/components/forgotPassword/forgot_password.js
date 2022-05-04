import React, { useState } from 'react';
import { ENDPOINTURL } from '../common/endpoints';
import { ValidateEmail } from '../validation';
import Axios from 'axios';

function ForgotPassword(props) {

    const [email, setEmail] = useState('')    
    const [forgotStatus, setForgotStatus] = useState("");

    // When sending request for ForgotPassword
    const submitHandler = async() => {
        const emailValidate = ValidateEmail(email);       
        setForgotStatus({
            status: "processing",
            message: "Processing..."
        })   
        try {
            if(!email){
                setForgotStatus({
                    status: "error",
                    message: "Enter email address"
                })            
            }else{
                if(emailValidate.status){
                    try {
                        const data = await Axios.get(`${ENDPOINTURL}/alimeet/register/forgetPassword?email=${email}`)
                        if(data){
                            if(data.data === "registrationConfirmation"){
                                setForgotStatus({
                                    status: "OK",
                                    message: "Check your email to reset password."
                                })                            
                            }else{
                                setForgotStatus({
                                    status: "error",
                                    message: data.data
                                })                            
                            }
                        }else{
                            setForgotStatus({
                                status: "error",
                                message: data.data
                            })
                        }               
                    }              
                    catch (error){
                        setForgotStatus({
                            status: "error",
                            message: "뭔가 잘못 됐어"
                        })
                    }
                }else{
                    setForgotStatus({
                        status: "error",
                        message: emailValidate.error
                    })                
                }          
            }
        } catch (error) {
            props.history.push("/error")
        } 
    }

    return (
        <>
            <div className='pass-model-wrapper'>
                <div className="pass-model-content">
                    <div className='text-center'>                        
                        <h2>비밀 번호 찾기 클릭</h2>
                        {
                            forgotStatus && forgotStatus.status === "OK" &&
                            <p className="text-success">{forgotStatus.message}</p>
                        }
                        {
                             forgotStatus && forgotStatus.status === "error" &&
                            <p className="text-danger">{forgotStatus.message}</p>
                        } 
                        {
                             forgotStatus && forgotStatus.status === "processing" &&
                             <p className="text-success">{forgotStatus.message}</p>
                        }                      
                    </div>
                    <div className="form_box">
                        <div className="input_box">
                            <label>아이디(이메일)</label>
                            <input type="email" value={email} placeholder="아이디(이메일)" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="input_box">
                            <div className="submit_btn">
                                <input type="submit" value="Submit" onClick={submitHandler}/>
                                <button className="blue_btn ml-3" onClick={(e) => props.setPassModel(false)}>Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

export default ForgotPassword;