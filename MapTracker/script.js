// Biến toàn cục
let markers = [];
let group = null;
// Khởi tạo danh sách thiết bị
const getDeviceList = () => {
  axios.get('http://localhost:5263/api/devices')
    .then(function(response) {
      console.log(response.data);
      const select = document.getElementById('deviceId');
      // Clear existing options
      type.innerHTML = "";
      select.innerHTML = "";
      // Add device id
      response.data.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceID;
        option.textContent = device.name;
        select.appendChild(option);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
};
const init = () => {
  // Khởi tạo map chỉ 1 lần khi trang load
  let map = L.map('map').setView([21.0285, 105.8542], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
};
const loadMap = (deviceId, date) => {
  let url = `http://localhost:5263/api/location?deviceId=${deviceId}&date=${date}`;
  axios.get(url)
    .then(function(response) {
        const types = [...new Set(response.data.map(item => item.type))];
      const points = response.data.map(item => [item.latitude, item.longitude, item.title]);
      console.log('Types:', types);
      fillType(types);
      viewMapByPoint(points);
    })
    .catch(function(error) {
      console.log(error);
    });
};
const fillType = (types) => {
  const typeSelect = document.getElementById('type');
  typeSelect.innerHTML = ""; // Xóa các tùy chọn cũ
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });
};
const viewMapByPoint = (points) => {
  // Xóa marker và group cũ nếu có
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  if (group) {
    map.removeLayer(group);
    group = null;
  }
  if (points.length === 0) {
    alert('Không có dữ liệu!');
    return;
  }
  // Thêm marker mới
  points.forEach((point, idx) => {
    let coordinate = [point[0], point[1]];
    let title = point[2] || 'Không có tiêu đề';
    let marker;
    // Marker hình tròn nhỏ cho các điểm trung gian
    marker = L.circle(coordinate, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 15
    }).addTo(map);
    marker.bindPopup(title);
    markers.push(marker);
  });
  // Fit map theo các điểm
  group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds());
};
document.getElementById('filterForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const deviceId = document.getElementById('deviceId').value;
  const date = document.getElementById('date').value;
  loadMap(deviceId, date);
});
init();
getDeviceList();