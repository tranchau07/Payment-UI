export function parseAddInfo(addInfo) {
  if (!addInfo) return [];
  return addInfo.split(';').filter(Boolean).map((item) => {
    const separator = item.indexOf('=');
    if (separator < 0) return { key: item, value: '' };
    return {
      key: item.slice(0, separator) || 'Key',
      value: item.slice(separator + 1),
    };
  });
}

const DOC_FIELD_LABELS = Object.freeze({
  'AMND STATE': 'Trạng thái hiệu lực', 'AMND DATE': 'Ngày cập nhật', 'AMND OFFICER': 'Người cập nhật',
  'AMND PREV ID': 'Phiên bản trước', ACTION: 'Thao tác', 'MSG CATEGORY': 'Nhóm thông điệp',
  'IS AUTHORIZATION': 'Loại xử lý', 'REQUEST CATEGORY': 'Luồng yêu cầu', 'SERVICE CLASS': 'Nhóm nghiệp vụ',
  REQUIREMENT: 'Yêu cầu xử lý', 'PARTITION KEY': 'Khóa phân vùng', 'SYNCH TAG': 'Trạng thái đồng bộ', VERSION: 'Phiên bản',
  'TRANS AMOUNT': 'Số tiền giao dịch', 'TRANS DATE': 'Ngày giao dịch', 'AUTH CODE': 'Mã xác thực',
  'TRANS TYPE': 'Mã loại giao dịch', 'TRANS TYPE NAME': 'Tên loại giao dịch', 'TRANS TYPE IDT': 'Định danh loại giao dịch',
  'DR / CR': 'Chiều ghi nhận', 'TRANG THAI XU LY': 'Trạng thái xử lý', 'POSTING DATE': 'Ngày hạch toán',
  'OUTWARD STATUS': 'Trạng thái gửi đi', 'RETURN CODE': 'Mã kết quả', 'REASON CODE': 'Mã lý do',
  'SOURCE NUMBER': 'Số tài khoản nguồn', 'SOURCE REG NUMBER': 'Mã đăng ký nguồn', 'SOURCE CODE': 'Mã phía nguồn',
  'SOURCE CONTRACT': 'Hợp đồng nguồn', 'SOURCE SERVICE': 'Dịch vụ nguồn', 'SOURCE CHANNEL': 'Kênh giao dịch nguồn',
  'SOURCE CAT': 'Nhóm đối tượng nguồn', 'SOURCE ACC TYPE': 'Loại tài khoản nguồn',
  'TARGET NUMBER': 'Số tài khoản nhận', 'TARGET CODE': 'Mã phía nhận', 'TARGET CONTRACT': 'Hợp đồng nhận',
  'TARGET SERVICE': 'Dịch vụ nhận', 'TARGET CHANNEL': 'Kênh giao dịch nhận', 'TARGET CAT': 'Nhóm đối tượng nhận',
  'TARGET ACC TYPE': 'Loại tài khoản nhận', 'TARGET COUNTRY': 'Quốc gia nhận',
  'SETTL AMOUNT': 'Số tiền quyết toán', 'SOURCE FEE AMOUNT': 'Phí phía gửi', 'SOURCE FEE CODE': 'Mã phí phía gửi',
  'TARGET FEE AMOUNT': 'Phí phía nhận', 'TARGET FEE CODE': 'Mã phí phía nhận', 'RECONS AMOUNT': 'Số tiền đối soát',
  'FX SETTL DATE': 'Ngày quyết toán ngoại tệ', 'REC DATE': 'Ngày tiếp nhận', 'CARD EXPIRE': 'Ngày hết hạn thẻ',
  'CARD SEQ NUMBER': 'Số thứ tự thẻ', 'MERCHANT ID': 'Mã đơn vị chấp nhận thanh toán', 'SIC CODE': 'Mã ngành nghề',
  'SENDING BIN': 'Mã tổ chức gửi', 'TARGET BIN ID': 'Mã tổ chức nhận', 'TRANS CONDITION': 'Điều kiện giao dịch',
  'TRANS COND ATTR': 'Thuộc tính điều kiện', 'BIN RECORD': 'Bản ghi tổ chức', 'TRANS LOCATION': 'Địa điểm giao dịch',
  'DOC ORIG ID': 'Giao dịch gốc', 'DOC PREV ID': 'Giao dịch trước', 'DOC SUMM ID': 'Giao dịch tổng hợp',
  'DOC CHAIN ID': 'Chuỗi giao dịch', 'NUMBER OF SUB-S': 'Số giao dịch thành phần', 'NUMBER IN CHAIN': 'Thứ tự trong chuỗi',
  'ACQ REF NUMBER': 'Mã tham chiếu tiếp nhận', 'RET REF NUMBER': 'Mã tham chiếu trả về',
  'ISS REF NUMBER': 'Mã tham chiếu phát hành', 'PS REF NUMBER': 'Mã tham chiếu thanh toán', 'NW REF DATE': 'Ngày tham chiếu mạng',
});

export function getDocFieldLabel(label) {
  return DOC_FIELD_LABELS[label] || label;
}

const POSTING_STATUS_META = Object.freeze({
  P: { vi: 'Đã hạch toán', en: 'Posted', className: 'posted' },
  W: { vi: 'Chờ xử lý', en: 'Pending', className: 'waiting' },
  J: { vi: 'Bị từ chối', en: 'Rejected', className: 'error' },
  D: { vi: 'Từ chối', en: 'Declined', className: 'error' },
  C: { vi: 'Đã đóng', en: 'Closed', className: 'neutral' },
  I: { vi: 'Không hoạt động', en: 'Inactive', className: 'unknown' },
  U: { vi: 'Xử lý hệ thống', en: 'System processing', className: 'system' },
});

export function getPostingStatusMeta(status, language = 'vi') {
  const noStatus = language === 'en' ? 'No status' : 'Chưa có trạng thái';
  if (!status) {
    return {
      code: null,
      label: noStatus,
      displayLabel: noStatus,
      optionLabel: noStatus,
      className: 'unknown',
    };
  }

  const code = status.toString().trim().toUpperCase();
  const meta = POSTING_STATUS_META[code];

  if (!meta) {
    return {
      code,
      label: code,
      displayLabel: code,
      optionLabel: code,
      className: 'unknown',
    };
  }

  const label = meta[language] || meta.vi;
  return {
    code,
    label,
    displayLabel: `${label} (${code})`,
    optionLabel: `${label} (${code})`,
    className: meta.className,
  };
}

export function toExclusiveEndDate(dateValue) {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export function toStartDate(dateValue) {
  if (!dateValue) return undefined;
  return new Date(`${dateValue}T00:00:00`).toISOString();
}
