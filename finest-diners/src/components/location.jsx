// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const cities = [
//   { name: "Ogun State", lat: 6.9979747, lng: 3.4737378 },
//   { name: "Lagos", lat: 6.6137395, lng: 3.3552568 },
//   { name: "Ikorodu", lat: 6.6194131, lng: 3.5104537 },
//   { name: "Abuja", lat: 9.0562646, lng: 7.4985259 },
//   { name: "Surulere", lat: 6.498293, lng: 3.348572 },
//   { name: "Obada", lat: 7.0651658, lng: 3.2935778 },
//   { name: "Agbara/Auba", lat: 6.51371, lng: 3.114051 },
//   { name: "Ibadan", lat: 7.3775355, lng: 3.9470396 },
// ];

// // Custom marker icon (green circle)
// const customIcon = L.divIcon({
//   html: `
//     <div style="
//       width: 20px;
//       height: 20px;
//       background-color: #6B7C2F;
//       border: 3px solid white;
//       border-radius: 50%;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//     "></div>
//   `,
//   iconSize: [20, 20],
//   className: "custom-marker",
// });

// export default function NigeriaMap() {
//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "500px",
//         borderRadius: "12px",
//         overflow: "hidden",
//         border: "1px solid #e0e0d8",
//       }}
//     >
//       <MapContainer
//         center={[7.5, 4.5]}
//         zoom={7}
//         style={{ width: "100%", height: "100%" }}
//       >
//         {/* OpenStreetMap tiles - completely free, no API key needed */}
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Render all city markers */}
//         {cities.map((city) => (
//           <Marker
//             key={city.name}
//             position={[city.lat, city.lng]}
//             icon={customIcon}
//           >
//             <Popup>
//               <div style={{ fontFamily: "'Courier New', monospace" }}>
//                 <strong style={{ fontSize: "14px" }}>{city.name}</strong>
//                 <br />
//                 <span style={{ fontSize: "12px", color: "#666" }}>
//                   {city.lat.toFixed(4)}°N, {city.lng.toFixed(4)}°E
//                 </span>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
