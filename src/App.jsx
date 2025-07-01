import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ClerkAuthProvider from "./providers/ClerkAuthProvider";
import { Provider } from "react-redux";
import { store } from "./store";

const App = () => {
  return (
    <div className="overflow-x-hidden font-openSans">
      <Provider store={store}>
        <ClerkAuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Homepage />} />
            </Routes>
            <Footer />
          </Router>
        </ClerkAuthProvider>
      </Provider>
    </div>
  );
};

export default App;
