import React, { useState, useEffect } from "react";
import styles from "./Card.module.css";
import editicon from "../assets/edit.png";
import { useSelector, useDispatch } from "react-redux";
import {
  openAddStoryModal,
  closeAddStoryModal,
  setStoryToEdit,
  setSlides,
} from "../actions";
import AddStoryModal from "./AddStoryModal";
import StorySlide from "./StorySlide";

const validateUrl = (url) => {
  const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?$/i;
  return pattern.test(url);
};

const Card = ({ slides, showEditButton }) => {
  const dispatch = useDispatch();
  const isAddStoryModalOpen = useSelector((state) => state.isAddStoryModalOpen);
  const [showAll, setShowAll] = useState(false);
  const token =
    useSelector((state) => state.token) || localStorage.getItem("token");
  const visibleStories = showAll ? slides : slides?.slice(0, 4);
  console.log("visibleStories", visibleStories);
  const [isSlidesModalOpen, setIsSlidesModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const handleEditClick = (slide, e) => {
    e.stopPropagation();
    if (slide) {
      dispatch(setStoryToEdit(slide));
      dispatch(openAddStoryModal());
    }
  };
  const handleCloseModal = () => {
    dispatch(setStoryToEdit(null));
    dispatch(closeAddStoryModal());
  };
  const handleSeeMore = () => {
    setShowAll(!showAll);
  };
  const handleSlideClick = (slide) => {
    setSelectedSlide(slide);
    dispatch(setSlides(slide?.slides));
    setIsSlidesModalOpen(true);
  };
  const handleCloseSlidesModal = () => {
    setIsSlidesModalOpen(false);
    setSelectedSlide(null);
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.SectionContainer}>
        {slides && (
          <div className={styles.commonConatiner}>
            <div className={styles.cardSectionContainer}>
              {visibleStories.map((slide, index) => (
                <div
                  key={index}
                  className={styles.card}
                  onClick={() => handleSlideClick(slide)}
                >
                  <div className={styles.imageOrvideo}>
                    {slide.slides &&
                      slide.slides[0] &&
                      (validateUrl(slide.slides[0]?.url) ? (
                        slide.slides[0]?.url.match(/\.(mp4|webm|avi)$/i) ? (
                          <video
                            className={styles.cardVideo}
                            // controls
                            src={slide.slides[0].url}
                            alt={slide.slides[0]?.heading || "Video"}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : (
                          <img
                            src={slide.slides[0].url}
                            alt={slide.slides[0]?.heading || "Image"}
                            className={styles.cardImage}
                            onError={(e) =>
                              (e.target.src = "path_to_placeholder_image.jpg")
                            }
                          />
                        )
                      ) : (
                        <div className={styles.fallbackMessage}>
                          Media not available
                        </div>
                      ))}

                    
                  </div>

                  <div className={styles.textContainer}>
                    <h3>{slide.slides[0]?.heading}</h3>
                    <p>{slide.slides[0]?.description}</p>
                  </div>
                  {showEditButton && (
                    <button
                      className={styles.editButton}
                      onClick={(e) => handleEditClick(slide, e)}
                    >
                      <img src={editicon} alt="edit" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className={styles.seeMoreBtn} onClick={handleSeeMore}>
              {showAll ? "Show Less" : "See More"}
            </button>
          </div>
        )}
      </div>
      {isAddStoryModalOpen && (
        <>
          <div className={styles.modaloverlay}></div>
          <AddStoryModal
            isOpen={isAddStoryModalOpen}
            onClose={handleCloseModal}
          />
        </>
      )}
      {isSlidesModalOpen && selectedSlide && (
        <StorySlide onClose={handleCloseSlidesModal} />
      )}
    </div>
  );
};

export default Card;
