import { Routes, Route, Navigate } from "react-router";
import { useLocation } from 'react-router-dom';
import { Login } from './pages/RegisterPages/Login'
import { Register } from "./pages/RegisterPages/Register";
import { Dashboard } from "./pages/DashboardComponents/Dashboard";
import { PageNotFound } from "./pages/PageNotFound/PageNotFound";
import { LinksPage } from "./pages/LinksPage";
import { ClientTransactionsPage } from './pages/ClientTransactionsPages/ClientTransactionsPage';
import { Chatbot } from "./pages/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import './App.css'



function App() {
  // const [count, setCount] = useState(0)
  const location = useLocation();
  const hideChatbotOnPages = ["/login", "/register"];

  let showChatbot = true;
  if (hideChatbotOnPages.includes(location.pathname)) {
    showChatbot = false;
  }


  return (
    <>
      <div className="parent-container">
      <Routes>
        <Route path='/' element={<Navigate to={"/login"}/>} />

        <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />

        <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />

        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path='/links' element={
          <ProtectedRoute>
            <LinksPage />
          </ProtectedRoute>
        } />

        <Route path='/clients/:clientId/transactions' element={
          <ProtectedRoute>
            <ClientTransactionsPage />
          </ProtectedRoute>
        } />

        {/* <Route path='/chatbot' element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        } /> */}

        <Route path="*" element={<PageNotFound/>} />
        
      </Routes>

      {showChatbot && <Chatbot />}
    </div>
    </>
  )
}

export default App
