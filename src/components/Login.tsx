import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
    const { login } = useAuth();

    const mutation = useMutation({
        mutationFn: async ({ userId, pass }: { userId: string, pass: string }) => {
            return await login(userId, pass);
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userId = formData.get('id') as string;
        const pass = formData.get('pass') as string;
        
        mutation.mutate({ userId, pass });
    };

    return (
        <div className="login-container">
            {mutation.isPending && (
                <div className="linear-progress-container">
                    <div className="linear-progress-bar" />
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <input 
                    name="id" 
                    placeholder="ID" 
                    required 
                    disabled={mutation.isPending}
                />
                <input 
                    name="pass" 
                    type="password" 
                    placeholder="PW" 
                    required 
                    disabled={mutation.isPending}
                />
                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? '로그인 중...' : '로그인'}
                </button>
            </form>
        </div>
    );
}