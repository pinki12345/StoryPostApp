
import React, { useEffect, useState } from "react";
import styles from "./SharePage.module.css";
import next from "../assets/next.png";
import prev from "../assets/prev.png";
import share from "../assets/share.png";
import bookmarkBlue from "../assets/blueBookmark.png"; 
import bookmarkWhite from "../assets/bookmark.png";
import heart from "../assets/heart.png";
import redHeart from "../assets/redHeart.png";
import { useSelector, useDispatch } from "react-redux";
import { likeSlide, unlikeSlide, setLikedSlides } from "../actions/index";
import ModalTemplate from "../Components/ModalTemplate";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

const SharePage = ({onClose }) =>{
  const { slideId } = useParams();
  const [slides, setSlides] = useState([]);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false); 
  const totalSlides = slides.length;
  const token =
    useSelector((state) => state.token) || localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
 
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
    setProgress(0);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex === totalSlides - 1 ? 0 : prevIndex + 1;
      if (nextIndex === 0) {
        onClose();
      }
      return nextIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const currentSlide = slides[currentIndex];
    setIsLiked(currentSlide.likedBy.includes(userId));
    setLikeCount(currentSlide.likes);
    setIsBookmarked(currentSlide.bookmarks.includes(userId)); 
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
        toast.success("Slide unliked!");
      } else {
        dispatch(likeSlide(slideId));
        setIsLiked(true);
        setLikeCount(likeCount + 1);
        toast.success("Slide liked!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling like on the slide."
      );
    }
  };

  const handleBookmarkClick = async () => {
    if (!token) {
      setIsModalOpen(true);
      return;
    }

    const slideId = slides[currentIndex]._id;

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
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling bookmark on the slide."
      );
    }
  };

const handleShareClick = () => {
    const currentSlide = slides[currentIndex];
    const slideId = currentSlide._id; 
    const newWindowUrl = `https://story-post-app.vercel.app/api/v1/shareslide/${slideId}`; 
    navigator.clipboard.writeText(newWindowUrl)
        .then(() => {
            toast.success("Story URL copied to clipboard!"); 
        })
        .catch(() => {
            toast.error("Failed to copy URL."); 
        });
};



  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.prevButton} onClick={handlePrev}>
          <img src={prev} alt="Previous" />
        </button>
        <button className={styles.nextButton} onClick={handleNext}>
          <img src={next} alt="Next" />
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
            <button className={styles.shareButton} onClick={handleShareClick}>
              <img src={share} alt="Share" />
            </button>
          </div>

          <div className={styles.slide}>
            {slides[currentIndex]?.image && (
              <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].heading}
                className={styles.slideImage}
              />
            )}
            {slides[currentIndex]?.video && (
              <video
                controls
                className={styles.slideVideo}
                src={slides[currentIndex].video}
                alt={slides[currentIndex].heading}
              />
            )}
            <div className={styles.headingText}>
              <h3>{slides[currentIndex]?.heading}</h3>
              <p>{slides[currentIndex]?.description}</p>
            </div>
          </div>

          <div className={styles.bottomButton}>
            <button
              className={styles.bookmarkButton}
              onClick={handleBookmarkClick}
            >
              <img
                src={isBookmarked ? bookmarkBlue : bookmarkWhite}
                alt="Bookmark"
              />
            </button>
            <button className={styles.heartButton} onClick={handleHeartClick}>
              <img src={isLiked ? redHeart : heart} alt="Like" />
              <div className={styles.likeCount}>{likeCount}</div>
            </button>
          </div>
        </div>
      </div>

      <ModalTemplate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
      />
    </div>
  );
};

export default SharePage;
