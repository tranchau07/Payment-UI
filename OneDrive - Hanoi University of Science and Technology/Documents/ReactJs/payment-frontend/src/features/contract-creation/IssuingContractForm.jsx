import { useState, useMemo } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import ApiForm from '../../components/common/ApiForm';
import { useApi } from '../../hooks/useApi';
import { contractService } from '../../services/contractApi';
import CreateCardForm from './CreateCardForm';

export default function IssuingContractForm({ newClientId, contractCreationStatus, onContractCreated, onBack }) {
  const [step, setStep, clearStep] = useSessionStorage('ic_step', 1);
  const [createdContractNumber, setCreatedContractNumber, clearCreatedContractNumber] = useSessionStorage('ic_createdContractNumber', null);
  const [formError, setFormError] = useState('');

  const liabContractIdentifier = useMemo(() => {
    return contractCreationStatus.includes(':')
      ? contractCreationStatus.split(':')[1].trim()
      : '';
  }, [contractCreationStatus]);

  const [contractValues, setContractValues, clearContractValues] = useSessionStorage('ic_contractValues', {
    liabContractIdentifier: liabContractIdentifier,
    clientIdentifier: newClientId,
    productCode: 'ISSUING_TRAINING01',
    branch: '0101',
    institutionCode: '0001',
    contractName: 'Issuing Contract',
    productCode2: '',
    productCode3: '',
    cbsNumber: ''
  });

  const [additionalInfos, setAdditionalInfos, clearAdditionalInfos] = useSessionStorage('ic_additionalInfos', [
    { key: 'addInfo01', value: '' }
  ]);
  const createContractApi = useApi(contractService.createWithLiability);

  const clearAllData = () => {
    clearStep();
    clearCreatedContractNumber();
    clearContractValues();
    clearAdditionalInfos();
  };

  const handleAddInfoChange = (index, value) => {
    const updatedInfos = [...additionalInfos];
    updatedInfos[index].value = value;
    setAdditionalInfos(updatedInfos);
  };

  const handleAddAdditionalInfo = () => {
    const nextIndex = additionalInfos.length + 1;
    if (nextIndex <= 4) {
      setAdditionalInfos([...additionalInfos, { key: `addInfo0${nextIndex}`, value: '' }]);
    }
  };

  const handleRemoveAdditionalInfo = (index) => {
    setAdditionalInfos(additionalInfos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values) => {
    setFormError(''); // Reset error on new submission
    const formattedAddInfos = additionalInfos.reduce((acc, info) => {
      if (info.value) {
        acc[info.key] = info.value;
      }
      return acc;
    }, {});

    const finalContractData = {
      ...values,
      ...formattedAddInfos,
    };

    if (!finalContractData.productCode2) delete finalContractData.productCode2;
    if (!finalContractData.productCode3) delete finalContractData.productCode3;

    try {
      const response = await createContractApi.execute(finalContractData);
      const serverResponse = response.data;

      if (serverResponse.retCode === 0 && serverResponse.success) {
        // Robustly find the contract number
        const contractNum = serverResponse.contractNumber || serverResponse.data?.contractNumber;
        
        if (contractNum) {
          console.log('[Contract Creation Success] Found Contract Number:', contractNum);
          setCreatedContractNumber(contractNum);
          setStep(2);
        } else {
          console.error("Contract creation successful, but 'contractNumber' not found in response:", serverResponse);
          setFormError("Tạo hợp đồng thành công nhưng không tìm thấy mã hợp đồng để tiếp tục.");
        }
      } else {
        const errorMessage = serverResponse.retMsg || 'Tạo hợp đồng không thành công.';
        console.warn(`[Contract Creation Failed] Code: ${serverResponse.retCode}, Message: ${errorMessage}`);
        setFormError(errorMessage);
        if (onContractCreated) onContractCreated({ success: false, error: errorMessage });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tạo hợp đồng. Vui lòng thử lại.';
      console.error('[Contract Creation Error]', errorMessage);
      setFormError(errorMessage);
      if (onContractCreated) onContractCreated({ success: false, error: errorMessage });
    }
  };

  const handleComplete = () => {
    clearAllData();
    if (onContractCreated) {
      onContractCreated({ success: true });
    }
  };

  const fields = [
    { name: 'liabContractIdentifier', label: 'Mã hợp đồng', type: 'text', readOnly: true },
    { name: 'clientIdentifier', label: 'Mã khách hàng', type: 'text', readOnly: true },
    { name: 'productCode', label: 'Mã sản phẩm', type: 'text', readOnly: true },
    { name: 'branch', label: 'Chi nhánh', type: 'text', readOnly: true },
    { name: 'institutionCode', label: 'Mã tổ chức', type: 'text', readOnly: true },
    { name: 'contractName', label: 'Tên hợp đồng', type: 'text', readOnly: true },
    {
      name: 'cbsNumber',
      label: 'Số CBS',
      type: 'text',
      inputType: 'number',
      placeholder: 'Nhập số CBS',
      validation: {
        required: true,
        pattern: /^\d+$/,
        message: 'Số CBS phải là số và không được để trống'
      }
    },
  ];

  if (step === 2) {
    return <CreateCardForm contractIdentifier={createdContractNumber} onComplete={handleComplete} />;
  }

  return (
    <section id="issuing-contract-creation">
      <h2>Tạo hợp đồng phát hành với trách nhiệm</h2>
      <p className="section-description">
        Điền thông tin để tạo hợp đồng phát hành.
      </p>

      <div className="form-container card">
        <ApiForm
          fields={fields}
          values={contractValues}
          onChange={setContractValues}
          onSubmit={handleSubmit}
        >
          {additionalInfos.map((info, index) => (
            <label key={info.key} className="api-form-field">
              <span>{info.key.charAt(0).toUpperCase() + info.key.slice(1)}</span>
              <input
                name={info.key}
                type="text"
                value={info.value}
                onChange={(e) => handleAddInfoChange(index, e.target.value)}
                placeholder={`Nhập ${info.key}`}
              />
              {index > 0 && (
                <button type="button" onClick={() => handleRemoveAdditionalInfo(index)} className="remove-add-info-button">
                  Xóa
                </button>
              )}
            </label>
          ))}
          {additionalInfos.length < 4 && (
            <button type="button" onClick={handleAddAdditionalInfo} className="add-button">
              Thêm AddInfo
            </button>
          )}

          <div className="form-navigation">
            {onBack && (
              <button
                type="button"
                className="back-button"
                onClick={onBack}
                disabled={createContractApi.loading}
              >
                Quay lại
              </button>
            )}
            <button
              className="submit-button"
              type="submit"
              disabled={createContractApi.loading}
            >
              {createContractApi.loading ? "Đang tạo..." : "Tiếp tục"}
            </button>
          </div>
          {formError && <div className="error-message">{formError}</div>}
          {createContractApi.error && <div className="error-message">{createContractApi.error.message || createContractApi.error}</div>}
        </ApiForm>
      </div>
    </section>
  );
}
