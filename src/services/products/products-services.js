import { ADD_PRODUCT, DELETE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT } from "../../constants/api-url/products/products-url";
import { axiosInstance } from "../axios-instance";

export const addProduct = async (data) => {
    const response = await axiosInstance.post(ADD_PRODUCT, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

export const getProducts = async () => {
    const response = await axiosInstance.get(GET_PRODUCTS);
    return response;
};

export const updateProduct = async (id, data) => {
    const response = await axiosInstance.post(`${UPDATE_PRODUCT}?id=${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response;
};

export const deleteProduct = async (id) => {
    const response = await axiosInstance.post(`${DELETE_PRODUCT}?id=${id}`);
    return response;
};