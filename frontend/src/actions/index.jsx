export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const SET_TOKEN = "SET_TOKEN";
export const SET_LOGOUT = "SET_LOGOUT";
export const OPEN_ADD_STORY_MODAL = "OPEN_ADD_STORY_MODAL";
export const CLOSE_ADD_STORY_MODAL = "CLOSE_ADD_STORY_MODAL";
export const SET_STORY_TO_EDIT = "SET_STORY_TO_EDIT";
export const LIKE_SLIDE = "LIKE_SLIDE";
export const UNLIKE_SLIDE = "UNLIKE_SLIDE";
export const SET_LIKED_SLIDES = "SET_LIKED_SLIDES";
export const BOOKMARK_SLIDE = "BOOKMARK_SLIDE";
export const UNBOOKMARK_SLIDE = "UNBOOKMARK_SLIDE";
export const SET_BOOKMARKED_SLIDES = "SET_BOOKMARKED_SLIDES";
export const SET_STORIES = "SET_STORIES";
export const FILTER_STORIES_BY_CATEGORY = "FILTER_STORIES_BY_CATEGORY";
export const SET_SELECTED_CATEGORIES = "SET_SELECTED_CATEGORIES";
export const SET_SLIDES = "SET_SLIDES";
import axios from "axios";

export const setToken = (payload) => ({
  type: SET_TOKEN,
  payload,
});

export const setLoading = (payload) => ({
  type: SET_LOADING,
  payload,
});

export const setError = (payload) => ({
  type: SET_ERROR,
  payload,
});

export const logout = () => ({
  type: SET_LOGOUT,
});

export const openAddStoryModal = () => ({
  type: OPEN_ADD_STORY_MODAL,
});

export const closeAddStoryModal = () => ({
  type: CLOSE_ADD_STORY_MODAL,
});

export const setStoryToEdit = (story) => ({
  type: SET_STORY_TO_EDIT,
  payload: story,
});

export const setLikedSlides = (likedSlides) => ({
  type: SET_LIKED_SLIDES,
  payload: likedSlides,
});

export const likeSlide = (slideId) => ({
  type: LIKE_SLIDE,
  payload: slideId,
});

export const unlikeSlide = (slideId) => ({
  type: UNLIKE_SLIDE,
  payload: slideId,
});

export const bookmarkSlide = (slideId) => ({
  type: BOOKMARK_SLIDE,
  payload: slideId,
});

export const unbookmarkSlide = (slideId) => ({
  type: UNBOOKMARK_SLIDE,
  payload: slideId,
});

export const setBookmarkedSlides = (slides) => ({
  type: SET_BOOKMARKED_SLIDES,
  payload: slides,
});

export const setStories = (stories) => ({
  type: SET_STORIES,
  payload: stories,
});

export const setStoriesByCategory = (data) => ({
  type: FILTER_STORIES_BY_CATEGORY,
  payload: data,
});

export const setSlides = (data) => ({
  type: SET_SLIDES,
  payload: data,
});

export const fetchStoriesByCategory = (selectedCategories) => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    if (!Array.isArray(selectedCategories)) {
      dispatch(setError("Invalid categories selected"));
      dispatch(setLoading(false));
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userStoriesResponse = await axios.get(
          "http://localhost:3000/api/v1/stories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        dispatch(setStories(userStoriesResponse.data.stories));

        const storiesByCategory = {};

        for (const category of selectedCategories) {
          let url;
          if (category === "All") {
            url = `http://localhost:3000/api/v1/allStories`;
          } else {
            url = `http://localhost:3000/api/v1/getStoriesByCategory/${category}`;
          }

          const response = await axios.get(url);
          storiesByCategory[category] = response.data;
        }

        const storiesArray = Object.keys(storiesByCategory).map((category) => ({
          category,
          stories: storiesByCategory[category] || [],
        }));

        console.log("storiesArray", storiesArray);
        dispatch(setStoriesByCategory(storiesArray));
      } catch (error) {
        console.error("Error fetching stories:", error);
        dispatch(setError("Error fetching stories"));
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      try {
        const storiesByCategory = {};

        for (const category of selectedCategories) {
          let url;
          if (category === "All") {
            url = `http://localhost:3000/api/v1/allStories`;
          } else {
            url = `http://localhost:3000/api/v1/getStoriesByCategory/${category}`;
          }
          const response = await axios.get(url);
          storiesByCategory[category] = response.data;
        }

        const storiesArray = Object.keys(storiesByCategory).map((category) => ({
          category,
          stories: storiesByCategory[category] || [],
        }));

        console.log("storiesArray without token", storiesArray);
        dispatch(setStoriesByCategory(storiesArray));
      } catch (error) {
        console.error("Error fetching stories without token:", error);
        dispatch(setError("Error fetching stories without token"));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };
};
