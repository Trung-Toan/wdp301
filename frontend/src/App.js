import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllRouter from "./routes/AllRouter";
import AccessibilitySettings from "./components/AccessibilitySettings";
import HelpButton from "./components/HelpButton";

function App() {
  return (
    <>
      <AllRouter />
      <AccessibilitySettings />
      <HelpButton />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;

