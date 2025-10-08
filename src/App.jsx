import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import AuthContextComponent from "./context/AuthContext";
import MobileInstallPrompt from "./components/common/MobileInstallPrompt";

function App() {
  return (
    <BrowserRouter>
      <AuthContextComponent>
        <AppRouter />
        <MobileInstallPrompt />
      </AuthContextComponent>
    </BrowserRouter>
  );
}

export default App;
