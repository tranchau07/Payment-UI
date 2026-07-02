import { useState, useEffect, useMemo } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import ApiForm from '../../components/common/ApiForm';
import { useApi } from '../../hooks/useApi';
import { contractService } from '../../services/contractApi';
import { branchService } from '../../services/branchApi';
import { applProductService } from '../../services/applProductApi';
import CreateCardForm from './CreateCardForm';

const INITIAL_FORM_VALUES = {
  clientIdentifier: '',
  liabContractIdentifier: '',
  productCode: '',
  productCode2: '',
  productCode3: '',
  contractName: '',
  cbsNumber: '',
  branch: '',
  institutionCode: '0001',
  addInfo01: '',
  addInfo02: ''
};

export default function ContractCreation({ clientId, onComplete }) {
  const [step, setStep, clearStep] = useSessionStorage('cc_step', 0); // 0: loading/checking, 1: liability, 2: issuing, 3: card
  const [formValues, setFormValues, clearFormValues] = useSessionStorage('cc_formValues', { 
    ...INITIAL_FORM_VALUES, 
    clientIdentifier: clientId || '',
    productCode: 'ISSUING_TRAINING01',
    contractName: `Issuing Training - KH ${clientId || ''}`
  });
  const [contractResponse, setContractResponse, clearContractResponse] = useSessionStorage('cc_contractResponse', null);
  const [localError, setLocalError] = useState('');
  const [existingLiability, setExistingLiability] = useState(null);

  const checkLiabilityApi = useApi(contractService.checkLiability);
  const createLiabilityApi = useApi(contractService.createLiability);
  const createIssuingApi = useApi(contractService.createWithLiability);
  const allBranches = useApi(branchService.getAll);
  const productsApi = useApi(applProductService.getAll);

  const productOptions = useMemo(() => (productsApi.data || [])
    .filter((p) =>
      p.amndState === 'A' &&
      p.isActive !== 'N' &&
      !p.parentCode?.trim() &&
      p.conCat === 'A' && p.pcat === 'C'
    )
    .map((p) => ({ value: p.code, label: p.name || p.code })), [productsApi.data]);

  const accessoryProductOptions = [
    { value: '', label: 'Không chọn' },
    { value: 'FEE_SMS_MONTHLY', label: 'SMS Banking' },
    { value: 'FEE_IBANKING', label: 'Internet Banking' }
  ];

  useEffect(() => {
    allBranches.execute();
    productsApi.execute();

    // Reset state for new clientId to prevent carrying over step/form values from previous sessions
    setContractResponse(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExistingLiability(null);
    
    const initialValues = {
      ...INITIAL_FORM_VALUES,
      clientIdentifier: clientId || '',
      productCode: 'ISSUING_TRAINING01',
      contractName: `Issuing Training - KH ${clientId || ''}`
    };

    const checkLiabilityStatus = async () => {
      try {
        const res = await checkLiabilityApi.execute(clientId);
        if (res.data && res.data.hasLiability) {
          setExistingLiability(res.data);
          setFormValues({
            ...initialValues,
            liabContractIdentifier: res.data.contractNumber,
            cbsNumber: res.data.cbsNumber || ''
          });
          setStep(2);
        } else {
          setFormValues(initialValues);
          setStep(1);
        }
      } catch (err) {
        console.error("Error checking liability status:", err);
        setFormValues(initialValues);
        setStep(1);
      }
    };

    if (clientId) {
      setStep(0); // Show loading spinner
      checkLiabilityStatus();
    } else {
      setFormValues(initialValues);
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const clearAllData = () => {
    clearStep();
    clearFormValues();
    clearContractResponse();
    setExistingLiability(null);
  };

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      
      if (name === 'productCode' && prev.clientIdentifier) {
        const product = productOptions.find(p => p.value === value);
        const productName = product ? product.label.split('(')[0].trim() : value;
        newValues.contractName = `${productName} - KH ${prev.clientIdentifier}`;
      }

      return newValues;
    });
  };

  const handleLiabilitySubmit = async (values) => {
    setLocalError('');
    try {
      const payload = {
        clientNumber: clientId,
        cbsNumber: values.cbsNumber
      };
      const response = await createLiabilityApi.execute(payload);
      const serverResponse = response.data;

      if (serverResponse.contractNumber || serverResponse.success !== false) {
        const contractNum = serverResponse.contractNumber;
        setFormValues(prev => ({
          ...prev,
          liabContractIdentifier: contractNum,
          cbsNumber: values.cbsNumber
        }));
        setStep(2);
        setLocalError('');
      } else {
        setLocalError(serverResponse.retMsg || 'Có lỗi xảy ra khi tạo hợp đồng bảo lãnh.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi tạo hợp đồng bảo lãnh.';
      setLocalError(errorMessage);
    }
  };

  const handleIssuingSubmit = async (values) => {
    setLocalError('');
    const finalValues = { 
      ...formValues, 
      ...values, 
      institutionCode: '0001'
    };

    try {
      const response = await createIssuingApi.execute(finalValues);
      const serverResponse = response.data;

      const contractNum = serverResponse.contractNumber || serverResponse.data?.contractNumber;

      if (contractNum || serverResponse.success !== false) {
        setContractResponse(serverResponse);
        setStep(3);
        setLocalError('');
      } else {
        setLocalError(serverResponse.retMsg || 'Hệ thống xử lý giao dịch gặp lỗi.');
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const errors = err.response.data;
        const errorMsg = Object.entries(errors).map(([key, msg]) => `${key}: ${msg}`).join(', ');
        setLocalError(`Lỗi dữ liệu: ${errorMsg}`);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ.';
        setLocalError(errorMessage);
      }
    }
  };

  const handleComplete = () => {
    clearAllData();
    if (onComplete) {
      onComplete();
    }
  };

  const liabilityFields = [
    {
      name: 'clientIdentifier',
      label: 'Mã khách hàng',
      type: 'input',
      inputType: 'text',
      disabled: true,
    },
    {
      name: 'cbsNumber',
      label: 'Số tài khoản liên kết',
      type: 'input',
      inputType: 'text',
      placeholder: 'Nhập số tài khoản thanh toán trích nợ',
      validation: { 
        required: true, 
        pattern: /^\d+$/, 
        message: 'Tài khoản liên kết là bắt buộc và chỉ chứa số' 
      },
    }
  ];

  const issuingFields = [
    {
      name: 'clientIdentifier',
      label: 'Mã khách hàng',
      type: 'input',
      inputType: 'text',
      disabled: true,
    },
    {
      name: 'liabContractIdentifier',
      label: 'Mã hợp đồng bảo lãnh',
      type: 'input',
      inputType: 'text',
      disabled: true,
      validation: { required: true, message: 'ID Hợp đồng bảo lãnh là bắt buộc' },
    },
    {
      name: 'productCode',
      label: 'Sản phẩm chính',
      type: 'select',
      options: productOptions,
      placeholder: 'Chọn loại sản phẩm chính',
      validation: { required: true, message: 'Vui lòng chọn Sản phẩm chính' },
    },
    {
      name: 'productCode2',
      label: 'Sản phẩm phụ 1',
      type: 'select',
      options: accessoryProductOptions,
      validation: { required: false },
    },
    {
      name: 'productCode3',
      label: 'Sản phẩm phụ 2',
      type: 'select',
      options: accessoryProductOptions,
      validation: { required: false },
    },
    {
      name: 'contractName',
      label: 'Tên Hợp đồng',
      type: 'input',
      inputType: 'text',
      placeholder: '[Tên SP] - [Tên KH]',
      validation: { required: true, message: 'Vui lòng nhập Tên Hợp đồng' },
    },
    {
      name: 'cbsNumber',
      label: 'Tài khoản liên kết',
      type: 'input',
      inputType: 'text',
      disabled: true,
    },
    {
      name: 'branch',
      label: 'Chi nhánh quản lý',
      type: 'select',
      options: allBranches.data?.map(b => ({ value: b.code, label: b.name })) || [],
      placeholder: 'Chọn chi nhánh',
      validation: { required: true, message: 'Vui lòng chọn Chi nhánh' },
    },
    {
      name: 'institutionCode',
      label: 'Tổ chức phát hành',
      type: 'input',
      disabled: true,
    },
    {
      name: 'addInfo01',
      label: 'Mã nhân viên tiếp thị',
      type: 'input',
      inputType: 'text',
      placeholder: 'Mã CBNV',
      validation: { required: false },
    },
    {
      name: 'addInfo02',
      label: 'Ghi chú (AddInfo02)',
      type: 'input',
      inputType: 'text',
      placeholder: 'Ghi chú',
      validation: { required: false },
    }
  ];

  if (step === 0) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner">Đang kiểm tra trạng thái hợp đồng trên Core...</div>
      </div>
    );
  }

  if (step === 3) {
    const contractNumber = contractResponse?.contractNumber || contractResponse?.data?.contractNumber;
    return <CreateCardForm contractIdentifier={contractNumber} onComplete={handleComplete} />;
  }

  const isLoading = createLiabilityApi.loading || createIssuingApi.loading;

  return (
    <section id="api-calls">
      <h2>Mở Hợp Đồng</h2>
      <p className="section-description">
        {step === 1 ? 'Bước 1: Mở Hợp đồng Bảo lãnh (Liability)' : 'Bước 2: Mở Hợp đồng Phát hành (Issuing Contract)'}
      </p>

      {existingLiability && step === 2 && (
        <div className="info-banner">
          <span>
            Hệ thống tìm thấy hợp đồng bảo lãnh đang hoạt động: <strong>{existingLiability.contractNumber}</strong> (Tài khoản: {existingLiability.cbsNumber})
          </span>
          <button 
            type="button" 
            className="back-button" 
            style={{ padding: '4px 8px', fontSize: '12px', margin: 0 }}
            onClick={() => {
              setStep(1);
              setFormValues(prev => ({ ...prev, liabContractIdentifier: '' }));
            }}
          >
            Tạo mới bảo lãnh
          </button>
        </div>
      )}

      <div className="form-container card" style={{ position: 'relative' }}>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner">Đang xử lý giao dịch...</div>
          </div>
        )}

        {step === 1 && (
          <ApiForm
            fields={liabilityFields}
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleLiabilitySubmit}
          >
            <div className="form-navigation">
              <button 
                type="button" 
                className="back-button" 
                onClick={handleComplete}
                disabled={isLoading}
              >
                Quay lại danh sách
              </button>
              <button 
                className="submit-button" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </div>
            {localError && <div className="error-message">{localError}</div>}
          </ApiForm>
        )}

        {step === 2 && (
          <ApiForm
            fields={issuingFields}
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleIssuingSubmit}
            onFieldChange={handleFieldChange}
          >
            <div className="form-navigation">
              <button 
                type="button" 
                className="back-button" 
                onClick={() => {
                  if (existingLiability) {
                    handleComplete();
                  } else {
                    setStep(1);
                  }
                }}
                disabled={isLoading}
              >
                {existingLiability ? 'Quay lại danh sách' : 'Quay lại'}
              </button>
              <button 
                className="submit-button" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang tạo..." : "Tiếp tục tạo thẻ"}
              </button>
            </div>
            {localError && <div className="error-message">{localError}</div>}
          </ApiForm>
        )}
      </div>
    </section>
  );
}
