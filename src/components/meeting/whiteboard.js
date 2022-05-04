import React, { useEffect, useState } from 'react';
import { ENDPOINSOCKETURL } from '../common/endpoints';

function Whiteboard(props) {

    const [role, setRole] = useState('');  

    useEffect(() => {
        let role = localStorage.getItem('user_role');
        if (role) {
            setRole(role);
        }else{
            // props.history.push('/');
        }
    }, []) 

    return (
        <>
             {
                props.roomName && <iframe width='100%' height='100%' src={`https://devmeet.alibiz.net/myindex.html?roomname=${props.roomName}`}></iframe>
             }   
 
            <button className="whiteboard-btn gray_btn" onClick={() => props.whiteboardhandler(false)} >Close</button>
        </>
    )
}

export default Whiteboard;