import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import StatsPage from "./components/StatsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/code/:code" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


