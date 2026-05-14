import type { BirthdayResponse } from "../store/store.ts";
import { handleResponseError } from "./apiUtils";

export const fetchBirthdays = async (): Promise<BirthdayResponse[]> => {
    const res = await fetch('/api/v1/birthdays', { credentials: 'include' });
    if (!res.ok) {
        throw await handleResponseError(res, '생일자 목록을 불러오는데 실패했습니다.');
    }
    return res.json();
};
