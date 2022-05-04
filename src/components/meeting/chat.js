import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ENDPOINSOCKETURL } from '../common/endpoints';
import './css/chat.css'
import $ from 'jquery';


let socket;
function Chat(props) {

    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [subtitleEvent, setSubtitleEvent] = useState('');

    const sendMessage = (e) => {
        e && e.preventDefault();        
        if (newMessage) {
            setMessages(messages => [...messages, {
                user: "local",
                message: newMessage,
                name: localStorage.getItem('user_name'),

            }])
            $('.circle').removeClass('active');
            socket.emit("send-message", { message: newMessage, user: "remote", name: localStorage.getItem('user_name') })
        }        
        socket.emit("share-screen-message", { message: "screen-share-on" })        

        setNewMessage("");
    }


    const showNewMessage = ({ message, user, name }) => {
        // console.log("SHOW NEW MESSAGES")

        setMessages(messages => [...messages, {
            user: user,
            message: message,
            name: name,
        }])
    }

    useEffect(() => {
        socket = io(ENDPOINSOCKETURL);
        $(window).on("keyup", (e) => {
            if (e.keyCode === 27) {
                $('.toolbox-content').removeClass('small')
                $('.meeting_section').removeClass('small')
                $('.chat-box-sec').removeClass('show')
                $('.circle').removeClass('active')

            }
        })
    }, [])

    useEffect(() => {
        if(props.subtitleMessage){
            console.log("Chat FIle Message: ", props.subtitleMessage)
            setSubtitleEvent(props.subtitleMessage)
            setNewMessage(subtitleEvent)
        }
    }, [props.subtitleMessage])


    useEffect(() => {
        sendMessage();
    }, [subtitleEvent])

    useEffect(() => {

        $(".chat-box-sec").animate({ scrollTop: $('.chat-box-sec').prop("scrollHeight") }, 1000);

    }, [messages])

    useEffect(() => {

        if (socket) {
            socket.emit("join", ({ room: props.roomName }));
            socket.on("new-message", ({ message, user, name }) => {
                $('.circle').addClass('active')
                showNewMessage({ message, user, name });
            });
        }

        if (socket === true) {
            socket.on("share-screen", ({ message }) => {
                console.log("share-screen is =============== ", message);
            })
        }

    }, [])

    const chatHandler = () => {

        $('.toolbox-content').toggleClass('small')
        $('.meeting_section').toggleClass('small')
        $('.chat-box-sec').toggleClass('show')
        $('.circle').removeClass('active')

    }

    return (
        <>
            <div className="message-box-wrapper">

            <div className="row" id="top">
                <div className="col-sm-4"><svg  onClick={chatHandler} style={{ width: '18px', height: '30px', position: 'sticky', top: '10px', left: '10px' }} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 1L1 11M1 1L11 11" stroke="#656185" strokeWidth="1.5"></path>
                 </svg></div>
                <div className="col-sm-4" id="chat">Chat</div>
               
            </div>
            
                <form onSubmit={sendMessage} style={{overflowX:'hidden!important', overflowY:'auto!important'}}>
                    <div className="message-box">

                        {
                            messages && messages.map((message, index) => (

                                <div key={index} className={message.user === 'local' ? "message remote d-flex jc-flex-end" : 'message d-flex'}>
                                    <div>
                                        <p>
                                            <span className="message-user"><b>{message.name}: </b> <br /></span>
                                            <span className="message-content">{message.message}</span>
                                        </p>
                                    </div>
                                </div>

                            ))
                        }

                    </div>
                    <div className="d-flex chat-message-input">

                        <input type="text" className="chat-input-box" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button  className="chat-input-submit" type="submit">Send</button>

                    </div>
                </form>

            </div>

        </>
    )

}

export default Chat;