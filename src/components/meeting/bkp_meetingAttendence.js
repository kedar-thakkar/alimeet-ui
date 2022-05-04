import React, { useEffect, useState } from 'react';
import Navbar from '../common/navbar';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import CheckLoginStatus from '../common/loginStatus';
import { Link } from 'react-router-dom';

function MeetingAttendence(props) {

    const { id } = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        const res = CheckLoginStatus();
        const user_role = localStorage.getItem('user_role');
        if (res && (user_role === 'Teacher' || user_role === 'Admin')) {
            getAttendenceData();
        } else {
            props.history.push('/')
        }

    }, [])

    const getAttendenceData = async () => {

        try {
            const token = localStorage.getItem("auth_token");
            const { data } = await Axios.get(`${ENDPOINTURL}/alimeet/attendance/viewAttendance?meetingId=${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            setData(data);

        } catch (error) {

        }


    }
    return (
        <>
            <Navbar />


            <div className="mt-5 py-5">

                {
                    data.length > 0 ? (
                        <table className='table table-bordered w-75 mx-auto table-striped' style={{ boxShadow: ' 0 0 15px 10px #eee', borderRadius: '10px', borderColor: 'transparent' }}>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Total Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data && data.map((attendence) => (
                                        <tr>

                                            <td><Link to={`/user/meeting/userAttendence/${attendence.userId}MID${id}`}>{attendence.userName}</Link></td>
                                            <td>{attendence.email}</td>
                                            <td>{attendence.checkInTime}</td>
                                            <td>{attendence.checkOutTime}</td>
                                            <td>{attendence.totalTime}</td>

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center">
                            <h2>No Records Found.</h2>
                        </div>
                    )

                }
            </div>



        </>
    )

}

export default MeetingAttendence;