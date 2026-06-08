import { Modal, Button, Row, Col, Badge, Form } from 'react-bootstrap';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const EstradaClosetModal = (props) => {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray'];

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            toast.warn('Please select a size and color!');
            return;
        }
        toast.success('Item added to cart!');
        props.onHide();
    };

    return (
        <Modal show={props.show} onHide={props.onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Product Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    {/* Product Image */}
                    <Col md={5} className="d-flex align-items-center justify-content-center">
                        <img
                            src="https://store.clickhole.com/cdn/shop/files/11870109656314399758_2048.jpg?v=1696020367&width=1445"
                            alt="Product"
                            className="img-fluid rounded"
                        />
                    </Col>

                    {/* Product Info */}
                    <Col md={7}>
                        <h4 className="fw-bold">Classic Blue Tee</h4>
                        <p className="text-muted mb-1">Category: T-Shirts</p>
                        <h5 className="text-success fw-semibold mb-3">₱50.00</h5>

                        <p className="text-secondary" style={{ fontSize: '0.92rem' }}>
                            A comfortable everyday classic tee made from 100% cotton. Breathable,
                            durable, and perfect for any casual occasion.
                        </p>

                        <hr />

                        {/* Size Selector */}
                        <div className="mb-3">
                            <Form.Label className="fw-semibold">
                                Size: {selectedSize && <Badge bg="secondary" className="ms-1">{selectedSize}</Badge>}
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <Button
                                        key={size}
                                        variant={selectedSize === size ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => setSelectedSize(size)}
                                        style={{ minWidth: '45px' }}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div className="mb-3">
                            <Form.Label className="fw-semibold">
                                Color: {selectedColor && <Badge bg="secondary" className="ms-1">{selectedColor}</Badge>}
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <Button
                                        key={color}
                                        variant={selectedColor === color ? 'dark' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {color}
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
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >
                                    −
                                </Button>
                                <span className="px-3 fw-semibold">{quantity}</span>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setQuantity(q => q + 1)}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
                <Button variant="success" onClick={handleAddToCart}>
                    Add to Cart
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
