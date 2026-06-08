import { ADD_TO_CART, DELETE_BULK_CART_ITEM, DELETE_CART_ITEM, GET_CART_BY_IDS, GET_CART_ITEM_COUNT, GET_CART_ITEMS, VALIDATE_CART_ITEM_QUANTITY } from "../../constants/api-url/cart/cart-url";
import { axiosInstance } from "../axios-instance";

export const createCartItem = async (item) => {
    const response = await axiosInstance.post(ADD_TO_CART, item);
    return response;
};

export const getCartItems = async () => {
    const response = await axiosInstance.get(GET_CART_ITEMS);
    return response;
};

export const getCartItemCount = async () => {
    const response = await axiosInstance.get(GET_CART_ITEM_COUNT);
    return response;
};

export const deleteCartItem = async (id) => {
    const response = await axiosInstance.delete(`${DELETE_CART_ITEM}?id=${id}`);
    return response;
};

export const deleteBulkCartItem = async (cartIds) => {
    const response = await axiosInstance.post(DELETE_BULK_CART_ITEM, { cart_ids: cartIds });
    return response;
};

export const getCartItemByIds = async (cartIds) => {
    const response = await axiosInstance.get(GET_CART_BY_IDS, {
        params: {
            ids: cartIds.join(',')
        }
    });
    return response;
};

export const validateCartItemQuantity = async (items) => {
    const response = await axiosInstance.post(VALIDATE_CART_ITEM_QUANTITY, { items })
    return response;
};