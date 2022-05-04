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
    console.log('meeting id : ', meetingId)
    const getRecordingList = async () => {

        setStatus("Processing...")
        try {
            const data = await Axios.post
                (`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=${meetingId}&source=Recordings`,
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
                setStatus('기록이 없습니다!')
            }

        } catch (error) {
            console.log(error.message)
            setStatus(error.message)
        }

    }

    useEffect(() => {
        console.log(meetingId);
        if (meetingId) {
            getRecordingList()
        }


    }, [])

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
            <table class="table table-striped table-hover">
                <thead>
                    <tr className='text-center'>
                        <th>녹음 된 파일 목록</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {
                            recordingList && recordingList.map(doc => (
                                <div className="w-100 py-2 text-center" style={{ cursor: 'pointer' }}>
                                    <a href={doc.url} target="blank">{doc.documentTitle}</a>
                                </div>
                            ))
                        }
                    </tr>
                </tbody>
            </table>


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

