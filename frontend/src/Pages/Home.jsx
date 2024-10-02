import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import maskGroup1 from "../assets/Mask group (1).png";
import maskGroup6 from "../assets/Mask group (6).png";
import movie from "../assets/movie.jpg";
import animal from "../assets/animal.jpg";
import edu from "../assets/edu.jpg";
import health from "../assets/health.jpg";
import Card from "../Components/Card";
import ModalTemplate from "../Components/ModalTemplate";
import menubar from "../assets/menubar.png";
import AddStoryModal from "../Components/AddStoryModal";
import { useDispatch, useSelector } from "react-redux";
import bookmark from "../assets/bookmark.png";
import {
  logout,
  openAddStoryModal,
  closeAddStoryModal,
  setStoryToEdit,
  setStories,
  fetchStoriesByCategory,
  setStoriesByCategory,
} from "../actions";
import Bookmark from "./Bookmark";
import { setLoading } from "../actions";
import Loader from "../Components/Loader";

const Home = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const loading = useSelector((state) => state.isLoading);
  const isAddStoryModalOpen = useSelector((state) => state.isAddStoryModalOpen);
  const userStories = useSelector((state) => state.stories);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const token =
    useSelector((state) => state.token) || localStorage.getItem("token");
  const [isBottomBoxVisible, setBottomBoxVisible] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const filteredStories = useSelector((state) => state.filteredStories);
  const [isStoriesVisible, setIsStoriesVisible] = useState(true);

  const handleShowYourStories = () => {
    setIsStoriesVisible((prev) => !prev);
    setBottomBoxVisible(false);
  };

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const logoutButtonRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || null;

  const fullName = user ? user.username : "";

  const openModal = (type) => {
    console.log(`Opening modal of type: ${type}`);
    setModalType(type);
    setIsModalOpen(true);
    setBottomBoxVisible(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log("Modal Open:", isModalOpen);
    console.log("Modal Type:", modalType);
  }, [isModalOpen, modalType]);

  const [bookmarks, setBookmarks] = useState([]);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleopenAddStoryModal = () => {
    dispatch(setStoryToEdit(null));
    dispatch(openAddStoryModal());
    setBottomBoxVisible(false);
  };

  const getFirstAndLastWord = (fullName) => {
    const words = fullName.trim().split(" ");
    const firstLetter = words[0].charAt(0);
    const lastLetter = words[words.length - 1].charAt(0);
    return `${firstLetter}${lastLetter}`;
  };

  const handleLogout = () => {
    console.log("Hi Ji ");
    setMenuVisible(false);
    localStorage.removeItem("token");
    dispatch(logout());
  };

  useEffect(() => {
    dispatch(fetchStoriesByCategory(selectedCategories));
  }, [selectedCategories]);

  const handleCategoryClick = (category) => {
    setSelectedCategories((prev) => {
      if (category === "All") {
        if (prev.includes("All")) {
          return prev.filter((cat) => cat !== "All");
        } else {
          return ["All"];
        }
      } else {
        const newCategories = prev.includes(category)
          ? prev.filter((cat) => cat !== category)
          : [...prev, category];
        if (newCategories.length > 0) {
          return newCategories.includes("All")
            ? newCategories
            : [...newCategories, "All"];
        }
        return newCategories;
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [menuVisible]);

  const handleAddBookmark = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/bookmarks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response: ", response.data);

      if (response.status === 200) {
        setBookmarks(response.data);
        setShowBookmarks((prev) => !prev);
        setBottomBoxVisible(false);
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const toggleBottomBox = () => {
    setBottomBoxVisible((prev) => !prev);
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        {!token ? (
          <div>
            {isMobile ? (
              <div className={styles.auth}>
                <img
                  src={menubar}
                  alt="MenuMobile"
                  onClick={toggleBottomBox}
                  className={styles.menuIcon}
                />
                {isBottomBoxVisible && (
                  <div className={styles.bottomBox}>
                    <button
                      className={styles.registerBtn}
                      onClick={() => openModal("signup")}
                    >
                      Register
                    </button>
                    <button
                      className={styles.signInBtn}
                      onClick={() => openModal("login")}
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <button
                  className={styles.registerBtn}
                  onClick={() => openModal("signup")}
                >
                  Register
                </button>
                <button
                  className={styles.signInBtn}
                  onClick={() => openModal("login")}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {isMobile ? (
              <div className={styles.signIn}>
                <div className={styles.menubtn}>
                  <img
                    src={menubar}
                    alt="MenuMobile"
                    onClick={toggleBottomBox}
                    className={styles.menuIcon}
                  />
                </div>
                {isBottomBoxVisible && (
                  <div className={styles.bottomSignInBox}>
                    <div className={styles.nameofUser}>
                      {" "}
                      <div className={styles.nameDisplayFirstnLast}>
                        <p>{getFirstAndLastWord(fullName)}</p>
                      </div>
                      <p className={styles.fullName}>{fullName}</p>
                    </div>
                    <button
                      className={styles.yourStory}
                      onClick={handleShowYourStories}
                    >
                      Your Story
                    </button>
                    <button
                      className={styles.signInBtn}
                      onClick={handleopenAddStoryModal}
                    >
                      Add Story
                    </button>
                    <button
                      className={styles.addBookmarks}
                      onClick={handleAddBookmark}
                    >
                      <img src={bookmark} alt="Bookmark Icon" />
                      <p>Add Bookmarks</p>
                    </button>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.rightSide}>
                <button
                  className={styles.addBookmarks}
                  onClick={handleAddBookmark}
                >
                  {" "}
                  <img src={bookmark} />
                  <p>Add Bookmarks</p>
                </button>
                <button
                  className={styles.signInBtn}
                  onClick={handleopenAddStoryModal}
                >
                  Add Story
                </button>
                <div className={styles.nameDisplayFirstnLast}>
                  <p>{getFirstAndLastWord(fullName)}</p>
                </div>
                <div
                  className={styles.menuBar}
                  onClick={toggleMenu}
                  ref={menuButtonRef}
                >
                  <img src={menubar} alt="Menu Bar" />
                </div>
                {menuVisible && (
                  <div className={styles.nameDisplay} ref={menuRef}>
                    <p>{fullName}</p>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className={styles.cardContainer}>
        <div className={styles.mainCard}>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("All") ? styles.selectedCard : ""
            }`}
            onClick={() => handleCategoryClick("All")}
          >
            <img src={maskGroup6} alt="All" />
            <p className={styles.cardText}>All</p>
          </div>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("Health and Fitness")
                ? styles.selectedCard
                : ""
            }`}
            onClick={() => handleCategoryClick("Health and Fitness")}
          >
            <img src={health} alt="Health" />
            <p className={styles.cardText}>Health and Fitness</p>
          </div>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("Animal") ? styles.selectedCard : ""
            }`}
            onClick={() => handleCategoryClick("Animal")}
          >
            <img src={animal} alt="Animal" />
            <p className={styles.cardText}>Animal</p>
          </div>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("Education")
                ? styles.selectedCard
                : ""
            }`}
            onClick={() => handleCategoryClick("Education")}
          >
            <img src={edu} alt="Education" />
            <p className={styles.cardText}>Education</p>
          </div>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("World") ? styles.selectedCard : ""
            }`}
            onClick={() => handleCategoryClick("World")}
          >
            <img src={maskGroup1} alt="World" />
            <p className={styles.cardText}>World</p>
          </div>
          <div
            className={`${styles.card} ${
              selectedCategories.includes("Movies") ? styles.selectedCard : ""
            }`}
            onClick={() => handleCategoryClick("Movies")}
          >
            <img src={movie} alt="Movies" />
            <p className={styles.cardText}>Movies</p>
          </div>
        </div>
      </div>

      {token ? (
        <div className={styles.cardSectionContainer}>
          {loading ? (
            <p>Loading...</p>
          ) : showBookmarks ? (
            <div className={styles.categoryContainer}>
              <h3 className={styles.categoryTitle}>Your Bookmarked Stories</h3>
              {bookmarks.length > 0 ? (
                <Bookmark bookmarks={bookmarks} />
              ) : (
                <p className={styles.noStories}>No bookmarks found</p>
              )}
            </div>
          ) : (
            <div>
              {(isMobile && isStoriesVisible) || !isMobile ? (
                <div className={styles.categoryContainer}>
                  <h3 className={styles.categoryTitle}>Your Stories</h3>
                  {userStories ? (
                    <Card slides={userStories} showEditButton={true} />
                  ) : (
                    <p className={styles.noStories}>No stories Available</p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
      <div className={styles.cardSectionContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : filteredStories.length > 0 ? (
          filteredStories.map(({ category, stories }) => (
            <div key={category} className={styles.categoryContainer}>
              <h3 className={styles.categoryTitle}>{category}</h3>

              {stories.stories ? (
                <Card slides={stories.stories} showEditButton={false} />
              ) : (
                <p className={styles.noStories}>No stories Available</p>
              )}
            </div>
          ))
        ) : (
          <p>No stories available for selected categories</p>
        )}
      </div>
      {isModalOpen && (
        <ModalTemplate
          isOpen={isModalOpen}
          onClose={closeModal}
          formType={modalType}
          setModalType={setModalType}
        />
      )}
      {isAddStoryModalOpen && <AddStoryModal />}
    </div>
  );
};

export default Home;
