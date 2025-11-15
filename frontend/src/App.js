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
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        limit={10}
        enableMultiContainer={false}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  );
}

export default App;

