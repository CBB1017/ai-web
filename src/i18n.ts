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
                serverError: "서버와 통신할 수 없습니다. 백엔드 서비스 상태를 확인해주세요.",
                inputEmpty: "아이디와 비밀번호를 입력해주세요.",
                inputTooLong: "입력값이 너무 깁니다.",
                idPatternHint: "영문, 숫자, 특수문자(._-)만 가능합니다."
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
                birthday: "🎂 {{day}}일은 {{name}}님의 생일입니다!",
                birthdayMessage: "🎂 {{day}}일은 {{name}}님의 생일입니다! 🎉",
                notice: "📢 [공지] {{title}}",
                noticeBadge: "공지",
                birthdayBadge: "생일",
                stop: "중단",
                inputPlaceholder: "메시지를 입력하세요...",
                newChatPlaceholder: "새 대화를 시작하려면 메시지를 입력하세요",
                send: "전송",
                inputEmptyAlert: "메시지를 입력해주세요.",
                me: "나",
                serverError: "서버와 연결이 원활하지 않습니다. 페이지를 새로고침 해주세요.",
                highDemandError: "현재 AI 모델 사용량이 많아 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
                modeRagBadge: "RAG",
                modeGeneralBadge: "일반",
                modeMcpBadge: "MCP",
                notifications: {
                    emailSummaryTitle: "이메일 요약 완료",
                    emailSummaryBody: "이메일 요약 작업이 완료되었습니다.",
                    errorTitle: "오류 발생",
                },
                suggestions: {
                    mcp: "도구 목록 확인하기",
                    vacation: "휴가 신청서 상신 (필요한 정보 안내)",
                    ot: "OT 신청서 상신 (필요한 정보 안내)",
                    workPlan: "근무계획 수립 신청 (익월 기준)",
                    roomReservation: "회의실(공유물) 예약/조회",
                    email: "이메일 목록 요약",
                    rule: "사내 규정 안내"
                },
                emailActionStarting: "⏳ **이메일 요약 작업을 시작합니다.**\n결과가 준비되면 이 메시지가 업데이트됩니다.",
                genericError: "⚠️ 오류가 발생했습니다.\n\n[상세 내용]\n{{message}}",
                unknownError: "알 수 없는 서버 오류"
            },
            action: {
                title: "액션 내역",
                all: "전체",
                room: "채팅방",
                success: "성공",
                failed: "실패",
                rollbackSuccess: "롤백 성공",
                rollbackFailed: "롤백 실패",
                rollback: "롤백",
                rolledBack: "롤백됨",
                seconds: "초",
                running: "실행 중...",
                selectRoomPrompt: "채팅방을 선택해주세요.",
                openSidebar: "사이드바 열기",
                noActions: "표시할 액션이 없습니다."
            },
            error: {
                historyLoadFailed: "History 로드 실패",
                roomListLoadFailed: "채팅방 목록을 불러오는데 실패했습니다.",
                roomSaveFailed: "채팅방 저장에 실패했습니다.",
                boardPostLoadFailed: "게시판 포스트 로드 실패",
                recentPostLoadFailed: "최신 게시글 로드 실패",
                birthdayListLoadFailed: "생일자 목록을 불러오는데 실패했습니다.",
                actionLoadFailed: "액션 내역 로드 실패",
                myActionLoadFailed: "내 액션 내역 로드 실패",
                loginFailed: "로그인에 실패했습니다."
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
                serverError: "Cannot connect to the server. Please check the backend service status.",
                inputEmpty: "Please enter your ID and password.",
                inputTooLong: "Input is too long.",
                idPatternHint: "Only alphanumeric characters and (._-) are allowed."
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
                birthday: "🎂 The {{day}}th is {{name}}'s birthday!",
                birthdayMessage: "🎂 The {{day}}th is {{name}}'s birthday! 🎉",
                notice: "📢 [Notice] {{title}}",
                noticeBadge: "Notice",
                birthdayBadge: "B-day",
                stop: "Stop",
                inputPlaceholder: "Type a message...",
                newChatPlaceholder: "Type a message to start a new chat",
                send: "Send",
                inputEmptyAlert: "Please enter a message.",
                me: "Me",
                serverError: "Server connection error. Please refresh the page.",
                highDemandError: "The AI model is currently experiencing high demand. Please try again in a moment.",
                modeRagBadge: "RAG",
                modeGeneralBadge: "General",
                modeMcpBadge: "MCP",
                notifications: {
                    emailSummaryTitle: "Email Summary Complete",
                    emailSummaryBody: "The email summary task has been completed.",
                    errorTitle: "Error Occurred",
                },
                suggestions: {
                    mcp: "Check Tool List",
                    vacation: "Submit vacation request (guide on required info)",
                    ot: "Submit OT request (guide on required info)",
                    workPlan: "Request work plan creation (next month)",
                    roomReservation: "Meeting room (shared resources) reservation/inquiry",
                    email: "Email list summary",
                    rule: "Internal rules guide"
                },
                emailActionStarting: "⏳ **Starting email summary task.**\nThis message will be updated once the result is ready.",
                genericError: "⚠️ An error occurred.\n\n[Details]\n{{message}}",
                unknownError: "Unknown server error"
            },
            action: {
                title: "Action History",
                all: "All",
                room: "Room",
                success: "Success",
                failed: "Failed",
                rollbackSuccess: "Rollback Success",
                rollbackFailed: "Rollback Failed",
                rollback: "Rollback",
                rolledBack: "Rolled back",
                seconds: "s",
                running: "Running...",
                selectRoomPrompt: "Please select a chat room.",
                openSidebar: "Open Sidebar",
                noActions: "No actions to display."
            },
            error: {
                historyLoadFailed: "Failed to load history",
                roomListLoadFailed: "Failed to load chat room list.",
                roomSaveFailed: "Failed to save chat room.",
                boardPostLoadFailed: "Failed to load board posts.",
                recentPostLoadFailed: "Failed to load recent posts.",
                birthdayListLoadFailed: "Failed to load birthday list.",
                actionLoadFailed: "Failed to load action history.",
                myActionLoadFailed: "Failed to load my action history.",
                loginFailed: "Login failed."
            }
        }
    },
    ja: {
        translation: {
            login: {
                title: "ブライセンコリア",
                subtitle: "AI Web Service",
                id: "ID",
                password: "パスワード",
                btn: "ログイン",
                loading: "ログイン中...",
                serverError: "サーバーと通信できません。バックエンドサービスの状態を確認してください。",
                inputEmpty: "IDとパスワードを入力してください。",
                inputTooLong: "入力値が長すぎます。",
                idPatternHint: "英数字と特殊文字(._-)のみ使用可能です。"
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
                birthday: "🎂 {{day}}日は{{name}}さんの誕生日です！",
                birthdayMessage: "🎂 {{day}}日は{{name}}さんの誕生日です！ 🎉",
                notice: "📢 [お知らせ] {{title}}",
                noticeBadge: "お知らせ",
                birthdayBadge: "誕生日",
                stop: "中断",
                inputPlaceholder: "メッセージを入力...",
                newChatPlaceholder: "新しい対話を開始するにはメッセージを入力してください",
                send: "送信",
                inputEmptyAlert: "メッセージを入力してください。",
                me: "自分",
                serverError: "サーバーとの接続が円滑ではありません。ページを更新してください。",
                highDemandError: "現在、AIモデルの利用が集中しています。しばらくしてからもう一度お試しください。",
                modeRagBadge: "RAG",
                modeGeneralBadge: "一般",
                modeMcpBadge: "MCP",
                suggestions: {
                    mcp: "ツールリストを確認する",
                    vacation: "休暇届の提出（必要情報の案内）",
                    ot: "残業申請の提出（必要情報の案内）",
                    workPlan: "勤務計画の作成申請（翌月基準）",
                    roomReservation: "会議室（共有物）予約・照会",
                    email: "メールの要約",
                    rule: "社内規定の案内"
                },
                emailActionStarting: "⏳ **メール要約作業を開始します。**\n結果が準備でき次第、このメッセージが更新されます。",
                genericError: "⚠️ エラーが発生しました。\n\n[詳細]\n{{message}}",
                unknownError: "不明なサーバーエラー"
            },
            action: {
                title: "アクション履歴",
                all: "全体",
                room: "チャットルーム",
                success: "成功",
                failed: "失敗",
                rollbackSuccess: "ロールバック成功",
                rollbackFailed: "ロールバック失敗",
                rollback: "ロールバック",
                rolledBack: "ロールバック済み",
                seconds: "秒",
                running: "実行中...",
                selectRoomPrompt: "チャットルームを選択してください。",
                openSidebar: "サイドバーを開く",
                noActions: "表示するアクションがありません。"
            },
            error: {
                historyLoadFailed: "履歴の読み込みに失敗しました",
                roomListLoadFailed: "チャットルームリストの読み込みに失敗しました。",
                roomSaveFailed: "チャットルームの保存に失敗しました。",
                boardPostLoadFailed: "掲示板の読み込みに失敗しました。",
                recentPostLoadFailed: "最新記事の読み込みに失敗しました。",
                birthdayListLoadFailed: "誕生日リストの読み込みに失敗しました。",
                actionLoadFailed: "アクション履歴の読み込み에 실패しました。",
                myActionLoadFailed: "マイアクション履歴の読み込みに失敗しました。",
                loginFailed: "ログインに失敗しました。"
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
                serverError: "Không thể kết nối với máy chủ. Vui lòng kiểm tra trạng thái dịch vụ backend.",
                inputEmpty: "Vui lòng nhập tên đăng nhập và mật khẩu.",
                inputTooLong: "Giá trị nhập quá dài.",
                idPatternHint: "Chỉ cho phép ký tự chữ cái, số và (._-)."
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
                welcomeSubtitle: "Hãy đặt câu hỏi hoặc chọn một trong các gợi ý dưới đây.",
                generating: "Đang tạo câu trả lời...",
                congratulate: "Chúc mừng",
                birthday: "🎂 Ngày {{day}} là sinh nhật của {{name}}!",
                birthdayMessage: "🎂 Ngày {{day}} là sinh nhật của {{name}}! 🎉",
                notice: "📢 [Thông báo] {{title}}",
                noticeBadge: "Thông báo",
                birthdayBadge: "Sinh nhật",
                stop: "Dừng",
                inputPlaceholder: "Nhập tin nhắn...",
                newChatPlaceholder: "Nhập tin nhắn để bắt đầu cuộc trò chuyện mới",
                send: "Gửi",
                inputEmptyAlert: "Vui lòng nhập tin nhắn.",
                me: "Tôi",
                serverError: "Kết nối máy chủ không ổn định. Vui lòng làm mới trang.",
                highDemandError: "Mô hình AI hiện đang có lượng truy cập cao. Vui lòng thử lại sau giây lát.",
                modeRagBadge: "RAG",
                modeGeneralBadge: "Chung",
                modeMcpBadge: "MCP",
                suggestions: {
                    mcp: "Kiểm tra danh sách công cụ",
                    vacation: "Gửi đơn xin nghỉ phép (hướng dẫn thông tin cần thiết)",
                    ot: "Gửi đơn xin làm thêm giờ (hướng dẫn thông tin cần thiết)",
                    workPlan: "Đăng ký lập kế hoạch làm việc (tháng tới)",
                    roomReservation: "Đặt chỗ/Tra cứu phòng họp (tài sản chung)",
                    email: "Tóm tắt email",
                    rule: "Hướng dẫn quy định công ty"
                },
                emailActionStarting: "⏳ **Đang bắt đầu tác vụ tóm tắt email.**\nTin nhắn này sẽ được cập nhật khi có kết quả.",
                genericError: "⚠️ Đã xảy ra lỗi.\n\n[Chi tiết]\n{{message}}",
                unknownError: "Lỗi máy chủ không xác định"
            },
            action: {
                title: "Lịch sử hành động",
                all: "Tất cả",
                room: "Phòng",
                success: "Thành công",
                failed: "Thất bại",
                rollbackSuccess: "Khôi phục thành công",
                rollbackFailed: "Khôi phục thất bại",
                rollback: "Khôi phục",
                rolledBack: "Đã khôi phục",
                seconds: "giây",
                running: "Đang chạy...",
                selectRoomPrompt: "Vui lòng chọn phòng trò chuyện.",
                openSidebar: "Mở thanh bên",
                noActions: "Không có hành động nào để hiển thị."
            },
            error: {
                historyLoadFailed: "Tải lịch sử thất bại",
                roomListLoadFailed: "Không thể tải danh sách phòng trò chuyện.",
                roomSaveFailed: "Lưu phòng trò chuyện thất bại.",
                boardPostLoadFailed: "Tải bài đăng bảng tin thất bại.",
                recentPostLoadFailed: "Tải bài đăng mới nhất thất bại.",
                birthdayListLoadFailed: "Không thể tải danh sách sinh nhật.",
                actionLoadFailed: "Tải lịch sử hành động thất bại.",
                myActionLoadFailed: "Tải lịch sử hành động của tôi thất bại.",
                loginFailed: "Đăng nhập thất bại."
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
        load: 'languageOnly', // 'ko-KR' -> 'ko'로 취급
        detection: {
            order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'], // 변경 시 저장할 곳
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
