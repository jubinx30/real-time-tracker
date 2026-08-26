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
            html: `<span style="background-color: ${color}"></span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
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


