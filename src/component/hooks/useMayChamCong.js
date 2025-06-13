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
    setIsLoading(true); // Thêm loading
    try {
      await deleteNhanVienMayChamCongServices(maNhanVien);
      setIsDeletedNhanVienMayChamCong(true);
      return true;
    } catch {
      setIsDeletedNhanVienMayChamCong(false);
      return false;
    } finally {
      setIsLoading(false); // Thêm finally block
    }
  };

  const deleteFingerprintDBAndMayChamCong = async (
    maNhanVien,
    viTriNgonTay
  ) => {
    setIsLoading(true); // Thêm loading
    try {
      await deleteFingerprintDBAndMayChamCongServices(maNhanVien, viTriNgonTay);
      setIsDeletedVanTay(true);
      return true;
    } catch {
      setIsDeletedVanTay(false);
      return false;
    } finally {
      setIsLoading(false); // Thêm finally block
    }
  };

  const syncFingerprintsToDB = async () => {
    try {
      await syncFingerprintsToDBServices();
      setIsSyncDataVanTay(true);
    } catch (error) {
      setIsSyncDataVanTay(false);
      console.log("Lỗi trong quá trình đồng bộ vân tay: ", error);
    }
  };

  const uploadFingerprintsToMayChamCong = async (nhanVienIds) => {
    try {
      await uploadFingerprintsToMayChamCongServices(nhanVienIds);
      setIsUploadtedVanTayDenMayChamCong(true);
    } catch (error) {
      setIsUploadtedVanTayDenMayChamCong(false);
      console.log("Lỗi trong quá trình đồng bộ vân tay: ", error);
    }
  };

  // Tách riêng useEffect cho sync fingerprints
  useEffect(() => {
    syncFingerprintsToDB();
  }, []);

  // Tách riêng useEffect cho handle sync data
  useEffect(() => {
    const handleSyncData = async () => {
      if (isCreatedNhanVienMayChamCong || isDeletedNhanVienMayChamCong) {
        await getAllNhanVienMayChamCong();
        setIsCreatedNhanVienMayChamCong(false);
        setIsDeletedNhanVienMayChamCong(false);
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
