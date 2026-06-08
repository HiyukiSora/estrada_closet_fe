import React from 'react';
import { Button, Row, Col, Form, Modal, Badge } from 'react-bootstrap'
import { getCommaWithDecimal } from '../../../../config/functions';

export const MainPageModal = (props) => {
    return (
        <React.Fragment>
            <Modal show={props.showModal} onHide={props.handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Product Details</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        {/* Product Image */}
                        <Col md={5} className="d-flex align-items-center justify-content-center">
                            <img
                                src={`http://localhost:80/estrada_closet_be/${props.selectedProduct?.image}`}
                                alt="Product"
                                className="img-fluid rounded"
                                style={{
                                    width: '100%',
                                    height: '450px',
                                    objectFit: 'fill'
                                }}
                            />
                        </Col>

                        {/* Product Info */}
                        <Col md={7}>
                            <h4 className="fw-bold">{props.selectedProduct?.name}</h4>
                            <h5 className="text-success fw-semibold mb-3">
                                ₱{getCommaWithDecimal(props.selectedProduct?.price)}
                            </h5>

                            <p className="text-secondary" style={{ fontSize: '0.92rem' }}>
                                {props.selectedProduct?.description}
                            </p>

                            <hr />

                            {/* Size Selector */}
                            <div className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Size: {props.selectedSize && <Badge bg="secondary" className="ms-1">{props.selectedSize.name}</Badge>}
                                </Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {props.selectedProduct?.sizes?.map(size => (
                                        <Button
                                            key={size.id}
                                            variant={props.selectedSize?.name === size.name ? 'dark' : 'outline-secondary'}
                                            size="sm"
                                            onClick={() => props.setSelectedSize(size)}
                                            style={{ minWidth: '45px' }}
                                        >
                                            {size.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div className="mb-3">
                                <Form.Label className="fw-semibold">
                                    Color: {props.selectedColor && <Badge bg="secondary" className="ms-1">{props.selectedColor.name}</Badge>}
                                </Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {props.selectedProduct?.colors?.map(color => (
                                        <Button
                                            key={color.name}
                                            variant={props.selectedColor?.name === color.name ? 'dark' : 'outline-secondary'}
                                            size="sm"
                                            onClick={() => props.setSelectedColor(color)}
                                        >
                                            {color.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-3">
                                <Form.Label className="fw-semibold">Quantity:</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => props.setQuantity(q => Math.max(1, q - 1))}
                                    >
                                        −
                                    </Button>
                                    <span className="px-3 fw-semibold">{props.quantity}</span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => props.setQuantity(q => q + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="success" onClick={props.handleAddToCart}>
                        Add to Cart
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}
