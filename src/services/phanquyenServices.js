// src/services/phanquyenServices.js
import axios from 'axios'; // Giả sử bạn đang dùng axios

const API_BASE_URL = 'http://your-api-url/api/phan-quyen'; // Thay thế bằng URL API thực tế của bạn

const phanquyenServices = {
    getAllRoles: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching roles:", error);
            throw error;
        }
    },

    getRoleById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching role with ID ${id}:`, error);
            throw error;
        }
    },

    createRole: async (roleData) => {
        try {
            const response = await axios.post(API_BASE_URL, roleData);
            return response.data;
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    },

    updateRole: async (id, roleData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, roleData);
            return response.data;
        } catch (error) {
            console.error(`Error updating role with ID ${id}:`, error);
            throw error;
        }
    },

    deleteRole: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting role with ID ${id}:`, error);
            throw error;
        }
    },
};

export default phanquyenServices;