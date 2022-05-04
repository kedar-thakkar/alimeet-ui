import React, { useEffect, useState } from 'react';
import file_upload from '../components/meeting/Wany/images/file-upload-01.png';
import {  Modal, ModalBody } from 'reactstrap';
import $ from 'jquery'
import Axios from 'axios';
import io from 'socket.io-client';
import {ENDPOINSOCKETURL, ENDPOINTURL } from './common/endpoints';

let socket;
function DocumentUpload(props) {

    const [modal, setModal] = useState(false);
    const [currentMeetingId, setCurrentMeetingId] = useState("");    
    const [modelContentHandler, setModelContentHandler] = useState(''); 
    const [componentStatus, setComponentStatus] = useState("");
    const [documentList, setDocumentList] = useState([])
    const token = localStorage.getItem("auth_token");
    const toggle = () => {
        setModal(!modal)
        props.setDocumentToggleModal(!modal)
    };
    
    var formData = new FormData();
    const uploadHandler = (e) => {
        var fi = document.getElementById('file'); // GET THE FILE INPUT.
        // checking for multiple file upload.
        if((e.target.files).length > 1){
            // cannot add multiple files . 
            var el = $("#UploadDocment");
            el.text('Sorry, multiple files are not allowed');            
            return ; 
        }        
        let fileSize = (e.target.files[0]).size/1024;
        $('#fp').append(`<span>${fileSize} Kb</span>`)
        formData.append('files', e.target.files[0])        
    }
 
    const uplaodDocument = async (e) => {
        console.log("socket",socket);
        e.preventDefault();    
        setComponentStatus({
            status: "processing",
            message: "Uploading Document..."
        })
        try {
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })
            const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/document/addAllDocuments?meetingId=${currentMeetingId}&source=Documents&userId=0`,
                    formData, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
            }) 
            console.log("data",data)
            console.log("data.data.length",data.data.length)
            let uploadeddocumentcount = data.data.length;        
            if (data.Status === "200") {               
                setComponentStatus({
                    status: "OK",
                    message: "Document List Successfull !"
                })
                toggle();                                
                socket.emit("document-counter", {"count":uploadeddocumentcount});    
            }else{
                setComponentStatus({
                    status: "error",
                    message: data.message
                })
            }                        
        } catch (error) {
            setComponentStatus({
                status: "error",
                message: "something went wrong while Document Uploaded"
            })
        }
    }
   
    const getDocumentList = async () => {
        setComponentStatus({
            status: "processing",
            message: "Processing..."
        })
        try {
            const data = await Axios.post(`${ENDPOINTURL}/alimeet/document/getDocumentList?meetingId=${currentMeetingId}&source=Documents&userId=0`,
                    {}, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
            })
            setComponentStatus({
                status: "OK",
                message: "DocumentList"
            })           
            setDocumentList(data.data)          
            var doc = data.data.length;  
            $("#count_badge").empty();
            document.getElementById("count_badge").innerHTML += doc;        
        } catch (error) {
            setComponentStatus({
                status: "error",
                message: "something went wrong when getting Document List"
            })   
        }
    } 

    useEffect(() => { 
        socket = io(ENDPOINSOCKETURL);
        setCurrentMeetingId(props.meetingId)

        setModal(props.modal)        
        let userRole = localStorage.getItem('user_role');
        if(userRole === "Student"){
            getDocumentList();
        }

        if(modal){            
            getDocumentList();
        }

        let role = localStorage.getItem('user_role');
        if(role === "Student"){
            setModelContentHandler('list');           
        }else{
            setModelContentHandler('upload');
        }

        if(modelContentHandler === "list"){
            getDocumentList();
        } 
    }, [props.meetingId,props.modal,modal,modelContentHandler])

    const deleteDocument = async (documentId) => {        
        try{
            setComponentStatus({
                status: "processing",
                message: "Processing..."
            })        
            const token = localStorage.getItem("auth_token");
            const { data } = await Axios.post(`${ENDPOINTURL}/alimeet/document/deleteDocument?documentId=${documentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }});
                setComponentStatus({
                    status: "OK",
                    message: "Document Deleted Successfully"
                })               
                var documents = data.length;  
                if(documents >= 0 )
                {
                    toggle();                   
                }
        }catch(error){            
            setComponentStatus({
                status: "error",
                message: "something went wrong while Document Deleting"
            })
        }        
    }

    return (
        <>          
            {
                (localStorage.getItem('user_role') === "Teacher" || localStorage.getItem('user_role') === "Admin") && (
                <Modal isOpen={modal} toggle={toggle} style={{maxWidth: "600px", borderRadius:"10px", padding: "0"}} className={"className"}>                     	
                    <div class="upload_title_box">
						<ul class="d-flex align-items-center ">
							<li><a href="#why1" onClick={() => setModelContentHandler("upload")} class="upload_tabs active">Add New Documents</a></li>	
						</ul>
                        <a class="popup-modal-dismiss close_icon" onClick={toggle} href="#">
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M11 1L1 11M1 1L11 11" stroke="#656185" stroke-width="1.5"></path>
							</svg>
						</a>						
				</div>
                    <ModalBody>
					<div class="upload_body_content"  id="tabs-content">
						<div class="tabs" id="why1">
							<div class="upload_box">
	                    		<img src={file_upload} alt="upload-file"/>
	                    		<p class="file-type-desc">
	                    			<font color="red">*</font>All file extension allowed
	                    		</p>
	                    		<div class="drag_box d-flex align-items-center justify-content-center">
			                    	<p class="drag-drop-text"> Drag &amp; Drop Files here Or </p>
	                    			<div class="browse-button" style={{position: "relative" , overflow: "hidden" , cursor: "default"}}>Browse</div>
	                    		</div>
	                    		<label class="file"> 
                                <input type="file" id="file" onChange={uploadHandler} />
                                <span id="fp"></span>                              
								</label>
	                     	</div>    
                        {
                            modelContentHandler === "upload" && (
                                <>
                                    {
                                        documentList && documentList.map((doc,i) => (
                                            <div class="upload_list_box" id="UploadDocment" key={i}>
                                                <div class="upload_list_box_inr">
                                                <a href={doc.url} target="blank">{doc.documentTitle}</a>
                                                {/* <button className='blue_btn' onClick={() => deleteDocument(doc.documentId)}>Delete</button>                                                                                                             */}
                                                </div>
                                                <button className='blue_btn' onClick={() => deleteDocument(doc.documentId)}>Delete</button> 
                                            </div>
                                        ))
                                    }                                   
                                    <div class="submit_btn"  onClick={uplaodDocument}>                                  
                                        <button type="submit" class="btn btn-primary btn-block">
                                            <img src="https://res.cloudinary.com/dtutqsucw/image/upload/v1438960670/file-upload.png" class="animated slideInUp"/>
                                            Upload
                                        </button>
                                    </div>
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
                             </>
                            )
                        }
	                    </div>                       
					</div>
                </ModalBody>
               </Modal>
                )
            } 
            {
                localStorage.getItem('user_role') === "Student"  && (
                <Modal isOpen={modal} toggle={toggle} style={{maxWidth: "600px", borderRadius:"10px", padding: "0"}} className={"className"}> 
                    <div class="upload_title_box">
                        <ul class="d-flex align-items-center ">                                   
                            <li><a href="#why2" onClick={() => setModelContentHandler("list")} class="upload_tabs">Upload Documents List</a></li>
                        </ul>
                        <a class="popup-modal-dismiss close_icon" onClick={toggle} href="#">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 1L1 11M1 1L11 11" stroke="#656185" stroke-width="1.5"></path>
                            </svg>
                        </a>						
                    </div>                       
                    <ModalBody>
                        <div class="upload_body_content"  id="tabs-content">                           
                            <div class="tabs"  id="why2">
                                {
                                    modelContentHandler === "list" && (
                                        <>
                                            {
                                                documentList && documentList.map((doc,i) => (
                                                    <div class="upload_list_box" id="UploadDocment" key={i}>
                                                            <div class="upload_list_box_inr">
                                                        <a href={doc.url} target="blank">{doc.documentTitle}</a>
                                                        <span id="fp"></span>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    )
                                }
                            </div> 
                        </div>
                    </ModalBody>
                </Modal>
                )
            }
           
        </>
    )
}

export default DocumentUpload;