import React from "react";
import styles from "./Bookmark.module.css";

const validateUrl = (url) => {
  const pattern =
    /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w- ./?%&=]*)?(\.(jpg|jpeg|png|gif|mp4|webm|avi))$/i;
  return pattern.test(url);
};

const Bookmark = ({ bookmarks }) => {
  console.log("bookmarks", bookmarks);
  return (
    <div className={styles.bookmarkContainer}>
      {bookmarks.length > 0 ? (
        bookmarks.map((bookmark) => (
          <div key={bookmark.slideId} className={styles.bookmarkCard}>
            {validateUrl(bookmark.url) ? (
              bookmark.url.match(/\.(mp4|webm|avi)$/i) ? (
                <video
                  className={styles.cardSlideVideo}
                  autoPlay
                  src={bookmark.url}
                  alt={bookmark.heading}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <img
                  src={bookmark.url}
                  alt={bookmark.heading}
                  className={styles.cardSlideImage}
                  onError={(e) =>
                    (e.target.src = "path_to_placeholder_image.jpg")
                  }
                />
              )
            ) : (
              <div className={styles.fallbackMessage}>Media not available</div>
            )}

            <div className={styles.bookmarkContent}>
              <h4 className={styles.bookmarkHeading}>{bookmark.heading}</h4>
              <p className={styles.bookmarkDescription}>
                {bookmark.description}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noBookmarks}>No bookmarks found</p>
      )}
    </div>
  );
};

export default Bookmark;
