// import React from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix Leaflet default icon issues
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: '/marker-icon-2x.png',
//   iconUrl: '/marker-icon.png',
//   shadowUrl: '/marker-shadow.png',
// });

// interface Location {
//   id: string;
//   title: string;
//   lat: number;
//   lng: number;
// }

// interface InteractiveMapProps {
//   locations: Location[];
//   destination?: string;
// }

// export default function InteractiveMap({ locations, destination }: InteractiveMapProps) {
//   // Center map on the first location or default to Mumbai coordinates
//   const center = locations.length > 0
//     ? [locations[0].lat, locations[0].lng]
//     : [19.0760, 72.8777]; // Default to Mumbai coordinates

//   return (
//     <div className="h-64 rounded-md overflow-hidden">
//       <MapContainer
//         center={center as [number, number]}
//         zoom={13}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         {locations.map((loc, index) => (
//           <Marker
//             key={loc.id || index}
//             position={[loc.lat, loc.lng]}
//           >
//             <Popup>{loc.title}</Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
