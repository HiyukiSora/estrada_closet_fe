import React, { useState } from 'react'
import { Button, Form, Modal} from 'react-bootstrap'
import './styles/cancel-order-modal-styles.css'

const REASONS = [
    { value: "Changed my mind", desc: "I no longer want this item." },
    { value: "Found a better price", desc: "I found it cheaper elsewhere." },
    { value: "Ordered by mistake", desc: "I accidentally placed this order." },
    { value: "Taking too long", desc: "Delivery or processing is too slow." },
    { value: "Other", desc: "I have a different reason." },
];

export const CancelOrderModal = ({ show, order, onClose, onConfirm }) => {
    const [selected, setSelected] = useState("");
    const [otherText, setOtherText] = useState("");
    const [cancelled, setCancelled] = useState(false);

    const isOther = selected === "Other";
    const canConfirm = selected && (!isOther || otherText.trim().length > 0);
    const finalReason = isOther ? otherText.trim() : selected;

    const handleConfirm = () => {
        if (!canConfirm) return;
        setCancelled(true);
        onConfirm?.(order, finalReason);
    };

    const handleClose = () => {
        onClose?.();
        // reset after close animation finishes
        setTimeout(() => { setSelected(""); setOtherText(""); setCancelled(false); }, 300);
    };

    return (
        <React.Fragment>
            <Modal
                show={show}
                onHide={handleClose}
                centered
                dialogClassName="cancel-modal"
                backdrop="static"
                keyboard={false}
                onHide={onClose}
            >
                <Modal.Header closeButton>
                    <div>
                        <div className="cancel-status-badge">
                            <span className="dot" />
                            <span>Cancel order</span>
                        </div>
                        <Modal.Title
                            as="p"
                            style={{ fontSize: 16, fontWeight: 600, margin: "0 0 3px", color: "#1a1208", fontFamily: "inherit" }}
                        >
                            Why are you cancelling?
                        </Modal.Title>
                        <p style={{ fontSize: 13, color: "#9e9185", margin: 0 }}>
                            Let us know so we can improve your experience.
                        </p>
                    </div>
                </Modal.Header>

                <Modal.Body>
                    {!cancelled ? (
                        <>
                            <div>
                                {REASONS.map((r) => (
                                    <label
                                        key={r.value}
                                        className={`reason-label${selected === r.value ? " selected" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancel_reason"
                                            value={r.value}
                                            checked={selected === r.value}
                                            onChange={() => setSelected(r.value)}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1208" }}>
                                                {r.value}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#9e9185", marginTop: 2 }}>
                                                {r.desc}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {isOther && (
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Please describe your reason..."
                                    value={otherText}
                                    onChange={(e) => setOtherText(e.target.value)}
                                    className="other-textarea mt-2"
                                />
                            )}
                        </>
                    ) : (
                        <div className="text-center py-2">
                            <div className="cancelled-icon">✕</div>
                            <p style={{ fontSize: 16, fontWeight: 600, color: "#1a1208", margin: "0 0 6px" }}>
                                Order cancelled
                            </p>
                            <p style={{ fontSize: 13, color: "#9e9185", margin: "0 0 12px", lineHeight: 1.5 }}>
                                We've noted your reason:{" "}
                                <strong style={{ color: "#1a1208" }}>{finalReason}</strong>
                            </p>
                            <p style={{ fontSize: 12, color: "#b0a89a", margin: 0 }}>
                                A refund will be processed within 3–5 business days.
                            </p>
                        </div>
                    )}
                </Modal.Body>

                {!cancelled && (
                    <Modal.Footer className="d-flex">
                        <Button className="btn-keep" onClick={handleClose}>
                            Keep order
                        </Button>
                        <Button
                            className="btn-confirm"
                            disabled={!canConfirm}
                            onClick={handleConfirm}
                        >
                            Confirm cancel
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </React.Fragment>
    );
}
