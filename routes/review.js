const express=require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const methodOverride=require("method-override");
const {isLoggedIn,validateReview,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/review.js");

//Reviews
//Post Review Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,reviewController.deleteReview);

module.exports=router;