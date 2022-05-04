// React System Libraries
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import queryString from "query-string"

// Customised Libraries or components
import { ENDPOINTURL } from '../common/endpoints';
import NewNavbar from '../common/newNavbar';

function ViewRecording(props) {

    const [recordingList, setRecordingList] = useState([]);
    const [componentStatus, setComponentStatus] = useState("");
    const token = localStorage.getItem("auth_token");
    let user_role = localStorage.getItem("user_role");
    let user_id = localStorage.getItem("user_id");
    let { meetingId } = queryString.parse(window.location.search);
    let userRecordingMeetingId = 0;
    let userRecording = 0;
    let isAdmin = user_role == 'Admin';

    // Get Recording List
    const getRecordingList = async () => {
        setComponentStatus({
            status: "processing",
            message: "Processing..."
        })
        try {
            let isAdmin = user_role == 'Admin';
            const recordingResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentListAPI?meetingId=${userRecordingMeetingId}&source=Recordings&userId=${ isAdmin ? 0 : userRecording}`,
                {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if(recordingResponse.data.Status == "200"){
                // Set Recording List
                setRecordingList(recordingResponse.data.data);

                // Set component status
                setComponentStatus({
                    status: "",
                    message: ""
                });
            }else{
                setComponentStatus({
                    status: "error",
                    message: recordingResponse.data.message
                });
            }
        } catch (error) {
            setComponentStatus({
                status: "error",
                message: "뭔가 잘못 됐어"
            });
        }
    }

    // Delete Specific Document of Meeting
    const deleteDocument = async (documentId) => {
        try{
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            });

            const deleteDocumentResponse = await Axios.post(`${ENDPOINTURL}/alimeet/document/deleteDocument?documentId=${documentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }});
            if(deleteDocumentResponse.data.Status == "200"){
                setComponentStatus({
                    status: "OK",
                    message: deleteDocumentResponse.data.message
                });
            }else{
                setComponentStatus({
                    status: "error",
                    message: deleteDocumentResponse.data.message
                });
            }

            props.history.push("/user/meeting/meetinglist");
        }catch(error){
            setComponentStatus({
                status: "error",
                message: "뭔가 잘못 됐어"
            });
        }
        
    }

    useEffect(() => {
        if(meetingId){
            userRecordingMeetingId = meetingId;
        }else{
            userRecording = user_id;
        }

        // Get Recording List
        getRecordingList();
    }, [])

    const myStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%!important', 
        margin: 'auto',
        paddingTop: '30px!important'
    }

    return(
        <div className="classroom_list">
            <NewNavbar />
            <div className="cl_attendance_list">
                <div className="wrapper">
                    <div className="cl_attendance_list_box">
                        {
                            componentStatus && componentStatus.status === "OK" &&
                            <h2 className="text-success">{componentStatus.message}</h2>
                        }
                        {
                            componentStatus && componentStatus.status === "error" &&
                            <h2 className="text-danger">{componentStatus.message}</h2>
                        }
                        {
                            componentStatus && componentStatus.status === "processing" &&
                            <h2 className="text-warning">{componentStatus.message}</h2>
                        }
                        {
                            componentStatus && componentStatus.status === "" &&
                            <h2>
                                회의 녹음
                                {
                                    user_role === 'Admin' &&
                                    (
                                        <Link to="/Adminpanelmain">집</Link>
                                    )
                                }
                            </h2>                           
                        }
                        <div className="attendance_table_box" style={myStyle}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>회의 제목</th>
                                        <th>녹음</th>
                                        <th>다운로드</th>
                                        <th>지우다</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    recordingList && recordingList.map((doc,i) => (                                 
                                        <tr key={i}>
                                            <td>{doc.meetingTitle}</td>
                                            <td><a href={doc.url} target="blank">{doc.documentTitle}</a></td>
                                            <td><a className='cl_save_btn' style={{marginRight: '30px'}} href={doc.url} download={doc.documentTitle}>Download</a></td>
                                            <td><button className='cl_save_btn' onClick={() => deleteDocument(doc.documentId)}>Delete</button></td>
                                            <td>{doc.status=== null || "COMPLETE"?'Uploaded':'Uploading...'}</td>                                            
                                        </tr> 
                                    ))
                                }
                                </tbody>
                            </table>  
                        </div>
                    </div>
                </div>
            </div>             
        </div>
    )
}
export default ViewRecording;
