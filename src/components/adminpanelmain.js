import React , {useState,useEffect} from 'react';

import Adminmeetings from './Adminmeetings';
import Adminpanel from './adminpanel';
import Sidebar from './common/sidebar';
import $ from 'jquery';
import NewNavbar from './common/newNavbar';
import "../css/mdb.min.css"

function Adminpanelmain(props){

    
    const [handler, setHandler]  = useState('users');

    function contenHandler(value) {
        
        $('.nav-item').removeClass('active')
        $(`.${value}`).addClass('active')
        setHandler(value)

    } 

    useEffect(() => {
        let role = localStorage.getItem('user_role'); 

        if(role !== 'Admin'){
            props.history.push('/')
        }
    },[])

    return(
        <>
       <NewNavbar />
       <div class="bg_section_new"> 
            <div class="wrapper">
                    <div class="row" style={{ marginTop: '80px' }}>
                        <div class="col-12">
                            <div class="left_cl_menu_call">
                                <Sidebar  contenHandler={contenHandler} />
                            </div>  
                        </div>
                        <div class="right_sec_cl_menu_call">
                            <div class="col-12"> 
                                    {
                                        handler && handler === 'users' ? (
                                            <Adminpanel history={props.history} />
                                        ) : (
                                            <Adminmeetings history={props.history} />
                                        )
                                    }     
                                                    
                            
                            </div>
                        </div>
                    </div>
            </div>
        </div>

        </>
    )

}

export default Adminpanelmain;