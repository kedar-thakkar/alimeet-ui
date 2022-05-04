import React, { useEffect, useState } from 'react';
import { ENDPOINTURL } from '../../components/common/endpoints';
import Axios from 'axios';
function PrivacyPolicy(props) {
    const [pdfUrl,setpdfUrl]=useState('')
    useEffect(async()=>{
        const meetingResponse = await Axios.get(`${ENDPOINTURL}/alimeet/register/getTermAndCondition`);
        setpdfUrl(meetingResponse.data.data.url);
        // let pdfUrl=meetingResponse.data.data.url
        // console.log(pdfUrl);
    }, [])

    return (
        <>
            <div className='policy-wrapper container' id="policy-page">
                <div>
                    <div className="policy-pdf">
                        
                        {pdfUrl &&  
                        <iframe src={pdfUrl} width="100%" title="description" />
                        }
                    </div>
                    <div className="text-center" style={{marginTop: '20px'}}>
                        <button className="blue_btn mr-1" onClick={() => props.setPolicy(false)}>동의</button>
                        <button className="gray_btn ml-1" onClick={() => props.history.push('/')}>취소</button>
                    </div>
                </div>
            </div>
        </>
    )

}

export default PrivacyPolicy;