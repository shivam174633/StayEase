const Listing = require("../models/listing");

async function geocode(location, country) {
    try {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'StayEase-App/1.0' } });
        const data = await response.json();
        if (data && data.length > 0) {
            return { type: 'Point', coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)] };
        }
    } catch (err) {
        console.log("Geocoding failed:", err.message);
    }
    return null;
}

module.exports.index = async (req, res) => {
    let { q, category } = req.query;
    let allListings;

    if (category) {
        allListings = await Listing.find({ category: category });
    } else if (q) {
        allListings = await Listing.find({ location: q });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, q, category });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    const geometry = await geocode(listing.location, listing.country);
    if (geometry) newListing.geometry = geometry;
    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (typeof req.file !== "undefined") {
        let { url, filename } = req.file;
        listing.image = { url, filename };
    }
    const geometry = await geocode(req.body.listing.location, req.body.listing.country);
    if (geometry) listing.geometry = geometry;
    await listing.save();
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};