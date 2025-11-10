import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import GameCategory from "./components/MainContent/GameCategory";
import GameProvider from "./components/MainContent/GameProvider";
import GameManager from "./components/MainContent/GameManager";
import GameStore from "./components/MainContent/GameStore";
import GameTag from "./components/MainContent/GameTag";

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="container">
          <Header />
          <div className="main-layout">
            <SideBar />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<GameCategory />} />
                <Route path="/game-provider" element={<GameProvider />} />
                <Route path="/game-manager" element={<GameManager />} />
                <Route path="/game-store" element={<GameStore />} />
                <Route path="/game-tags" element={<GameTag />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
