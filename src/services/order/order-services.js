import { CANCEL_ORDER, GET_ORDER, PLACE_ORDER, UPDATE_STATUS_ORDER } from "../../constants/api-url/order/order-url";
import { axiosInstance } from "../axios-instance";

export const placeOrder = async (data) => {
    const response = await axiosInstance.post(PLACE_ORDER, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

export const getOrders = async () => {
    const response = await axiosInstance.get(GET_ORDER);
    return response;
};

export const cancelOrder = async (id, reason) => {
    const response = await axiosInstance.post(CANCEL_ORDER, { order_id: id, reason: reason });
    return response
};

export const updateStatusOrder = async (order_id , items, newStatus) => {
    const response = await axiosInstance.post(UPDATE_STATUS_ORDER, { order_id: order_id , items: items, status: newStatus });
    return response;
};