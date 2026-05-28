import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getProductCards, createCard } from '../../services/cardApi';
import { useSessionStorage } from '../../hooks/useSessionStorage';

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="form-container card">
      <h2 style={{ marginBottom: '10px' }}>Tạo Thẻ Mới (Create Card)</h2>
      <p className="section-description" style={{ marginBottom: '20px' }}>
        Dựa trên Hợp đồng: <strong>{contractIdentifier}</strong>
      </p>
      
      <form onSubmit={handleSubmit} className="api-form">
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
          <input type="text" value="0101" readOnly className="readonly-input" style={{ backgroundColor: '#f5f5f5' }} />
        </label>
        
        <label className="api-form-field">
          <span>Tài khoản CBS (CBS Number)</span>
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
        
        <label className="api-form-field">
          <span>Tên công ty in nổi (Embossed Company Name)</span>
          <input
            type="text"
            name="embossedCompanyName"
            value={formData.embossedCompanyName}
            onChange={handleChange}
            required
            placeholder="VD: OPENWAY CO"
          />
        </label>
        
        <div className="form-navigation">
          <button type="submit" disabled={isLoading} className="submit-button" style={{ width: '100%', marginTop: '20px' }}>
            {isLoading ? 'Đang tạo thẻ...' : 'Tạo Thẻ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCardForm;
