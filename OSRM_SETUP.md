# Finest Diners — Self-Hosted Routing + Live Tracking Guide

## Overview

This guide explains how to set up OSRM (Open Source Routing Machine) for real-time ETA calculations and distance measurements in the Finest Diners delivery platform.

## What is OSRM?

OSRM is an open-source routing engine that provides:
- **ETA calculations**: Estimated time of arrival between two GPS coordinates
- **Distance measurements**: Accurate road-based distance calculations
- **Self-hosted**: No external API dependencies or costs
- **Fast**: Sub-second response times for routing queries

## Links

- OSRM (routing / ETA, self-hosted, free): https://project-osrm.org/
- OSRM source: https://github.com/Project-OSRM/osrm-backend
- Nominatim (self-hosted geocoding — optional replacement for OpenCage): https://nominatim.org/
- OSM data extracts (download your region's map data): https://download.geofabrik.de/

## Self-Hosting OSRM with Docker

You need an OpenStreetMap extract (`.osm.pbf`) for the region your riders operate in.
Download it from Geofabrik above, place it in a folder, then run:

```bash
# 1. Extract the road network using the car profile
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-extract -p /opt/car.lua /data/your-region.osm.pbf

# 2. Partition the graph (MLD algorithm — recommended default)
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-partition /data/your-region.osrm

# 3. Customize the graph
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-customize /data/your-region.osrm

# 4. Start the routing server on port 5000
docker run -t -i -p 5000:5000 -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend osrm-routed --algorithm mld /data/your-region.osrm
```

### Test Your OSRM Server

```bash
curl "http://localhost:5000/route/v1/driving/3.3792,6.5244;3.4000,6.4500?overview=false"
```

The response includes `routes[0].duration` (seconds) and `routes[0].distance` (meters) — that's your ETA.

**Note:** Steps 1-3 only need to run once per map update. For production, host step 4 on a server with a public URL (not localhost) so your app can reach it, and budget RAM at roughly 5x the size of your `.osm.pbf` file.

## Backend Configuration

### Environment Variables

Add the following to your backend `.env` file:

```bash
# OSRM Server URL (optional - if not set, ETA will be disabled)
OSRM_URL=https://your-osrm-server.com
```

### How It Works

1. **Order Creation**: When a customer places an order, the delivery coordinates (latitude/longitude) are saved in the `deliveryCoordinates` field of the order.

2. **Socket.IO Location Updates**: As the customer's location is tracked (or a rider's location in the future), the backend calculates ETA using OSRM:
   - From: Current location (rider/customer)
   - To: Delivery address coordinates

3. **Real-Time ETA**: The ETA is broadcast via Socket.IO to all connected clients tracking that order.

### API Endpoint

The backend provides a REST endpoint for manual ETA calculations:

```
GET /api/location/route?fromLat=..&fromLng=..&toLat=..&toLng=..
```

Response:
```json
{
  "duration": 1200,          // seconds
  "distance": 5000,          // meters
  "durationMinutes": 20,     // rounded minutes
  "distanceKm": "5.00"       // kilometers
}
```

## Frontend Integration

The frontend automatically receives ETA updates via Socket.IO when tracking an order:

```javascript
socket.on('location:update', (data) => {
  if (data.eta !== undefined) setEta(data.eta);
  if (data.distance !== undefined) setDistance(data.distance);
});
```

The ETA is displayed on the order tracking page when the order status is `out_for_delivery`.

## The Complete Tracking Stack

### Server — Node.js + Express + Socket.IO

Relays rider locations to whichever customers are watching that order.

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const riderLocations = {}; // in-memory store, keyed by orderId

io.on('connection', (socket) => {
  // Rider's phone sends its location
  socket.on('rider:location', ({ orderId, lat, lng }) => {
    riderLocations[orderId] = { lat, lng, updatedAt: Date.now() };
    io.to(`order:${orderId}`).emit('location:update', { lat, lng });
  });

  // Customer's browser subscribes to one order
  socket.on('customer:track', ({ orderId }) => {
    socket.join(`order:${orderId}`);
    if (riderLocations[orderId]) {
      socket.emit('location:update', riderLocations[orderId]);
    }
  });
});

server.listen(4000, () => console.log('Tracking server running on port 4000'));
```

### Rider App — Sends GPS

Runs on the rider's phone (webview, React Native, etc). Uses the phone's built-in GPS via the browser's geolocation API.

```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-server.com');
const orderId = 'order_123';

navigator.geolocation.watchPosition(
  (position) => {
    socket.emit('rider:location', {
      orderId,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  },
  (err) => console.error(err),
  { enableHighAccuracy: true, maximumAge: 5000 }
);
```

### Customer Page — Shows Live Location + ETA from OSRM

```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-server.com');
const orderId = 'order_123';
const destination = { lat: 6.4500, lng: 3.4000 }; // customer's delivery address

socket.emit('customer:track', { orderId });

socket.on('location:update', async ({ lat, lng }) => {
  updateMapMarker(lat, lng); // your own map-drawing function

  const res = await fetch(
    `https://your-osrm-server.com/route/v1/driving/${lng},${lat};${destination.lng},${destination.lat}?overview=false` 
  );
  const data = await res.json();
  const etaMinutes = Math.round(data.routes[0].duration / 60);
  document.getElementById('eta').textContent = `${etaMinutes} min away`;
});
```

## How It All Fits Together

1. Customer enters a delivery address → OpenCage geocodes it to coordinates (once, at checkout).
2. Rider's phone sends GPS updates → your server, via Socket.IO.
3. Server broadcasts the update to any customer watching that order.
4. Customer's browser gets the new location, redraws the marker, and asks your self-hosted OSRM server for a fresh ETA.

## Production Considerations

- **Server Requirements**: Budget RAM at roughly 5x the size of your `.osm.pbf` file
- **Public URL**: OSRM server must be publicly accessible (not localhost) for production
- **Map Updates**: Re-run steps 1-3 when you want to update to newer OSM data
- **Rate Limiting**: The backend has rate limiting on location endpoints to prevent abuse
- **Fallback**: If OSRM is not configured, the app still works but ETA will not be available

## Troubleshooting

### OSRM Server Not Responding

- Check that the Docker container is running: `docker ps`
- Verify the port mapping: `docker logs <container-id>`
- Test locally: `curl http://localhost:5000/route/v1/driving/...`

### ETA Not Showing

- Verify `OSRM_URL` is set in backend `.env`
- Check backend logs for OSRM errors
- Ensure order has `deliveryCoordinates` saved
- Confirm order status is `out_for_delivery`

### Socket.IO Connection Issues

- Check CORS configuration in backend
- Verify token is being sent in Socket.IO handshake
- Check backend logs for authentication errors
