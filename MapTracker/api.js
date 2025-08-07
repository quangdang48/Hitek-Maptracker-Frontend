// Tạo axios instance
const api = axios.create({
  baseURL: 'http://localhost:5263/api',
  withCredentials: true
});

// Gọi danh sách thiết bị
async function getDevices() {
  return await api.get('/devices');
}

// Gọi dữ liệu theo thiết bị và ngày
async function getLocation(deviceId, date) {
  return await api.get(`/location?deviceId=${deviceId}&date=${date}`);
}

window.apiService = {
  getDevices,
  getLocation
};
