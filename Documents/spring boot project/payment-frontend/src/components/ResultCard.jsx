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
              {Object.hasOwn(serverResponse, 'newMerchantId') ? (
                <>
                  <div className="result-item">
                    <span className="label">NewClient (Mã Merchant mới):</span>
                    <span className="value">{serverResponse.newMerchantId || 'N/A'}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">RetCode (Mã kết quả):</span>
                    <span className="value">{serverResponse.retCode !== undefined && serverResponse.retCode !== null ? serverResponse.retCode : 'N/A'}</span>
                  </div>
                  <div className="result-item full-width">
                    <span className="label">RetMsg (Thông điệp phản hồi):</span>
                    <span className="value">{serverResponse.retMsg || 'N/A'}</span>
                  </div>
                  <div className="result-item full-width">
                    <span className="label">ResultInfo (Thông tin bổ sung):</span>
                    <span className="value">{serverResponse.resultInfo || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
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
                      <span className="label">Hợp đồng bảo đảm:</span>
                      <span className="value">{serverResponse.contractCreationStatus}</span>
                    </div>
                  )}
                  <div className="result-item full-width">
                    <span className="label">Thông báo:</span>
                    <span className="value">{serverResponse.resultInfo || serverResponse.retMsg}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {serverResponse && Object.hasOwn(serverResponse, 'newMerchantId') && (
          <div className="result-section">
            <h4>Thông tin Merchant đã đăng ký</h4>
            <div className="result-grid">
              <div className="result-item">
                <span className="label">Tên công ty:</span>
                <span className="value">{content.companyName}</span>
              </div>
              <div className="result-item">
                <span className="label">Tên thương mại:</span>
                <span className="value">{content.tradeName}</span>
              </div>
              <div className="result-item">
                <span className="label">Tên viết tắt:</span>
                <span className="value">{content.shortName}</span>
              </div>
              <div className="result-item">
                <span className="label">Mã Merchant (Client Number):</span>
                <span className="value">{content.clientNumber}</span>
              </div>
              <div className="result-item">
                <span className="label">Mã số thuế (TIN):</span>
                <span className="value">{content.tin}</span>
              </div>
              <div className="result-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{content.phone || content.mobilePhone}</span>
              </div>
              <div className="result-item">
                <span className="label">Email:</span>
                <span className="value">{content.email}</span>
              </div>
              <div className="result-item">
                <span className="label">Website:</span>
                <span className="value">{content.url || 'N/A'}</span>
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
