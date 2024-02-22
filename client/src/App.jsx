import { Routes, Route } from "react-router-dom";
import { Homepage } from "./Pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Ap/>}/>
      <Route path="/board" element={<Homepage/>}/>
    </Routes>
  );
}

export default App;
