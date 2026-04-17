import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    ko: {
        translation: {
            login: {
                title: "브라이센 코리아",
                subtitle: "AI Web Service",
                id: "아이디",
                password: "비밀번호",
                btn: "로그인",
                loading: "로그인 중...",
                serverError: "서버와 통신할 수 없습니다. 백엔드 서비스 상태를 확인해주세요."
            },
            sidebar: {
                newChat: "+ 새 대화",
                history: "대화 기록",
                pin: "사이드바 고정",
                unpin: "고정 해제",
                loading: "로딩 중...",
                justNow: "방금 전",
                minutesAgo: "{{count}}분 전",
                hoursAgo: "{{count}}시간 전",
                daysAgo: "{{count}}일 전",
                emptyChat: "새 대화"
            },
            chat: {
                userSuffix: "님의 AI Assistant",
                logout: "로그아웃",
                loggingOut: "로그아웃 중...",
                modeGeneral: "일반 대화",
                modeKnowledge: "사내 지식 기반 (RAG)",
                welcomeTitle: "안녕하세요, {{name}}님!",
                welcomeSubtitle: "궁금한 점을 물어보거나 아래 제안 중 하나를 선택해보세요.",
                generating: "답변을 생성하는 중...",
                congratulate: "축하하기",
                birthday: "🎂 오늘은 {{name}}님의 생일입니다!",
                notice: "📢 [공지] {{title}}",
                stop: "중단",
                inputPlaceholder: "메시지를 입력하세요...",
                newChatPlaceholder: "새 대화를 시작하려면 메시지를 입력하세요",
                send: "전송",
                inputEmptyAlert: "메시지를 입력해주세요.",
                me: "나",
                highDemandError: "현재 AI 모델 사용량이 많아 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
                suggestions: {
                    mcp: "MCP 목록 확인하기",
                    vacation: "휴가 신청서 상신 (필요한 정보 안내)",
                    ot: "OT 신청서 상신 (필요한 정보 안내)",
                    email: "이메일 요약",
                    rule: "사내 규정 안내"
                }
            },
            action: {
                title: "액션 내역",
                success: "성공",
                failed: "실패",
                rollbackSuccess: "롤백 성공",
                rollbackFailed: "롤백 실패",
                rollback: "롤백",
                rolledBack: "롤백됨",
                seconds: "초"
            }
        }
    },
    en: {
        translation: {
            login: {
                title: "Brycen Korea",
                subtitle: "AI Web Service",
                id: "ID",
                password: "Password",
                btn: "Login",
                loading: "Logging in...",
                serverError: "Cannot connect to the server. Please check the backend service status."
            },
            sidebar: {
                newChat: "+ New Chat",
                history: "Chat History",
                pin: "Pin Sidebar",
                unpin: "Unpin Sidebar",
                loading: "Loading...",
                justNow: "Just now",
                minutesAgo: "{{count}}m ago",
                hoursAgo: "{{count}}h ago",
                daysAgo: "{{count}}d ago",
                emptyChat: "New Chat"
            },
            chat: {
                userSuffix: "'s AI Assistant",
                logout: "Logout",
                loggingOut: "Logging out...",
                modeGeneral: "General Chat",
                modeKnowledge: "Internal Knowledge (RAG)",
                welcomeTitle: "Hello, {{name}}!",
                welcomeSubtitle: "Ask anything or select one of the suggestions below.",
                generating: "Generating response...",
                congratulate: "Congratulate",
                birthday: "🎂 Today is {{name}}'s birthday!",
                notice: "📢 [Notice] {{title}}",
                stop: "Stop",
                inputPlaceholder: "Type a message...",
                newChatPlaceholder: "Type a message to start a new chat",
                send: "Send",
                inputEmptyAlert: "Please enter a message.",
                me: "Me",
                highDemandError: "The AI model is currently experiencing high demand. Please try again in a moment.",
                suggestions: {
                    mcp: "Check MCP List",
                    vacation: "Submit vacation request (guide on required info)",
                    ot: "Submit OT request (guide on required info)",
                    email: "Email summary",
                    rule: "Internal rules guide"
                }
            },
            action: {
                title: "Action History",
                success: "Success",
                failed: "Failed",
                rollbackSuccess: "Rollback Success",
                rollbackFailed: "Rollback Failed",
                rollback: "Rollback",
                rolledBack: "Rolled back",
                seconds: "s"
            }
        }
    },
    ja: {
        translation: {
            login: {
                title: "ブ라이センコリア",
                subtitle: "AI Web Service",
                id: "ID",
                password: "パスワード",
                btn: "ログイン",
                loading: "ログイン中...",
                serverError: "サーバーと通信できません。バックエンドサービスの状態を確認してください。"
            },
            sidebar: {
                newChat: "+ 新規チャット",
                history: "会話履歴",
                pin: "サイドバーを固定",
                unpin: "固定を解除",
                loading: "読み込み中...",
                justNow: "たった今",
                minutesAgo: "{{count}}分前",
                hoursAgo: "{{count}}時間前",
                daysAgo: "{{count}}日前",
                emptyChat: "新規チャット"
            },
            chat: {
                userSuffix: "さんの AI Assistant",
                logout: "ログアウト",
                loggingOut: "ログアウト中...",
                modeGeneral: "一般対話",
                modeKnowledge: "社内知識ベース (RAG)",
                welcomeTitle: "こんにちは、{{name}}さん！",
                welcomeSubtitle: "気になることを聞いたり、以下の提案から1つ選択してください。",
                generating: "回答を生成中...",
                congratulate: "お祝いする",
                birthday: "🎂 今日は{{name}}さんの誕生日です！",
                notice: "📢 [お知らせ] {{title}}",
                stop: "중단",
                inputPlaceholder: "メッセージを入力...",
                newChatPlaceholder: "新しい対話を開始するにはメッセージを入力してください",
                send: "送信",
                inputEmptyAlert: "メッセージを入力してください。",
                me: "自分",
                highDemandError: "現在、AIモデルの利用が集中しています。しばらくしてからもう一度お試しください。",
                suggestions: {
                    mcp: "MCPリストを確認する",
                    vacation: "休暇届の提出（必要情報の案内）",
                    ot: "残業申請の提出（必要情報の案内）",
                    email: "メールの要約",
                    rule: "社内規定の案内"
                }
            },
            action: {
                title: "アクション履歴",
                success: "成功",
                failed: "失敗",
                rollbackSuccess: "ロールバック成功",
                rollbackFailed: "ロールバック失敗",
                rollback: "ロールバック",
                rolledBack: "ロールバック済み",
                seconds: "秒"
            }
        }
    },
    vi: {
        translation: {
            login: {
                title: "Brycen Korea",
                subtitle: "AI Web Service",
                id: "Tên đăng nhập",
                password: "Mật khẩu",
                btn: "Đăng nhập",
                loading: "Đang đăng nhập...",
                serverError: "Không thể kết nối với máy chủ. Vui lòng kiểm tra trạng thái dịch vụ backend."
            },
            sidebar: {
                newChat: "+ Cuộc trò chuyện mới",
                history: "Lịch sử trò chuyện",
                pin: "Ghim thanh bên",
                unpin: "Bỏ ghim thanh bên",
                loading: "Đang tải...",
                justNow: "Vừa xong",
                minutesAgo: "{{count}} phút trước",
                hoursAgo: "{{count}} giờ trước",
                daysAgo: "{{count}} ngày trước",
                emptyChat: "Cuộc trò chuyện mới"
            },
            chat: {
                userSuffix: " - Trợ lý AI",
                logout: "Đăng xuất",
                loggingOut: "Đang đăng xuất...",
                modeGeneral: "Trò chuyện chung",
                modeKnowledge: "Kiến thức nội bộ (RAG)",
                welcomeTitle: "Xin chào, {{name}}!",
                welcomeSubtitle: "Hãy đặt câu hỏi 또는 chọn một trong các gợi ý dưới đây.",
                generating: "Đang tạo câu trả lời...",
                congratulate: "Chúc mừng",
                birthday: "🎂 Hôm nay là sinh nhật của {{name}}!",
                notice: "📢 [Thông báo] {{title}}",
                stop: "Dừng",
                inputPlaceholder: "Nhập tin nhắn...",
                newChatPlaceholder: "Nhập tin nhắn để bắt đầu cuộc trò chuyện mới",
                send: "Gửi",
                inputEmptyAlert: "Vui lòng nhập tin nhắn.",
                me: "Tôi",
                highDemandError: "Mô hình AI hiện đang có lượng truy cập cao. Vui lòng thử lại sau giây lát.",
                suggestions: {
                    mcp: "Kiểm tra danh sách MCP",
                    vacation: "Gửi đơn xin nghỉ phép (hướng dẫn thông tin cần thiết)",
                    ot: "Gửi đơn xin làm thêm giờ (hướng dẫn thông tin cần thiết)",
                    email: "Tóm tắt email",
                    rule: "Hướng dẫn quy định công ty"
                }
            },
            action: {
                title: "Lịch sử hành động",
                success: "Thành công",
                failed: "Thất bại",
                rollbackSuccess: "Khôi phục thành công",
                rollbackFailed: "Khôi phục thất bại",
                rollback: "Khôi phục",
                rolledBack: "Đã khôi phục",
                seconds: "giây"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'ko',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
