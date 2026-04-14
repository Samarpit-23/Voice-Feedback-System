import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recorder from "./components/Recorder";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/review/:businessId" element={<Recorder />} />
      </Routes>
    </Router>
  );
}

export default App;