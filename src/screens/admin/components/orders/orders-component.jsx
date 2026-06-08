import React, { useEffect, useState } from 'react'
import {
    Card, Table, Badge, Button, Modal, Form,
    InputGroup, Row, Col, Image
} from 'react-bootstrap'
import { FaSearch, FaEye, FaTruck, FaStore, FaMoneyBillWave, FaMobile } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { getOrders, updateStatusOrder } from '../../../../services/order/order-services'
import { formatCurrency, formatDate, formatStatus } from '../../../../config/functions'
import { ORDER_STATUSES, PAYMENT_BADGE, STATUS_BADGE } from './constants/order-component-constants'

export const OrdersComponentTab = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrders();
                if (response.status === 200) {
                    setOrders(response.data || [])
                } else {
                    toast.error('Failed to load orders');
                }
            } catch (error) {
                toast.error('Failed to load orders: ' + error.message)
            }
        }
        fetchOrders()
    }, [flag])

    // ── Filtering
    const filteredOrders = orders.filter(o => {
        const matchStatus = statusFilter === 'all' || o.order_status === statusFilter
        const q = search.toLowerCase()
        const matchSearch = !q ||
            o.order_number.toLowerCase().includes(q) ||
            `${o.first_name} ${o.last_name}`.toLowerCase().includes(q) ||
            (o.email || '').toLowerCase().includes(q) ||
            o.phone.includes(q)
        return matchStatus && matchSearch
    })

    // ── Modal
    const openModal = (order) => {
        setSelectedOrder(order)
        setNewStatus(order.order_status)
        setShowModal(true)
    }

    const handleUpdateStatus = async () => {
        if (!selectedOrder || selectedOrder === undefined) return;
        try {
            const response = await updateStatusOrder(selectedOrder.order_id, selectedOrder.items, newStatus)
            if (response.status === 200) {
                toast.success('Order status updated!')
                setShowModal(false)
                setFlag(!flag)
            } else {
                toast.error('Failed to update status.')
            }
        } catch (error) {
            toast.error('Failed to update status: ' + error.message)
        }
    }

    return (
        <React.Fragment>
            <Card className="shadow-sm border">
                <Card.Body>

                    {/* Toolbar */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search orders, customer..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </InputGroup>

                        {/* Status filter pills */}
                        <div className="d-flex flex-wrap gap-2">
                            {['all', ...ORDER_STATUSES].map(s => (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={statusFilter === s ? 'dark' : 'outline-secondary'}
                                    style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                                    onClick={() => setStatusFilter(s)}
                                >
                                    {s === 'all' ? 'All' : formatStatus(s)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Fulfillment</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-4">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <div className="fw-semibold">{order.order_number}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {formatDate(order.created_at)}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="fw-semibold">{order.first_name} {order.last_name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.email}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{order.phone}</div>
                                    </td>

                                    <td>
                                        <Badge bg="secondary" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                            {order.fulfillment_method === 'pickup'
                                                ? <><FaStore size={10} /> Pickup</>
                                                : <><FaTruck size={10} /> Delivery</>
                                            }
                                        </Badge>
                                    </td>

                                    <td className="fw-semibold text-success">
                                        {formatCurrency(order.total_amount)}
                                    </td>

                                    <td>
                                        <Badge bg={PAYMENT_BADGE[order.payment_status] || 'secondary'} className="mb-1 d-block" style={{ width: 'fit-content' }}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </Badge>
                                        <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                            {order.payment_method === 'gcash' ? <FaMobile size={10} /> : <FaMoneyBillWave size={10} />}
                                            {order.payment_method.toUpperCase()}
                                        </span>
                                    </td>

                                    <td>
                                        <Badge bg={STATUS_BADGE[order.order_status] || 'secondary'}>
                                            {formatStatus(order.order_status)}
                                        </Badge>
                                    </td>

                                    <td className="text-center">
                                        <Button
                                            variant="outline-dark"
                                            size="sm"
                                            onClick={() => openModal(order)}
                                        >
                                            <FaEye className="me-1" /> View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>

            {/* ── Order Detail Modal ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Order #{selectedOrder?.order_number}
                        <Badge
                            bg={STATUS_BADGE[selectedOrder?.order_status] || 'secondary'}
                            className="ms-2"
                            style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}
                        >
                            {formatStatus(selectedOrder?.order_status || '')}
                        </Badge>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedOrder && (
                        <Row>
                            {/* Left: Customer & Payment */}
                            <Col md={6}>
                                <p className="fw-semibold mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Customer Info
                                </p>
                                <InfoRow label="Name" value={`${selectedOrder?.first_name} ${selectedOrder?.last_name}`} />
                                <InfoRow label="Email" value={selectedOrder?.email || '—'} />
                                <InfoRow label="Phone" value={selectedOrder?.phone} />

                                <p className="fw-semibold mb-2 mt-3" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Fulfillment
                                </p>
                                <InfoRow
                                    label="Method"
                                    value={<Badge bg="secondary">{selectedOrder?.fulfillment_method === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}</Badge>}
                                />
                                {selectedOrder?.fulfillment_method === 'delivery' && (
                                    <>
                                        <InfoRow
                                            label="Address"
                                            value={`${selectedOrder?.street}, ${selectedOrder?.barangay}, ${selectedOrder?.city}, ${selectedOrder?.province} ${selectedOrder?.zip_code}`}
                                        />
                                        {selectedOrder?.delivery_notes && (
                                            <InfoRow label="Notes" value={selectedOrder?.delivery_notes} />
                                        )}
                                    </>
                                )}

                                <p className="fw-semibold mb-2 mt-3" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Payment
                                </p>
                                <InfoRow
                                    label="Method"
                                    value={selectedOrder?.payment_method.toUpperCase()}
                                />
                                {selectedOrder?.gcash_sender_number && (
                                    <InfoRow label="GCash Sender" value={selectedOrder?.gcash_sender_number} />
                                )}
                                <InfoRow
                                    label="Status"
                                    value={
                                        <Badge bg={PAYMENT_BADGE[selectedOrder?.payment_status] || 'secondary'}>
                                            {selectedOrder?.payment_status.charAt(0).toUpperCase() + selectedOrder?.payment_status.slice(1)}
                                        </Badge>
                                    }
                                />
                                {selectedOrder?.payment_screenshot && (
                                    <div className="mt-2">
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Payment screenshot: </span>
                                        <a
                                            href={`http://localhost:80/estrada_closet_be/${selectedOrder?.payment_screenshot}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            View
                                        </a>
                                    </div>
                                )}
                            </Col>

                            {/* Right: Items & Totals */}
                            <Col md={6}>
                                <p className="fw-semibold mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Order Items
                                </p>

                                {selectedOrder?.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="d-flex align-items-start gap-2 mb-2 pb-2"
                                        style={{ borderBottom: '1px solid #f0f0f0' }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center bg-light rounded flex-shrink-0"
                                            style={{ width: 44, height: 44, fontSize: '1.2rem' }}
                                        >
                                            <Image
                                                src={`http://localhost:80/estrada_closet_be/${item?.image}`}
                                                rounded
                                                style={{ width: 60, height: 60, objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{item?.product_name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {item?.brand} · Size: {item?.size} · Color: {item?.color} · Qty: {item?.quantity}
                                            </div>
                                        </div>
                                        <div className="fw-semibold text-success" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                            {formatCurrency(item?.price * item?.quantity)}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-3 pt-2" style={{ borderTop: '1px solid #dee2e6' }}>
                                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-muted">Subtotal</span>
                                        <span>{formatCurrency(selectedOrder?.subtotal)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-muted">Delivery fee</span>
                                        <span>{formatCurrency(selectedOrder?.delivery_fee)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between fw-bold" style={{ fontSize: '0.95rem' }}>
                                        <span>Total</span>
                                        <span className="text-success">{formatCurrency(selectedOrder?.total_amount)}</span>
                                    </div>
                                </div>

                                {/* Update status */}
                                <p className="fw-semibold mb-2 mt-4" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Update Order Status
                                </p>
                                <Form.Select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    disabled={selectedOrder?.order_status === "cancelled" || selectedOrder?.order_status === "completed"}
                                >
                                    {ORDER_STATUSES.map(s => (
                                        <option key={s} value={s}>{formatStatus(s)}</option>
                                    ))}
                                </Form.Select>

                                <p className="fw-semibold mb-2 mt-3" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>
                                    Placed On
                                </p>
                                <span style={{ fontSize: '0.85rem' }}>{formatDate(selectedOrder?.created_at)}</span>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} >Close</Button>
                    {(selectedOrder?.order_status !== 'cancelled' && selectedOrder?.order_status !== 'completed') && (
                        <Button
                            variant="dark"
                            onClick={handleUpdateStatus}
                        >
                            Save Status
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}

// ── Small helper component
const InfoRow = ({ label, value }) => (
    <div className="d-flex justify-content-between gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
        <span className="text-muted flex-shrink-0">{label}</span>
        <span className="text-end fw-semibold">{value}</span>
    </div>
)