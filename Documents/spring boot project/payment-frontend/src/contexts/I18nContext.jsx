import { useEffect, useMemo, useState } from 'react';
import { I18nContext } from './i18n-context';

const STORAGE_KEY = 'payment-ui-language';

const repairMojibake = (value) => {
  if (typeof value !== 'string') return value;
  if (!/[\u00c2-\u00c4\u00e2]/.test(value)) return value;
  try {
    return decodeURIComponent(
      Array.from(value)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  } catch {
    return value;
  }
};

const legacyEnglish = Object.freeze({
  'Thông tin tổ chức': 'Organization information', 'Thông tin hệ thống': 'System information', 'Đăng ký & Liên hệ': 'Registration & contact',
  'Thông tin chung': 'General information', 'Thông tin cá nhân': 'Personal information', 'Định danh & Nghề nghiệp': 'Identification and occupation',
  'Liên lạc': 'Contact details', 'Địa chỉ': 'Address', 'Thông tin bổ sung': 'Additional information',
  'Lý do': 'Reason', 'Lý do đăng ký': 'Registration reason', 'Chi nhánh': 'Branch', 'Chọn chi nhánh': 'Select branch',
  'Loại khách hàng': 'Customer type', 'Chọn loại khách hàng': 'Select customer type', 'Tên viết tắt': 'Short name',
  'Họ': 'First name', 'Tên': 'Last name', 'Tên đệm': 'Middle name', 'Ngày sinh': 'Date of birth',
  'Giới tính': 'Gender', 'Chọn giới tính': 'Select gender', 'Nam': 'Male', 'Nữ': 'Female', 'Không xác định': 'Unspecified',
  'Danh xưng': 'Salutation', 'Chọn danh xưng': 'Select salutation', 'Tình trạng hôn nhân': 'Marital status',
  'Chọn tình trạng hôn nhân': 'Select marital status', 'Quốc tịch': 'Citizenship', 'Chọn quốc tịch': 'Select citizenship',
  'Số CMND/CCCD': 'National ID number', 'Nơi cấp/Ngày cấp': 'Place and date of issue', 'Chi tiết CMND/CCCD': 'National ID issuance details',
  'Số an sinh xã hội': 'Social security number', 'Mã số thuế': 'Tax identification number', 'Mã số thuế cá nhân': 'Personal tax identification number',
  'Nghề nghiệp': 'Occupation', 'Tên công ty': 'Company name', 'Tên công ty (nếu có)': 'Company name (optional)',
  'Số điện thoại di động': 'Mobile number', 'Số điện thoại nhà': 'Home phone', 'Số điện thoại cố định': 'Landline number',
  'Loại địa chỉ': 'Address type', 'Chọn loại địa chỉ': 'Select address type', 'Quốc gia': 'Country', 'Chọn quốc gia': 'Select country',
  'Thành phố/Tỉnh': 'City/Province', 'Quận/Huyện/Bang': 'District/State', 'Mã bưu chính': 'Postal code',
  'Địa chỉ dòng 1': 'Address line 1', 'Địa chỉ dòng 2': 'Address line 2', 'Địa chỉ dòng 3': 'Address line 3', 'Địa chỉ dòng 4': 'Address line 4',
  'Số nhà, tên đường': 'Street address', 'Phường/Xã (tùy chọn)': 'Ward/Commune (optional)', 'Ghi chú thêm (tùy chọn)': 'Additional details (optional)',
  'Ghi chú khác (tùy chọn)': 'Other details (optional)', 'Loại đăng ký': 'Registration type', 'Chi tiết đăng ký': 'Registration details',
  'Ngày đăng ký': 'Registration date', 'Số đăng ký kinh doanh': 'Business registration number', 'Tên thương mại': 'Trading name',
  'Mã số thuế (TIN)': 'Tax identification number (TIN)', 'Tổ chức tài chính': 'Financial institution', 'Ngôn ngữ': 'Language',
  'Điện thoại bàn': 'Landline number', 'Điện thoại di động': 'Mobile number', 'Mã Merchant (Client Number)': 'Merchant number',
  'Chọn ngôn ngữ': 'Select language', 'Nhập tên công ty': 'Enter company name', 'Nhập tên thương mại': 'Enter trading name',
  'Nhập tên viết tắt': 'Enter short name', 'Nhập mã Merchant': 'Enter merchant number', 'Nhập mã số thuế': 'Enter tax identification number',
  'Nhập email liên hệ': 'Enter contact email', 'Nhập số điện thoại di động': 'Enter mobile number', 'Nhập số điện thoại cố định': 'Enter landline number',
  'Trường này là bắt buộc': 'This field is required', 'Giá trị không hợp lệ': 'Invalid value'
});

const messages = {
  vi: {
    'language.vi': 'VI', 'language.en': 'EN', 'language.label': 'Ngôn ngữ',
    'pagination.label': 'Phân trang',
    'app.name': 'CỔNG THANH TOÁN', 'app.connectionSecure': 'KẾT NỐI AN TOÀN', 'app.logout': 'Đăng xuất',
    'nav.issuing': 'PHÁT HÀNH', 'nav.customers': 'Danh sách khách hàng', 'nav.newCustomer': 'Đăng ký khách hàng',
    'nav.acquiring': 'CHẤP NHẬN THANH TOÁN', 'nav.merchants': 'Danh sách ĐVCNT', 'nav.newMerchant': 'Đăng ký ĐVCNT',
    'nav.catalog': 'DANH MỤC', 'nav.products': 'Danh mục sản phẩm', 'nav.transactions': 'Tra cứu giao dịch', 'nav.cashFlow': 'Dòng tiền hợp đồng',
    'nav.actions': 'THAO TÁC', 'nav.openContract': 'Mở hợp đồng', 'nav.openAcquiringContract': 'Mở hợp đồng thanh toán', 'nav.registerDevice': 'Khai báo thiết bị', 'nav.customerDetail': 'Chi tiết khách hàng',
    'common.loading': 'Đang tải dữ liệu…', 'common.retry': 'Thử lại', 'common.noData': 'Không có dữ liệu phù hợp.', 'common.all': 'Tất cả',
    'common.search': 'Tìm kiếm', 'common.clear': 'Xóa bộ lọc', 'common.details': 'Xem chi tiết', 'common.detailsShort': 'Chi tiết', 'common.openContractShort': 'Mở HĐ', 'common.previous': 'Trước', 'common.next': 'Sau',
    'common.overview': 'Tổng quan', 'common.technical': 'Kỹ thuật', 'common.status': 'Trạng thái', 'common.currency': 'Tiền tệ', 'common.name': 'Tên',
    'common.source': 'Nguồn', 'common.destination': 'Đích', 'common.amount': 'Số tiền', 'common.success': 'Thành công', 'common.unclassified': 'Chưa phân loại',
    'common.searching': 'Đang tìm…', 'common.searchResults': 'Kết quả tìm kiếm', 'common.addNew': 'Thêm mới', 'common.actions': 'Thao tác', 'common.createContract': 'Mở hợp đồng',
    'common.back': 'Quay lại', 'common.continue': 'Tiếp tục', 'common.processing': 'Đang xử lý…', 'common.finishRegister': 'Hoàn tất đăng ký', 'common.backToList': 'Quay lại danh sách',
    'export.xlsx': 'Xuất XLSX', 'export.csv': 'Xuất CSV', 'export.pdf': 'Xuất PDF', 'export.statement': 'Xuất sao kê', 'export.postingLegs': 'Xuất bút toán', 'export.failed': 'Không thể xuất file. Vui lòng thử lại.',
    'registration.customerTitle': 'Đăng ký khách hàng', 'registration.merchantTitle': 'Đăng ký ĐVCNT',
    'registration.customerSuccess': 'Đăng ký khách hàng thành công', 'registration.merchantSuccess': 'Đăng ký đơn vị thành công', 'registration.continueContract': 'Tiếp tục mở hợp đồng',
    'customer.name': 'Tên khách hàng', 'customer.namePlaceholder': 'Nhập tên khách hàng', 'customer.phone': 'Số điện thoại', 'customer.phonePlaceholder': 'Nhập số điện thoại',
    'customer.number': 'Mã khách hàng', 'customer.numberPlaceholder': 'Nhập mã khách hàng', 'customer.taxNumber': 'Mã số thuế', 'customer.taxPlaceholder': 'Nhập mã số thuế',
    'customer.branch': 'Chi nhánh', 'customer.branchPlaceholder': 'Chọn chi nhánh', 'customer.notFound': 'Không tìm thấy khách hàng phù hợp.', 'customer.fullName': 'Họ và tên', 'customer.found': 'khách hàng',
    'merchant.name': 'Tên đơn vị chấp nhận thanh toán', 'merchant.namePlaceholder': 'Nhập tên đơn vị', 'merchant.number': 'Mã đơn vị', 'merchant.numberPlaceholder': 'Nhập mã đơn vị',
    'merchant.notFound': 'Không tìm thấy đơn vị chấp nhận thanh toán phù hợp.', 'merchant.found': 'đơn vị',
    'customer.details': 'Chi tiết khách hàng', 'merchant.details': 'Chi tiết đơn vị chấp nhận thanh toán', 'customer.back': 'Quay lại danh sách',
    'customer.contracts': 'Hợp đồng', 'customer.accounts': 'Tài khoản', 'customer.products': 'Sản phẩm', 'customer.transactions': 'Giao dịch',
    'customer.accountsByContract': 'Tài khoản theo hợp đồng', 'customer.activeProducts': 'Sản phẩm đang sử dụng', 'customer.unnamedProduct': 'Chưa có tên',
    'customer.noContractsForTransactions': 'Khách hàng chưa có hợp đồng.', 'customer.loadError': 'Không thể tải dữ liệu khách hàng.',
    'transaction.searchTitle': 'Tra cứu giao dịch', 'transaction.keyword': 'Từ khóa', 'transaction.keywordPlaceholder': 'Số tham chiếu nguồn, đích hoặc mã cấp phép',
    'transaction.fromDate': 'Từ ngày', 'transaction.toDate': 'Đến ngày', 'transaction.type': 'Loại giao dịch', 'transaction.advanced': 'Bộ lọc nâng cao',
    'transaction.contractId': 'Mã hợp đồng', 'transaction.returnCode': 'Mã kết quả', 'transaction.time': 'Thời điểm giao dịch', 'transaction.result': 'Kết quả',
    'transaction.notFound': 'Không tìm thấy giao dịch phù hợp.', 'transaction.count': 'giao dịch', 'transaction.list': 'Danh sách giao dịch',
    'transaction.detailLoadError': 'Không thể tải chi tiết giao dịch.', 'transaction.noDescription': 'Không có nội dung giao dịch.',
    'transaction.amounts': 'Số tiền và tiền tệ', 'transaction.relatedContracts': 'Hợp đồng liên quan', 'transaction.entries': 'Bút toán',
    'transaction.postingDate': 'Ngày hạch toán', 'transaction.receivedDate': 'Ngày tiếp nhận', 'transaction.authorization': 'Mã cấp phép',
    'transaction.outwardStatus': 'Trạng thái gửi đi', 'transaction.transactionAmount': 'Số tiền giao dịch', 'transaction.settlementAmount': 'Số tiền thanh toán',
    'transaction.reconciliationAmount': 'Số tiền đối soát', 'transaction.contract': 'Hợp đồng', 'transaction.product': 'Sản phẩm',
    'transaction.statusCode': 'Mã trạng thái', 'transaction.available': 'Khả dụng', 'transaction.noContract': 'Không có hợp đồng.',
    'transaction.noEntries': 'Chưa tìm thấy bút toán.', 'transaction.entry': 'Bút toán', 'transaction.code': 'Mã giao dịch',
    'transaction.sourceAccount': 'Tài khoản nguồn', 'transaction.targetAccount': 'Tài khoản đích', 'transaction.sourceContractId': 'Mã hợp đồng nguồn', 'transaction.targetContractId': 'Mã hợp đồng đích',
    'transaction.history': 'Lịch sử giao dịch', 'transaction.historyLoadError': 'Không thể tải lịch sử giao dịch.', 'transaction.noContractHistory': 'Chưa có hợp đồng.',
    'product.list': 'Danh mục sản phẩm', 'product.searchPlaceholder': 'Tìm theo mã hoặc tên sản phẩm', 'product.categoryAll': 'Tất cả danh mục',
    'product.issuing': 'Phát hành', 'product.acquiring': 'Chấp nhận thanh toán', 'product.device': 'Thiết bị', 'product.liability': 'Tài khoản bảo đảm',
    'product.ready': 'Sẵn sàng', 'product.notReady': 'Chưa sẵn sàng', 'product.loading': 'Đang tải danh mục sản phẩm…', 'product.noData': 'Không tìm thấy sản phẩm.',
    'product.contractCount': 'Hợp đồng', 'product.back': 'Danh mục sản phẩm', 'product.configuration': 'Cấu hình', 'product.loadError': 'Không thể tải sản phẩm.',
    'product.businessType': 'Loại nghiệp vụ', 'product.category': 'Danh mục', 'product.parent': 'Sản phẩm cha', 'product.root': 'Cấp cao nhất',
    'product.contractType': 'Loại hợp đồng', 'product.contractSubtype': 'Phân loại hợp đồng', 'product.accountScheme': 'Cơ chế tài khoản', 'product.servicePackage': 'Gói dịch vụ',
    'product.minCreditLimit': 'Hạn mức tín dụng tối thiểu', 'product.maxCreditLimit': 'Hạn mức tín dụng tối đa', 'product.notConfigured': 'Chưa cấu hình',
    'account.title': 'Tài khoản', 'account.balanceLimits': 'Số dư và hạn mức', 'account.transactions': 'Giao dịch', 'account.contract': 'Hợp đồng',
    'account.loadError': 'Không thể tải tài khoản.', 'account.observedAt': 'Ghi nhận lúc', 'account.type': 'Loại tài khoản', 'account.categoryCode': 'Mã phân loại', 'account.dueTypeCode': 'Mã kỳ hạn',
    'account.openingBalance': 'Số dư đầu kỳ', 'account.currentBalance': 'Số dư hiện tại', 'account.totalBlocked': 'Tổng số tiền phong tỏa', 'account.ownBlocked': 'Số tiền tự phong tỏa',
    'account.lowerLimit': 'Hạn mức dưới', 'account.upperLimit': 'Hạn mức trên', 'account.relatedTransactions': 'Xem giao dịch của hợp đồng',
    'contract.title': 'Hợp đồng', 'contract.accounts': 'Tài khoản', 'contract.transactions': 'Giao dịch', 'contract.loadError': 'Không thể tải hợp đồng.',
    'contract.customer': 'Khách hàng', 'contract.unnamed': 'Hợp đồng chưa đặt tên', 'contract.available': 'Số tiền khả dụng', 'contract.statusCode': 'Mã trạng thái hợp đồng',
    'contract.productionStatus': 'Trạng thái vận hành', 'contract.readiness': 'Mức độ sẵn sàng', 'contract.openDate': 'Ngày mở', 'contract.balanceObservedAt': 'Thời điểm ghi nhận số dư',
    'contract.totalBalance': 'Tổng số dư', 'contract.blocked': 'Số tiền phong tỏa', 'contract.noAccounts': 'Hợp đồng không có tài khoản.', 'contract.openTransactions': 'Xem lịch sử giao dịch',
    'cashFlow.title': 'Dòng tiền theo hợp đồng', 'cashFlow.loadError': 'Không thể tải dữ liệu dòng tiền.', 'cashFlow.historyError': 'Không thể tải lịch sử giao dịch.',
    'cashFlow.contracts': 'Hợp đồng có giao dịch', 'cashFlow.postedTransactions': 'Giao dịch đã hạch toán', 'cashFlow.latestActivity': 'Hoạt động gần nhất',
    'cashFlow.received': 'Tiền vào', 'cashFlow.sent': 'Tiền ra', 'cashFlow.internal': 'Nội bộ', 'cashFlow.searchContract': 'Tìm hợp đồng',
    'cashFlow.searchPlaceholder': 'Tên, số hợp đồng hoặc sản phẩm', 'cashFlow.sort': 'Sắp xếp', 'cashFlow.sortLatest': 'Giao dịch gần nhất',
    'cashFlow.sortActivity': 'Nhiều giao dịch nhất', 'cashFlow.sortReceived': 'Tiền vào nhiều nhất', 'cashFlow.sortSent': 'Tiền ra nhiều nhất', 'cashFlow.sortBalance': 'Số dư khả dụng cao nhất',
    'cashFlow.results': 'kết quả', 'cashFlow.availableBalance': 'Số dư khả dụng', 'cashFlow.net': 'Dòng tiền thuần', 'cashFlow.latest': 'Gần nhất',
    'cashFlow.viewTransactions': 'Xem giao dịch', 'cashFlow.noContracts': 'Không tìm thấy hợp đồng phù hợp.', 'cashFlow.history': 'Lịch sử giao dịch',
    'cashFlow.close': 'Đóng', 'cashFlow.loadingHistory': 'Đang tải giao dịch…', 'cashFlow.noNarrative': 'Không có nội dung', 'cashFlow.noHistory': 'Hợp đồng chưa có giao dịch.', 'cashFlow.page': 'Trang',
    'login.title': 'Đăng nhập', 'login.username': 'Tên đăng nhập', 'login.password': 'Mật khẩu', 'login.usernamePlaceholder': 'Nhập tên đăng nhập',
    'login.passwordPlaceholder': 'Nhập mật khẩu', 'login.submit': 'Đăng nhập', 'login.accountProvisioned': 'Tài khoản do quản trị viên hệ thống cấp.',
    'login.required': 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.', 'login.failed': 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
    'login.hidePassword': 'Ẩn mật khẩu', 'login.showPassword': 'Hiện mật khẩu', 'login.compliance': 'Bảo mật theo tiêu chuẩn PCI DSS'
  },
  en: {
    'language.vi': 'VI', 'language.en': 'EN', 'language.label': 'Language',
    'pagination.label': 'Pagination',
    'app.name': 'PAYMENT PORTAL', 'app.connectionSecure': 'SECURE CONNECTION', 'app.logout': 'Sign out',
    'nav.issuing': 'ISSUING', 'nav.customers': 'Customers', 'nav.newCustomer': 'Register customer',
    'nav.acquiring': 'ACQUIRING', 'nav.merchants': 'Merchants', 'nav.newMerchant': 'Register merchant',
    'nav.catalog': 'CATALOG', 'nav.products': 'Products', 'nav.transactions': 'Transaction search', 'nav.cashFlow': 'Contract cash flow',
    'nav.actions': 'ACTIONS', 'nav.openContract': 'Open contract', 'nav.openAcquiringContract': 'Open acquiring contract', 'nav.registerDevice': 'Register device', 'nav.customerDetail': 'Customer details',
    'common.loading': 'Loading…', 'common.retry': 'Retry', 'common.noData': 'No matching data.', 'common.all': 'All',
    'common.search': 'Search', 'common.clear': 'Clear filters', 'common.details': 'View details', 'common.detailsShort': 'Details', 'common.openContractShort': 'Open contract', 'common.previous': 'Previous', 'common.next': 'Next',
    'common.overview': 'Overview', 'common.technical': 'Technical', 'common.status': 'Status', 'common.currency': 'Currency', 'common.name': 'Name',
    'common.source': 'Source', 'common.destination': 'Destination', 'common.amount': 'Amount', 'common.success': 'Successful', 'common.unclassified': 'Unclassified',
    'common.searching': 'Searching…', 'common.searchResults': 'Search results', 'common.addNew': 'Add new', 'common.actions': 'Actions', 'common.createContract': 'Open contract',
    'common.back': 'Back', 'common.continue': 'Continue', 'common.processing': 'Processing…', 'common.finishRegister': 'Complete registration', 'common.backToList': 'Back to list',
    'export.xlsx': 'Export XLSX', 'export.csv': 'Export CSV', 'export.pdf': 'Export PDF', 'export.statement': 'Export statement', 'export.postingLegs': 'Export entries', 'export.failed': 'Unable to export the file. Please try again.',
    'registration.customerTitle': 'Customer registration', 'registration.merchantTitle': 'Merchant registration',
    'registration.customerSuccess': 'Customer registered successfully', 'registration.merchantSuccess': 'Merchant registered successfully', 'registration.continueContract': 'Continue to contract opening',
    'customer.name': 'Customer name', 'customer.namePlaceholder': 'Enter customer name', 'customer.phone': 'Phone number', 'customer.phonePlaceholder': 'Enter phone number',
    'customer.number': 'Customer number', 'customer.numberPlaceholder': 'Enter customer number', 'customer.taxNumber': 'Tax identification number', 'customer.taxPlaceholder': 'Enter tax identification number',
    'customer.branch': 'Branch', 'customer.branchPlaceholder': 'Select branch', 'customer.notFound': 'No matching customers found.', 'customer.fullName': 'Full name', 'customer.found': 'customers',
    'merchant.name': 'Merchant name', 'merchant.namePlaceholder': 'Enter merchant name', 'merchant.number': 'Merchant number', 'merchant.numberPlaceholder': 'Enter merchant number',
    'merchant.notFound': 'No matching merchants found.', 'merchant.found': 'merchants',
    'customer.details': 'Customer details', 'merchant.details': 'Merchant details', 'customer.back': 'Back to list',
    'customer.contracts': 'Contracts', 'customer.accounts': 'Accounts', 'customer.products': 'Products', 'customer.transactions': 'Transactions',
    'customer.accountsByContract': 'Accounts by contract', 'customer.activeProducts': 'Active products', 'customer.unnamedProduct': 'Unnamed product',
    'customer.noContractsForTransactions': 'The customer has no contracts.', 'customer.loadError': 'Unable to load customer data.',
    'transaction.searchTitle': 'Transaction search', 'transaction.keyword': 'Keyword', 'transaction.keywordPlaceholder': 'Source, destination or authorization reference',
    'transaction.fromDate': 'From date', 'transaction.toDate': 'To date', 'transaction.type': 'Transaction type', 'transaction.advanced': 'Advanced filters',
    'transaction.contractId': 'Contract ID', 'transaction.returnCode': 'Return code', 'transaction.time': 'Transaction time', 'transaction.result': 'Result',
    'transaction.notFound': 'No transactions match the selected filters.', 'transaction.count': 'transactions', 'transaction.list': 'Transactions',
    'transaction.detailLoadError': 'Unable to load transaction details.', 'transaction.noDescription': 'No transaction narrative.',
    'transaction.amounts': 'Amounts and currencies', 'transaction.relatedContracts': 'Related contracts', 'transaction.entries': 'Posting entries',
    'transaction.postingDate': 'Posting date', 'transaction.receivedDate': 'Received date', 'transaction.authorization': 'Authorization code',
    'transaction.outwardStatus': 'Outbound status', 'transaction.transactionAmount': 'Transaction amount', 'transaction.settlementAmount': 'Settlement amount',
    'transaction.reconciliationAmount': 'Reconciliation amount', 'transaction.contract': 'Contract', 'transaction.product': 'Product',
    'transaction.statusCode': 'Status code', 'transaction.available': 'Available amount', 'transaction.noContract': 'No contract.',
    'transaction.noEntries': 'No posting entries found.', 'transaction.entry': 'Entry', 'transaction.code': 'Transaction code',
    'transaction.sourceAccount': 'Source account', 'transaction.targetAccount': 'Target account', 'transaction.sourceContractId': 'Source contract ID', 'transaction.targetContractId': 'Target contract ID',
    'transaction.history': 'Transaction history', 'transaction.historyLoadError': 'Unable to load transaction history.', 'transaction.noContractHistory': 'No contracts available.',
    'product.list': 'Products', 'product.searchPlaceholder': 'Search by product code or name', 'product.categoryAll': 'All categories',
    'product.issuing': 'Issuing', 'product.acquiring': 'Acquiring', 'product.device': 'Device', 'product.liability': 'Liability account',
    'product.ready': 'Ready', 'product.notReady': 'Not ready', 'product.loading': 'Loading products…', 'product.noData': 'No products found.',
    'product.contractCount': 'Contracts', 'product.back': 'Products', 'product.configuration': 'Configuration', 'product.loadError': 'Unable to load product.',
    'product.businessType': 'Business type', 'product.category': 'Category', 'product.parent': 'Parent product', 'product.root': 'Top level',
    'product.contractType': 'Contract type', 'product.contractSubtype': 'Contract subtype', 'product.accountScheme': 'Account scheme', 'product.servicePackage': 'Service package',
    'product.minCreditLimit': 'Minimum credit limit', 'product.maxCreditLimit': 'Maximum credit limit', 'product.notConfigured': 'Not configured',
    'account.title': 'Account', 'account.balanceLimits': 'Balances and limits', 'account.transactions': 'Transactions', 'account.contract': 'Contract',
    'account.loadError': 'Unable to load account.', 'account.observedAt': 'Observed at', 'account.type': 'Account type', 'account.categoryCode': 'Category code', 'account.dueTypeCode': 'Due type code',
    'account.openingBalance': 'Opening balance', 'account.currentBalance': 'Current balance', 'account.totalBlocked': 'Total blocked amount', 'account.ownBlocked': 'Own blocked amount',
    'account.lowerLimit': 'Lower limit', 'account.upperLimit': 'Upper limit', 'account.relatedTransactions': 'View contract transactions',
    'contract.title': 'Contract', 'contract.accounts': 'Accounts', 'contract.transactions': 'Transactions', 'contract.loadError': 'Unable to load contract.',
    'contract.customer': 'Customer', 'contract.unnamed': 'Unnamed contract', 'contract.available': 'Available amount', 'contract.statusCode': 'Contract status code',
    'contract.productionStatus': 'Production status', 'contract.readiness': 'Readiness', 'contract.openDate': 'Open date', 'contract.balanceObservedAt': 'Balance observed at',
    'contract.totalBalance': 'Total balance', 'contract.blocked': 'Blocked amount', 'contract.noAccounts': 'This contract has no accounts.', 'contract.openTransactions': 'View transaction history',
    'cashFlow.title': 'Contract cash flow', 'cashFlow.loadError': 'Unable to load cash-flow data.', 'cashFlow.historyError': 'Unable to load transaction history.',
    'cashFlow.contracts': 'Contracts with transactions', 'cashFlow.postedTransactions': 'Posted transactions', 'cashFlow.latestActivity': 'Latest activity',
    'cashFlow.received': 'Cash in', 'cashFlow.sent': 'Cash out', 'cashFlow.internal': 'Internal', 'cashFlow.searchContract': 'Search contracts',
    'cashFlow.searchPlaceholder': 'Contract name, number or product', 'cashFlow.sort': 'Sort by', 'cashFlow.sortLatest': 'Latest transaction',
    'cashFlow.sortActivity': 'Most transactions', 'cashFlow.sortReceived': 'Highest cash in', 'cashFlow.sortSent': 'Highest cash out', 'cashFlow.sortBalance': 'Highest available balance',
    'cashFlow.results': 'results', 'cashFlow.availableBalance': 'Available balance', 'cashFlow.net': 'Net cash flow', 'cashFlow.latest': 'Latest',
    'cashFlow.viewTransactions': 'View transactions', 'cashFlow.noContracts': 'No matching contracts found.', 'cashFlow.history': 'Transaction history',
    'cashFlow.close': 'Close', 'cashFlow.loadingHistory': 'Loading transactions…', 'cashFlow.noNarrative': 'No narrative', 'cashFlow.noHistory': 'This contract has no transactions.', 'cashFlow.page': 'Page',
    'login.title': 'Sign in', 'login.username': 'Username', 'login.password': 'Password', 'login.usernamePlaceholder': 'Enter username',
    'login.passwordPlaceholder': 'Enter password', 'login.submit': 'Sign in', 'login.accountProvisioned': 'Accounts are provisioned by a system administrator.',
    'login.required': 'Enter your username and password.', 'login.failed': 'Sign-in failed. Check your credentials and try again.',
    'login.hidePassword': 'Hide password', 'login.showPassword': 'Show password', 'login.compliance': 'PCI DSS compliant security'
  }
};

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'vi');
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);
  const repairedLegacyEnglish = useMemo(() => Object.fromEntries(
    Object.entries(legacyEnglish).flatMap(([key, value]) => {
      const repairedKey = repairMojibake(key);
      return repairedKey === key ? [[key, value]] : [[key, value], [repairedKey, value]];
    })
  ), []);
  const value = useMemo(() => ({
    language,
    locale: language === 'en' ? 'en-US' : 'vi-VN',
    setLanguage,
    t: (key) => repairMojibake(messages[language][key] ?? messages.vi[key] ?? key),
    translate: (text) => {
      const normalized = repairMojibake(text);
      return language === 'en' ? (repairedLegacyEnglish[normalized] || repairedLegacyEnglish[text] || normalized) : normalized;
    }
  }), [language, repairedLegacyEnglish]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
