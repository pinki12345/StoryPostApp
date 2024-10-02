import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AddStoryModal.module.css";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setLoading } from "../actions/index";
import Loader from "./Loader";

const AddStoryModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.isLoading);
  const token =
    useSelector((state) => state.token) || localStorage.getItem("token");
  const storyToEdit = useSelector((state) => state.storyToEdit);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([
    { heading: "", description: "", url: "" },
    { heading: "", description: "", url: "" },
    { heading: "", description: "", url: "" },
  ]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (storyToEdit) {
      setSlides(
        storyToEdit?.slides.map((slide) => ({
          heading: slide.heading,
          description: slide.description,
          url: slide.url,
        }))
      );
      setCategory(storyToEdit.category);
    }
  }, [storyToEdit]);

  const handleSlideChange = (index, field, value) => {
    const newSlides = slides.map((slide, i) => {
      if (i === index) {
        return { ...slide, [field]: value };
      }
      return slide;
    });
    setSlides(newSlides);
  };

  const addSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, { heading: "", description: "", url: "" }]);
    } else {
      toast.error("You can add up to 6 slides only.");
    }
  };

  const removeSlide = (index) => {
    if (slides.length > 1) {
      const filteredSlides = slides.filter((_, i) => i !== index);
      setSlides(filteredSlides);
      if (currentSlide >= filteredSlides.length) {
        setCurrentSlide(filteredSlides.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const validateUrl = (url) => {
    const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/i;
    return pattern.test(url);
  };

  const getContentType = async (url) => {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow" });
      const contentType = response.headers.get("Content-Type");
      if (!contentType) {
        throw new Error("Could not determine the content type.");
      }
      return contentType;
    } catch (error) {
      throw new Error("Failed to fetch URL content type or follow redirect.");
    }
  };

  const validateVideoDuration = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const duration = video.duration; 
        resolve(duration <= 15); 
      };

      video.onerror = () => {
        reject(new Error("Invalid video URL"));
      };

      video.load(); 
    });
  };

  const validateSlides = async () => {
    for (const slide of slides) {
      if (!slide.heading || !slide.description || !slide.url) {
        toast.error("All fields must be filled out.");
        return false;
      }

      if (!validateUrl(slide.url)) {
        toast.error(
          "Invalid URL format. Please provide a valid image or video URL."
        );
        return false;
      }

      try {
        const contentType = await getContentType(slide.url);

        if (contentType.startsWith("image/")) {
          continue;
        } else if (contentType.startsWith("video/")) {
          const isValidDuration = await validateVideoDuration(slide.url);
          if (!isValidDuration) {
            toast.error("Video must be less than or equal to 15 seconds.");
            return false;
          }
        } else {
          toast.error(
            "Unsupported file type. Please use valid image or video URLs."
          );
          return false;
        }
      } catch (error) {
        toast.error("Failed to identify or validate URL content.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!(await validateSlides())) return;

    const storyData = {
      slides: slides.map((slide) => ({
        heading: slide.heading,
        url: slide.url,
        description: slide.description,
      })),
      category,
    };
    const toastId = toast.loading("Creating Story...");
    dispatch(setLoading(true));
    try {
      let response;
      if (storyToEdit) {
        response = await axios.put(
          `https://storyapp-rinj.onrender.com/api/v1/editStory/${storyToEdit._id}`,
          storyData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Story edited successfully!", { id: toastId });
      } else {
        response = await axios.post(
          "https://storyapp-rinj.onrender.com/api/v1/createStory",
          storyData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Story created successfully!", { id: toastId });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error("Failed to submit story. Please try again.", { id: toastId });
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  if (!isOpen) return null;
  if (isLoading) return <Loader />;
  return (
    <div className={styles.modal}>
      <div className={styles["modal-content"]}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <p>Add up to 6 slides</p>
        <div className={styles.slideAndForm}>
          <div className={styles["slide-controls"]}>
            {slides.map((_, index) => (
              <div key={index} className={styles["slide-nav"]}>
                <button
                  className={`${styles.constSlideButton} ${
                    index === currentSlide ? styles.active : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  Slide {index + 1}
                </button>
                {index >= 3 && (
                  <button
                    className={styles.remove}
                    onClick={() => removeSlide(index)}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {!storyToEdit && slides.length < 6 && (
              <button onClick={addSlide} className={styles.addSlide}>
                Add +
              </button>
            )}
          </div>

          <div className={styles["slide-form"]}>
            <div className={styles["form-group"]}>
              <label>Heading:</label>
              <input
                type="text"
                placeholder="Post Heading"
                value={slides[currentSlide].heading}
                onChange={(e) =>
                  handleSlideChange(currentSlide, "heading", e.target.value)
                }
              />
            </div>
            <div className={styles["form-group"]}>
              <label>Description:</label>
              <textarea
                placeholder="Story Description"
                value={slides[currentSlide].description}
                onChange={(e) =>
                  handleSlideChange(currentSlide, "description", e.target.value)
                }
              />
            </div>

            <div className={styles["form-group"]}>
              <label>URL (Image or Video):</label>
              <input
                type="text"
                placeholder="Add Image or Video URL"
                value={slides[currentSlide].url}
                onChange={(e) =>
                  handleSlideChange(currentSlide, "url", e.target.value)
                }
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                
              >
                <option value="" disabled>
                  Select category
                </option>
                <option value="Animal">Animal</option>
                <option value="Movies">Movies</option>
                <option value="World">World</option>
                <option value="Health and Fitness">Health and Fitness</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div className={styles["button-group"]}>
              <div className={styles.buttonPrevNext}>
                <button
                  className={styles.previousButton}
                  onClick={handlePrevious}
                >
                  Previous
                </button>
                <button className={styles.nextButton} onClick={handleNext}>
                  Next
                </button>
              </div>
              <button className={styles.postButton} onClick={handleSubmit}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStoryModal;
