import type { BirthdayResponse } from "../store/store.ts";
import { handleResponseError } from "./apiUtils";
import i18n from '../i18n';

export const fetchBirthdays = async (): Promise<BirthdayResponse[]> => {
    const res = await fetch('/api/v1/birthdays', { credentials: 'include' });
    if (!res.ok) {
        throw await handleResponseError(res, i18n.t('error.birthdayListLoadFailed'));
    }
    return res.json();
};
