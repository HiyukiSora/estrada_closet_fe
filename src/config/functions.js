import { STATUS_COLOR, STATUS_LABEL } from "../constants/constants";

export const stats = (products, orders, revenue) => [
    { label: 'Total Products', value: products.length, color: 'primary' },
    { label: 'Total Orders', value: orders.length, color: 'warning' },
    { label: 'Revenue', value: revenue, color: 'danger' },
];

export const validateForm = (form) => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Product name is required.';
    if (!form.brand.trim()) errors.brand = 'Brand is required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    if (!form.sizes || form.sizes.length === 0)
        errors.sizes = 'Please select at least one size.';
    if (!form.colors || form.colors.length === 0)
        errors.colors = 'Please select at least one color.';
    if (!form.image && !form.imagePreview)
        errors.image = 'Please upload a product image.';
    if (Number(form.price) < 0) {
        errors.price = 'Price cannot be negative';
    }
    if (Number(form.stock) < 0) {
        errors.stock = 'Stock cannot be negative';
    }
    return errors;
};

export const fetchProductSizeCategories = (product) => {
    return product?.sizes || [];
};

export const priceRanges = [
    { label: 'Under ₱50', value: 'under50' },
    { label: '₱50 – ₱100', value: '50to100' },
    { label: '₱100 – ₱200', value: '100to200' },
    { label: 'Above ₱200', value: 'above200' },
];

export const getCommaWithDecimal = (data) => {
    return data?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const getCommaWithDecimalEnPh = (n) => {
    return n?.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const getSelectedItems = (cartItems, selectedIds) => {
    return cartItems?.filter(item => selectedIds.has(item.cart_id));
};

export const fetchQuantitiesPrice = (checkoutItems) => {
    return checkoutItems.map(item => ({
        cart_id: item.cart_id,
        quantity: item.quantity
    }));
};

export const fmt = (n) =>
    Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

export const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
    processing: { label: "Processing", color: "#d97706", bg: "#fef3c7", dot: "#f59e0b" },
    out_for_delivery: { label: "Out for Delivery", color: "#7c3aed", bg: "#ede9fe", dot: "#8b5cf6" },
    ready_for_pickup: { label: "Ready for Pickup", color: "#0ea5e9", bg: "#e0f2fe", dot: "#38bdf8" },
    confirmed: { label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe", dot: "#3b82f6" },
    cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", dot: "#ef4444" },
    completed: { label: "Completed", color: "#16a34a", bg: "#dcfce7", dot: "#22c55e" },
};

export const countOf = (s, orderList) => {
    return orderList?.filter(o => o.status === s).length
};

export const formatAddress = (order) => {
    const parts = [
        order.street,
        order.barangay,
        order.city,
        order.province,
        order.zip_code
    ];

    return parts
        .filter(Boolean)
        .join(", ");
};

export const formatDate = (dt) => {
    const d = new Date(dt)
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
};

export const formatCurrency = (val) => {
    const value = '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value;
};

export const formatStatus = (s) => {
    const value = s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return value;
};

export const generateReceiptPDF = async (order) => {
    // Dynamically import jsPDF so the component tree isn't blocked
    const { jsPDF } = await import("https://cdn.skypack.dev/jspdf@2.5.1");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();   // 595.28
    const PH = doc.internal.pageSize.getHeight();  // 841.89

    const CREAM = [250, 247, 244];
    const INK = [26, 18, 8];
    const MUTED = [158, 145, 133];
    const BORDER = [237, 232, 227];
    const ACCENT = [26, 18, 8];
    const GREEN = [5, 150, 105];

    // ── Background ──────────────────────────────────────────────────────────
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, PW, PH, "F");

    // ── Top accent bar ───────────────────────────────────────────────────────
    doc.setFillColor(...ACCENT);
    doc.rect(0, 0, PW, 6, "F");

    // ── Brand header ─────────────────────────────────────────────────────────
    const headerH = 90;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 22, PW - 80, headerH, 10, 10, "F");
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(1);
    doc.roundedRect(40, 22, PW - 80, headerH, 10, 10, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...INK);
    doc.text("Estrada Closet Co.", 60, 58);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Official Order Receipt", 60, 74);
    doc.text("estradacloset.com", 60, 88);

    // Right-align receipt label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text("RECEIPT", PW - 60, 52, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(order.order_number || "—", PW - 60, 66, { align: "right" });
    doc.text(fmtDate(order.created_at), PW - 60, 80, { align: "right" });

    // ── Status pill ──────────────────────────────────────────────────────────
    const statusColor = STATUS_COLOR[order.status] || "#555";
    const hex2rgb = (h) => {
        const r = parseInt(h.slice(1, 3), 16);
        const g = parseInt(h.slice(3, 5), 16);
        const b = parseInt(h.slice(5, 7), 16);
        return [r, g, b];
    };
    const [sr, sg, sb] = hex2rgb(statusColor);
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(PW - 60 - 80, 90, 80, 18, 9, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text((STATUS_LABEL[order.status] || order.status).toUpperCase(), PW - 60 - 40, 102, { align: "center" });

    let y = 136;

    // ── Order info row ───────────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, y, PW - 80, 52, 8, 8, "F");
    doc.setDrawColor(...BORDER);
    doc.roundedRect(40, y, PW - 80, 52, 8, 8, "S");

    const colW = (PW - 80) / 3;
    const infoItems = [
        { label: "Fulfillment", value: order.fulfillment_method === "pickup" ? "Store Pickup" : "Delivery" },
        { label: "Payment", value: order.payment_method === "gcash" ? "GCash" : "Cash on Delivery" },
        { label: "Items", value: `${order.items?.length || 0} item${(order.items?.length || 0) !== 1 ? "s" : ""}` },
    ];
    infoItems.forEach((item, i) => {
        const cx = 40 + colW * i + colW / 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(item.label.toUpperCase(), cx, y + 18, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(item.value, cx, y + 34, { align: "center" });

        // vertical divider
        if (i < 2) {
            doc.setDrawColor(...BORDER);
            doc.line(40 + colW * (i + 1), y + 8, 40 + colW * (i + 1), y + 44);
        }
    });

    y += 68;

    // ── Items section ────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text("ORDER ITEMS", 40, y);

    doc.setDrawColor(...BORDER);
    doc.line(40, y + 4, PW - 40, y + 4);

    y += 16;

    // Table header
    doc.setFillColor(...INK);
    doc.roundedRect(40, y, PW - 80, 22, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("PRODUCT", 54, y + 14);
    doc.text("SIZE / COLOR", 270, y + 14, { align: "center" });
    doc.text("QTY", 370, y + 14, { align: "center" });
    doc.text("UNIT PRICE", 450, y + 14, { align: "center" });
    doc.text("AMOUNT", PW - 54, y + 14, { align: "right" });

    y += 30;

    (order.items || []).forEach((item, i) => {
        const rowH = 36;
        doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 245, i % 2 === 0 ? 255 : 242);
        doc.rect(40, y, PW - 80, rowH, "F");
        doc.setDrawColor(...BORDER);
        doc.rect(40, y, PW - 80, rowH, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(item.product_name || "—", 54, y + 14, { maxWidth: 190 });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        const variant = [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(" · ");
        doc.text(variant || "—", 54, y + 26, { maxWidth: 190 });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(String(item.quantity || 1), 370, y + 20, { align: "center" });
        doc.text(`${fmt(item.price)}`, 440, y + 20, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.text(`${fmt((item.price || 0) * (item.quantity || 1))}`, PW - 65, y + 20, { align: "right" });

        y += rowH;
    });

    y += 12;

    // ── Delivery address ─────────────────────────────────────────────────────
    if (order.fulfillment_method === "delivery" && order.delivery_address) {
        doc.setFillColor(245, 240, 235);
        doc.roundedRect(40, y, PW - 80, 40, 6, 6, "F");
        doc.setDrawColor(...BORDER);
        doc.roundedRect(40, y, PW - 80, 40, 6, 6, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text("DELIVERY ADDRESS", 54, y + 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        const addr = typeof order.delivery_address === "string"
            ? order.delivery_address
            : [
                order.delivery_address?.street,
                order.delivery_address?.barangay,
                order.delivery_address?.city,
                order.delivery_address?.province,
            ].filter(Boolean).join(", ");
        doc.text(addr || "—", 54, y + 28, { maxWidth: PW - 120 });

        y += 52;
    }

    // ── Totals box ───────────────────────────────────────────────────────────
    const totalsW = 220;
    const totalsX = PW - 40 - totalsW;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(totalsX, y, totalsW, 92, 8, 8, "F");
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(1.5);
    doc.roundedRect(totalsX, y, totalsW, 92, 8, 8, "S");
    doc.setLineWidth(1);

    // Subtotal row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Subtotal", totalsX + 16, y + 22);
    doc.setTextColor(...INK);
    doc.text(`${fmt(order.subtotal)}`, totalsX + totalsW - 25, y + 22, { align: "right" });

    // Delivery fee row
    doc.setTextColor(...MUTED);
    doc.text("Delivery Fee", totalsX + 16, y + 40);
    if (order.delivery_fee === 0) {
        doc.setTextColor(...GREEN);
        doc.text("Free", totalsX + totalsW - 25, y + 40, { align: "right" });
    } else {
        doc.setTextColor(...INK);
        doc.text(`${fmt(order.delivery_fee)}`, totalsX + totalsW - 25, y + 40, { align: "right" });
    }

    // Divider
    doc.setDrawColor(...BORDER);
    doc.line(totalsX + 12, y + 52, totalsX + totalsW - 12, y + 52);

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text("Total", totalsX + 16, y + 72);
    doc.setFontSize(14);
    doc.text(`${fmt(order.total_amount)}`, totalsX + totalsW - 35, y + 72, { align: "right" });

    y += 108;

    // ── Thank-you footer ─────────────────────────────────────────────────────
    doc.setFillColor(...INK);
    doc.roundedRect(40, y, PW - 80, 48, 8, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("Thank you for shopping with Estrada Closet!", PW / 2, y + 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 170, 160);
    doc.text(
        "For questions or concerns, reach us at cherrygraceestrada@gmail.com",
        PW / 2, y + 36, { align: "center" }
    );

    // ── Page number & watermark ──────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`Generated on ${new Date().toLocaleString("en-PH")}`, PW / 2, PH - 20, { align: "center" });

    doc.save(`Receipt-${order.order_number || "order"}.pdf`);
}