const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const listingSchema = new Schema({
    title: { type: String },
    description: { type: String },
    image: { url: String, filename: String },
    price: { type: Number, required: true },
    location: String,
    country: String,
    category: {
        type: String,
        enum: ["trending", "rooms", "cities", "mountains", "castles", "pools", "camping", "farms", "arctic", "domes", "boats"],
        default: "trending",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    geometry: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] }
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;