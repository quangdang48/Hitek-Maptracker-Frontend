// Khởi tạo map chỉ 1 lần khi trang load
let map = L.map('map').setView([21.0285, 105.8542], 13);
const tileLayers = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' })
};
let currentLayer = tileLayers.osm.addTo(map);
document.getElementById('basemapSelector').addEventListener('change', (e) => {
  map.removeLayer(currentLayer);
  currentLayer = tileLayers[e.target.value].addTo(map);
});
let markers = [];
let group = null;
const getDeviceList = () => {
  apiService.getDevices()
    .then(response => {
      const deviceSelect = document.getElementById('deviceId');
      response.data.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceID;
        option.textContent = device.name;
        deviceSelect.appendChild(option);
      });
    })
    .catch(console.error);
}
const loadMap = (deviceId, date) => 
{
  apiService.getLocation(deviceId, date)
      .then(function(response) {
        const types = [...new Set(response.data.map(item => item.type))];
        const data = response.data;
        const points = data.map(item => [item.latitude, item.longitude, item.title, item.linkInfo, item.type]);
        console.log(typeof(points));
        fillType(types,points);
        viewMapByPoint(points);
      })
      .catch(function(error) {
        console.log(error);
      });
};
const fillType = (types,points) => {
  const typeDiv = document.getElementById('type');
  typeDiv.innerHTML = "";
  // Checkbox "Tất cả"
  const allId = 'type_all';
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = allId;
  allCheckbox.value = 'all';
  allCheckbox.checked = true;
  allCheckbox.addEventListener('change', function() {
    // console.log('All checkbox changed:', this.checked);
      typeDiv.querySelectorAll('input[type=checkbox]').forEach(cb => {
        if (cb.id !== allId) cb.checked = false;
      });
      triggerTypeChange(points);
  });
  const allLabel = document.createElement('label');
  allLabel.htmlFor = allId;
  allLabel.textContent = 'Tất cả';
  typeDiv.appendChild(allCheckbox);
  typeDiv.appendChild(allLabel);
  types.forEach((type, idx) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `type_${idx}`;
    checkbox.value = type;
    checkbox.style.marginLeft = '10px';
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        allCheckbox.checked = false;
      }
      triggerTypeChange(points);
    });
    //label cho checkbox
    let label = createLabel(type);
    // labe l.textContent = type;
    typeDiv.appendChild(checkbox);
    typeDiv.appendChild(label);
  });
};
const createLabel = (type, idx) => {
    const label = document.createElement("label");
    label.htmlFor = `type_${idx}`;
    label.style.display = "inline-block";
    label.style.width = "12px";
    label.style.height = "12px";
    label.style.borderRadius = "50%";
    label.style.marginRight = "5px";

    // Gán màu và tooltip theo type
    switch (type) {
        case 1:
            label.style.backgroundColor = "#f03";
            label.title = "Loại 1";
            break;
        case 2:
            label.style.backgroundColor = "#03f";
            label.title = "Loại 2";
            break;
        case 3:
            label.style.backgroundColor = "#0f3";
            label.title = "Loại 3";
            break;
        case 4:
            label.style.backgroundColor = "orange";
            label.title = "Loại 4";
            break;
        case 5:
            label.style.backgroundColor = "purple";
            label.title = "Loại 5";
            break;
    }

    document.getElementById("type").appendChild(label);
    return label;
}

// Hàm lọc và hiển thị lại map khi chọn type
function triggerTypeChange(allPoints) {
  const typeDiv = document.getElementById('type');
  const checked = Array.from(typeDiv.querySelectorAll('input[type=checkbox]:checked'));
  console.log('Checked types:', checked.map(cb => cb.value));
  if (checked.some(cb => cb.value === 'all') && checked.length === 1) {
    viewMapByPoint(allPoints);
    return;
  }else if(checked.length === 0) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    return
  }else{
    const selectedTypes = checked.map(cb => cb.value);
    console.log('All points', allPoints);
    const filteredPoints = allPoints
      .filter(item => {
        const type_item = String(item[4]);
        return selectedTypes.includes(type_item)
      })
    console.log('Filtered points:', filteredPoints);
    viewMapByPoint(filteredPoints);
  }
}
const viewMapByPoint = (points) => {
  // Xóa marker và group cũ nếu có
  console.log(points.length);
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
    let linkInfo = point[3] || '';
    let type = point[4] || 'Không có loại';
    let marker;
    // Marker hình tròn nhỏ cho các điểm trung gian
    if(type === 1) {
        marker = L.circle(coordinate, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 35
        }).addTo(map);
    }else if(type === 2) {
        marker = L.circle(coordinate, {
            color: 'blue',
            fillColor: '#03f',
            fillOpacity: 0.5,
            radius: 35
        }).addTo(map);
    }
    else if(type === 3) {
        marker = L.circle(coordinate, {
            color: 'green',
            fillColor: '#0f3',
            fillOpacity: 0.5,
            radius: 35
        }).addTo(map);
    }
    else if(type === 4) {
        marker = L.circle(coordinate, {
            color: 'orange',
            fillColor: '#f90',
            fillOpacity: 0.5,
            radius: 35
        }).addTo(map);
    }
    else if(type === 5) {
        marker = L.circle(coordinate, {
            color: 'purple',
            fillColor: '#f90',
            fillOpacity: 0.5,
            radius: 35
        }).addTo(map);
    }

    
    marker.bindPopup(title+
      `<br><a href="${linkInfo}" target="_blank">Xem chi tiết</a>`);
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
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await axios.post('http://localhost:5263/api/logout', {}, {
        withCredentials: true // Quan trọng để gửi cookie
      });

      // Quay lại trang login
      window.location.href = "http://localhost:5500/MapTracker/login.html";
    } catch (err) {
      console.error("Đăng xuất thất bại", err);
      alert("Lỗi khi đăng xuất.");
    }
});
getDeviceList();