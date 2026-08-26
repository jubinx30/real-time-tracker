 const socket = io();

 if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position)=>{
            const {latitude, longitude} = position.coords;
            socket.emit("send-location",{latitude,longitude});
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
 socket.on("recieve-location",(data)=>{
     const{id,latitude,longitude,color}=data;
    map.setView([latitude,longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    } else{
        const icon = L.divIcon({
            className: "user-marker",
            html: `<svg viewBox="0 0 32 42" aria-hidden="true"><path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 1C8.3 1 2 7.3 2 15c0 10.5 14 25 14 25s14-14.5 14-25C30 7.3 23.7 1 16 1z"/><circle cx="16" cy="15" r="5" fill="#ffffff"/></svg>`,
            iconSize: [32, 42],
            iconAnchor: [16, 40],
        });
        markers[id] = L.marker([latitude,longitude], {icon}).addTo(map);
    }
 });


 socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
 })


