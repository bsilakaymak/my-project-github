const axios = require("axios");
const HttpError = require("../model/http-error");
const config = require("config");
const MAPBOX_API_KEY = config.get("MAPBOX_API_KEY");

async function getCoordsForAddress(address) {
  const res = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_API_KEY}`
  );
  const data = res.data;
  if (!data || data.features.length === 0) {
    const error = new HttpError(
      "Could not find location for the spesified address."
    );
    throw error;
  }

  const coordinates = data.features[1].geometry.coordinates;
  return coordinates;
}
module.exports = getCoordsForAddress;
