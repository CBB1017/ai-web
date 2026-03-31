import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();

    const handleSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await login(formData.get('id') as string, formData.get('pass') as string);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit}>
                <input name="id" placeholder="ID" required />
                <input name="pass" type="password" placeholder="PW" required />
                <button type="submit">로그인</button>
            </form>
        </div>
    );
}