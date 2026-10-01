import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import P2P from "./pages/P2P";
import P2M from "./pages/P2M";
import Recharge from "./pages/Recharge";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/p2p" element={<P2P />} />
          <Route path="/p2m" element={<P2M />} />
          <Route path="/recharge" element={<Recharge />} />
        </Routes>
      </Router>
  );
}

export default App;