
import { ADD_SIZE, DELETE_SIZE, GET_SIZES } from "../../constants/api-url/size/size-url";
import { axiosInstance } from "../axios-instance";

export const createSize = async (data) => {
    const response = await axiosInstance.post(ADD_SIZE, data);
    return response;
};

export const getSizes = async () => {
    const response = await axiosInstance.get(GET_SIZES);
    return response;
};

export const deleteSize = async (id) => {
    const response = await axiosInstance.delete(DELETE_SIZE, {
        params: { id }
    });
    return response;
}