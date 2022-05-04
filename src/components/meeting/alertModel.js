import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function AlertModel(props) {  
    

    return (
        <div>
            {/* <Button color="danger" onClick={props.toggle}>Toggle Model</Button> */}
            <Modal isOpen={props.modal} toggle={props.toggle} >
                <ModalHeader toggle={props.toggle}>{props.alertHead}</ModalHeader>
                <ModalBody>
                    {
                        props.alertBody
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={props.onokay}>Do Something</Button>{' '}
                    <Button color="secondary" onClick={props.toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    )

}

export default AlertModel;