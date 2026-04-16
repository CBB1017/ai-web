import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { login } = useAuth();
    const { t } = useTranslation();

    const mutation = useMutation({
        mutationFn: async ({ userId, pass }: { userId: string, pass: string }) => {
            return await login(userId, pass);
        },
        onError: (err: any) => {
            if (err.status === 502 || err.status === 503) {
                alert(t('chat.highDemandError'));
            } else {
                alert(err.message);
            }
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
            <div className="login-header">
                <h1>{t('login.title')}</h1>
                <p>{t('login.subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input 
                        name="id" 
                        placeholder={t('login.id')} 
                        required 
                        disabled={mutation.isPending}
                    />
                </div>
                <div className="input-group">
                    <input 
                        name="pass" 
                        type="password" 
                        placeholder={t('login.password')} 
                        required 
                        disabled={mutation.isPending}
                    />
                </div>
                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? t('login.loading') : t('login.btn')}
                </button>
            </form>
        </div>
    );
}