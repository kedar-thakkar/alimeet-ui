import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import Logo from '../images/login_logo.svg';
import Axios from 'axios';


function VerifyNewAccount(props) {

    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState({
        value: 'Please wait, verifying your account.',
        color: 'text-warning'
    });

    //For Making Changes During User Action EntirePage
    useEffect(() => {
        try {
            const { email, token } = queryString.parse(window.location.search);
            if (!email || !token) {
                props.history.push("/")
            } else {
                setEmail(email);
                setToken(token);
            }
            
            if(token && email){
                verifyUsersAccount()
            }else{
                props.history.push("/error")
            }
        } catch (error) {
            props.history.push("/error")
        }
        
    },[token, email])

    //For Verifing User Account 
    const verifyUsersAccount = async () => {
        try{
            const data = await Axios.get(`https://devmeet.alibiz.net:8443/alimeet/register/verifyUser?email=${email}&password=${token}`);
            if(data.data === true){
                setMessage({
                    value: "Account Verified Successfully.",
                    color: "text-success"
                });

                setTimeout(() => {
                    props.history.push("/")
                }, [1000])

            }else{
                setMessage({
                    value: "Account Verification Failed.",
                    color: "text-danger"
                }) 
            }
        } catch(error){
            props.history.push("/error")
        }
    }

    return (
        <>
            <div className="verify-account-wrapper">
                {
                    email && (
                        <div>
                            <img src={Logo} className="mb-3"/>
                            <h4 className="mt-2">Hie {email}, </h4>
                            <p className={`mt-4 f-16 ${message.color}`}>{message.value}</p>
                        </div>
                    )
                }
            </div>
        </>
    )

}

export default VerifyNewAccount;