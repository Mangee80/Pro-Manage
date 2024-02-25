import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import {Login} from "./Pages/Loginpage";
import { Register } from "./Pages/Registerpage";
import { CreateCardForm } from "../src/Components/Cardform/CreateNewCardForm"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/create" element={<CreateCardForm/>}/>
    </Routes>
  );
}

export default App;
