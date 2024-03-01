import { Routes, Route } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Login } from "./Pages/Loginpage";
import { CardDetails } from "./Pages/CardDetails";
import { Register } from "./Pages/Registerpage";
import { CreateNewCardForm } from "./Components/Cardform/CreateNewCardFom";

function App() {
  return (
    <Routes>
      {/* Use the CardDetails component and access the id parameter with useParams */}
      <Route path="/card/:id" element={<CardDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/" element={<Login />} />
      <Route path="/create" element={<CreateNewCardForm />} />
    </Routes>
  );
}

export default App;
