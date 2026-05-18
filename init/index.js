const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayease";

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocode(location, country) {
    try {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'StayEase-App/1.0' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                type: 'Point',
                coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
            };
        }
    } catch (err) {
        console.log("Geocoding failed:", err.message);
    }
    return null;
}

const initDB = async () => {
    await Listing.deleteMany({});

    for (let item of initData.data) {
        const geometry = await geocode(item.location, item.country);
        if (geometry) {
            item.geometry = geometry;
            console.log(`✅ ${item.title} → [${geometry.coordinates}]`);
        } else {
            console.log(`❌ Failed: ${item.title}`);
        }
        await delay(1100); // Nominatim allows only 1 req/sec
    }

    await Listing.insertMany(initData.data);
    console.log("✅ Database initialized with coordinates!");
    mongoose.connection.close();
};

initDB();