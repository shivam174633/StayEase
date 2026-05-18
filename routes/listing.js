const express=require("express");
const router=express.Router();
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const flash=require("connect-flash");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage});

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

 //new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    .get(wrapAsync(listingController.showListing))
    .delete(isLoggedIn,wrapAsync(listingController.deleteListing));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports=router;