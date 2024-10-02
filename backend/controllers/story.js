const Story = require("../models/story");
const User = require("../models/user");

exports.createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slides, category } = req.body;
    console.log("Slides, category:", slides, category);

    if (
      ![
        "Animal",
        "Movies",
        "World",
        "Health and Fitness",
        "Education",
      ].includes(category)
    ) {
      return res.status(400).json({ message: `Invalid category: ${category}` });
    }

    if (!slides || !Array.isArray(slides) || slides.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 slides are required." });
    }

    for (const slide of slides) {
      if (!slide.heading || !slide.description || !slide.url) {
        return res.status(400).json({
          message: "Each slide must have a heading, description, and a URL.",
        });
      }
    }

    const newStory = new Story({
      slides,
      category,
      createdBy: userId,
    });

    await newStory.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully!",
      data: newStory,
    });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find();
    if (!stories || stories.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve stories",
      error: error.message,
    });
  }
};

exports.getStoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let filter = {};
    if (category) {
      const categoryArray = category.split(",");
      filter.category = { $in: categoryArray };
    }
    const stories = await Story.find(filter);

    if (!stories || stories.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json({ stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories", error });
  }
};

exports.getStoriesByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    console.log("userId: " + userId);
    const stories = await Story.find({ createdBy: userId });
    if (!stories || stories.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("Error retrieving stories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve stories for the user",
      error: error.message,
    });
  }
};

exports.likeSlide = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slideId } = req.body;
    const story = await Story.findOne({ "slides._id": slideId });
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    const slide = story.slides.id(slideId);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    if (slide.likedBy.includes(userId)) {
      return res.status(400).json({ message: "Slide already liked" });
    }

    slide.likedBy.push(userId);
    slide.likes += 1;

    await story.save();

    return res.status(200).json({
      message: "Slide liked successfully",
      likes: slide.likes,
    });
  } catch (error) {
    console.error("Error liking slide:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.unlikeSlide = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slideId } = req.body;
    const story = await Story.findOne({ "slides._id": slideId });
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    const slide = story.slides.id(slideId);
    if (!slide) {
      return res.status(404).json({ message: "Slide not found" });
    }
    if (!slide.likedBy.includes(userId)) {
      return res.status(400).json({ message: "Slide not liked yet" });
    }

    slide.likedBy = slide.likedBy.filter((id) => id.toString() !== userId);
    slide.likes -= 1;

    await story.save();
    return res.status(200).json({
      message: "Slide unliked successfully",
      likes: slide.likes,
    });
  } catch (error) {
    console.error("Error unliking slide:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { slideId } = req.body;
    const userId = req.user._id;
    const story = await Story.findOne({ "slides._id": slideId });

    if (!story) {
      return res.status(404).json({ message: "Slide not found" });
    }
    const slideIndex = story.slides.findIndex(
      (slide) => slide._id.toString() === slideId
    );
    if (slideIndex === -1) {
      return res.status(404).json({ message: "Slide not found" });
    }
    const isBookmarked = story.slides[slideIndex].bookmarks.includes(userId);
    if (isBookmarked) {
      story.slides[slideIndex].bookmarks = story.slides[
        slideIndex
      ].bookmarks.filter(
        (bookmarkId) => bookmarkId.toString() !== userId.toString()
      );
    } else {
      story.slides[slideIndex].bookmarks.push(userId);
    }
    await story.save();
    return res.status(200).json({
      message: isBookmarked
        ? "Slide unbookmarked successfully"
        : "Slide bookmarked successfully",
      isBookmarked: !isBookmarked,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error toggling bookmark", error });
  }
};

exports.getBookmarksByUserId = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const stories = await Story.find({ "slides.bookmarks": userId })
      .populate("slides.bookmarks", "username")
      .exec();

    const bookmarkedSlides = stories.flatMap((story) =>
      story?.slides
        .filter((slide) => {
          if (!slide.bookmarks || !Array.isArray(slide.bookmarks)) {
            return false;
          }
          const userHasBookmarked = slide.bookmarks.some((bookmark) => {
            return bookmark._id.toString() === userId;
          });

          return userHasBookmarked;
        })
        .map((slide) => ({
          storyId: story._id,
          slideId: slide._id,
          heading: slide.heading,
          description: slide.description,
          url: slide.url,
          video: slide.video,
          bookmarks: slide.bookmarks,
        }))
    );
    if (bookmarkedSlides.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookmarks found for this user" });
    }

    res.status(200).json(bookmarkedSlides);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ message: "Error fetching bookmarks", error });
  }
};

const mongoose = require("mongoose");

exports.getSlideById = async (req, res) => {
  const { id } = req.params;
  console.log("Incoming Slide ID:", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Slide ID" });
  }

  try {
    const story = await Story.findOne({ "slides._id": id });
    if (!story) {
      return res.status(404).json({ message: "Slide not found" });
    }
    res.json(story);
  } catch (error) {
    console.error("Error retrieving slide:", error);
    res.status(500).json({ message: "Error retrieving slide", error });
  }
};

exports.editStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { slides, category } = req.body;
    const userId = req.user._id;
    if (
      category &&
      ![
        "Animal",
        "Movies",
        "World",
        "Health and Fitness",
        "Education",
      ].includes(category)
    ) {
      return res.status(400).json({ message: `Invalid category: ${category}` });
    }
    if (!slides || !Array.isArray(slides) || slides.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 slides are required." });
    }

    for (const slide of slides) {
      if (!slide.heading || !slide.description || !slide.url) {
        return res.status(400).json({
          message: "Each slide must have a heading, description, and a URL.",
        });
      }
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    if (!story.createdBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this story." });
    }
    story.slides = slides;
    if (category) {
      story.category = category;
    }

    await story.save();

    res.status(200).json({
      success: true,
      message: "Story updated successfully!",
      data: story,
    });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
