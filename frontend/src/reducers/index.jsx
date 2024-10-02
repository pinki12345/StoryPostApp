import {
  SET_LOADING,
  SET_ERROR,
  SET_TOKEN,
  SET_LOGOUT,
  OPEN_ADD_STORY_MODAL,
  CLOSE_ADD_STORY_MODAL,
  SET_STORY_TO_EDIT,
  SET_LIKED_SLIDES,
  BOOKMARK_SLIDE,
  LIKE_SLIDE,
  UNLIKE_SLIDE,
  UNBOOKMARK_SLIDE,
  SET_BOOKMARKED_SLIDES,
  SET_STORIES,
  SET_SLIDES,
  FILTER_STORIES_BY_CATEGORY,
} from "../actions/index";

const initialState = {
  token: localStorage.getItem("token") || null,
  isLoading: false,
  isAddStoryModalOpen: false,
  storyToEdit: null,
  likedSlides: [],
  bookmarkedSlides: [],
  stories: [],
  slides: [],
  filteredStories: [],
  error: null,
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case SET_LOGOUT:
      return {
        ...state,
        token: null,
      };
    case OPEN_ADD_STORY_MODAL:
      return {
        ...state,
        isAddStoryModalOpen: true,
      };
    case CLOSE_ADD_STORY_MODAL:
      return {
        ...state,
        isAddStoryModalOpen: false,
      };
    case SET_STORY_TO_EDIT:
      return {
        ...state,
        storyToEdit: action.payload,
      };
    case SET_LIKED_SLIDES:
      return {
        ...state,
        likedSlides: action.payload,
      };
    case LIKE_SLIDE:
      return {
        ...state,
        likedSlides: [...state.likedSlides, action.payload],
      };
    case UNLIKE_SLIDE:
      return {
        ...state,
        likedSlides: state.likedSlides.filter((id) => id !== action.payload),
      };
    case BOOKMARK_SLIDE:
      return {
        ...state,
        bookmarkedSlides: [...state.bookmarkedSlides, action.payload],
      };
    case UNBOOKMARK_SLIDE:
      return {
        ...state,
        bookmarkedSlides: state.bookmarkedSlides.filter(
          (slideId) => slideId !== action.payload
        ),
      };
    case SET_BOOKMARKED_SLIDES:
      return {
        ...state,
        bookmarkedSlides: action.payload,
      };

    case SET_STORIES:
      return {
        ...state,
        stories: action.payload,
      };
    case SET_SLIDES:
      return {
        ...state,
        slides: action.payload,
      };
    case FILTER_STORIES_BY_CATEGORY:
      return {
        ...state,
        filteredStories: action.payload,
      };

    default:
      return state;
  }
};

export default postReducer;
