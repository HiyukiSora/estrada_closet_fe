import React from 'react';
import { Button, Modal, Image } from 'react-bootstrap';
import './styles/receipt-modal-styles.css';
import { STATUS_COLOR, STATUS_LABEL } from '../../constants/constants';
import { fmt, fmtDate, generateReceiptPDF } from '../../config/functions';
import { imageUrl } from '../../config/image-base';

export const ReceiptModal = ({ show, order, onClose }) => {
    if (!order) return null;

    const statusColor = STATUS_COLOR[order.order_status] || "#555";

    return (
        <React.Fragment>
            <Modal
                show={show}
                onHide={onClose}
                centered
                dialogClassName="receipt-modal"
                backdropClassName="receipt-modal"
                backdrop="static"
            >
                {/* ── Header ── */}
                <Modal.Header>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                                fontFamily: "'Georgia', 'DM Serif Display', serif",
                                fontSize: 18, fontWeight: 400, color: "#1a1208",
                            }}>
                                Order Receipt
                            </span>
                            <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                                padding: "3px 10px", borderRadius: 99,
                                background: statusColor + "18",
                                color: statusColor, textTransform: "uppercase",
                            }}>
                                {STATUS_LABEL[order.order_status] || order.order_status}
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#b0a89a", marginTop: 3 }}>
                            {order.order_number} · {fmtDate(order.created_at)}
                        </div>
                    </div>
                </Modal.Header>

                {/* ── Body ── */}
                <Modal.Body>
                    {/* Order meta pills */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                        {[
                            order.fulfillment_method === "pickup" ? "🏪 Store Pickup" : "🚚 Delivery",
                            order.payment_method === "gcash" ? "📱 GCash" : "💵 Cash",
                        ].map((label) => (
                            <span key={label} style={{
                                padding: "5px 12px", borderRadius: 99, fontSize: 12,
                                background: "#fff", border: "1.5px solid #ede8e3", color: "#7a6e65",
                            }}>
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                            color: "#b0a89a", marginBottom: 10, textTransform: "uppercase",
                        }}>
                            Items Ordered
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(order.items || []).map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "12px 14px",
                                    background: "#fff", borderRadius: 14,
                                    border: "1.5px solid #ede8e3",
                                }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                        background: "#ede8e3", display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: 18,
                                    }}>
                                        <Image
                                                src={imageUrl(item?.image)}
                                                rounded
                                                style={{ width: 60, height: 60, objectFit: 'cover' }}
                                            />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1208", marginBottom: 2 }}>
                                            {item.product_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#b0a89a" }}>
                                            {[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(" · ")}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1208" }}>
                                            ₱{fmt((item.price || 0) * (item.quantity || 1))}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#b0a89a" }}>× {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery address */}
                    {order.fulfillment_method === "delivery" && (
                        <div style={{
                            padding: "10px 14px", borderRadius: 12,
                            background: "#f5f0eb", border: "1px solid #e8e0d8",
                            fontSize: 12, color: "#7a6e65",
                            display: "flex", gap: 8, alignItems: "flex-start",
                            marginBottom: 16,
                        }}>
                            <span>📍</span>
                            <span>
                                {[order?.street,
                                order?.barangay,
                                order?.city,
                                order?.province,
                                ].filter(Boolean).join(", ")}
                            </span>
                        </div>
                    )}

                    {/* Price breakdown */}
                    <div style={{
                        background: "#fff", borderRadius: 16,
                        border: "1.5px solid #ede8e3",
                        overflow: "hidden",
                    }}>
                        {[
                            { label: "Subtotal", value: `₱${fmt(order.subtotal)}` },
                            {
                                label: "Delivery Fee",
                                value: order.delivery_fee === 0 ? "Free" : `₱${fmt(order.delivery_fee)}`,
                                green: order.delivery_fee === 0,
                            },
                        ].map(({ label, value, green }) => (
                            <div key={label} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "12px 16px",
                                borderBottom: "1px solid #f0ebe5",
                                fontSize: 13,
                            }}>
                                <span style={{ color: "#9e9185" }}>{label}</span>
                                <span style={{ color: green ? "#059669" : "#1a1208", fontWeight: green ? 600 : 400 }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "16px", background: "#1a1208",
                        }}>
                            <span style={{ color: "#c8bdb5", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>
                                TOTAL
                            </span>
                            <span style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#fff" }}>
                                ₱{fmt(order.total_amount)}
                            </span>
                        </div>
                    </div>

                    {/* Receipt note */}
                    <div style={{
                        marginTop: 16, padding: "10px 14px",
                        borderRadius: 10, background: "#f5f0eb",
                        fontSize: 11, color: "#b0a89a", textAlign: "center",
                        lineHeight: 1.6,
                    }}>
                        This receipt is proof of your order. Please keep it for reference.<br />
                        For concerns, contact{" "}
                        <span style={{ color: "#7a6e65", fontWeight: 600 }}>cherrygraceestrada@gmail.com</span>
                    </div>
                </Modal.Body>

                {/* ── Footer ── */}
                <Modal.Footer>
                    <Button className="btn-close-footer" onClick={onClose}>
                        Close
                    </Button>
                    <Button className="btn-download" onClick={() => generateReceiptPDF(order)}>
                        <span>↓</span> Download PDF Receipt
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};