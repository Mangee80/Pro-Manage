import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import {Login} from "./Pages/Loginpage";
import { Register } from "./Pages/Registerpage";
import { CreateNewCardForm } from "./Components/Cardform/CreateNewCardFom"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/create" element={<CreateNewCardForm />}/>
    </Routes>
  );
}

export default App;
