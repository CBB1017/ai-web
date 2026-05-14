export const handleResponseError = async (response: Response, defaultMessage: string) => {
    let errorDetail = defaultMessage;
    try {
        const errorData = await response.json();
        // 다양한 에러 필드 지원 (message, detail, error.detail, status: "fail" 등)
        errorDetail = errorData.message || 
                      errorData.detail || 
                      errorData.error?.detail || 
                      (errorData.status === 'fail' ? errorData.message : null) ||
                      defaultMessage;
    } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 유지
    }

    const error: any = new Error(errorDetail);
    error.status = response.status;
    return error;
};
