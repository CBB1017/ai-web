import { useState, useEffect } from 'react';

export function useTimeRefresh() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // 1분마다 갱신

        return () => clearInterval(timer);
    }, []);

    return now;
}