import { useState } from 'react';
import { createDuLieuQuetVanTayServices } from '../../services/dulieuquetvantayServices';

export const useDuLieuQuetVanTay = () => {
    const [loading, setLoading] = useState(false);

    const createDuLieuQuetVanTay = async (duLieuQuetVanTay) => {
        setLoading(true);
        try {
            const response = await createDuLieuQuetVanTayServices(duLieuQuetVanTay);
            return response; // Trả về response để kiểm tra kết quả
        } catch (error) {
            console.error('Lỗi trong useDuLieuQuetVanTay:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        createDuLieuQuetVanTay,
        loading
    };
};