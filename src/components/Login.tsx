import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await login(formData.get('name') as string, formData.get('pass') as string);
        } catch (err) {
            alert("로그인 정보가 올바르지 않습니다.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="ID" required />
                <input name="pass" type="password" placeholder="PW" required />
                <button type="submit">로그인</button>
            </form>
        </div>
    );
}