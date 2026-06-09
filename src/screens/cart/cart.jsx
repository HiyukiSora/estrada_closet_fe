import React, { useEffect, useState } from 'react'
import { Container, Badge, Table, Button, Row, Col, Card, Image, Form } from 'react-bootstrap'
import { FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '../../components/header/header';
import { deleteBulkCartItem, deleteCartItem, getCartItems, validateCartItemQuantity } from '../../services/cart/cart-services';
import { getCommaWithDecimal, getSelectedItems } from '../../config/functions';
import { imageUrl } from '../../config/image-base';
import { useCartItemCountStore, useCartItemSelectionStore, useCheckoutCartItemStore } from '../../stores/use-context-stores';
import { LoadingModal } from '../../components/loading-modal/loading-modal';

export const Cart = () => {
    const navigate = useNavigate();

    const [flag, setFlag] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const { toggleRefreshCart } = useCartItemCountStore();
    const { toggleSelectionId, setSelectedIds: setSelectionIds, clearSelectedIds } = useCartItemSelectionStore();
    const { setCheckoutItems, clearCheckoutItems } = useCheckoutCartItemStore();

    // Selection helpers
    const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    const handleQuantityChange = (id, delta) => {
        setCartItems(prev =>
            prev.map(item =>
                item.cart_id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    // Remove single cart item
    const handleRemove = async (id) => {
        if (id === undefined || id === null) {
            toast.error('Invalid product ID.');
            return;
        }

        try {
            const response = await deleteCartItem(id);
            if (response.status === 200) {
                toast.success('Item removed from cart.');
                setFlag(!flag);
                toggleRefreshCart();
            }
        } catch (error) {
            toast.error('Failed to remove item from cart: ', error);
        }
    };

    // Bulk delete selected items
    const handleBulkDelete = async () => {
        const bulkSelectedIds = Array.from(selectedIds);

        if (bulkSelectedIds.length === 0) {
            toast.error('Invalid product ID.');
            return;
        }

        try {
            const response = await deleteBulkCartItem(bulkSelectedIds);

            if (response.status === 200) {
                toast.success("Selected items removed successfully!");
                setFlag(!flag);
                setSelectedIds(new Set());
                toggleRefreshCart();
            }
        } catch (error) {
            toast.error('Failed to remove bulk item from cart: ', error);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectionIds(cartItems.map(item => item.cart_id));
            setSelectedIds(new Set(cartItems.map(item => item.cart_id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectItem = (cart_id) => {
        toggleSelectionId(cart_id);
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(cart_id) ? next.delete(cart_id) : next.add(cart_id);
            return next;
        });
    };

    const getSubTotal = (price, quantity) => {
        let subtotal = price * quantity;
        return getCommaWithDecimal(subtotal);
    };

    const subtotal = getSelectedItems(cartItems, selectedIds).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const total = subtotal;

    const handleCheckout = async () => {
        if (!selectedIds || selectedIds.size === 0) {
            toast.error("Please select an item before checkout.")
            return;
        }

        try {
            const items = Array.from(selectedIds).map(id => {
                const item = cartItems.find(ci => ci.cart_id === id);

                return {
                    cart_id: id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_image: item.product_image,
                    size_name: item.size_name,
                    color_name: item.color_name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity,
                };
            });

            const response = await validateCartItemQuantity(items);
            if (response.data.status === 200) {
                setIsCheckingOut(true);
                setTimeout(() => {
                    setCheckoutItems(items);
                    setIsCheckingOut(false);
                    navigate('/checkout');
                }, 1500);
            } else {
                toast.error(response.data.message);
                if (response.data.errors) {
                    response.data.errors.forEach(err => toast.error(err));
                }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    const navigatePage = () => {
        navigate('/main');
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            const response = await getCartItems();
            if (response.status === 200) {
                setCartItems(response.data || []);
            } else {
                toast.error('Failed to load cart items');
            }
        }

        fetchCartItems();
    }, [flag]);

    useEffect(() => {
        clearCheckoutItems();
        clearSelectedIds();
    }, [clearSelectedIds, clearCheckoutItems]);

    return (
        <React.Fragment>
            <Header />
            <Container className="mt-4 mb-5">
                {/* Back Button */}
                <Button
                    variant="outline-secondary"
                    className="mb-4 d-flex align-items-center gap-2"
                    onClick={navigatePage}
                >
                    <FaArrowLeft /> Continue Shopping
                </Button>

                <h4 className="fw-bold mb-4">
                    <FaShoppingCart className="me-2" />
                    Your Cart
                    {cartItems.length > 0 && (
                        <Badge bg="danger" className="ms-2" style={{ fontSize: '0.75rem' }}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </Badge>
                    )}
                </h4>

                {cartItems.length === 0 ? (
                    <Card className="text-center py-5 border-0 bg-light">
                        <Card.Body>
                            <FaShoppingCart size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">Your cart is empty</h5>
                            <p className="text-muted mb-4">Looks like you haven't added anything yet.</p>
                            <Button variant="dark" onClick={navigatePage}>
                                Browse Products
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-4">
                        {/* Cart Items Table */}
                        <Col lg={8}>
                            {selectedIds.size > 0 && (
                                <div className="d-flex align-items-center justify-content-between px-3 py-2 mb-2 rounded border shadow-sm bg-light">
                                    <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                        {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                                    </span>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="d-flex align-items-center gap-2"
                                        onClick={handleBulkDelete}
                                    >
                                        <FaTrash /> Delete Selected
                                    </Button>
                                </div>
                            )}


                            <Card className="border rounded shadow-sm">
                                <Card.Body className="p-0">
                                    <Table responsive className="mb-0 align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '40px' }} className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={el => {
                                                            if (el) el.indeterminate = someSelected;
                                                        }}
                                                        onChange={handleSelectAll}
                                                        aria-label="Select all items"
                                                    />
                                                </th>
                                                <th style={{ width: '45%' }}>Product</th>
                                                <th className="text-center">Price</th>
                                                <th className="text-center">Quantity</th>
                                                <th className="text-center">Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item, index) => (
                                                <tr key={index}>
                                                    {/* Per-row checkbox */}
                                                    <td className="text-center">
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={selectedIds.has(item.cart_id)}
                                                            onChange={() => handleSelectItem(item.cart_id)}
                                                            aria-label={`Select ${item.product_name}`}
                                                        />
                                                    </td>
                                                    {/* Product */}
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <Image
                                                                src={imageUrl(item.product_image)}
                                                                rounded
                                                                style={{ width: '64px', height: '80px', objectFit: 'cover' }}
                                                            />
                                                            <div>
                                                                <p className="mb-0 fw-semibold">{item.product_name}</p>
                                                                <small className="text-muted">
                                                                    Size: {item.size_name} &bull; Color: {item.color_name}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="text-center">₱{getCommaWithDecimal(item?.price)}</td>

                                                    {/* Quantity Controls */}
                                                    <td className="text-center">
                                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => handleQuantityChange(item.cart_id, -1)}
                                                            >
                                                                −
                                                            </Button>
                                                            <span className="fw-semibold px-1">{item.quantity}</span>
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => handleQuantityChange(item.cart_id, 1)}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </td>

                                                    {/* Subtotal */}
                                                    <td className="text-center fw-semibold text-success">
                                                        ₱{getSubTotal(item.price, item.quantity)}
                                                    </td>

                                                    {/* Remove */}
                                                    <td className="text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleRemove(item.cart_id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Order Summary */}
                        <Col lg={4}>
                            <Card className="border rounded shadow-sm">
                                <Card.Body>
                                    <h6 className="fw-bold mb-4">Order Summary</h6>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal</span>
                                        <span>₱{getCommaWithDecimal(subtotal)}</span>
                                    </div>

                                    <hr />

                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="fw-bold">Total</span>
                                        <span className="fw-bold text-success fs-5">
                                            ₱{getCommaWithDecimal(total)}
                                        </span>
                                    </div>

                                    <Button
                                        variant="dark"
                                        className="w-100"
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </Button>

                                    <Button
                                        variant="outline-secondary"
                                        className="w-100 mt-2"
                                        onClick={navigatePage}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
            <LoadingModal
                showModal={isCheckingOut}
                title={"Preparing your checkout..."}
                message={"Please wait while we process your order."}
            />
        </React.Fragment>
    );
};