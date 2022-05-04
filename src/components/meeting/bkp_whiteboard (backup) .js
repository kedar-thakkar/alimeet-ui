import React, { useEffect, useState } from 'react';
import { ENDPOINSOCKETURL } from '../common/endpoints';

function Whiteboard(props) {

    const [role, setRole] = useState(''); 

    useEffect(() => {
        let role = localStorage.getItem('user_role');
        if (role) {
            setRole(role);
        }
    }, [])

    return (
        <>
            {/* <SketchField width='100%'
                height='100vh'
                tool={Tools.Pencil}
                undoSteps='15'
                lineColor='black'
                lineWidth={3}
            /> */}
            {/* 
            {
                role === "Teacher" ? <iframe src={url}></iframe> : 
                <div style={{pointerEvents: 'none'}}>
                    <iframe src={url}></iframe>
                </div>
            } */}

            {/* <iframe src={"https://devmeet.alibiz.net/myindex.html"}></iframe> */}
            <iframe src={"https://devmeet.alibiz.net/myindex.html"}></iframe>



            <button className="whiteboard-btn gray_btn" onClick={() => props.whiteboardhandler(false)} >Close</button>

        </>

    )
}

export default Whiteboard;