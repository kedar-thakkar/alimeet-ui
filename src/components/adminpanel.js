import React, { useState, useEffect } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import { ENDPOINTURL } from '../components/common/endpoints';
import Axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';

function Adminpanel(props) {

    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [searchData, setSearchData] = useState('')
    const [response, setResponse] = useState('');
    const [searchResults, setSearchResults] = useState([]) 
    let formdata = "";
    let pdfdata= "";


    const getAllStudents = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const studentsResponse = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Both`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (studentsResponse.data.Status === "200") {
                setStudents(studentsResponse.data.data);
            }
        } catch (error) {
            console.log(error)
        }

    }

    /*const getAllTeachers = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const teachersData = await Axios.get(`${ENDPOINTURL}/alimeet/user/getAllUsers/Teacher`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (teachersData.data.Status === "200") {
                setTeachers(teachersData.data.data);
            }
        } catch (error) {
            console.log(error)
        }

    }*/

    const getSearchUsers = async (value) => {
        try {

            if (!value) {
                getAllStudents()
                ////getAllTeachers()
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

    const userDeleteHandler = async (userId) => {
        localStorage.setItem('deleteUser', userId);
        $('.custom-alert').removeClass('d-none');
        $('.custom-alert').addClass('show');
    }

    const editHandler = (user) => {
        let email = user.email; 
        props.history.push(`/user/profile/editprofile?editprofile=true&email=${email}`);

    }

    useEffect(() => {
        getAllStudents()
        //getAllTeachers()
    }, [])


    useEffect(() => {
        if(response){
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
        
        if(e.target.files[0].type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
            setResponse('invalid file format!'); 
            $('#excel-form-reset').click();
        }else{
            setResponse('uploading excel...'); 
            excelUploadHander();
        }
    }
    const pdfFileHandler=(e)=>{
        pdfdata = new FormData();
        const file = e.target.files[0];
        pdfdata.append('files', e.target.files[0]);
        console.log(pdfdata);

        if(e.target.files[0].type ==="application/pdf"){
            setResponse('uploading pdf...'); 
            pdfUploadHandler();

        }
        else{
            alert("Invalid File Format! Please Upload .pdf File Only.");
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
    const pdfUploadHandler = async (e) => {

        e && e.preventDefault(); 
        try {
            const token = localStorage.getItem("auth_token");
            const data = await Axios.post
                (`${ENDPOINTURL}/alimeet/register/uploadTermAndCondition?userId=106`,
                    pdfdata, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                console.log(pdfdata);

            console.log('My data -------------------', data)

            if (data.status === 200) {  
                setResponse('pdf Uploaded Successfully');
                $('#pdf-form-reset').click();
                pdfdata = "";

            }

            // console.log(data)
        } catch (error) { 
           setResponse(error.message)
        }

    }
    

    return (
        <>
            <div className='custom-alert d-none'>
                <div className='custom-alert-wrapper'>
                    <div className='custom-alert-content'>
                        <h3><b>강의 삭제!</b></h3><br />
                        <p style={{ fontSize: '16px' }}>이강의를 삭제 합니다. <br />삭제된 강의는 다시 복원 할 수 없습니다. <br />삭제를 진행 하겠습니까? </p>
                        <div className="custom-alert-button">
                            <button className='btn blue_btn' onClick={async () => {
                                const token = localStorage.getItem("auth_token");
                                let userId = localStorage.getItem('deleteUser');
                                const data = await Axios.get(`${ENDPOINTURL}/alimeet/user/deleteUser?userId=${userId}`, {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                })
                                if (data.data === "Meeting Successfully Deleted !") {
                                    $('.custom-alert').removeClass('show');
                                    $('.custom-alert').addClass('d-none');
                                    getAllStudents()
                                }

                            }}>확인</button>
                            <button className='btn gray_btn' onClick={() => $('.custom-alert').addClass('d-none')}>취소</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <form onSubmit={excelUploadHander} className="d-none">
                        <input type='file' id="excel-file-input" onChange={excelFileHandler}/> 
                        <input type='submit'/>
                        <input type='reset' id="excel-form-reset"/>
                    </form>
                    <button className="blue_btn" onClick={() => $('#excel-file-input').click()}>Upload Excel File</button>
                    <form onSubmit={pdfUploadHandler} className="d-none">
                    <input type="file" id="pdf-file-input" accept='.pdf' onChange={pdfFileHandler} />
                        <input type='submit'/>
                        <input type='reset' id="pdf-form-reset"/>
                    </form>
                    <button className="blue_btn" onClick={() => $('#pdf-file-input').click()}>Upload Terms & Conditions</button>
                    <Link to='/signup' className="blue_btn" style={{marginLeft: '20px'}}>
                        Add New Member
                    </Link>
                    <span style={{ paddingLeft: "20px" }}>{response}</span>
                </div>
                <div className="right_meeting_box">

                    <div className="search_box" style={{ margin: "20px 0" }}>
                        <input type="text" value={searchData} placeholder="수강생 찾기" onChange={(e) => {
                            setSearchData(e.target.value)
                            getSearchUsers(e.target.value)
                        }
                        } />
                    </div>
                    <Link to="/user/meeting/schedulemeeting" className="green_btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
                            <g fill="none" fillRule="evenodd">
                                <g fill="#FFF" fillRule="nonzero">
                                    <g>
                                        <g>
                                            <g>
                                                <g>
                                                    <path d="M36 24.714L31.714 24.714 31.714 29 30.286 29 30.286 24.714 26 24.714 26 23.286 30.286 23.286 30.286 19 31.714 19 31.714 23.286 36 23.286z" transform="translate(-1045 -139) translate(282 120) translate(1) translate(736)" />
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        강의 등록
                    </Link>
                </div>
            </div>

            <table class="table table-bordered table-striped table-light">
                <thead>
                    <tr className='text-center'>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students && students.map((student, index) => (
                            <tr className='text-center' key={index}>
                                <td> {student.userName} </td>
                                <td> {student.email} </td>
                                <td> {student.role} </td>
                                <td>
                                    <button className="btn btn-info" style={{ marginRight: '10px' }} onClick={() => editHandler(student)}><i className="fa fa-pencil-square-o"></i></button>
                                    <button className="btn btn-info" style={{ marginLeft: '10px' }} onClick={() => userDeleteHandler(student.id)}><i className="fa fa-trash-o"></i></button>
                                </td>
                            </tr>
                        ))
                    }
                    {
                        searchResults && searchResults.map((searchResult, index) => (
                            <tr className='text-center' key={index}>
                                <td> {searchResult.userName} </td>
                                <td> {searchResult.email} </td>
                                <td> {searchResult.role} </td>
                                <td>
                                    <button className="btn btn-info" style={{ marginRight: '10px' }} onClick={() => editHandler(searchResult)}><i className="fa fa-pencil-square-o"></i></button>
                                    <button className="btn btn-info" style={{ marginLeft: '10px' }} onClick={() => userDeleteHandler(searchResult.id)}><i className="fa fa-trash-o"></i></button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

        </>
    )
}

export default Adminpanel;
