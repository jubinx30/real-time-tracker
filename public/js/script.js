 const socket = io();
 const savedName = localStorage.getItem("tracker-display-name");
 const displayName = (savedName || window.prompt("Enter your name for the map:") || "").trim().slice(0, 32) || "Anonymous";
 localStorage.setItem("tracker-display-name", displayName);
 socket.emit("set-name", displayName);

 if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position)=>{
            const {latitude, longitude} = position.coords;
            socket.emit("send-location",{latitude,longitude,name: displayName});
        },
        (error)=>{
            console.log(error);
        },
        {
            enableHighAccuracy:true,
            timeout: 5000,
            maximumAge: 0,
        }
    )
 }

 
 const map = L.map("map").setView([0,0],15);
 
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"OpenStreetMap"
 }).addTo(map);

 const markers = {};

 function getInitials(name){
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
 }

 function escapeHtml(value){
     return value.replace(/[&<>'"]/g, (character) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
     })[character]);
 }

 function getPopupContent(name, latitude, longitude){
     return `<strong>${escapeHtml(name)}</strong><br>Latitude: ${latitude.toFixed(5)}<br>Longitude: ${longitude.toFixed(5)}`;
 }

 socket.on("recieve-location",(data)=>{
     const{id,latitude,longitude,color,name}=data;
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
        markers[id].setPopupContent(getPopupContent(name, latitude, longitude));
    } else{
        const icon = L.divIcon({
            className: "user-marker",
            html: `<svg viewBox="0 0 32 42" aria-hidden="true"><path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 1C8.3 1 2 7.3 2 15c0 10.5 14 25 14 25s14-14.5 14-25C30 7.3 23.7 1 16 1z"/><circle cx="16" cy="15" r="7" fill="#ffffff"/><text x="16" y="18" text-anchor="middle" font-size="7" font-weight="700" fill="${color}">${escapeHtml(getInitials(name))}</text></svg>`,
            iconSize: [32, 42],
            iconAnchor: [16, 40],
        });
        markers[id] = L.marker([latitude,longitude], {icon})
            .bindPopup(getPopupContent(name, latitude, longitude))
            .addTo(map);
    }
 });


 socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
 })


