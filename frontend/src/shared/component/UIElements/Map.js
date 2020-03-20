import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = props => {
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  const { center, zoom } = props;

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: zoom
      });

      map.on("load", () => {
        setMap(map);
        map.resize();
      });
    };

    if (!map) initializeMap({ setMap, mapContainer });
  }, [map, center, zoom]);

  return (
    <div
      className={`map ${props.className}`}
      ref={el => (mapContainer.current = el)}
      style={props.style}
    />
  );
};

export default Map;
