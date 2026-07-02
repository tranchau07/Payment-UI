import { useEffect, useMemo, useState } from 'react';
import ApiForm from '../../components/common/ApiForm';
import ResultCard from '../../components/ResultCard';
import { useApi } from '../../hooks/useApi';
import { contractService } from '../../services/contractApi';
import { applProductService } from '../../services/applProductApi';
import { currencyService } from '../../services/currencyApi';
import useAuth from '../../hooks/useAuth';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { createIdempotencyKey } from '../../utils/idempotency';

export default function CreateDeviceForm({ contractNumber, parentProductCode, onComplete, onBack }) {
  const { user } = useAuth();
  const [idempotencyKey,, clearIdempotencyKey] = useSessionStorage(
    `acq_device_idempotency:${user?.username || 'anonymous'}:${contractNumber || 'none'}`,
    createIdempotencyKey
  );
  const [flatValues, setFlatValues] = useState({
    reason: 'Create POS Terminal via Gateway',
    contractSearchMethod: 'CONTRACT_NUMBER',
    contractIdentifier: contractNumber || '',
    deviceTypeCode: 'OLIVETTY',
    enableImmediately: 'Y',
    productCode: '',
    serialNumber: '',
    defaultCurrency: '',
    startTime: '0000',
    endTime: '2359',
    cutOffTime: '2300',
    transactionClass: 'R'
  });
  
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const createDeviceApi = useApi(contractService.createDevice);
  const productsApi = useApi(applProductService.getAll);
  const currenciesApi = useApi(currencyService.getAll);

  useEffect(() => {
    productsApi.execute();
    currenciesApi.execute();
    // Catalog loaders are stable service calls and only need to run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter device products that are children of the contract's product
  const productOptions = useMemo(() => {
    const parentProduct = (productsApi.data || []).find(
      (p) => p.code?.trim() === parentProductCode?.trim()
    );
    const parentId = parentProduct ? parentProduct.id : null;

    return (productsApi.data || [])
      .filter((p) => {
        if (p.amndState !== 'A' || p.isActive === 'N') {
          return false;
        }
        if (p.parentCode?.trim() === parentProductCode?.trim()) {
          return true;
        }
        if (parentId && p.parentCode && p.parentCode.length === 24 && p.parentCode.startsWith('161103')) {
          const suffixOid = parseInt(p.parentCode.substring(6), 10);
          return suffixOid === parentId;
        }
        return false;
      })
      .map((p) => ({
        value: p.code,
        label: `${p.code} - ${p.name || p.code}`
      }));
  }, [productsApi.data, parentProductCode]);

  // Load currencies
  const currencyOptions = useMemo(() => {
    return (currenciesApi.data || [])
      .filter((c) => c.isActive === 'Y')
      .map((c) => ({
        value: c.code,
        label: `${c.numericCode} (${c.code}) - ${c.name}`
      }));
  }, [currenciesApi.data]);

  const fields = [
    { name: 'contractIdentifier', label: 'Số hợp đồng Acquiring', disabled: true, validation: { required: true } },
    {
      name: 'productCode',
      label: 'Sản phẩm Device (POS/Terminal)',
      type: 'select',
      placeholder: 'Chọn sản phẩm Device',
      options: productOptions,
      validation: { required: true, message: 'Vui lòng chọn sản phẩm' }
    },
    { name: 'serialNumber', label: 'Số Serial (SerialNumber)', validation: { required: true, message: 'Vui lòng nhập số Serial' } },
    {
      name: 'deviceTypeCode',
      label: 'Loại thiết bị (DeviceTypeCode)',
      type: 'select',
      placeholder: 'Chọn loại thiết bị',
      options: [
        { value: 'OLIVETTY', label: 'OLIVETTY' },
        { value: 'STD', label: 'STD (Standard)' },
        { value: 'VERIFONE', label: 'VERIFONE' },
        { value: 'INGENICO', label: 'INGENICO' }
      ],
      validation: { required: true }
    },
    {
      name: 'defaultCurrency',
      label: 'Tiền tệ mặc định',
      type: 'select',
      placeholder: 'Chọn tiền tệ',
      options: currencyOptions,
      validation: { required: true, message: 'Vui lòng chọn tiền tệ' }
    },
    {
      name: 'enableImmediately',
      label: 'Kích hoạt ngay',
      type: 'select',
      placeholder: 'Chọn trạng thái kích hoạt',
      options: [
        { value: 'Y', label: 'Có (Y)' },
        { value: 'N', label: 'Không (N)' }
      ],
      validation: { required: true }
    },
    { name: 'startTime', label: 'Giờ bắt đầu giao dịch (HHmm)', validation: { required: true, pattern: /^(?:[01]\d|2[0-3])[0-5]\d$/, message: 'Giờ phải có định dạng HHmm' } },
    { name: 'endTime', label: 'Giờ kết thúc giao dịch (HHmm)', validation: { required: true, pattern: /^(?:[01]\d|2[0-3])[0-5]\d$/, message: 'Giờ phải có định dạng HHmm' } },
    { name: 'cutOffTime', label: 'Giờ Cut-off (HHmm)', validation: { required: true, pattern: /^(?:[01]\d|2[0-3])[0-5]\d$/, message: 'Giờ phải có định dạng HHmm' } },
    {
      name: 'transactionClass',
      label: 'Phân loại giao dịch (TransactionClass)',
      type: 'select',
      placeholder: 'Chọn phân loại giao dịch',
      options: [
        { value: 'C', label: 'C - Cash' },
        { value: 'R', label: 'R - Retail' },
        { value: 'U', label: 'U - Unique' }
      ],
      validation: { required: true }
    },
    { name: 'reason', label: 'Lý do tạo', validation: { required: true, message: 'Vui lòng nhập lý do' } }
  ];

  const submitForm = async (values) => {
    setError('');
    const payload = {
      reason: values.reason,
      contractSearchMethod: values.contractSearchMethod,
      contractIdentifier: values.contractIdentifier,
      deviceTypeCode: values.deviceTypeCode,
      enableImmediately: values.enableImmediately,
      productCode: values.productCode,
      inObject: {
        serialNumber: values.serialNumber.trim(),
        defaultCurrency: values.defaultCurrency,
        startTime: values.startTime,
        endTime: values.endTime,
        cutOffTime: values.cutOffTime,
        transactionClass: values.transactionClass
      }
    };

    try {
      const response = await createDeviceApi.execute(contractNumber, payload, idempotencyKey);
      setIsSuccess(true);
      setSuccessData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.retMsg ||
        err.message ||
        'Tạo thiết bị Device thất bại'
      );
    }
  };

  if (isSuccess) {
    return (
      <section>
        <ResultCard title="Tạo thiết bị Device thành công" content={successData} />
        <div className="form-navigation">
          <button className="submit-button" onClick={() => { clearIdempotencyKey(); onComplete(); }}>
            Hoàn tất
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="api-calls">
      <h2>Khai báo thiết bị Device (POS/Terminal)</h2>
      <p className="section-description">
        Tạo mới thiết bị thanh toán (POS/Terminal) liên kết trực tiếp với hợp đồng Acquiring <strong>{contractNumber}</strong>.
      </p>
      <div className="form-container card">
        {productsApi.loading || currenciesApi.loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Đang tải danh sách sản phẩm và tiền tệ...
          </div>
        ) : (
          <ApiForm
            fields={fields}
            values={flatValues}
            onChange={setFlatValues}
            onSubmit={submitForm}
          >
            <div className="form-navigation">
              <button
                type="button"
                className="back-button"
                onClick={onBack}
                disabled={createDeviceApi.loading}
              >
                Quay lại
              </button>
              <button
                className="submit-button"
                type="submit"
                disabled={createDeviceApi.loading}
              >
                {createDeviceApi.loading ? 'Đang gửi...' : 'Tạo thiết bị'}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </ApiForm>
        )}
      </div>
    </section>
  );
}
