import React, { useEffect, useState, useRef } from "react";
import styles from "./StorySlide.module.css";
import next from "../assets/next.png";
import prev from "../assets/prev.png";
import share from "../assets/share.png";
import { useSelector, useDispatch } from "react-redux";
import {
  likeSlide,
  unlikeSlide,
  setLikedSlides,
  setSlides,
} from "../actions/index";
import ModalTemplate from "./ModalTemplate";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { setLoading } from "../actions/index";
import Loader from "./Loader";
import { IoMdDownload } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import { MdFileDownloadDone } from "react-icons/md";
import { IoBookmark } from "react-icons/io5";


const validateUrl = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      if (contentType.startsWith("image/")) {
        return "image";
      } else if (contentType.startsWith("video/")) {
        return "video";
      }
    }
    return null;
  } catch (error) {
    console.error("Error validating URL:", error);
    return null;
  }
};

const StorySlide = ({ onClose }) => {
  const slides = useSelector((state) => state.slides);
  const { slideId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const loading = useSelector((state) => state.isLoading);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedSlides, setDownloadedSlides] = useState([]);
  const totalSlides = slides.length;
  const token =
    useSelector((state) => state.token) || localStorage.getItem("token");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const videoRef = useRef(null);
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentIndex]);

  useEffect(() => {
    const checkMediaType = async () => {
      if (slides[currentIndex]) {
        const url = slides[currentIndex].url;
        const type = await validateUrl(url);
        setMediaType(type);
      }
    };

    checkMediaType();
  }, [currentIndex, slides]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (mediaType === "video" && videoElement) {
      const playVideo = () => {
        console.log("Playing video from the start.");
        videoElement.currentTime = 0;
        videoElement.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      };
      videoElement.addEventListener("loadeddata", playVideo);
      if (videoElement.readyState >= 3) {
        playVideo();
      }
      return () => {
        videoElement.removeEventListener("loadeddata", playVideo);
      };
    } else {
      console.log("Video element is not available or media type is not video.");
    }
  }, [currentIndex, mediaType]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const currentSlide = slides[currentIndex];

    if (currentSlide) {
      setIsLiked(currentSlide.likedBy?.includes(userId));
      setLikeCount(currentSlide.likes || 0);
      setIsBookmarked(currentSlide.bookmarks?.includes(userId));
    }
  }, [currentIndex, slides, userId]);

  const handleHeartClick = async () => {
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    const slideId = slides[currentIndex]._id;
    const apiUrl = `https://storyapp-rinj.onrender.com/api/v1/${
      isLiked ? "unlikeSlide" : "likeSlide"
    }`;
    const toastId = toast.loading("Processing...", {
      className: "toast-container",
    });
    try {
      const response = await axios.post(
        apiUrl,
        { slideId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (isLiked) {
        dispatch(unlikeSlide(slideId));
        setIsLiked(false);
        setLikeCount(likeCount - 1);
        toast.success("Slide unliked!",{
          className: "toast-container",
        });
      } else {
        dispatch(likeSlide(slideId));
        setIsLiked(true);
        setLikeCount(likeCount + 1);
        toast.success("Slide liked!",{
          className: "toast-container",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling like on the slide.",{
          className: "toast-container",
        }
      );
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleBookmarkClick = async () => {
    if (!token) {
      setIsModalOpen(true);
      return;
    }
    const slideId = slides[currentIndex]._id;
    const toastId = toast.loading("Processing...",{
      className: "toast-container",
    });
    try {
      const response = await axios.post(
        "https://storyapp-rinj.onrender.com/api/v1/bookmark",
        { slideId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsBookmarked(!isBookmarked);
      toast.success(response.data.message,{
        className: "toast-container",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling bookmark on the slide.",{
          className: "toast-container",
        }
      );
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleShareClick = () => {
    const currentSlide = slides[currentIndex];
    const slideId = currentSlide._id;
    const newWindowUrl = `https://story-post-app.vercel.app/shareslide/${slideId}`;
    console.log("Generated URL:", newWindowUrl);
    navigator.clipboard
      .writeText(newWindowUrl)
      .then(() => {
        toast.success("Story URL copied to clipboard!",{
          className: "toast-container",
        });
      })
      .catch(() => {
        toast.error("Failed to copy URL.",{
          className: "toast-container",
        });
      });
  };

  useEffect(() => {
    const fetchSlide = async () => {
      const toastId = toast.loading("Processing...");
      dispatch(setLoading(true));
      try {
        const response = await axios.get(
          `https://storyapp-rinj.onrender.com/api/v1/shareslide/${slideId}`
        );
        dispatch(setSlides(response.data.slides));
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading slide.",{
          className: "toast-container",
        });
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
    if (slideId) {
      fetchSlide();
    }
  }, [slideId, dispatch]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex === totalSlides - 1 ? 0 : prevIndex + 1;
      if (prevIndex === totalSlides - 1) {
        onClose();
      } else if (nextIndex === 0) {
        navigate("/");
      }
      return nextIndex;
    });
  };

  const handleDownload = async (slideIndex) => {
    const currentSlide = slides[currentIndex];

    if (currentSlide && validateUrl(currentSlide.url)) {
      try {
        const response = await fetch(currentSlide.url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch file: ${response.status} ${response.statusText}`
          );
        }
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = currentSlide.url.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        setIsDownloaded(true);
        toast.success("Download successfully!");
        if (!downloadedSlides.includes(slideIndex)) {
          setDownloadedSlides([...downloadedSlides, slideIndex]);
        }
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Error downloading the file: " + error.message);
      }
    } else {
      toast.error("Invalid media URL for download.");
    }
  };
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  if (loading) return <Loader />;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.prevButton} onClick={handlePrev}>
          <img src={prev} alt="Previous" />
        </button>
        <div className={styles.card}>
          <div className={styles.progressBarContainer}>
            <div className={styles.segmentContainer}>
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={styles.segment}
                  style={{
                    width: `${100 / totalSlides}%`,
                    backgroundColor:
                      currentIndex === index ? "#808080" : "#ffffff",
                  }}
                >
                  <div
                    className={styles.progressBar}
                    style={{
                      width: currentIndex === index ? `${progress}%` : "0%",
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.closenShareButton}>
            <button className={styles.closeButton} onClick={onClose}>
              X
            </button>
            <button className={styles.shareButton} onClick={()=>handleShareClick()}>
              <img src={share} alt="Share" />
            </button>
          </div>
          <div className={styles.slide}>
            {slides[currentIndex] && (
              <div className={styles.imageOrvideo}>
                {mediaType === "video" ? (
                  <video
                    className={styles.cardSlideVideo}
                    autoPlay
                    ref={videoRef}
                    src={slides[currentIndex].url}
                    alt={slides[currentIndex].heading}
                    preload="none"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : mediaType === "image" ? (
                  <img
                    src={slides[currentIndex].url}
                    alt={slides[currentIndex].heading}
                    className={styles.cardSlideImage}
                    onError={(e) =>
                      (e.target.src = "path_to_placeholder_image.jpg")
                    }
                  />
                ) : (
                  <div className={styles.fallbackMessage}>
                    Media not available
                  </div>
                )}
              </div>
            )}
            <div className={styles.headingText}>
              <h3>{slides[currentIndex]?.heading}</h3>
              <p>{slides[currentIndex]?.description}</p>
            </div>
          </div>
          <div className={styles.bottomButton}>
            <button
              className={styles.bookmarkButton}
              onClick={() => handleBookmarkClick()}
            >
              <IoBookmark
                style={{
                  color: isBookmarked ? "blue" : "white",
                  cursor: "pointer",
                }}
                size={30}
              />
            </button>
            <button
              className={styles.downloadButton}
              onClick={() => handleDownload(slides[currentIndex])}
            >
              {downloadedSlides.includes(slides[currentIndex]) ? (
                <MdFileDownloadDone size={30} />
              ) : (
                <IoMdDownload
                  style={{ color: "white", cursor: "pointer" }}
                  size={30}
                />
              )}
            </button>
            <button className={styles.heartButton} onClick={handleHeartClick}>
              <FaHeart
                style={{ color: isLiked ? "red" : "white", cursor: "pointer" }}
                size={30}
              />
              <div className={styles.likeCount}>{likeCount}</div>
            </button>
          </div>
        </div>
        <button className={styles.nextButton} onClick={handleNext}>
          <img src={next} alt="Next" />
        </button>
      </div>
      <ModalTemplate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
      />
    </div>
  );
};

export default StorySlide;
