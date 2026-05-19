import { useState, useEffect } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import ApiForm from '../../components/common/ApiForm';
import { useApi } from '../../hooks/useApi';
import { contractService } from '../../services/contractApi';
import { branchService } from '../../services/branchApi';
import CreateCardForm from './CreateCardForm'; // Import the new component

const INITIAL_FORM_VALUES = {
  clientIdentifier: '',
  liabContractIdentifier: '',
  productCode: '',
  productCode2: '',
  productCode3: '',
  contractName: '',
  cbsNumber: '',
  branch: '',
  institutionCode: 'MYBANK', // Default
  addInfo01: '',
  addInfo02: ''
};

export default function ContractCreation({ clientId, onComplete }) {
  const [step, setStep, clearStep] = useSessionStorage('cc_step', 1); // 1 for contract, 2 for card
  const [formValues, setFormValues, clearFormValues] = useSessionStorage('cc_formValues', { ...INITIAL_FORM_VALUES, clientIdentifier: clientId || '' });
  const [contractResponse, setContractResponse, clearContractResponse] = useSessionStorage('cc_contractResponse', null);
  const [localError, setLocalError] = useState('');

  const contractApi = useApi(contractService.createWithLiability);
  const allBranches = useApi(branchService.getAll);

  // Mock product data for now since there's no specific API mentioned for products
  const productOptions = [
    { value: 'VISA_DEBIT_STD', label: 'Tài khoản ghi nợ chuẩn' },
    { value: 'VCB_VISA_PLATINUM', label: 'Tài khoản tín dụng hạng bạch kim' }
  ];

  const accessoryProductOptions = [
    { value: '', label: 'Không chọn' },
    { value: 'FEE_SMS_MONTHLY', label: 'SMS Banking' },
    { value: 'FEE_IBANKING', label: 'Internet Banking' }
  ];

  useEffect(() => {
    allBranches.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllData = () => {
    clearStep();
    clearFormValues();
    clearContractResponse();
  };

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      
      // Auto-generate contract name if product code changes
      if (name === 'productCode' && prev.clientIdentifier) {
        // Find product short name
        const product = productOptions.find(p => p.value === value);
        const productName = product ? product.label.split('(')[0].trim() : value;
        // Ideally we append the client name here, but we only have ID in this view 
        // unless passed down. We'll format it with ID for now or leave user to fill it.
        newValues.contractName = `${productName} - KH ${prev.clientIdentifier}`;
      }

      return newValues;
    });
  };

  const handleSubmit = async (values) => {
    const finalValues = { ...formValues, ...values };

    try {
      const response = await contractApi.execute(finalValues);
      const serverResponse = response.data;

      // Note: Backend might use retCode or success, we check appropriately based on PRD hints
      if (serverResponse.retCode === 0 || serverResponse.success !== false) {
        setContractResponse(serverResponse);
        setStep(2); // Move to the next step
        setLocalError('');
      } else {
        setLocalError(serverResponse.retMsg || 'Có lỗi xảy ra từ hệ thống Core Way4.');
      }
    } catch (err) {
      // 400 Bad Request error handling per PRD
      if (err.response && err.response.status === 400) {
        const errors = err.response.data;
        const errorMsg = Object.entries(errors).map(([key, msg]) => `${key}: ${msg}`).join(', ');
        setLocalError(`Lỗi dữ liệu: ${errorMsg}`);
      } else {
        const errorMessage = err.response?.data?.retMsg || err.message || 'Lỗi kết nối máy chủ.';
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

  const fields = [
    {
      name: 'clientIdentifier',
      label: 'ID Khách hàng',
      type: 'input',
      inputType: 'text',
      disabled: true,
      validation: { required: true, message: 'ID Khách hàng là bắt buộc' },
    },
    {
      name: 'liabContractIdentifier',
      label: 'ID Hợp đồng bảo lãnh',
      type: 'input',
      inputType: 'text',
      placeholder: 'Số Hợp đồng Liability cha (Tín dụng)',
      validation: { required: false },
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
      label: 'Tài khoản CBS (CASA)',
      type: 'input',
      inputType: 'text',
      placeholder: 'Số tài khoản thanh toán trích nợ',
      validation: { 
        required: true, 
        pattern: /^\d+$/, 
        message: 'Tài khoản CBS là bắt buộc và chỉ chứa số' 
      },
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
      type: 'select',
      options: [{ value: 'MYBANK', label: 'MYBANK' }, { value: 'OTHER', label: 'OTHER' }],
      validation: { required: true, message: 'Vui lòng chọn Tổ chức' },
    },
    {
      name: 'addInfo01',
      label: 'Mã NV Tiếp thị (AddInfo01)',
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

  if (step === 2) {
    return <CreateCardForm contractIdentifier={contractResponse?.contractNumber} onComplete={handleComplete} />;
  }

  return (
    <section id="api-calls">
      <h2>Mở Hợp Đồng</h2>
      <p className="section-description">
        Gắn Hợp đồng (Contract) và Nghĩa vụ nợ (Liability) cho Khách hàng.
      </p>

      <div className="form-container card" style={{ position: 'relative' }}>
        {contractApi.loading && (
          <div className="loading-overlay" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, 
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div className="spinner">Đang xử lý (Way4)...</div>
          </div>
        )}

        <ApiForm
          fields={fields}
          values={formValues}
          onChange={setFormValues}
          onSubmit={handleSubmit}
          onFieldChange={handleFieldChange}
        >
          <div className="form-navigation">
            <button 
              type="button" 
              className="back-button" 
              onClick={handleComplete}
              disabled={contractApi.loading}
            >
              Quay lại danh sách
            </button>
            <button 
              className="submit-button" 
              type="submit"
              disabled={contractApi.loading}
            >
              {contractApi.loading ? "Đang xử lý..." : "Tiếp tục"}
            </button>
          </div>
          {localError && <div className="error-message">{localError}</div>}
        </ApiForm>
      </div>
    </section>
  );
}