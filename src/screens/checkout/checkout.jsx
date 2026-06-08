import React, { useState, useRef } from 'react';
import {
    Container, Row, Col, Card, Button, Form,
    Badge, Image, Spinner
} from 'react-bootstrap';
import {
    FaArrowLeft, FaLock, FaUser, FaCreditCard,
    FaMoneyBillWave, FaCheckCircle, FaShoppingBag,
    FaStore, FaTruck, FaMapMarkerAlt, FaDirections,
    FaCopy, FaQrcode, FaMobileAlt, FaUpload, FaTimesCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '../../components/header/header';
import { fetchQuantitiesPrice, getCommaWithDecimal } from '../../config/functions';
import { useCartItemCountStore, useCartItemSelectionStore, useCheckoutCartItemStore } from '../../stores/use-context-stores';
import { placeOrder } from '../../services/order/order-services';

// ─── Payment method options ───────────────────────────────────────────────────
const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: <FaMoneyBillWave /> },
    { id: 'gcash', label: 'GCash', icon: <FaMoneyBillWave /> },
];

// ─── Fulfillment options ──────────────────────────────────────────────────────
const FULFILLMENT_METHODS = [
    {
        id: 'pickup',
        label: 'Store Pickup',
        description: 'Claim your order at our store',
        icon: <FaStore />,
    },
    {
        id: 'delivery',
        label: 'Delivery',
        description: 'We deliver to your address',
        icon: <FaTruck />,
    },
];

// ─── Store info — update as needed ───────────────────────────────────────────
const STORE_INFO = {
    name: "Estrada Closet",
    address: "123 Rizal Street, Barangay Central, Calbayog City, Samar 6710",
    hours: "Mon – Sat: 9:00 AM – 7:00 PM",
    landmark: "Near City Hall, ground floor of the Estrada Building",
    googleMapsUrl: "https://maps.google.com/?q=Calbayog+City+Samar",
};

// ─── Store GCash info — update with real owner details ────────────────────────
const GCASH_INFO = {
    ownerName: "Maria Santos",
    number: "09171234567",
    qrImage: null,
};

export const Checkout = () => {
    const navigate = useNavigate();
    const screenshotInputRef = useRef(null);

    const [paymentMethod, setPaymentMethod] = useState('');
    const [fulfillment, setFulfillment] = useState('');
    const [placing, setPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [gcashNumberCopied, setGcashNumberCopied] = useState(false);
    const [gcashSenderNumber, setGcashSenderNumber] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null); // File object
    const [screenshotPreview, setScreenshotPreview] = useState(null); // Data URL
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        zipCode: '',
        deliveryNotes: '',
    });
    const [errors, setErrors] = useState({});

    const { toggleRefreshCart } = useCartItemCountStore();
    const { clearCheckoutItems } = useCheckoutCartItemStore();
    const selectedIds = useCartItemSelectionStore(state => state.selectedIds);
    const clearSelectedIds = useCartItemSelectionStore(state => state.clearSelectedIds);
    const checkoutItems = useCheckoutCartItemStore(state => state.checkoutItems);
    const items = checkoutItems;

    const DELIVERY_FEE = fulfillment === 'delivery' ? 50 : 0;
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + DELIVERY_FEE;

    // helpers
    const continueShopping = () => {
        clearCheckoutItems();
        clearSelectedIds();
        navigate('/main')
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        // Validate file size (max 5 MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5 MB.');
            return;
        }

        setPaymentScreenshot(file);
        setErrors(prev => ({ ...prev, paymentScreenshot: '' }));

        const reader = new FileReader();
        reader.onloadend = () => setScreenshotPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveScreenshot = () => {
        setPaymentScreenshot(null);
        setScreenshotPreview(null);
        if (screenshotInputRef.current) screenshotInputRef.current.value = '';
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email))
            e.email = 'Enter a valid email';
        if (!form.phone.trim()) e.phone = 'Required';
        if (fulfillment === 'delivery') {
            if (!form.street.trim()) e.street = 'Required';
            if (!form.barangay.trim()) e.barangay = 'Required';
            if (!form.city.trim()) e.city = 'Required';
            if (!form.province.trim()) e.province = 'Required';
        }
        if (paymentMethod === 'gcash') {
            if (!gcashSenderNumber.trim()) {
                e.gcashSenderNumber = 'Required';
            } else if (!/^09\d{9}$/.test(gcashSenderNumber.replace(/\s/g, ''))) {
                e.gcashSenderNumber = 'Enter a valid GCash number (e.g. 09XXXXXXXXX)';
            }
            if (!paymentScreenshot) {
                e.paymentScreenshot = 'Please upload your GCash payment screenshot';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCopyGcash = () => {
        navigator.clipboard.writeText(GCASH_INFO.number).then(() => {
            setGcashNumberCopied(true);
            setTimeout(() => setGcashNumberCopied(false), 2000);
        });
    };

    const handlePlaceOrder = async () => {
        if (!fulfillment) { toast.error('Please select a fulfillment method.'); return; }
        if (!validate()) { toast.error('Please fill in all required fields.'); return; }
        if (!paymentMethod) { toast.error('Please select a payment method.'); return; }
        try {
            const formData = new FormData();
            formData.append('first_name', form.firstName);
            formData.append('last_name', form.lastName);
            formData.append('email', form.email);
            formData.append('phone', form.phone);
            formData.append('fulfillment_method', fulfillment);
            formData.append('street', form.street);
            formData.append('barangay', form.barangay);
            formData.append('city', form.city);
            formData.append('province', form.province);
            formData.append('zip_code', form.zipCode);
            formData.append('delivery_notes', form.deliveryNotes);
            formData.append('payment_method', paymentMethod);
            formData.append('gcash_sender_number', gcashSenderNumber);
            formData.append('cart_item_ids', JSON.stringify(selectedIds));
            formData.append('updated_quantities', JSON.stringify(fetchQuantitiesPrice(checkoutItems)));

            if (paymentMethod === 'gcash' && paymentScreenshot) {
                formData.append('payment_screenshot', paymentScreenshot);
            }

            const response = await placeOrder(formData);

            if (response.status === 200) {
                toggleRefreshCart();
                setPlacing(true);
                setOrderPlaced(true);
            } else {
                toast.error('Failed to place order.');
            }
        } catch (error) {
            toast.error('Network error. Please try again.', error);
        } finally {
            setPlacing(false);
        }
    };

    // Success screen
    if (orderPlaced) {
        return (
            <React.Fragment>
                <Header />
                <Container className="mt-5 mb-5">
                    <Card className="border-0 shadow-sm text-center py-5 mx-auto" style={{ maxWidth: 500 }}>
                        <Card.Body>
                            <FaCheckCircle size={64} className="text-success mb-3" />
                            <h4 className="fw-bold mb-1">Order Confirmed!</h4>
                            <p className="text-muted mb-4">
                                Thank you, <strong>{form.firstName}</strong>!{' '}
                                {fulfillment === 'pickup'
                                    ? 'Please proceed to the counter to complete your purchase.'
                                    : 'We will deliver your order to your address shortly.'}
                            </p>
                            <div className="bg-light rounded p-3 mb-4 text-start">
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted small">Fulfillment</span>
                                    <span className="fw-semibold">
                                        {FULFILLMENT_METHODS.find(f => f.id === fulfillment)?.label}
                                    </span>
                                </div>
                                {fulfillment === 'delivery' && (
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Deliver to</span>
                                        <span className="fw-semibold text-end" style={{ maxWidth: '60%' }}>
                                            {form.street}, Brgy. {form.barangay}, {form.city}
                                        </span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted small">Subtotal</span>
                                    <span className="fw-semibold">₱{getCommaWithDecimal(subtotal)}</span>
                                </div>
                                {fulfillment === 'delivery' && (
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Delivery Fee</span>
                                        <span className="fw-semibold">₱{getCommaWithDecimal(DELIVERY_FEE)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-muted small">Total to pay</span>
                                    <span className="fw-bold text-success">₱{getCommaWithDecimal(total)}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted small">Payment</span>
                                    <span className="fw-semibold">
                                        {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}
                                    </span>
                                </div>
                                {paymentMethod === 'gcash' && (
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="text-muted small">GCash No.</span>
                                        <span className="fw-semibold font-monospace">{gcashSenderNumber}</span>
                                    </div>
                                )}
                            </div>
                            <Button variant="dark" className="w-100" onClick={continueShopping}>
                                Continue Shopping
                            </Button>
                        </Card.Body>
                    </Card>
                </Container>
            </React.Fragment>
        );
    }

    // Main checkout
    return (
        <React.Fragment>
            <Header />
            <Container className="mt-4 mb-5">
                {/* Back */}
                <Button
                    variant="outline-secondary"
                    className="mb-4 d-flex align-items-center gap-2"
                    onClick={() => {
                        navigate('/cart')
                        clearSelectedIds();
                        clearCheckoutItems();
                    }}
                >
                    <FaArrowLeft /> Back to Cart
                </Button>

                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <FaShoppingBag /> Checkout
                </h4>
                <p className="text-muted mb-4 d-flex align-items-center gap-1" style={{ fontSize: '0.875rem' }}>
                    <FaStore className="me-1" /> Estrada Closet Co.
                </p>

                <Row className="g-4">
                    {/* ── LEFT ── */}
                    <Col lg={8}>

                        {/* ── Fulfillment Method ── */}
                        <Card className="border rounded shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaTruck className="text-dark" /> Fulfillment Method
                                </h6>

                                <div className="d-flex gap-3 mb-3 flex-wrap">
                                    {FULFILLMENT_METHODS.map(f => (
                                        <label
                                            key={f.id}
                                            className={`d-flex align-items-center gap-3 p-3 rounded border flex-grow-1
                                                ${fulfillment === f.id
                                                    ? 'border-dark bg-light fw-semibold'
                                                    : 'border-secondary-subtle'}`}
                                            style={{ cursor: 'pointer', minWidth: 160 }}
                                        >
                                            <Form.Check
                                                type="radio"
                                                name="fulfillment"
                                                value={f.id}
                                                checked={fulfillment === f.id}
                                                onChange={() => setFulfillment(f.id)}
                                            />
                                            <span className="fs-5">{f.icon}</span>
                                            <div>
                                                <div>{f.label}</div>
                                                <div className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                                                    {f.description}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Store Pickup — show store info */}
                                {fulfillment === 'pickup' && (
                                    <div className="rounded border border-secondary-subtle p-3 bg-light d-flex gap-3">
                                        <FaMapMarkerAlt className="text-danger mt-1 flex-shrink-0" size={18} />
                                        <div>
                                            <p className="mb-1 fw-semibold">{STORE_INFO.name}</p>
                                            <p className="mb-1 small text-muted">{STORE_INFO.address}</p>
                                            <p className="mb-1 small text-muted">
                                                <strong>Store Hours:</strong> {STORE_INFO.hours}
                                            </p>
                                            <p className="mb-2 small text-muted">
                                                <strong>Landmark:</strong> {STORE_INFO.landmark}
                                            </p>
                                            <a
                                                href={STORE_INFO.googleMapsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1"
                                            >
                                                <FaDirections /> Get Directions
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery — address form */}
                                {fulfillment === 'delivery' && (
                                    <div className="rounded border border-secondary-subtle p-3 bg-light">
                                        <p className="fw-semibold small mb-3 d-flex align-items-center gap-1">
                                            <FaMapMarkerAlt className="text-danger" /> Delivery Address
                                        </p>
                                        <Row className="g-3">
                                            <Col sm={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        Street / House No. / Building <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="street"
                                                        value={form.street}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.street}
                                                        placeholder="e.g. 45 Maharlika Highway"
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        Barangay <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="barangay"
                                                        value={form.barangay}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.barangay}
                                                        placeholder="e.g. Brgy. Central"
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.barangay}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        City / Municipality <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="city"
                                                        value={form.city}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.city}
                                                        placeholder="e.g. Calbayog City"
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        Province <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="province"
                                                        value={form.province}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.province}
                                                        placeholder="e.g. Samar"
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors.province}</Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        ZIP Code <span className="text-muted">(optional)</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        name="zipCode"
                                                        value={form.zipCode}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 6710"
                                                        maxLength={4}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-semibold">
                                                        Delivery Notes <span className="text-muted">(optional)</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        name="deliveryNotes"
                                                        value={form.deliveryNotes}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Leave at the gate, call upon arrival…"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Customer Info */}
                        <Card className="border rounded shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaUser className="text-dark" /> Customer Information
                                </h6>

                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">
                                                First Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                isInvalid={!!errors.firstName}
                                                placeholder="Juan"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">
                                                Last Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                isInvalid={!!errors.lastName}
                                                placeholder="dela Cruz"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">
                                                Phone Number <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                isInvalid={!!errors.phone}
                                                placeholder="09XX XXX XXXX"
                                                maxLength={11}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold">
                                                Email <span className="text-muted">(optional)</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                isInvalid={!!errors.email}
                                                placeholder="juan@email.com"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Payment Method */}
                        <Card className="border rounded shadow-sm">
                            <Card.Body>
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FaCreditCard className="text-dark" /> Payment Method
                                </h6>

                                <div className="d-flex flex-column gap-2 mb-3">
                                    {PAYMENT_METHODS.map(m => (
                                        <label
                                            key={m.id}
                                            className={`d-flex align-items-center gap-3 p-3 rounded border
                                                ${paymentMethod === m.id
                                                    ? 'border-dark bg-light fw-semibold'
                                                    : 'border-secondary-subtle'}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Form.Check
                                                type="radio"
                                                name="paymentMethod"
                                                value={m.id}
                                                checked={paymentMethod === m.id}
                                                onChange={() => setPaymentMethod(m.id)}
                                            />
                                            <span className="fs-5">{m.icon}</span>
                                            {m.label}
                                        </label>
                                    ))}
                                </div>

                                {paymentMethod === 'cash' && (
                                    <div className="bg-light rounded p-3 text-muted small d-flex align-items-center gap-2">
                                        <FaMoneyBillWave />
                                        {fulfillment === 'pickup'
                                            ? 'Please prepare the exact amount or present your bill at the counter.'
                                            : 'Please prepare the exact amount when our rider arrives.'}
                                    </div>
                                )}

                                {paymentMethod === 'gcash' && (
                                    <div className="rounded border border-secondary-subtle p-3 mt-1">
                                        {/* Header */}
                                        <p className="fw-semibold small mb-3 d-flex align-items-center gap-2">
                                            <FaQrcode className="text-primary" />
                                            Send payment to this GCash account
                                        </p>

                                        <div className="d-flex gap-3 align-items-start flex-wrap">
                                            {/* QR Code */}
                                            {GCASH_INFO.qrImage ? (
                                                <div className="text-center flex-shrink-0">
                                                    <div
                                                        className="border rounded p-1 bg-white d-inline-block"
                                                        style={{ lineHeight: 0 }}
                                                    >
                                                        <img
                                                            src={GCASH_INFO.qrImage}
                                                            alt="GCash QR Code"
                                                            style={{ width: 140, height: 140, objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.7rem' }}>
                                                        Scan with GCash app
                                                    </p>
                                                </div>
                                            ) : (
                                                <div
                                                    className="border rounded d-flex flex-column align-items-center justify-content-center bg-light flex-shrink-0 text-muted"
                                                    style={{ width: 120, height: 120, fontSize: '0.7rem' }}
                                                >
                                                    <FaQrcode size={32} className="mb-1 text-secondary" />
                                                    <span className="text-center px-2">QR not set</span>
                                                </div>
                                            )}

                                            {/* Store account details */}
                                            <div className="flex-grow-1">
                                                <p className="mb-1 text-muted small">Account Name</p>
                                                <p className="fw-bold mb-3">{GCASH_INFO.ownerName}</p>

                                                <p className="mb-1 text-muted small d-flex align-items-center gap-1">
                                                    <FaMobileAlt size={11} /> GCash Number
                                                </p>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span
                                                        className="fw-bold fs-6 font-monospace"
                                                        style={{ letterSpacing: '0.05em' }}
                                                    >
                                                        {GCASH_INFO.number}
                                                    </span>
                                                    <Button
                                                        variant={gcashNumberCopied ? 'success' : 'outline-secondary'}
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1 py-0 px-2"
                                                        style={{ fontSize: '0.72rem' }}
                                                        onClick={handleCopyGcash}
                                                    >
                                                        <FaCopy size={10} />
                                                        {gcashNumberCopied ? 'Copied!' : 'Copy'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        <div className="mt-3 bg-light rounded p-2 text-muted small">
                                            <ol className="mb-0 ps-3">
                                                <li>Open your <strong>GCash app</strong> and tap <strong>Send Money</strong>.</li>
                                                <li>Scan the QR code above <em>or</em> enter the number manually.</li>
                                                <li>Enter the exact amount: <strong>₱{getCommaWithDecimal(total)}</strong>.</li>
                                                <li>
                                                    {fulfillment === 'pickup'
                                                        ? 'Screenshot your confirmation and upload it below, then show it to the cashier.'
                                                        : 'Screenshot your confirmation and upload it below, then show it to the rider upon delivery.'}
                                                </li>
                                            </ol>
                                        </div>

                                        {/* ── NEW: Customer GCash Number ── */}
                                        <div className="mt-3 pt-3 border-top">
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold d-flex align-items-center gap-1">
                                                    <FaMobileAlt size={12} className="text-primary" />
                                                    Your GCash Number <span className="text-danger">*</span>
                                                    <span
                                                        className="ms-1 text-muted fw-normal"
                                                        style={{ fontSize: '0.72rem' }}
                                                    >
                                                        (for refund if order is cancelled)
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={gcashSenderNumber}
                                                    onChange={(e) => {
                                                        setGcashSenderNumber(e.target.value);
                                                        setErrors(prev => ({ ...prev, gcashSenderNumber: '' }));
                                                    }}
                                                    isInvalid={!!errors.gcashSenderNumber}
                                                    placeholder="09XX XXX XXXX"
                                                    maxLength={11}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.gcashSenderNumber}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                    This will only be used to process refunds in case your order is cancelled.
                                                </Form.Text>
                                            </Form.Group>
                                        </div>

                                        {/* ── NEW: Payment Screenshot Upload ── */}
                                        <div className="mt-3 pt-3 border-top">
                                            <Form.Label className="small fw-semibold d-flex align-items-center gap-1">
                                                <FaUpload size={12} className="text-primary" />
                                                Payment Screenshot <span className="text-danger">*</span>
                                            </Form.Label>

                                            {!screenshotPreview ? (
                                                <>
                                                    <div
                                                        className={`border rounded d-flex flex-column align-items-center justify-content-center p-4 text-center
                                                            ${errors.paymentScreenshot ? 'border-danger' : 'border-secondary-subtle'}`}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderStyle: 'dashed',
                                                            backgroundColor: '#f8f9fa',
                                                            minHeight: 110,
                                                        }}
                                                        onClick={() => screenshotInputRef.current?.click()}
                                                    >
                                                        <FaUpload size={22} className="text-secondary mb-2" />
                                                        <p className="mb-0 small fw-semibold">Click to upload screenshot</p>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '0.72rem' }}>
                                                            PNG, JPG, JPEG · max 5 MB
                                                        </p>
                                                    </div>
                                                    {errors.paymentScreenshot && (
                                                        <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                                                            {errors.paymentScreenshot}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="position-relative d-inline-block">
                                                    <img
                                                        src={screenshotPreview}
                                                        alt="Payment screenshot preview"
                                                        className="rounded border"
                                                        style={{
                                                            maxHeight: 200,
                                                            maxWidth: '100%',
                                                            objectFit: 'contain',
                                                            display: 'block',
                                                        }}
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        className="position-absolute top-0 end-0 d-flex align-items-center gap-1 m-1 py-0 px-1"
                                                        style={{ fontSize: '0.72rem' }}
                                                        onClick={handleRemoveScreenshot}
                                                        title="Remove screenshot"
                                                    >
                                                        <FaTimesCircle size={11} /> Remove
                                                    </Button>
                                                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>
                                                        {paymentScreenshot?.name}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Hidden file input */}
                                            <input
                                                ref={screenshotInputRef}
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                style={{ display: 'none' }}
                                                onChange={handleScreenshotChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* ── RIGHT: Order Summary ── */}
                    <Col lg={4} className="position-sticky" style={{ top: "90px", alignSelf: "flex-start" }}>
                        <Card className="border rounded shadow-sm ">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Order Summary</h6>

                                {/* Item list */}
                                <div className="mb-3" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {items.length === 0 ? (
                                        <p className="text-muted small text-center">No items</p>
                                    ) : items.map((item, i) => (
                                        <div key={i} className="d-flex align-items-center gap-2 mt-3">
                                            <div className="position-relative flex-shrink-0">
                                                <Image
                                                    src={`http://localhost:80/estrada_closet_be/${item.product_image}`}
                                                    rounded
                                                    style={{ width: 52, height: 64, objectFit: 'cover' }}
                                                />
                                                <Badge
                                                    bg="dark"
                                                    className="position-absolute top-0 start-100 translate-middle"
                                                    style={{ fontSize: '0.65rem' }}
                                                >
                                                    {item.quantity}
                                                </Badge>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="mb-0 fw-semibold text-truncate small">{item.product_name}</p>
                                                <small className="text-muted">{item.size_name} · {item.color_name}</small>
                                            </div>
                                            <span className="small fw-semibold text-nowrap">
                                                ₱{getCommaWithDecimal(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <hr />

                                {/* Totals */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Subtotal</span>
                                    <span className="small fw-semibold">₱{getCommaWithDecimal(subtotal)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted small d-flex align-items-center gap-1">
                                        {fulfillment === 'delivery' ? <FaTruck size={11} /> : <FaStore size={11} />}
                                        {fulfillment === 'delivery' ? 'Delivery Fee' : 'Store Pickup'}
                                    </span>
                                    <span className="small fw-semibold">
                                        {fulfillment === 'delivery'
                                            ? `₱${getCommaWithDecimal(DELIVERY_FEE)}`
                                            : fulfillment === 'pickup'
                                                ? <span className="text-success">Free</span>
                                                : null
                                        }
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between mb-4">
                                    <span className="fw-bold">Total</span>
                                    <span className="fw-bold text-success fs-5">
                                        ₱{getCommaWithDecimal(total)}
                                    </span>
                                </div>

                                <Button
                                    variant="dark"
                                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                >
                                    {placing
                                        ? <><Spinner size="sm" animation="border" /> Processing…</>
                                        : <><FaLock /> Place Order</>
                                    }
                                </Button>

                                <p className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
                                    <FaLock className="me-1" />
                                    Your information is kept secure.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
};