import type { BirthdayResponse } from "../store/store.ts";

export const fetchBirthdays = async (): Promise<BirthdayResponse[]> => {
    const res = await fetch('/api/v1/birthdays', { credentials: 'include' });
    if (!res.ok) {
        const error: any = new Error('생일자 목록을 불러오는데 실패했습니다.');
        error.status = res.status;
        throw error;
    }
    return res.json();
};
