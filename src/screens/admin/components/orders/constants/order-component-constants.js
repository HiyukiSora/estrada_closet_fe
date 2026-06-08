export const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'out_for_delivery',
    'completed',
    'cancelled'
]

export const STATUS_BADGE = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    ready_for_pickup: 'success',
    out_for_delivery: 'success',
    completed: 'success',
    cancelled: 'secondary',
}

export const PAYMENT_BADGE = {
    paid: 'success',
    unpaid: 'danger',
    failed: 'warning',
    refunded: 'secondary',
}