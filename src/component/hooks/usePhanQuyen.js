// src/hooks/usePhanQuyen.js
import { useState, useEffect } from 'react';
import phanquyenServices from '../services/phanquyenServices'; // Sẽ tạo ở bước tiếp theo

const usePhanQuyen = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const data = await phanquyenServices.getAllRoles();
                setRoles(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    // Bạn có thể thêm các hàm như addRole, updateRole, deleteRole ở đây
    const addRole = async (newRole) => {
        try {
            setLoading(true);
            const addedRole = await phanquyenServices.createRole(newRole);
            setRoles((prevRoles) => [...prevRoles, addedRole]);
            return addedRole;
        } catch (err) {
            setError(err);
            throw err; // Re-throw để component gọi có thể xử lý
        } finally {
            setLoading(false);
        }
    };

    return { roles, loading, error, addRole }; // Trả về các giá trị và hàm cần thiết
};

export default usePhanQuyen;