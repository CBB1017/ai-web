import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
    const { isAuthenticated } = useAuth();

    // 인증 여부에 따른 조건부 렌더링 (가장 가벼운 라우팅)
    return isAuthenticated ? <Chat /> : <Login />;
}

export default App;