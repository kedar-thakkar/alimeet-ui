import React from 'react';
import { Link } from 'react-router-dom';

function DropdownComponent(props) {
  let items = props.items;

  return (
    <>
      <div className="" style={{ position: "absolute", left: "unset!important", right: "0px", top: "42px", background: "white", zIndex: '9' }}>
        {
          items && (
            items.map((item, index) => (
              <Link to={item.link} style={{ verticalAlign: "center", color: "#000000", padding: "1rem 1.4rem", background: '#fff!important' }} className="dropdown-item" id={item.name} key={index}>
                {item.name}
              </Link>
            ))
          )
        }
      </div>
    </>
  )
}

export default DropdownComponent;