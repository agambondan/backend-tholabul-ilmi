'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LOCATIONS = [
    { lat: 21.4225, lng: 39.8262, name: "Makkah Al-Mukarramah", desc: "Kelahiran Nabi ﷺ, Masjidil Haram, Ka'bah" },
    { lat: 24.4672, lng: 39.6112, name: "Madinah Al-Munawwarah", desc: "Masjid Nabawi, hijrah Rasulullah ﷺ" },
    { lat: 21.3891, lng: 39.8579, name: "Ka'bah (Kiblat)", desc: "Kiblat umat Islam sedunia" },
    { lat: 31.7683, lng: 35.2137, name: "Baitul Maqdis (Al-Quds)", desc: "Kiblat pertama, Masjidil Aqsha" },
    { lat: 25.2048, lng: 55.2708, name: "Dubai", desc: "Pusat peradaban Islam modern" },
    { lat: 33.3152, lng: 44.3661, name: "Baghdad", desc: "Baitul Hikmah, pusat ilmu Abbasiah" },
    { lat: 30.0444, lng: 31.2357, name: "Kairo", desc: "Universitas Al-Azhar" },
    { lat: 36.8065, lng: 10.1815, name: "Kairouan", desc: "Masjid Uqbah, pusat ilmu di Afrika Utara" },
    { lat: 37.8889, lng: -4.7794, name: "Cordoba", desc: "Masjid Cordoba, pusat Islam di Andalusia" },
    { lat: 41.0082, lng: 28.9784, name: "Istanbul", desc: "Kekhalifahan Utsmaniyah" },
    { lat: 34.0209, lng: -6.8419, name: "Fes", desc: "Universitas Al-Qarawiyyin, tertua di dunia" },
];

export default function MapComponent() {
    return (
        <MapContainer center={[24.5, 43]} zoom={4} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {LOCATIONS.map((loc) => (
                <Marker key={loc.name} position={[loc.lat, loc.lng]}>
                    <Popup>
                        <strong>{loc.name}</strong>
                        <br />
                        {loc.desc}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
