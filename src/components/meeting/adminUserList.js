import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import Axios from 'axios';
import { ENDPOINTURL } from '../common/endpoints';
import AlertModel from './alertModel';

function AdminUserList(props) {


    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [searchData, setSearchData] = useState('')
    const [response, setResponse] = useState('');
    const [searchResults, setSearchResults] = useState([])

    const [alertHead, setAlertHead] = useState('');
    const [alertBody, setAlertBody] = useState('');

    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    let formdata = "";


    const getAllStudents = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Student`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            setStudents(data.data);

        } catch (error) {
            console.log(error)
        }

    }


    const deleteUserHandler = () => {
        
        // Changes from here.
         

        // const token = localStorage.getItem("auth_token");
        // let userId = localStorage.getItem('deleteUser');
        // const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/deleteUser?userId=${userId}`, {
        //     headers: {
        //         "Authorization": `Bearer ${token}`
        //     }
        // })
        // if (data.data === "Meeting Successfully Deleted !") {
        //     $('.custom-alert').removeClass('show')
        //     getAllStudents()
        //     getAllTeachers()
        // }
    }

    const getAllTeachers = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Teacher`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            setTeachers(data.data);

        } catch (error) {
            console.log(error)
        }

    }

    const getSearchUsers = async (value) => {
        try {

            if (!value) {
                getAllStudents()
                getAllTeachers()
            } else {

                const token = localStorage.getItem("auth_token");
                const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/getUserDataByEmail/${value}`, {
                    headers: {

                        "Authorization": `Bearer ${token}`
                    }
                })

                setStudents([])
                setTeachers([])

                //console.log(data.data);  
                setSearchResults(data.data)

            }



        } catch (error) {
            console.log(error)
        }

    }

    const alertDeleteUserHandler = async (userId) => {

        localStorage.setItem('deleteUser', userId);
        setAlertHead('Delete User');
        setAlertBody("이강의를 삭제 합니다. 삭제된 강의는 다시 복원 할 수 없습니다. 삭제를 진행 하겠습니까?")
        toggle();

    }

    const editHandler = (user) => {
        let email = user.email;
        props.history.push(`/user/profile/editprofile?editprofile=true&email=${email}`);

    }

    useEffect(() => {
        getAllStudents()
        getAllTeachers()
    }, [])


    useEffect(() => {
        if (response) {
            setTimeout(() => {
                setResponse('');
            }, 5000)
        }
    }, [response])

    const excelFileHandler = (e) => {
        setResponse('checking file format...');
        formdata = new FormData();
        const file = e.target.files[0];
        formdata.append('files', e.target.files[0]);

        if (e.target.files[0].type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            setResponse('invalid file format!');
            $('#excel-form-reset').click();
        } else {
            setResponse('uploading excel...');
            excelUploadHander();
        }
    }



    const excelUploadHander = async (e) => {

        e && e.preventDefault();
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.post
                (`${ENDPOINTURL}/alimeet/document/addExcelData`,
                    formdata, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
            console.log('My data -------------------', data)

            if (data.status === 200) {
                setResponse('Excel Uploaded Successfully');
                $('#excel-form-reset').click();
                formdata = "";

            }

            // console.log(data)
        } catch (error) {
            setResponse(error.message)
        }

    }

    return (
        <div className="meeting_user_content_table_inr_col" id="tabs1">

            <div className="alert-model">
                <AlertModel toggle={toggle} alertBody={alertBody} alertHead={alertHead} modal={modal} setModal={setModal} onokay={deleteUserHandler} />
            </div>

            <div className="meeting_user_content_table_head">
                <a href="#." className="meeting_user_blue_btn">
                    Upload Excel File
							            </a>
                <div className="find_a_lecture">
                    <input type="text" placeholder="Find a lecture" />
                    <a href="#." className="meeting_user_blue_btn course_registration_btn">
                        Course registration
								            </a>
                </div>
            </div>
            <div className="user_meeting_table_box user_table">
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>

                    {
                        teachers.map((teacher, index) => (
                            <tr key={index}>
                                <td>{teacher.userName}</td>
                                <td><a href="mailto:Email@gmail.com">{teacher.email}</a></td>
                                <td>{teacher.role}</td>
                                <td>
                                    <div className="action_box">
                                        <a onClick={(e) => { e.preventDefault(); editHandler(teacher) }} className="action_icon">
                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M23.8295 6.464L27.536 10.1687L23.8295 6.464ZM26.213 3.20025L16.1908 13.2225C15.6729 13.7396 15.3197 14.3985 15.1758 15.116L14.25 19.75L18.884 18.8225C19.6015 18.679 20.2595 18.3272 20.7775 17.8092L30.7998 7.787C31.1009 7.48583 31.3398 7.12829 31.5028 6.73479C31.6658 6.34129 31.7497 5.91954 31.7497 5.49362C31.7497 5.06771 31.6658 4.64596 31.5028 4.25246C31.3398 3.85896 31.1009 3.50142 30.7998 3.20025C30.4986 2.89908 30.141 2.66018 29.7475 2.49719C29.354 2.33419 28.9323 2.2503 28.5064 2.2503C28.0805 2.2503 27.6587 2.33419 27.2652 2.49719C26.8717 2.66018 26.5142 2.89908 26.213 3.20025V3.20025Z" stroke="#319ED9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M28.25 23.25V28.5C28.25 29.4283 27.8813 30.3185 27.2249 30.9749C26.5685 31.6313 25.6783 32 24.75 32H5.5C4.57174 32 3.6815 31.6313 3.02513 30.9749C2.36875 30.3185 2 29.4283 2 28.5V9.25C2 8.32174 2.36875 7.4315 3.02513 6.77513C3.6815 6.11875 4.57174 5.75 5.5 5.75H10.75" stroke="#319ED9" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </a>
                                        <a onClick={(e) => { e.preventDefault(); alertDeleteUserHandler(teacher.id) }} className="action_icon">
                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.66659 3.66667C8.66659 2.78261 9.01777 1.93477 9.6429 1.30964C10.268 0.684523 11.1159 0.333333 11.9999 0.333333H21.9999C22.884 0.333333 23.7318 0.684523 24.3569 1.30964C24.9821 1.93477 25.3333 2.78261 25.3333 3.66667V7H31.9999C32.4419 7 32.8659 7.1756 33.1784 7.48816C33.491 7.80072 33.6666 8.22464 33.6666 8.66667C33.6666 9.10869 33.491 9.53262 33.1784 9.84518C32.8659 10.1577 32.4419 10.3333 31.9999 10.3333H30.2183L28.7733 30.57C28.7134 31.411 28.3371 32.198 27.7201 32.7726C27.1031 33.3472 26.2914 33.6667 25.4483 33.6667H8.54992C7.70682 33.6667 6.89503 33.3472 6.27806 32.7726C5.66109 32.198 5.28478 31.411 5.22492 30.57L3.78325 10.3333H1.99992C1.55789 10.3333 1.13397 10.1577 0.821407 9.84518C0.508847 9.53262 0.333252 9.10869 0.333252 8.66667C0.333252 8.22464 0.508847 7.80072 0.821407 7.48816C1.13397 7.1756 1.55789 7 1.99992 7H8.66659V3.66667ZM11.9999 7H21.9999V3.66667H11.9999V7ZM7.12325 10.3333L8.55159 30.3333H25.4499L26.8783 10.3333H7.12325ZM13.6666 13.6667C14.1086 13.6667 14.5325 13.8423 14.8451 14.1548C15.1577 14.4674 15.3333 14.8913 15.3333 15.3333V25.3333C15.3333 25.7754 15.1577 26.1993 14.8451 26.5118C14.5325 26.8244 14.1086 27 13.6666 27C13.2246 27 12.8006 26.8244 12.4881 26.5118C12.1755 26.1993 11.9999 25.7754 11.9999 25.3333V15.3333C11.9999 14.8913 12.1755 14.4674 12.4881 14.1548C12.8006 13.8423 13.2246 13.6667 13.6666 13.6667ZM20.3333 13.6667C20.7753 13.6667 21.1992 13.8423 21.5118 14.1548C21.8243 14.4674 21.9999 14.8913 21.9999 15.3333V25.3333C21.9999 25.7754 21.8243 26.1993 21.5118 26.5118C21.1992 26.8244 20.7753 27 20.3333 27C19.8912 27 19.4673 26.8244 19.1547 26.5118C18.8422 26.1993 18.6666 25.7754 18.6666 25.3333V15.3333C18.6666 14.8913 18.8422 14.4674 19.1547 14.1548C19.4673 13.8423 19.8912 13.6667 20.3333 13.6667Z" fill="black" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }

                    {
                        students.map((student, index) => (
                            <tr key={index}>
                                <td>{student.userName}</td>
                                <td><a href="mailto:Email@gmail.com">{student.email}</a></td>
                                <td>{student.role}</td>
                                <td>
                                    <div className="action_box">
                                        <a onClick={(e) => { e.preventDefault(); editHandler(student) }} className="action_icon">
                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M23.8295 6.464L27.536 10.1687L23.8295 6.464ZM26.213 3.20025L16.1908 13.2225C15.6729 13.7396 15.3197 14.3985 15.1758 15.116L14.25 19.75L18.884 18.8225C19.6015 18.679 20.2595 18.3272 20.7775 17.8092L30.7998 7.787C31.1009 7.48583 31.3398 7.12829 31.5028 6.73479C31.6658 6.34129 31.7497 5.91954 31.7497 5.49362C31.7497 5.06771 31.6658 4.64596 31.5028 4.25246C31.3398 3.85896 31.1009 3.50142 30.7998 3.20025C30.4986 2.89908 30.141 2.66018 29.7475 2.49719C29.354 2.33419 28.9323 2.2503 28.5064 2.2503C28.0805 2.2503 27.6587 2.33419 27.2652 2.49719C26.8717 2.66018 26.5142 2.89908 26.213 3.20025V3.20025Z" stroke="#319ED9" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
                                                <path d="M28.25 23.25V28.5C28.25 29.4283 27.8813 30.3185 27.2249 30.9749C26.5685 31.6313 25.6783 32 24.75 32H5.5C4.57174 32 3.6815 31.6313 3.02513 30.9749C2.36875 30.3185 2 29.4283 2 28.5V9.25C2 8.32174 2.36875 7.4315 3.02513 6.77513C3.6815 6.11875 4.57174 5.75 5.5 5.75H10.75" stroke="#319ED9" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </a>
                                        <a href="#." className="action_icon">
                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.66659 3.66667C8.66659 2.78261 9.01777 1.93477 9.6429 1.30964C10.268 0.684523 11.1159 0.333333 11.9999 0.333333H21.9999C22.884 0.333333 23.7318 0.684523 24.3569 1.30964C24.9821 1.93477 25.3333 2.78261 25.3333 3.66667V7H31.9999C32.4419 7 32.8659 7.1756 33.1784 7.48816C33.491 7.80072 33.6666 8.22464 33.6666 8.66667C33.6666 9.10869 33.491 9.53262 33.1784 9.84518C32.8659 10.1577 32.4419 10.3333 31.9999 10.3333H30.2183L28.7733 30.57C28.7134 31.411 28.3371 32.198 27.7201 32.7726C27.1031 33.3472 26.2914 33.6667 25.4483 33.6667H8.54992C7.70682 33.6667 6.89503 33.3472 6.27806 32.7726C5.66109 32.198 5.28478 31.411 5.22492 30.57L3.78325 10.3333H1.99992C1.55789 10.3333 1.13397 10.1577 0.821407 9.84518C0.508847 9.53262 0.333252 9.10869 0.333252 8.66667C0.333252 8.22464 0.508847 7.80072 0.821407 7.48816C1.13397 7.1756 1.55789 7 1.99992 7H8.66659V3.66667ZM11.9999 7H21.9999V3.66667H11.9999V7ZM7.12325 10.3333L8.55159 30.3333H25.4499L26.8783 10.3333H7.12325ZM13.6666 13.6667C14.1086 13.6667 14.5325 13.8423 14.8451 14.1548C15.1577 14.4674 15.3333 14.8913 15.3333 15.3333V25.3333C15.3333 25.7754 15.1577 26.1993 14.8451 26.5118C14.5325 26.8244 14.1086 27 13.6666 27C13.2246 27 12.8006 26.8244 12.4881 26.5118C12.1755 26.1993 11.9999 25.7754 11.9999 25.3333V15.3333C11.9999 14.8913 12.1755 14.4674 12.4881 14.1548C12.8006 13.8423 13.2246 13.6667 13.6666 13.6667ZM20.3333 13.6667C20.7753 13.6667 21.1992 13.8423 21.5118 14.1548C21.8243 14.4674 21.9999 14.8913 21.9999 15.3333V25.3333C21.9999 25.7754 21.8243 26.1993 21.5118 26.5118C21.1992 26.8244 20.7753 27 20.3333 27C19.8912 27 19.4673 26.8244 19.1547 26.5118C18.8422 26.1993 18.6666 25.7754 18.6666 25.3333V15.3333C18.6666 14.8913 18.8422 14.4674 19.1547 14.1548C19.4673 13.8423 19.8912 13.6667 20.3333 13.6667Z" fill="black" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }



                </table>
            </div>

        </div>
    )

}

export default AdminUserList;