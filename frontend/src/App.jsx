import "./App.css";
import Home from "./Pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SharePage from "./Pages/SharePage";
import StorySlide from "./Components/StorySlide";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shareslide/:slideId" element={<StorySlide />} />
      </Routes>
    </div>

    
  );
}

export default App;
