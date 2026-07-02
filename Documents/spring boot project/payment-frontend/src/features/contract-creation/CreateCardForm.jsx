import { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getProductCards, createCard } from '../../services/cardApi';
import { useSessionStorage } from '../../hooks/useSessionStorage';

const removeDiacriticsAndUpperCase = (str) => {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z ]/g, ''); // chỉ giữ chữ cái A-Z và khoảng trắng
};

const CreateCardForm = ({ contractIdentifier, onComplete }) => {
  const { data: productCodesData, execute: fetchProductCodes } = useApi(getProductCards);
  const { data: creationResultApi, error: creationErrorApi, loading: isLoading, execute: performCreateCard } = useApi(createCard);

  const [formData, setFormData, clearFormData] = useSessionStorage('card_formData', {
    cardName: '',
    cbsNumber: '',
    embossedFirstName: '',
    embossedLastName: '',
    embossedCompanyName: '',
    productCode: '',
  });

  const [persistedResult, setPersistedResult, clearPersistedResult] = useSessionStorage('card_creationResult', null);
  const [persistedError, setPersistedError, clearPersistedError] = useSessionStorage('card_error', null);

  useEffect(() => {
    fetchProductCodes();
  }, [fetchProductCodes]);

  useEffect(() => {
    if (creationResultApi) {
      setPersistedResult(creationResultApi);
    }
    if (creationErrorApi) {
      setPersistedError(creationErrorApi);
    }
  }, [creationResultApi, creationErrorApi, setPersistedResult, setPersistedError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'embossedFirstName' || name === 'embossedLastName' || name === 'embossedCompanyName') {
      const cleanValue = removeDiacriticsAndUpperCase(value);
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      contractIdentifier,
      productCode: formData.productCode,
      inObject: {
        cardName: formData.cardName,
        branch: '0101', // Hardcoded as requested
        cbsNumber: formData.cbsNumber,
        embossedFirstName: formData.embossedFirstName,
        embossedLastName: formData.embossedLastName,
        embossedCompanyName: formData.embossedCompanyName,
      },
    };
    await performCreateCard(payload);
  };

  const handleFinish = () => {
    clearFormData();
    clearPersistedResult();
    clearPersistedError();
    if (onComplete) {
      onComplete();
    } else {
      window.location.reload();
    }
  };

  // Extract products array safely
  const productsList = Array.isArray(productCodesData) 
    ? productCodesData 
    : (productCodesData?.data || productCodesData?.content || []);

  const currentResult = persistedResult;
  const currentError = persistedError;

  if (currentResult || currentError) {
    const isSuccess = !!currentResult && !currentError;
    return (
      <div className="form-container card result-view">
        <div className={`success-header ${isSuccess ? '' : 'error-header'}`}>
          <div className="success-icon">{isSuccess ? '✓' : '✗'}</div>
          <h3>{isSuccess ? 'Tạo thẻ thành công' : 'Tạo thẻ thất bại'}</h3>
        </div>
        
        <div className="result-content">
          {currentError && <div className="error-message" style={{marginBottom: '20px'}}>{currentError}</div>}
          
          {currentResult && (
            <div className="result-section server-response">
              <h4>Thông tin chi tiết:</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Mã hợp đồng:</span>
                  <span className="value">{contractIdentifier}</span>
                </div>
                <div className="result-item">
                  <span className="label">Số thẻ (Card Number):</span>
                  <span className="value">{currentResult.cardNumber || 'N/A'}</span>
                </div>
                <div className="result-item">
                  <span className="label">Số hồ sơ (Application Number):</span>
                  <span className="value">{currentResult.applicationNumber || 'N/A'}</span>
                </div>
                <div className="result-item">
                  <span className="label">Mã kết quả (retCode):</span>
                  <span className="value">{currentResult.retCode}</span>
                </div>
                <div className="result-item full-width">
                  <span className="label">Thông báo (retMsg):</span>
                  <span className="value">{currentResult.retMsg}</span>
                </div>
                {currentResult.debugInfo && (
                  <div className="result-item full-width">
                    <span className="label">Debug Info:</span>
                    <span className="value">{currentResult.debugInfo}</span>
                  </div>
                )}
                {currentResult.resultInfo && (
                  <div className="result-item full-width">
                    <span className="label">Result Info:</span>
                    <span className="value" style={{ wordBreak: 'break-all' }}>{currentResult.resultInfo}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="result-actions" style={{ marginTop: '20px' }}>
            <button className="primary-button" onClick={handleFinish}>
              Hoàn tất
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getExpiryString = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear() + 5).substring(2); // Thẻ hết hạn sau 5 năm
    return `${mm}/${yy}`;
  };

  const expiryString = getExpiryString();

  return (
    <div className="form-container card" style={{ maxWidth: '960px', margin: '0 auto 40px' }}>
      <h2 style={{ marginBottom: '6px', textAlign: 'left' }}>Phát Hành Thẻ Vật Lý</h2>
      <p className="section-description" style={{ marginBottom: '32px', textAlign: 'left', marginLeft: 0, marginRight: 0 }}>
        Mở thẻ mới liên kết với Hợp đồng Phát hành: <strong>{contractIdentifier}</strong>
      </p>
      
      <div className="card-creation-split">
        {/* Live Card Preview Column */}
        <div className="card-preview-column">
          <span className="preview-column-title">
            🎨 Bản Xem Trước Thẻ (Live Preview)
          </span>
          <div className={`mini-physical-card preview-mode product-${formData.productCode}`}>
            <div className="card-glass-glow" />
            <div className="card-top">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="card-chip-nano" title="EMV Chip">
                  <div className="chip-line v1"></div>
                  <div className="chip-line v2"></div>
                  <div className="chip-line h1"></div>
                  <div className="chip-inner"></div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="card-contactless-svg" style={{ opacity: 0.8 }} title="Contactless">
                  <path d="M5 8.5a4 4 0 0 1 0 7M5 5a8 8 0 0 1 0 14M5 1.5a12 12 0 0 1 0 21" />
                  <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="card-brand-logo">VISA</span>
            </div>
            <div className="card-number-display">
              {formData.cbsNumber ? formData.cbsNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
            </div>
            <div className="card-middle">
              <div className="card-info-item">
                <span className="card-info-label">CHỦ THẺ</span>
                <span className="card-info-value">
                  {`${formData.embossedLastName || ''} ${formData.embossedFirstName || ''}`.trim().toUpperCase() || 'TEN CHU THE'}
                </span>
                {formData.embossedCompanyName && (
                  <span className="card-info-value" style={{ fontSize: '9px', marginTop: '2px', opacity: 0.85 }}>
                    {formData.embossedCompanyName.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="card-info-item">
                <span className="card-info-label">HẾT HẠN</span>
                <span className="card-info-value">{expiryString}</span>
              </div>
            </div>
            <div className="card-bottom">
              <div className="card-product-tag">{formData.productCode || 'Chưa chọn sản phẩm'}</div>
              <div className="card-balance-tag">ĐANG HOẠT ĐỘNG</div>
            </div>
          </div>
        </div>

        {/* Form Fields Column */}
        <form onSubmit={handleSubmit} className="api-form" style={{ gap: '20px' }}>
          <label className="api-form-field">
            <span>Sản phẩm (Product Code)</span>
            <select name="productCode" value={formData.productCode} onChange={handleChange} required>
              <option value="">-- Chọn sản phẩm --</option>
              {productsList.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          
          <label className="api-form-field">
            <span>Tên Thẻ (Card Name)</span>
            <input type="text" name="cardName" value={formData.cardName} onChange={handleChange} required placeholder="VD: NGUYEN VAN A" />
          </label>
          
          <label className="api-form-field">
            <span>Chi nhánh (Branch)</span>
            <input type="text" value="0101" readOnly className="readonly-input" />
          </label>
          
          <label className="api-form-field">
            <span>Tài khoản liên kết</span>
            <input type="text" name="cbsNumber" value={formData.cbsNumber} onChange={handleChange} required placeholder="VD: 1234567890" />
          </label>
          
          <label className="api-form-field">
            <span>Tên in nổi (Embossed First Name)</span>
            <input
              type="text"
              name="embossedFirstName"
              value={formData.embossedFirstName}
              onChange={handleChange}
              required
              placeholder="VD: VAN A"
            />
          </label>
          
          <label className="api-form-field">
            <span>Họ in nổi (Embossed Last Name)</span>
            <input
              type="text"
              name="embossedLastName"
              value={formData.embossedLastName}
              onChange={handleChange}
              required
              placeholder="VD: NGUYEN"
            />
          </label>
          
          <label className="api-form-field" style={{ gridColumn: '1 / -1' }}>
            <span>Tên công ty in nổi (Embossed Company Name) - Tùy chọn</span>
            <input
              type="text"
              name="embossedCompanyName"
              value={formData.embossedCompanyName}
              onChange={handleChange}
              placeholder="VD: OPENWAY CO"
            />
          </label>
          
          <div className="form-navigation" style={{ marginTop: '16px' }}>
            <button type="submit" disabled={isLoading} className="submit-button" style={{ width: '100%' }}>
              {isLoading ? 'Đang tạo thẻ...' : 'Tạo Thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardForm;
