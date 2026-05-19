export default function ResultCard({ title, content, onAction }) {
  if (!content) {
    return null;
  }

  const { reason, clientInfo, customData, serverResponse } = content;

  return (
    <div className="result-card success-card">
      <div className="success-header">
        <div className="success-icon">✓</div>
        <h3>{title}</h3>
      </div>
      
      <div className="result-content">
        {serverResponse && (
          <div className="result-section server-response">
            <h4>Kết quả từ máy chủ</h4>
            <div className="result-grid">
              <div className="result-item">
                <span className="label">Mã khách hàng mới:</span>
                <span className="value">{serverResponse.newClientId || 'N/A'}</span>
              </div>
              <div className="result-item">
                <span className="label">Số đơn đăng ký:</span>
                <span className="value">{serverResponse.applicationNumber || 'N/A'}</span>
              </div>
              {serverResponse.contractCreationStatus && (
                <div className="result-item full-width highlight">
                  <span className="label">Hợp đồng trách nhiệm (Way4):</span>
                  <span className="value">{serverResponse.contractCreationStatus}</span>
                </div>
              )}
              <div className="result-item full-width">
                <span className="label">Thông báo:</span>
                <span className="value">{serverResponse.resultInfo || serverResponse.retMsg}</span>
              </div>
            </div>
          </div>
        )}

        {onAction && (
          <div className="result-actions">
            <button className="primary-button" onClick={onAction}>
              Hoàn tất & Quay lại
            </button>
          </div>
        )}

        {clientInfo && (
          <>
            <div className="result-section">
              <h4>Thông tin chung</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Lý do:</span>
                  <span className="value">{reason}</span>
                </div>
              </div>
            </div>

            <div className="result-section">
              <h4>Thông tin khách hàng</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Họ tên:</span>
                  <span className="value">{`${clientInfo.firstName || ''} ${clientInfo.middleName || ''} ${clientInfo.lastName || ''}`}</span>
                </div>
                <div className="result-item">
                  <span className="label">Tên viết tắt:</span>
                  <span className="value">{clientInfo.shortName}</span>
                </div>
                <div className="result-item">
                  <span className="label">Ngày sinh:</span>
                  <span className="value">{clientInfo.birthDate}</span>
                </div>
                <div className="result-item">
                  <span className="label">Giới tính:</span>
                  <span className="value">{clientInfo.gender === 'M' ? 'Nam' : clientInfo.gender === 'F' ? 'Nữ' : 'Khác'}</span>
                </div>
                <div className="result-item">
                  <span className="label">Email:</span>
                  <span className="value">{clientInfo.email}</span>
                </div>
                <div className="result-item">
                  <span className="label">Điện thoại:</span>
                  <span className="value">{clientInfo.mobilePhone}</span>
                </div>
                <div className="result-item">
                  <span className="label">Số CMND/CCCD:</span>
                  <span className="value">{clientInfo.identityCardNumber}</span>
                </div>
                <div className="result-item">
                  <span className="label">Nghề nghiệp:</span>
                  <span className="value">{clientInfo.profession}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {customData && customData.length > 0 && (
          <div className="result-section">
            <h4>Thông tin bổ sung</h4>
            <div className="result-grid">
              {customData.map((item, index) => (
                <div key={index} className="result-item full-width">
                  <span className="label">{item.tagName || `Thông tin ${index + 1}`}:</span>
                  <span className="value">{item.tagValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
