import React, { useEffect, useState } from "react";
import { Header } from "../../components/header/header";
import { countOf, STATUS_CONFIG } from "../../config/functions";
import { getOrders } from "../../services/order/order-services";
import { OrderCard } from "./components/order-card/order-card";
import { FilterPill } from "./components/filter-pill/filter-pill";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { logoutUser } from "../../services/auth/auth-services";
import './styles/order-styles.css';

export const Order = () => {
    const navigate = useNavigate();
    const { isAuthenticated, clearAuth } = useAuthStore();
    const [filter, setFilter] = useState("all");
    const [openId, setOpenId] = useState(null);
    const [orderList, setOrderList] = useState([]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch {
        }
        navigate('/');
        clearAuth();
    };

    const filtered = filter === "all"
        ? orderList
        : orderList.filter(o => o.status === filter);

    useEffect(() => {
        const fetchOrders = async () => {
            const response = await getOrders();
            if (response.status === 200) {
                setOrderList(response.data || []);
            } else {
                toast.error('Failed to load order.');
            }
        };

        fetchOrders();
    }, []);

    return (
        <React.Fragment>
            <Header />
            <div style={{ fontFamily: "'Lato', sans-serif", minHeight: "100vh", background: "#f5f0eb" }}>
                {/* ── Hero strip ── */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)",
                        padding: "28px 24px 32px",
                    }}
                >
                    <div style={{ maxWidth: 760, margin: "0 auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ color: "#c9b99a", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                                    Estrada Closet Co.
                                </p>
                                <h1
                                    style={{
                                        fontFamily: "'DM Serif Display', serif",
                                        fontSize: 32,
                                        color: "#fff",
                                        fontWeight: 400,
                                        letterSpacing: "-0.02em",
                                        marginBottom: 14,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Your Orders
                                </h1>
                            </div>
                            {isAuthenticated && (
                                <span
                                    onClick={handleLogout}
                                    style={{
                                        color: "#c9b99a",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        padding: "6px 14px",
                                        border: "1px solid rgba(201,185,154,0.3)",
                                        borderRadius: 8,
                                        transition: "0.2s",
                                        flexShrink: 0,
                                        marginTop: 2,
                                    }}
                                    onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.08)"}
                                    onMouseLeave={e => e.target.style.background = "transparent"}
                                >
                                    Log out
                                </span>
                            )}
                        </div>

                        {/* Summary pills */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {[
                                { emoji: "📦", label: "Total", val: orderList.length },
                                { emoji: "✅", label: "Delivered", val: countOf("delivered", orderList) },
                                { emoji: "⏳", label: "Processing", val: countOf("processing", orderList) },
                            ].map(s => (
                                <div
                                    key={s.label}
                                    style={{
                                        background: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        borderRadius: 12,
                                        padding: "8px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span style={{ fontSize: 14 }}>{s.emoji}</span>
                                    <span style={{ color: "#c9b99a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
                                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'DM Serif Display', serif" }}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Filter bar ── */}
                <div
                    style={{
                        background: "#fff",
                        borderBottom: "1.5px solid #ede8e3",
                        padding: "14px 24px",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            maxWidth: 760,
                            margin: "0 auto",
                            display: "flex",
                            gap: 8,
                            overflowX: "auto",
                            paddingBottom: 2,
                        }}
                    >
                        <FilterPill
                            label="All Orders"
                            active={filter === "all"}
                            onClick={() => setFilter("all")}
                            count={orderList.length}
                        />
                        {["pending",
                            "processing",
                            "confirmed",
                            "ready_for_pickup",
                            "out_for_delivery",
                            "completed",
                            "cancelled"].map(s => (
                                <FilterPill
                                    key={s}
                                    label={STATUS_CONFIG[s]?.label}
                                    active={filter === s}
                                    onClick={() => setFilter(s)}
                                    count={countOf(s, orderList)}
                                />
                            ))}
                    </div>
                </div>

                {/* ── Order list ── */}
                <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 60px" }}>
                    {filtered.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "80px 20px",
                                color: "#b0a89a",
                            }}
                        >
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
                            <div
                                style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: 22,
                                    color: "#7a6e65",
                                    marginBottom: 8,
                                }}
                            >
                                No orders here
                            </div>
                            <div style={{ fontSize: 13 }}>
                                {filter === "all" ? "Start shopping to see your orders." : `No ${filter} orders found.`}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {filtered.map(order => (
                                <div key={order.id} className="order-card-wrap">
                                    <OrderCard
                                        order={order}
                                        isOpen={openId === order.order_id}
                                        onToggle={() => setOpenId(openId === order.order_id ? null : order.order_id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}