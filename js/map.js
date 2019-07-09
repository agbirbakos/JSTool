var tileLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var map = new L.Map('map', {
  'center': [42.020990, -93.775294],
  'zoom': 6,
  'layers': [tileLayer]
});

var marker = L.marker([42.020990, -93.775294],{
  draggable: true
}).addTo(map);

marker.on('dragend', function (e) {
  document.getElementById('latitude').value = Math.round(100*marker.getLatLng().lat)/100;
  document.getElementById('longitude').value = Math.round(100*marker.getLatLng().lng)/100;
});