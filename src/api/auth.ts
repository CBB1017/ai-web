// 예시: 공통 API 호출 헬퍼
export const fetchWithAuth = (url: string, options: any = {}) => {
    const token = localStorage.getItem('accessToken');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
};