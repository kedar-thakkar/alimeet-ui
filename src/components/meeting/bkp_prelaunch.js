import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import $ from 'jquery';
import PropTypes from "prop-types";
import {
    Card,
    Button,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardFooter,
    Row,
    Col,
    Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import 'font-awesome/css/font-awesome.min.css';

function Prelaunch(props) {

    // console.log("props.mediaDevices",props.mediaDevices);

    const [audioTracks, setAudioTracks] = useState([]);
    const [videoTracks, setVideoTracks] = useState([]);

    const [audioId, setAudioId] = useState("");
    const [videoId, setVideoId] = useState("");
    const [model, setModel] = useState(true);



    useEffect(() => {


        let audio = [];
        let video = [];
        (props.mediaDevices).map((device) => {

            console.log(device)
            if (device.kind === "audioinput" || device.kind === "audiooutput") {
                setAudioTracks(audioTracks => [...audioTracks, device]);
                // console.log("audio", device);
                audio.push(device);
            } else {
                // console.log("video", device); 
                setVideoTracks(videoTracks => [...videoTracks, device]);
                video.push(device);
            }
        })

        setAudioTracks(audio);
        setVideoTracks(video);
        console.log(audio)
        console.log(video)

    }, [props.mediaDevices])


    useEffect(() => {
        if (props.modal) {
            setModel(true);
        } else {
            setModel(false);
        }
    }, [props])


    useEffect(() => {
        console.log(audioTracks);
        console.log(videoTracks);
    }, [audioTracks, videoTracks])

    const style = {
        width: "100%",
        height: "44px"
    }

    const section = {
        width: '100%',
        height: '100vh',
        display: "flex",
        alignItems: "center",
        justifyContent: "center"

    }


    const section1 = {
        width: '100%',
        height: 'unset!important',
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }


    return (
        <>

            <div style={!model ? section : section1} >
                <div style={{ padding: '50px', backgroundColor: 'white' }}>
                    <Card>
                        <CardBody className="text-center">
                            {
                                !model && <h1>Prelaunch Screen</h1>
                            }
                            <Webcam id="video" style={{ width: '80%', marginBottom: '30px' }} />
                            <Row xs="2">
                                <Col>
                                    <h6 style={{ marginBottom: '10px' }}>
                                        <i className="fa fa-video-camera"></i> &nbsp;
                                        <b>Webcam</b>
                                    </h6>
                                </Col>
                                <Col>
                                    <h6 style={{ marginBottom: '10px' }}>
                                        <i className="fa fa-microphone"></i>&nbsp;
                                        <b>Microphone</b>
                                    </h6>
                                </Col>
                            </Row>
                            <Row xs="2">
                                <Col>
                                    <select style={style} onChange={(e) => setVideoId(e.target.value)}>
                                        <option>Choose Video Device</option>
                                        {
                                            videoTracks && videoTracks.map((track) => (
                                                <option key={track.id} value={track.deviceId}>{track.label}</option>
                                            ))
                                        }
                                    </select>
                                </Col>
                                <Col>
                                    <select style={style} onChange={(e) => setAudioId(e.target.value, "audio")}>
                                        <option>Choose Audio Device</option>

                                        {
                                            audioTracks && audioTracks.map((track) => (
                                                <option key={track.id} value={track.deviceId}>{track.label}</option>
                                            ))
                                        }
                                    </select>
                                </Col>
                            </Row>
                        </CardBody>
                        <CardFooter className="text-center" style={{ padding: '19px' }}>
                            {
                                !model &&
                                <Button color="primary mr-5" onClick={() => {
                                    if (audioId && videoId) {
                                        props.prelaunchMediaHandler(audioId, videoId)
                                    } else {
                                        alert("Please select valid devices. ");
                                    }
                                }}>
                                    Join meeting
                                </Button>
                            }
                            {
                                model &&
                                <Button color="primary" onClick={() => {
                                    if (audioId && videoId) {
                                        props.prelaunchMediaHandler(audioId, videoId)

                                    } else {
                                        alert("Please select valid devices. ");
                                    }
                                }}>
                                    Ok
                                </Button>
                            }
                            {
                                !model &&
                                <Button color="primary" className="ml-5" href="/user/meeting/meetinglist">
                                    Back
                                </Button>
                            }
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
          )
}

export default Prelaunch;