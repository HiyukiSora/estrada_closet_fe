import { ADD_COLOR, DELETE_COLOR, GET_COLORS } from "../../constants/api-url/color/color-url";
import { axiosInstance } from "../axios-instance";

export const createColor = async (data) => {
    const response = await axiosInstance.post(ADD_COLOR, data);
    return response;
};

export const getColors = async () => {
    const response = await axiosInstance.get(GET_COLORS);
    return response;
};

export const deleteColor = async (id) => {
    const response = await axiosInstance.delete(DELETE_COLOR, {
        params: { id }
    });
    return response;
}