import { useEffect, useState } from "react";
import {
  checkConnectionMayChamCongServices,
  getAllNhanVienMayChamCongServices,
  createNhanVienMayChamCongServices,
  deleteNhanVienMayChamCongServices,
  deleteFingerprintDBAndMayChamCongServices,
  syncFingerprintsToDBServices,
  uploadFingerprintsToMayChamCongServices,
} from "../../services/maychamongServices";

export const useMayChamCong = () => {
  const [isLoadingMayChamCong, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [danhSachNhanVienMayChamCong, setDanhSachNhanVienMayChamCong] =
    useState([]);
  const [isCreatedNhanVienMayChamCong, setIsCreatedNhanVienMayChamCong] =
    useState(false);
  const [isDeletedNhanVienMayChamCong, setIsDeletedNhanVienMayChamCong] =
    useState(false);
  const [isDeletedVanTay, setIsDeletedVanTay] = useState(false);
  const [isUploadtedVanTayDenMayChamCong, setIsUploadtedVanTayDenMayChamCong] =
    useState(false);
  const [isSyncDataVanTay, setIsSyncDataVanTay] = useState(false);

  const checkConnection = async (host, port) => {
    setIsLoading(true);
    setIsConnected(false);

    try {
      const res = await checkConnectionMayChamCongServices(host, port);
      if (res === 200) {
        setIsConnected(true);
        return true;
      } else {
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.log(error);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllNhanVienMayChamCong = async () => {
    setIsLoading(true);
    try {
      const res = await getAllNhanVienMayChamCongServices();
      setDanhSachNhanVienMayChamCong(res.data.employees);
      return true;
    } catch {
      setDanhSachNhanVienMayChamCong([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createNhanVienMayChamCong = async (dataNhanVienMayChamCong) => {
    setIsLoading(true);
    try {
      await createNhanVienMayChamCongServices(dataNhanVienMayChamCong);
      setIsCreatedNhanVienMayChamCong(true);
      return true;
    } catch {
      setIsCreatedNhanVienMayChamCong(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNhanVienMayChamCong = async (maNhanVien) => {
    setIsLoading(true);
    try {
      await deleteNhanVienMayChamCongServices(maNhanVien);
      setIsDeletedNhanVienMayChamCong(true);
      return true;
    } catch {
      setIsDeletedNhanVienMayChamCong(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFingerprintDBAndMayChamCong = async (
    maNhanVien,
    viTriNgonTay
  ) => {
    setIsLoading(true);
    try {
      await deleteFingerprintDBAndMayChamCongServices(maNhanVien, viTriNgonTay);
      setIsDeletedVanTay(true);
      return true;
    } catch {
      setIsDeletedVanTay(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncFingerprintsToDB = async () => {
    setIsLoading(true);
    try {
      await syncFingerprintsToDBServices();
      setIsSyncDataVanTay(true);
      return true;
    } catch (error) {
      setIsSyncDataVanTay(false);
      console.log("Lỗi trong quá trình đồng bộ vân tay: ", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFingerprintsToMayChamCong = async (nhanVienIds) => {
    setIsLoading(true);
    try {
      await uploadFingerprintsToMayChamCongServices(nhanVienIds);
      setIsUploadtedVanTayDenMayChamCong(true);
      return true;
    } catch (error) {
      setIsUploadtedVanTayDenMayChamCong(false);
      console.log("Lỗi trong quá trình đồng bộ vân tay: ", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    const handleSyncData = async () => {
      if (isCreatedNhanVienMayChamCong || isDeletedNhanVienMayChamCong || isDeletedVanTay || isSyncDataVanTay) {
        await getAllNhanVienMayChamCong();
        // Reset tất cả các trạng thái cờ sau khi đã gọi API để tránh vòng lặp không mong muốn
        setIsCreatedNhanVienMayChamCong(false);
        setIsDeletedNhanVienMayChamCong(false);
        setIsDeletedVanTay(false);
        setIsSyncDataVanTay(false);
      }
    };

    handleSyncData();
  }, [
    isCreatedNhanVienMayChamCong,
    isDeletedNhanVienMayChamCong,
    isDeletedVanTay,
    isSyncDataVanTay,
  ]);

  return {
    danhSachNhanVienMayChamCong,
    isLoadingMayChamCong,
    isConnected,
    isDeletedVanTay,
    isUploadtedVanTayDenMayChamCong,
    checkConnection,
    getAllNhanVienMayChamCong,
    createNhanVienMayChamCong,
    deleteNhanVienMayChamCong,
    deleteFingerprintDBAndMayChamCong,
    syncFingerprintsToDB,
    uploadFingerprintsToMayChamCong,
  };
};