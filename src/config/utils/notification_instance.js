// Global notification instance để sử dụng trong axios
let notificationApi = null;

export const setNotificationApi = (api) => {
  notificationApi = api;
};

export const getNotificationApi = () => {
  return notificationApi;
};
