const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/user");

const {
  createStory,
  getAllStories,
  getStoriesByUser,
  editStory,
  getStoriesByCategory,
  likeSlide,
  unlikeSlide,
  toggleBookmark,
  getSlideById,
  getBookmarksByUserId
} = require("../controllers/story");


router.post("/createStory", authMiddleware, createStory);
//______________________________STORIES____________________________
router.get("/allStories", getAllStories);
router.get("/getStoriesByCategory/:category", getStoriesByCategory);
router.get("/stories", authMiddleware, getStoriesByUser);
// _____________________________LIKE________________________________

// router.get("/likedSlides",authMiddleware, getLikedSlides);
router.post("/likeSlide", authMiddleware, likeSlide);
router.post("/unlikeSlide", authMiddleware, unlikeSlide);
//______________________________BOOKMARK____________________________

router.post("/bookmark", authMiddleware, toggleBookmark);

router.get('/slide/:id', getSlideById);


router.put("/editStory/:storyId", authMiddleware, editStory);




router.get('/user/bookmarks',authMiddleware, getBookmarksByUserId);


router.get("/shareslide/:id", getSlideById);




module.exports = router;
