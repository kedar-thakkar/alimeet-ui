import React from 'react';

function Sidebar(props) {

    const listItem = {
        textAlign: 'center',
        backgroundColor: '#EEEEEE',
        padding: '15px 0',
        cursor : 'pointer'
    }

    return (      
           
                    <ul className="nav flex-column nav-pills nav-tabs" id="myTab" role="tablist" aria-orientation="vertical">
                        <li style={listItem} className="nav-item users active" onClick={()=>props.contenHandler('users')}>users
                            {/* <a className="nav-link active" id="User-tab" data-toggle="tab" href="#" role="tab" aria-controls="User" aria-selected="true" >User</a> */}
                        </li>
                        <li style={listItem} className="nav-item meetings"  onClick={()=>props.contenHandler('meetings')}>meetings
                            {/* <a className="nav-link" id="Meetings-tab" data-toggle="tab" href="#" role="tab" aria-controls="Meetings" aria-selected="false" >Meetings</a> */}
                        </li>
                    </ul>                 
     

    )

}

export default Sidebar;