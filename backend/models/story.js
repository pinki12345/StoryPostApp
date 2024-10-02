const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: [true, "Story title is required"],
  },
  description: {
    type: String,
    required: [true, "Description field is mandatory"],
  },
  url: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

  ],
});

const storySchema = new mongoose.Schema(
  {
    slides: [slideSchema],
    category: {
    type: String,
    enum: ["Animal", "Movies", "World", "Health and Fitness", "Education"],
    required: true,
   },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
