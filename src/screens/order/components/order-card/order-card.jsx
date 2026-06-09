import React, { useState } from "react";
import { formatAddress, formatDate, getCommaWithDecimal, getCommaWithDecimalEnPh, STATUS_CONFIG } from "../../../../config/functions";
import { imageUrl } from "../../../../config/image-base";
import { btnStyle } from "../../styles/order-style";
import { ItemImage } from "../item-thumb/item-thumb";
import { CancelOrderModal } from "../cancel-order-modal/cancel-order-modal";
import { toast } from "react-toastify";
import { cancelOrder } from "../../../../services/order/order-services";
import { ReceiptModal } from "../../../../components/receipt-modal/receipt-modal";

export const OrderCard = ({ order, isOpen, onToggle }) => {
    const cfg = STATUS_CONFIG[order.status];
    const [showCancel, setShowCancel] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    const handleCancelOrder = async (orderId, reason) => {
        if (orderId === undefined || orderId === null) {
            toast.error("Please select an item before checkout.")
            return;
        }

        try {
            const response = await cancelOrder(orderId, reason);

            if (response.status === 200) {
                toast.success("Order cancelled successfully.");
                setShowCancel(false);
            } else {
                toast.error("Failed to cancel the order. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while cancelling the order. Please try again later.", error);
        }
    };

    return (
        <React.Fragment>
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1.5px solid #ede8e3",
                    overflow: "hidden",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease",
                    boxShadow: isOpen
                        ? "0 12px 40px rgba(0,0,0,0.1)"
                        : "0 2px 12px rgba(0,0,0,0.05)",
                    transform: isOpen ? "translateY(-2px)" : "none",
                }}
            >
                {/* ── Card Header ── */}
                <button
                    onClick={onToggle}
                    style={{
                        width: "100%",
                        padding: "20px 24px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        textAlign: "left",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                        {/* Status dot + badge */}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 12px",
                                borderRadius: 99,
                                background: cfg?.bg,
                                color: cfg?.color,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: cfg?.dot,
                                    display: "inline-block",
                                    animation: order.status === "processing" ? "pulse 1.6s ease-in-out infinite" : "none",
                                }}
                            />
                            {cfg?.label}
                        </span>

                        {/* Order meta */}
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#1a1208", fontWeight: 400 }}>
                                    {order.order_number}
                                </span>
                                <span style={{ color: "#b0a89a", fontSize: 12 }}>·</span>
                                <span style={{ color: "#b0a89a", fontSize: 12 }}>{formatDate(order.created_at)}</span>
                            </div>
                            <div style={{ color: "#9e9185", fontSize: 12, marginTop: 2 }}>
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                &ensp;·&ensp;
                                {order.fulfillment_method === "pickup" ? "🏪 Store Pickup" : "🚚 Delivery"}
                                &ensp;·&ensp;
                                {order.payment_method === "gcash" ? "📱 GCash" : "💵 Cash"}
                            </div>
                        </div>
                    </div>

                    {/* Total + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1a1208" }}>
                            ₱{getCommaWithDecimal(order.total_amount)}
                        </span>
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: isOpen ? "#1a1208" : "#f5f0eb",
                                color: isOpen ? "#fff" : "#7a6e65",
                                fontSize: 13,
                                transition: "all 0.25s ease",
                                flexShrink: 0,
                            }}
                        >
                            {isOpen ? "↑" : "↓"}
                        </span>
                    </div>
                </button>

                {/* ── Expanded Detail ── */}
                <div
                    style={{
                        maxHeight: isOpen ? 600 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                >
                    <div style={{ padding: "0 24px 24px", borderTop: "1.5px solid #f0ebe5" }}>
                        {/* Items */}
                        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {order.items.map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "12px 14px",
                                        background: "#faf7f4",
                                        borderRadius: 14,
                                        border: "1px solid #ede8e3",
                                    }}
                                >
                                    <ItemImage image={imageUrl(item.image)} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1208", marginBottom: 3 }}>
                                            {item.product_name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#9e9185" }}>
                                            Size {item.size} · {item.color}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1208" }}>
                                            ₱{getCommaWithDecimal(item.price * item.quantity)}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#b0a89a" }}>× {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Delivery address */}
                        {order.fulfillment_method === "delivery" && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: "10px 14px",
                                    background: "#f5f0eb",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    color: "#7a6e65",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 8,
                                }}
                            >
                                <span style={{ marginTop: 1 }}>📍</span>
                                <span>{formatAddress(order)}</span>
                            </div>
                        )}

                        {/* Price breakdown */}
                        <div
                            style={{
                                marginTop: 16,
                                padding: "16px 18px",
                                background: "#faf7f4",
                                borderRadius: 14,
                                border: "1.5px solid #ede8e3",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#9e9185" }}>
                                <span>Subtotal</span>
                                <span>₱{getCommaWithDecimalEnPh(order.subtotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, color: "#9e9185" }}>
                                <span>Delivery Fee</span>
                                <span style={{ color: order.delivery_fee === 0 ? "#059669" : "#9e9185" }}>
                                    {order.delivery_fee === 0 ? "Free" : `₱${getCommaWithDecimalEnPh(order.delivery_fee)}`}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingTop: 12,
                                    borderTop: "1.5px solid #ede8e3",
                                }}
                            >
                                <span style={{ fontWeight: 700, color: "#1a1208", fontSize: 14 }}>Total</span>
                                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1a1208" }}>
                                    ₱{getCommaWithDecimalEnPh(order.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                            {(order.status === "pending" || order.status === "processing") && (
                                <button style={btnStyle("#dc2626", "#fff")} onClick={() => setShowCancel(true)}>
                                    ✕ Cancel Order
                                </button>
                            )}
                            {order.status === "completed" && (
                                <button style={btnStyle("transparent", "#7a6e65", "#ede8e3")} onClick={() => setShowReceipt(true)}>
                                    📋 View Receipt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showCancel && (
                <CancelOrderModal
                    show={showCancel}
                    order={order}
                    onClose={() => setShowCancel(false)}
                    onConfirm={(order, reason) => handleCancelOrder(order.order_id, reason)}
                />
            )}
            {showReceipt && (
                <ReceiptModal
                    show={showReceipt}
                    order={order}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </React.Fragment>
    );
}