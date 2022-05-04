import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../images/logo.png";



function AdminNavbar(props) {

    return (
        <header className="header">
            <div className="wrapper">
                <div className="header_inr">
                    <div className="header_logo" style={{ marginLeft: '-29%'}}>
                        <img src={logo} alt="" />
                    </div>
                </div>
            </div>
        </header>
    )

}
export default AdminNavbar;