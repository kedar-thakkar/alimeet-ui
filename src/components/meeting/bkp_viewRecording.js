import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import queryString from "query-string"
import { Link } from 'react-router-dom';
import logo from "../../images/logo.png";


function ViewRecording(props) {

    const [recordingList, setRecordingList] = useState([]);
    const [status, setStatus] = useState("");
    let user_role = localStorage.getItem("user_role")
    const token = localStorage.getItem("auth_token");
    let { meetingId } = queryString.parse(window.location.search);    
    const getRecordingList = async () => {

        setStatus("Processing...")
        try {
            const data = await Axios.post
                (`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=${meetingId}&source=Recordings&userId=0`,
                    {}, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
            console.log(data.data)
            setRecordingList(data.data)

            if ((data.data).length > 0) {
                setStatus('')
            } else {
                setStatus('No recording found!')
            }

        } catch (error) {
            console.log(error.message)
            setStatus(error.message);
        }

    }

    useEffect(() => {
        console.log(meetingId);
        if (meetingId) {
            getRecordingList()
        }


    }, [])

    const myStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%!important', 
        margin: 'auto',
        paddingTop: '30px!important'
    }

    const deleteDocument = async (documentId) => {
        
        try{
            const token = localStorage.getItem("auth_token");
            const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/document/deleteDocument?documentId=${documentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }});
 
                
                if(data === "Recording Deleted Successfully !"){
                    getRecordingList()
                }
            console.log(data)

        }catch(error){
            console.log(error.message)
        }
        
    }

    return (
        <>
            <header className="header">
                <div className="wrapper">
                    <div className="header_inr">
                        <div className="header_logo">
                            <Link to="/user/meeting/meetinglist">
                                <img src={logo} alt="" />
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

                    </div>
                </div>
            </header> 
                
                <div style={{ width: '80%', margin: 'auto', paddingTop: '50px' }}>
                {
                    recordingList && recordingList.map(doc => (
                        <div className="w-100 py-2 text-center" style={myStyle}>
                            <a href={doc.url} target="blank">{doc.documentTitle}</a>
                            <div>
                                <a className='blue_btn' style={{marginRight: '30px'}} href={doc.url} download={doc.documentTitle}>Download</a>
                                <button className='blue_btn' onClick={() => deleteDocument(doc.documentId)}>Delete</button>
                            </div>
                        </div>
                    ))
                } 
                </div>
                


            {
                recordingList.length === 0 && (
                    <div className="text-center">
                        <h1>{status}</h1>
                    </div>
                )
            }



        </>
    )

}
export default ViewRecording;

