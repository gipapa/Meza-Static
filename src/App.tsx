import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PlayModePage from './pages/PlayModePage';
import AreaSelectPage from './pages/AreaSelectPage';
import BattlePage from './pages/BattlePage';
import CatchPage from './pages/CatchPage';
import ResultPage from './pages/ResultPage';
import CollectionPage from './pages/CollectionPage';
import TagDetailPage from './pages/TagDetailPage';
import TrainerPage from './pages/TrainerPage';
import HowToPage from './pages/HowToPage';
import SettingsPage from './pages/SettingsPage';
import { TestBattlePage, TestWheelPage, TestCatchPage } from './pages/TestBattlePage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayModePage />} />
            <Route path="/play/area" element={<AreaSelectPage />} />
            <Route path="/play/battle" element={<BattlePage />} />
            <Route path="/play/catch" element={<CatchPage />} />
            <Route path="/play/catch-now" element={<CatchPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/collection/:tagId" element={<TagDetailPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/howto" element={<HowToPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/test/battle" element={<TestBattlePage />} />
            <Route path="/test/wheel" element={<TestWheelPage />} />
            <Route path="/test/catch" element={<TestCatchPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
