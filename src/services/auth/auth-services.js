import { LOGIN_URL, REGISTER_URL, VERIFY_URL, LOGOUT_URL } from "../../constants/api-url/auth/auth-url";
import { axiosInstance } from "../axios-instance";

export const registerUser = async (data) => {
    const response = await axiosInstance.post(REGISTER_URL, data);
    return response;
};

export const loginUser = async (data) => {
    const response = await axiosInstance.post(LOGIN_URL, data);
    return response;
};

export const verifyToken = async () => {
    const response = await axiosInstance.get(VERIFY_URL);
    return response;
};

export const logoutUser = async () => {
    const response = await axiosInstance.post(LOGOUT_URL);
    return response;
};
