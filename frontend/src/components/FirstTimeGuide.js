import React, { useState, useEffect } from 'react';
import StepByStepGuide from './StepByStepGuide';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function FirstTimeGuide({ page = 'home', forceShow = false, onComplete: externalOnComplete }) {
    const [showGuide, setShowGuide] = useState(false);
    const { settings } = useAccessibility();
    const isElderly = settings.elderlyMode || settings.autoEnabled;

    useEffect(() => {
        // Kiểm tra role của user - chỉ hiển thị cho PATIENT và user thường (không có role)
        const account = JSON.parse(sessionStorage.getItem('account') || '{}');
        const userRole = account.role;
        
        // KHÔNG hiển thị guide cho admin, assistant, doctor
        if (userRole === 'ADMIN_SYSTEM' || userRole === 'ADMIN_CLINIC' || 
            userRole === 'ASSISTANT' || userRole === 'DOCTOR') {
            return;
        }
        
        // Nếu forceShow = true, hiển thị ngay lập tức
        if (forceShow) {
            const timer = setTimeout(() => {
                setShowGuide(true);
            }, 300);
            return () => clearTimeout(timer);
        }
        
        // Check if user has seen the guide for this page
        const hasSeenGuide = localStorage.getItem(`firstTimeGuide_${page}`);
        
        // Always show guide for elderly users on first visit, or for all users if not seen
        if (!hasSeenGuide) {
            // Delay to ensure page is loaded
            const timer = setTimeout(() => {
                setShowGuide(true);
            }, 1500); // Tăng delay để đảm bảo page đã render xong
            return () => clearTimeout(timer);
        }
    }, [page, forceShow]);

    const handleComplete = () => {
        // Chỉ lưu vào localStorage nếu không phải forceShow (xem lại)
        // Nếu forceShow, không cần lưu lại vì user đã xem rồi
        if (!forceShow) {
            localStorage.setItem(`firstTimeGuide_${page}`, 'true');
        }
        setShowGuide(false);
        // Gọi callback từ bên ngoài nếu có
        if (externalOnComplete) {
            externalOnComplete();
        }
    };

    const getStepsForPage = () => {
        switch (page) {
            case 'home':
                return [
                    {
                        title: 'Chào mừng đến với MediSched!',
                        description: 'Đây là trang chủ của hệ thống đặt lịch khám bệnh. Bạn có thể tìm kiếm bác sĩ, chuyên khoa, hoặc cơ sở y tế tại đây.',
                        tips: [
                            'Sử dụng thanh tìm kiếm ở giữa trang để tìm bác sĩ hoặc phòng khám',
                            'Chọn chuyên khoa và địa điểm để tìm kiếm chính xác hơn',
                            'Nhấn nút "Trợ năng" ở góc phải màn hình để tùy chỉnh giao diện'
                        ]
                    },
                    {
                        title: 'Tìm kiếm bác sĩ',
                        description: 'Bạn có thể tìm kiếm bác sĩ bằng cách: Chọn chuyên khoa, chọn địa điểm (tỉnh/thành phố và phường/xã), sau đó nhấn nút "Tìm kiếm".',
                        tips: [
                            'Bạn không cần điền đầy đủ tất cả các thông tin',
                            'Chỉ cần chọn chuyên khoa hoặc địa điểm là có thể tìm kiếm',
                            'Nhấn nút "Tìm kiếm" màu xanh để xem kết quả'
                        ]
                    },
                    {
                        title: 'Đặt lịch khám',
                        description: 'Sau khi tìm thấy bác sĩ phù hợp, nhấn vào tên bác sĩ để xem chi tiết. Sau đó chọn ngày và giờ khám phù hợp với bạn.',
                        tips: [
                            'Chọn ngày và giờ khám còn trống (màu xanh)',
                            'Nhấn nút "Đặt lịch" để tiếp tục',
                            'Điền đầy đủ thông tin cá nhân để hoàn tất đặt lịch'
                        ]
                    },
                    {
                        title: 'Cài đặt trợ năng',
                        description: 'Nếu bạn gặp khó khăn khi sử dụng, hãy nhấn nút "Trợ năng" ở góc phải màn hình. Bạn có thể bật chế độ dành cho người cao tuổi hoặc tùy chỉnh các tính năng khác.',
                        tips: [
                            'Chế độ người cao tuổi sẽ tự động bật tất cả các tính năng hỗ trợ',
                            'Bạn có thể tùy chỉnh từng tính năng riêng lẻ',
                            'Các cài đặt sẽ được lưu tự động'
                        ]
                    }
                ];
            case 'booking':
                return [
                    {
                        title: 'Điền thông tin đặt lịch',
                        description: 'Vui lòng điền đầy đủ thông tin bên dưới. Các trường có dấu * là bắt buộc phải điền.',
                        tips: [
                            'Thông tin cá nhân sẽ được tự động điền nếu bạn đã đăng nhập',
                            'Kiểm tra lại thông tin trước khi nhấn "Xác nhận đặt lịch"',
                            'Nếu là người cao tuổi, hãy điền thông tin người thân để được hỗ trợ tốt hơn'
                        ]
                    },
                    {
                        title: 'Chọn địa chỉ',
                        description: 'Chọn Tỉnh/Thành phố và Phường/Xã nơi bạn sinh sống. Thông tin này giúp chúng tôi gợi ý các phòng khám gần bạn.',
                        tips: [
                            'Chọn Tỉnh/Thành phố trước, sau đó chọn Phường/Xã',
                            'Địa chỉ cụ thể (số nhà, đường) là tùy chọn',
                            'Hệ thống sẽ cảnh báo nếu bạn đặt lịch ở địa điểm quá xa'
                        ]
                    },
                    {
                        title: 'Xác nhận đặt lịch',
                        description: 'Sau khi điền đầy đủ thông tin, nhấn nút "Xác nhận đặt lịch" màu xanh ở cuối form. Hệ thống sẽ gửi email xác nhận cho bạn.',
                        tips: [
                            'Kiểm tra lại thông tin trước khi xác nhận',
                            'Lưu mã đặt lịch để tra cứu sau này',
                            'Bạn sẽ nhận được email xác nhận đặt lịch thành công'
                        ]
                    }
                ];
            case 'profile':
                return [
                    {
                        title: 'Trang thông tin cá nhân',
                        description: 'Đây là trang quản lý thông tin cá nhân của bạn. Bạn có thể xem và cập nhật thông tin ở đây.',
                        tips: [
                            'Nhấn vào các tab bên trái để xem các thông tin khác nhau',
                            'Thông tin cá nhân: Cập nhật họ tên, ngày sinh, địa chỉ',
                            'Thông tin y tế: Xem và cập nhật thông tin sức khỏe'
                        ]
                    },
                    {
                        title: 'Cập nhật thông tin',
                        description: 'Để cập nhật thông tin, nhấn nút "Chỉnh sửa" và điền thông tin mới. Sau đó nhấn "Lưu" để lưu thay đổi.',
                        tips: [
                            'Một số thông tin như email có thể cần xác thực',
                            'Thông tin y tế quan trọng, hãy cập nhật chính xác',
                            'Ảnh đại diện có thể thay đổi bằng cách nhấn vào ảnh'
                        ]
                    },
                    {
                        title: 'Các tab khác',
                        description: 'Bạn có thể xem lịch sử khám, hồ sơ bệnh án, và cài đặt tài khoản ở các tab khác.',
                        tips: [
                            'Lịch sử khám: Xem tất cả các lần khám trước đây',
                            'Hồ sơ bệnh án: Xem và quản lý hồ sơ bệnh án của bạn',
                            'Cài đặt: Thay đổi mật khẩu và các cài đặt khác'
                        ]
                    }
                ];
            case 'login':
                return [
                    {
                        title: 'Đăng nhập vào hệ thống',
                        description: 'Nhập email hoặc username và mật khẩu để đăng nhập vào hệ thống. Nếu chưa có tài khoản, nhấn nút "Đăng ký" để tạo tài khoản mới.',
                        tips: [
                            'Bạn có thể đăng nhập bằng email hoặc username',
                            'Nếu quên mật khẩu, nhấn "Quên mật khẩu?" để khôi phục',
                            'Bạn cũng có thể đăng nhập bằng Google'
                        ]
                    },
                    {
                        title: 'Đăng nhập bằng Google',
                        description: 'Nếu bạn có tài khoản Google, bạn có thể đăng nhập nhanh bằng cách nhấn nút "Đăng nhập với Google".',
                        tips: [
                            'Đăng nhập bằng Google sẽ nhanh hơn và không cần nhớ mật khẩu',
                            'Tài khoản Google sẽ được liên kết với tài khoản MediSched',
                            'Bạn có thể sử dụng cả hai cách đăng nhập sau này'
                        ]
                    }
                ];
            case 'register':
                return [
                    {
                        title: 'Đăng ký tài khoản mới',
                        description: 'Điền đầy đủ thông tin để tạo tài khoản mới. Các trường có dấu * là bắt buộc phải điền.',
                        tips: [
                            'Username và email phải là duy nhất',
                            'Mật khẩu phải có ít nhất 8 ký tự',
                            'Nhập lại mật khẩu phải khớp với mật khẩu'
                        ]
                    },
                    {
                        title: 'Xác minh email',
                        description: 'Sau khi đăng ký thành công, bạn sẽ nhận được email xác minh. Nhấn vào link trong email để kích hoạt tài khoản.',
                        tips: [
                            'Kiểm tra hộp thư đến (và cả thư mục Spam)',
                            'Email xác minh có hiệu lực trong 24 giờ',
                            'Nếu không nhận được email, nhấn "Gửi lại email xác minh"'
                        ]
                    }
                ];
            case 'forgot_password':
                return [
                    {
                        title: 'Quên mật khẩu',
                        description: 'Nhập email đã đăng ký để nhận link khôi phục mật khẩu. Link sẽ được gửi qua email.',
                        tips: [
                            'Nhập đúng email đã đăng ký tài khoản',
                            'Kiểm tra hộp thư đến (và cả thư mục Spam)',
                            'Link khôi phục có hiệu lực trong 24 giờ'
                        ]
                    },
                    {
                        title: 'Đặt lại mật khẩu',
                        description: 'Sau khi nhấn vào link trong email, bạn sẽ được chuyển đến trang đặt lại mật khẩu. Nhập mật khẩu mới và xác nhận.',
                        tips: [
                            'Mật khẩu mới phải có ít nhất 8 ký tự',
                            'Nhập lại mật khẩu phải khớp với mật khẩu mới',
                            'Sau khi đặt lại, bạn có thể đăng nhập với mật khẩu mới'
                        ]
                    }
                ];
            case 'doctor_list':
                return [
                    {
                        title: 'Danh sách bác sĩ',
                        description: 'Đây là danh sách tất cả các bác sĩ trong hệ thống. Bạn có thể tìm kiếm và lọc bác sĩ theo chuyên khoa hoặc địa điểm.',
                        tips: [
                            'Sử dụng thanh tìm kiếm để tìm bác sĩ theo tên',
                            'Lọc theo chuyên khoa để tìm bác sĩ phù hợp',
                            'Nhấn vào tên bác sĩ để xem thông tin chi tiết'
                        ]
                    },
                    {
                        title: 'Xem thông tin bác sĩ',
                        description: 'Nhấn vào thẻ bác sĩ để xem thông tin chi tiết, bao gồm kinh nghiệm, chuyên khoa, và lịch khám có sẵn.',
                        tips: [
                            'Xem đánh giá của bệnh nhân khác',
                            'Kiểm tra lịch khám có sẵn',
                            'Nhấn nút "Đặt lịch" để đặt lịch khám'
                        ]
                    }
                ];
            case 'doctor_detail':
                return [
                    {
                        title: 'Thông tin chi tiết bác sĩ',
                        description: 'Đây là trang thông tin chi tiết về bác sĩ, bao gồm kinh nghiệm, chuyên khoa, và đánh giá từ bệnh nhân.',
                        tips: [
                            'Xem thông tin về kinh nghiệm và bằng cấp của bác sĩ',
                            'Đọc đánh giá từ bệnh nhân khác',
                            'Kiểm tra lịch khám có sẵn'
                        ]
                    },
                    {
                        title: 'Đặt lịch khám',
                        description: 'Chọn ngày và giờ khám phù hợp với bạn. Các slot màu xanh là còn trống, màu xám là đã được đặt.',
                        tips: [
                            'Chọn ngày trong lịch (các ngày có slot khả dụng)',
                            'Chọn giờ khám phù hợp',
                            'Nhấn nút "Đặt lịch" để tiếp tục'
                        ]
                    }
                ];
            case 'specialty_list':
                return [
                    {
                        title: 'Danh sách chuyên khoa',
                        description: 'Đây là danh sách tất cả các chuyên khoa y tế. Nhấn vào một chuyên khoa để xem danh sách bác sĩ trong chuyên khoa đó.',
                        tips: [
                            'Tìm chuyên khoa bạn cần khám',
                            'Nhấn vào chuyên khoa để xem chi tiết',
                            'Xem danh sách bác sĩ trong chuyên khoa'
                        ]
                    }
                ];
            case 'specialty_detail':
                return [
                    {
                        title: 'Chi tiết chuyên khoa',
                        description: 'Đây là trang thông tin về chuyên khoa và danh sách bác sĩ trong chuyên khoa này.',
                        tips: [
                            'Xem mô tả về chuyên khoa',
                            'Xem danh sách bác sĩ trong chuyên khoa',
                            'Nhấn vào bác sĩ để xem thông tin chi tiết và đặt lịch'
                        ]
                    }
                ];
            case 'facility_list':
                return [
                    {
                        title: 'Danh sách cơ sở y tế',
                        description: 'Đây là danh sách tất cả các phòng khám và bệnh viện trong hệ thống. Bạn có thể tìm kiếm và lọc theo địa điểm.',
                        tips: [
                            'Sử dụng thanh tìm kiếm để tìm phòng khám',
                            'Lọc theo địa điểm để tìm phòng khám gần bạn',
                            'Nhấn vào tên phòng khám để xem thông tin chi tiết'
                        ]
                    }
                ];
            case 'facility_detail':
                return [
                    {
                        title: 'Thông tin phòng khám',
                        description: 'Đây là trang thông tin chi tiết về phòng khám, bao gồm địa chỉ, số điện thoại, và danh sách bác sĩ.',
                        tips: [
                            'Xem thông tin về phòng khám',
                            'Xem địa chỉ và số điện thoại',
                            'Xem danh sách bác sĩ làm việc tại phòng khám'
                        ]
                    },
                    {
                        title: 'Đặt lịch tại phòng khám',
                        description: 'Bạn có thể đặt lịch khám tại phòng khám này. Chọn chuyên khoa và bác sĩ, sau đó chọn ngày và giờ khám.',
                        tips: [
                            'Chọn chuyên khoa bạn muốn khám',
                            'Chọn bác sĩ (hoặc để hệ thống tự động chọn)',
                            'Chọn ngày và giờ khám phù hợp'
                        ]
                    }
                ];
            case 'facility_booking':
                return [
                    {
                        title: 'Đặt lịch tại phòng khám',
                        description: 'Điền thông tin để đặt lịch khám tại phòng khám. Hệ thống sẽ tự động chọn bác sĩ và slot phù hợp nếu bạn chọn.',
                        tips: [
                            'Chọn chuyên khoa bạn muốn khám',
                            'Có thể để hệ thống tự động chọn bác sĩ và slot',
                            'Điền đầy đủ thông tin cá nhân'
                        ]
                    }
                ];
            case 'clinic_search':
                return [
                    {
                        title: 'Tìm kiếm phòng khám',
                        description: 'Sử dụng các bộ lọc để tìm phòng khám phù hợp với bạn. Kết quả sẽ hiển thị các phòng khám khớp với tiêu chí tìm kiếm.',
                        tips: [
                            'Chọn chuyên khoa để tìm phòng khám có chuyên khoa đó',
                            'Chọn địa điểm để tìm phòng khám gần bạn',
                            'Sử dụng thanh tìm kiếm để tìm theo tên phòng khám'
                        ]
                    },
                    {
                        title: 'Xem kết quả tìm kiếm',
                        description: 'Kết quả tìm kiếm sẽ hiển thị danh sách phòng khám. Nhấn vào phòng khám để xem thông tin chi tiết và đặt lịch.',
                        tips: [
                            'Xem địa chỉ và số điện thoại của phòng khám',
                            'Xem các chuyên khoa có tại phòng khám',
                            'Nhấn "Đặt lịch" để đặt lịch khám'
                        ]
                    }
                ];
            case 'appointments':
                return [
                    {
                        title: 'Lịch hẹn của tôi',
                        description: 'Đây là trang quản lý tất cả các lịch hẹn của bạn. Bạn có thể xem lịch sắp tới, đã khám, và đã hủy.',
                        tips: [
                            'Tab "Sắp tới": Xem các lịch hẹn sắp tới',
                            'Tab "Đã khám": Xem lịch sử các lần khám',
                            'Tab "Đã hủy": Xem các lịch đã hủy'
                        ]
                    },
                    {
                        title: 'Quản lý lịch hẹn',
                        description: 'Bạn có thể xem chi tiết và hủy lịch hẹn sắp tới. Nhấn "Xem chi tiết" để xem thông tin đầy đủ, hoặc "Hủy lịch" để hủy.',
                        tips: [
                            'Nhấn "Xem chi tiết" để xem thông tin đầy đủ về lịch hẹn',
                            'Nhấn "Hủy lịch" để hủy lịch hẹn sắp tới',
                            'Lịch đã hủy sẽ không thể khôi phục'
                        ]
                    }
                ];
            case 'notifications':
                return [
                    {
                        title: 'Thông báo',
                        description: 'Đây là trang xem tất cả các thông báo của bạn, bao gồm thông báo về lịch hẹn, kết quả khám, và các thông báo hệ thống.',
                        tips: [
                            'Xem tất cả thông báo chưa đọc',
                            'Nhấn vào thông báo để xem chi tiết',
                            'Thông báo đã đọc sẽ tự động được đánh dấu'
                        ]
                    }
                ];
            case 'record_detail':
                return [
                    {
                        title: 'Chi tiết hồ sơ bệnh án',
                        description: 'Đây là trang xem chi tiết hồ sơ bệnh án của bạn, bao gồm thông tin khám, đơn thuốc, và ghi chú của bác sĩ.',
                        tips: [
                            'Xem thông tin chi tiết về lần khám',
                            'Xem đơn thuốc đã được kê',
                            'Xem ghi chú và triệu chứng'
                        ]
                    }
                ];
            default:
                return [];
        }
    };

    const getPageTitle = () => {
        const titles = {
            'home': 'Trang chủ',
            'booking': 'Đặt lịch khám',
            'profile': 'Trang cá nhân',
            'login': 'Đăng nhập',
            'register': 'Đăng ký',
            'forgot_password': 'Quên mật khẩu',
            'doctor_list': 'Danh sách bác sĩ',
            'doctor_detail': 'Thông tin bác sĩ',
            'specialty_list': 'Danh sách chuyên khoa',
            'specialty_detail': 'Chi tiết chuyên khoa',
            'facility_list': 'Danh sách cơ sở y tế',
            'facility_detail': 'Thông tin phòng khám',
            'facility_booking': 'Đặt lịch tại phòng khám',
            'clinic_search': 'Tìm kiếm phòng khám',
            'appointments': 'Lịch hẹn của tôi',
            'notifications': 'Thông báo',
            'record_detail': 'Chi tiết hồ sơ bệnh án'
        };
        return `Hướng dẫn sử dụng ${titles[page] || page}`;
    };

    if (!showGuide) return null;

    const steps = getStepsForPage();
    if (steps.length === 0) return null;

    return (
        <StepByStepGuide
            steps={steps}
            title={getPageTitle()}
            onComplete={handleComplete}
            showSkip={true}
        />
    );
}

