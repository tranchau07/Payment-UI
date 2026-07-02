import { useEffect, useMemo, useState } from 'react';
import ApiForm from '../../components/common/ApiForm';
import { useApi } from '../../hooks/useApi';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { contractService } from '../../services/contractApi';
import { branchService } from '../../services/branchApi';
import { countryService } from '../../services/countryApi';
import { addressTypeService } from '../../services/addressTypeApi';
import { applProductService } from '../../services/applProductApi';
import { sicService } from '../../services/sicApi';
import { currencyService } from '../../services/currencyApi';
import { fiService } from '../../services/fiApi';
import { clientService } from '../../services/clientApi';
import useAuth from '../../hooks/useAuth';
import { createIdempotencyKey } from '../../utils/idempotency';
import { acquiringDraftKey, acquiringDraftScope } from '../../utils/acquiringDraft';

const today = () => new Date().toISOString().slice(0, 10);

const cleanMerchantId = (clientNumber) => {
  if (!clientNumber) return '';
  let cleaned = clientNumber.startsWith('MC-') ? clientNumber.substring(3) : clientNumber;
  cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.substring(0, 14);
};

export default function AcquiringContractFlow({ merchantId, onComplete }) {
  const { user } = useAuth();
  const draftScope = acquiringDraftScope(user?.username, merchantId);
  const draftKey = (name) => acquiringDraftKey(name, user?.username, merchantId);
  const [step, setStep, clearStep] = useSessionStorage(draftKey('acq_step'), 'contract');
  const [createdContract, setCreatedContract, clearCreatedContract] = useSessionStorage(draftKey('acq_created_contract'), null);
  const [contractIdempotencyKey,, clearContractIdempotencyKey] = useSessionStorage(`acq_contract_idempotency:${draftScope}`, createIdempotencyKey);
  const [addressIdempotencyKey,, clearAddressIdempotencyKey] = useSessionStorage(`acq_address_idempotency:${draftScope}`, createIdempotencyKey);
  const [contractValues, setContractValues, clearContractValues] = useSessionStorage(`acq_contract_values:${draftScope}`, {
    clientIdentifier: merchantId ? String(merchantId) : '',
    productCode: '', productCode2: '', productCode3: '', institutionCode: '0001', branch: '',
    contractNumber: '', contractName: '', currency: '', mcc: '', merchantId: '', cbsNumber: '', openDate: today()
  });
  const [addressValues, setAddressValues, clearAddressValues] = useSessionStorage(`acq_address_values:${draftScope}`, {
    reason: 'Create Acquiring Contract Address', addressTypeCode: '', branch: '', country: '', region: '',
    district: '', city: '', zipCode: '', line1: '', line2: '', line3: '', line4: ''
  });
  const [error, setError] = useState('');
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);

  const getClientApi = useApi(clientService.getById);
  const createContractApi = useApi(contractService.createAcquiring);
  const createAddressApi = useApi(contractService.createAcquiringAddress);
  const branchesApi = useApi(branchService.getAll);
  const countriesApi = useApi(countryService.getAll);
  const addressTypesApi = useApi(addressTypeService.getAll);
  const productsApi = useApi(applProductService.getAll);
  const sicsApi = useApi(sicService.getAll);
  const currenciesApi = useApi(currencyService.getAll);
  const fisApi = useApi(fiService.getAll);

  useEffect(() => {
    branchesApi.execute(); countriesApi.execute(); addressTypesApi.execute(); productsApi.execute();
    sicsApi.execute({ useInBank: 'Y' }); currenciesApi.execute(); fisApi.execute();
    
    const fetchMerchantDetails = async () => {
      if (merchantId) {
        try {
          const response = await getClientApi.execute(merchantId);
          const client = response.data;
          if (client) {
            setContractValues((current) => ({
              ...current,
              clientIdentifier: String(merchantId),
              contractName: current.contractName || (client.shortName ? `${client.shortName} - HD Acquiring` : (client.companyName ? `${client.companyName} - HD Acquiring` : '')),
              merchantId: current.merchantId || cleanMerchantId(client.clientNumber),
              branch: current.branch || client.branchCode || ''
            }));
            setAddressValues((current) => ({
              ...current,
              country: current.country || 'VNM',
              branch: current.branch || client.branchCode || ''
            }));
          }
        } catch (err) {
          console.error("Failed to fetch merchant details", err);
        }
      }
    };

    fetchMerchantDetails();

    if (createdContract && String(createdContract.clientIdentifier) !== String(merchantId)) {
      clearCreatedContract();
      clearAddressValues();
      setStep('contract');
    } else if (!createdContract && merchantId) {
      setStep('contract');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const productOptions = useMemo(() => (productsApi.data || [])
    .filter((p) =>
      p.amndState === 'A' &&
      p.isActive !== 'N' &&
      !p.parentCode?.trim() &&
      p.conCat === 'A' && p.pcat === 'M'
    )
    .map((p) => ({ value: p.code, label: p.name || p.code })), [productsApi.data]);

  const contractFields = [
    { name: 'clientIdentifier', label: 'Mã đơn vị chấp nhận thanh toán', disabled: true, validation: { required: true } },
    { name: 'productCode', label: 'Sản phẩm Acquiring', type: 'select', placeholder: 'Chọn sản phẩm', options: productOptions, validation: { required: true, message: 'Vui lòng chọn sản phẩm' } },
    { name: 'contractName', label: 'Tên hợp đồng', validation: { required: true, message: 'Vui lòng nhập tên hợp đồng' } },
    { name: 'contractNumber', label: 'Số hợp đồng (để trống nếu hệ thống tự sinh)' },
    { name: 'merchantId', label: 'Mã đơn vị (tối đa 14 ký tự)', validation: { required: true, maxLength: 14, message: 'Vui lòng nhập mã đơn vị tối đa 14 ký tự để tương thích với thiết bị thanh toán' } },
    { name: 'cbsNumber', label: 'Số tài khoản liên kết', validation: { required: true, message: 'Vui lòng nhập số tài khoản liên kết' } },
    {
      name: 'institutionCode',
      label: 'Mã tổ chức',
      type: 'select',
      placeholder: 'Chọn tổ chức',
      options: (fisApi.data || []).map((fi) => ({
        value: fi.bankCode,
        label: `${fi.bankCode} - ${fi.name}`
      })),
      validation: { required: true, message: 'Vui lòng chọn tổ chức' }
    },
    { name: 'branch', label: 'Chi nhánh', type: 'select', placeholder: 'Chọn chi nhánh', options: (branchesApi.data || []).map((x) => ({ value: x.code, label: x.name || x.code })), validation: { required: true, message: 'Vui lòng chọn chi nhánh' } },
    {
      name: 'currency',
      label: 'Tiền tệ',
      type: 'select',
      placeholder: 'Chọn tiền tệ',
      options: (currenciesApi.data || [])
        .filter((currency) => currency.isActive === 'Y')
        .map((currency) => ({
          value: currency.numericCode,
          label: `${currency.numericCode} (${currency.code}) - ${currency.name}`
        })),
      validation: { required: true, message: 'Vui lòng chọn tiền tệ' }
    },
    { name: 'mcc', label: 'MCC', type: 'select', placeholder: 'Chọn MCC', options: (sicsApi.data || []).map((x) => ({ value: x.code, label: `${x.code} - ${x.name}` })), validation: { required: true, message: 'Vui lòng chọn MCC' } },
    { name: 'openDate', label: 'Ngày mở', inputType: 'date', validation: { required: true } }
  ];

  const addressFields = [
    { name: 'addressTypeCode', label: 'Loại địa chỉ', type: 'select', placeholder: 'Chọn loại địa chỉ', options: (addressTypesApi.data || []).map((x) => ({ value: x.code, label: x.name || x.code })), validation: { required: true, message: 'Vui lòng chọn loại địa chỉ' } },
    { name: 'branch', label: 'Chi nhánh', type: 'select', placeholder: 'Chọn chi nhánh', options: (branchesApi.data || []).map((x) => ({ value: x.code, label: x.name || x.code })) },
    { name: 'country', label: 'Quốc gia', type: 'select', placeholder: 'Chọn quốc gia', options: (countriesApi.data || []).filter((c) => c.useInBank === 'Y').map((x) => ({ value: x.code, label: x.name || x.code })), validation: { required: true, message: 'Vui lòng chọn quốc gia' } },
    { name: 'region', label: 'Mã vùng (2 ký tự)', validation: { required: true, minLength: 2, maxLength: 2, message: 'Mã vùng phải có đúng 2 ký tự' } },
    { name: 'district', label: 'Quận/Huyện' }, { name: 'city', label: 'Thành phố' },
    { name: 'zipCode', label: 'Mã bưu chính' }, { name: 'line1', label: 'Địa chỉ dòng 1', validation: { required: true, message: 'Vui lòng nhập địa chỉ' } },
    { name: 'line2', label: 'Địa chỉ dòng 2' }, { name: 'line3', label: 'Địa chỉ dòng 3' }, { name: 'line4', label: 'Địa chỉ dòng 4' },
    { name: 'reason', label: 'Lý do', validation: { required: true } }
  ];

  const messageOf = (err, fallback) => err.response?.data?.message || err.response?.data?.retMsg || err.message || fallback;

  const submitContract = async (values) => {
    setError('');
    const clean = (value) => value?.trim() || null;
    const payload = {
      clientSearchMethod: 'CLIENT_ID', clientIdentifier: String(merchantId), productCode: values.productCode,
      productCode2: clean(values.productCode2), productCode3: clean(values.productCode3),
      inObject: { institutionCode: values.institutionCode, branch: values.branch, contractNumber: clean(values.contractNumber),
        contractName: values.contractName.trim(), currency: values.currency, mcc: values.mcc, merchantId: values.merchantId.trim(),
        cbsNumber: values.cbsNumber.trim(), openDate: values.openDate }
    };
    try {
      const response = await createContractApi.execute(payload, contractIdempotencyKey);
      setCreatedContract({ ...response.data, clientIdentifier: String(merchantId) });
      setAddressValues((current) => ({ ...current, branch: current.branch || values.branch }));
      setStep('address');
    } catch (err) { setError(messageOf(err, 'Tạo hợp đồng Acquiring thất bại')); }
  };

  const submitAddress = async (values) => {
    setError('');
    try {
      await createAddressApi.execute(createdContract.contractNumber, values, addressIdempotencyKey);
      setShowSuccessOptions(true);
    } catch (err) { setError(messageOf(err, 'Hợp đồng đã tạo nhưng chưa tạo được địa chỉ. Bạn có thể thử lại.')); }
  };

  const finish = () => { 
    clearStep(); 
    clearCreatedContract(); 
    clearContractValues(); 
    clearAddressValues(); 
    clearContractIdempotencyKey();
    clearAddressIdempotencyKey();
    setShowSuccessOptions(false);
    onComplete?.(); 
  };

  const finishAndGoToDevice = (contractNo, prodCode) => {
    clearStep();
    clearCreatedContract();
    clearContractValues();
    clearAddressValues();
    clearContractIdempotencyKey();
    clearAddressIdempotencyKey();
    setShowSuccessOptions(false);
    onComplete?.(contractNo, prodCode);
  };

  if (showSuccessOptions) {
    return (
      <section id="api-calls">
        <h2>Tạo hợp đồng Acquiring thành công</h2>
        <div className="registration-success-container card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
          <h3 style={{ color: 'var(--text-h)', marginBottom: '10px', fontSize: '20px' }}>Khởi tạo hợp đồng hoàn tất</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px', lineHeight: '1.6', maxWidth: '480px' }}>
            Hợp đồng Acquiring số <strong>{createdContract?.contractNumber}</strong> đã được tạo và khai báo địa chỉ thành công trên hệ thống.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              className="back-button"
              style={{ minWidth: '200px', padding: '10px 20px', fontSize: '14px' }}
              onClick={() => {
                const contractNo = createdContract?.contractNumber;
                const prodCode = contractValues.productCode;
                finishAndGoToDevice(contractNo, prodCode);
              }}
            >
              Khai báo POS/Terminal ngay
            </button>
            <button 
              className="submit-button"
              style={{ minWidth: '200px', padding: '10px 20px', fontSize: '14px' }}
              onClick={finish}
            >
              Hoàn tất và xem hồ sơ
            </button>
          </div>
        </div>
      </section>
    );
  }

  return <section id="api-calls">
    <h2>{step === 'contract' ? 'Tạo hợp đồng Acquiring' : 'Tạo địa chỉ hợp đồng'}</h2>
    {step === 'address' && <p className="section-description">Hợp đồng <strong>{createdContract?.contractNumber}</strong> đã tạo thành công. Tiếp tục khai báo địa chỉ.</p>}
    <div className="form-container card">
      <ApiForm fields={step === 'contract' ? contractFields : addressFields} values={step === 'contract' ? contractValues : addressValues}
        onChange={step === 'contract' ? setContractValues : setAddressValues} onSubmit={step === 'contract' ? submitContract : submitAddress}>
        <div className="form-navigation">
          <button type="button" className="back-button" onClick={step === 'contract' ? finish : onComplete} disabled={createContractApi.loading || createAddressApi.loading}>{step === 'contract' ? 'Quay lại' : 'Hoàn tất sau'}</button>
          <button className="submit-button" type="submit" disabled={createContractApi.loading || createAddressApi.loading}>{step === 'contract' ? 'Tạo hợp đồng' : 'Tạo địa chỉ'}</button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </ApiForm>
    </div>
  </section>;
}
