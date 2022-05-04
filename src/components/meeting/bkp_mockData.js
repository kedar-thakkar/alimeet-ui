import React, { useEffect, useState } from 'react';
import { ENDPOINTURL } from '../common/endpoints';
import Axios from 'axios'

function GetStudentEmails(props){
	const getEmailSuggestion = async (entered_email) => {
		alert(2);
	    if (entered_email.length === 0) {
	        //setEmailSuggestion([]);
	        return;
	    }

	    try {
	        const token = localStorage.getItem("auth_token");
	        const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getUserDataByEmail/${entered_email}`, {
	            headers: {
	                "Authorization": `Bearer ${token}`
	            }
	        })
			console.log(data.data)
	        if (data.data) {
	            let response = data.data;
	            let emailArr = [];
	            response.map(data => {
	                emailArr.push(data.email)
	            })

	            return emailArr;
	        }
	    } catch (error) {
	    }
	}

	getEmailSuggestion('test');
	return(
		<h2> {props.data.data} </h2>
  );
}

export default GetStudentEmails;

// export default [
// 	{ id: 1, text: "React" },
// 	{ id: 2, text: "JavaScript" },
// 	{ id: 3, text: "Angular" },
// 	{ id: 4, text: "React Native" },
// 	{ id: 5, text: "Symphony" },
// 	{ id: 6, text: "PHP" }
//   ];
  