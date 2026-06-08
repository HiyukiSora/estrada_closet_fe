import React from 'react'
import { Modal, Spinner } from 'react-bootstrap'

export const LoadingModal = (props) => {
    return (
        <React.Fragment>
            <Modal
                show={props.showModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Body className="text-center py-5">
                    <Spinner
                        animation="border"
                        variant="dark"
                        style={{ width: '4rem', height: '4rem' }}
                    />

                    <h5 className="fw-bold mt-4">
                        {props.title}
                    </h5>

                    <p className="text-muted mb-0">
                        {props.message}
                    </p>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}
