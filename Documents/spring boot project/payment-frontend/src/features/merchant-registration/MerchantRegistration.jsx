import { useState, useEffect } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import ApiForm from '../../components/common/ApiForm';
import ResultCard from '../../components/ResultCard';
import useI18n from '../../hooks/useI18n';
import Stepper from '../client-registration/components/Stepper';
import { useApi } from '../../hooks/useApi';
import { branchService } from '../../services/branchApi';
import { clientTypeService } from '../../services/clientTypeApi';
import { langService } from '../../services/langApi';
import { fiService } from '../../services/fiApi';
import { merchantService } from '../../services/merchantApi';
import useAuth from '../../hooks/useAuth';
import { createIdempotencyKey } from '../../utils/idempotency';

const generateMerchantNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MC-${timestamp}-${random}`.toUpperCase();
};

const INITIAL_FORM_VALUES = {
  reason: 'Create Merchant via Web Portal',
  institutionCode: '0001',
  branchCode: '',
  clientCategory: 'C',
  clientTypeCode: '',
  productCategory: 'M',
  companyName: '',
  tradeName: '',
  shortName: '',
  url: '',
  languageCode: 'RUS',
  phone: '',
  mobilePhone: '',
  email: '',
  clientNumber: generateMerchantNumber(),
  registrationType: 'BUS',
  registrationNumber: '',
  registrationDetails: '',
  tin: '',
  registrationDate: ''
};

export default function MerchantRegistration({ onComplete }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [idempotencyKey,, clearIdempotencyKey] = useSessionStorage(
    `merchant_registration_idempotency:${user?.username || 'anonymous'}`,
    createIdempotencyKey
  );
  const [submittedValues, setSubmittedValues, clearSubmittedValues] = useSessionStorage('mr_submittedValues', null);
  const [localError, setLocalError] = useState('');
  const [currentStep, setCurrentStep, clearCurrentStep] = useSessionStorage('mr_currentStep', 0);
  const [formValues, setFormValues, clearFormValues] = useSessionStorage('mr_formValues', INITIAL_FORM_VALUES);

  const allBranches = useApi(branchService.getAll);
  const allClientTypes = useApi(clientTypeService.getAll);
  const allLangs = useApi(langService.getAll);
  const allFis = useApi(fiService.getAll);
  const registrationApi = useApi(merchantService.register);

  useEffect(() => {
    allBranches.execute();
    allClientTypes.execute();
    allLangs.execute();
    allFis.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllData = () => {
    clearSubmittedValues();
    clearCurrentStep();
    clearFormValues();
    clearIdempotencyKey();
  };

  const steps = [
    {
      title: 'Thông tin tổ chức',
      fields: [
        {
          name: 'companyName',
          label: 'Tên công ty',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập tên công ty',
          validation: { required: true, message: 'Vui lòng nhập tên công ty' }
        },
        {
          name: 'tradeName',
          label: 'Tên thương mại',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập tên thương mại',
          validation: { required: true, message: 'Vui lòng nhập tên thương mại' }
        },
        {
          name: 'shortName',
          label: 'Tên viết tắt',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập tên viết tắt',
          validation: { required: true, message: 'Vui lòng nhập tên viết tắt' }
        },
        {
          name: 'url',
          label: 'Website URL',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập URL (ví dụ: https://abcpay.vn)'
        }
      ]
    },
    {
      title: 'Thông tin hệ thống',
      fields: [
        {
          name: 'institutionCode',
          label: 'Tổ chức tài chính',
          type: 'select',
          placeholder: 'Chọn FI',
          options: allFis.data?.map(f => ({ value: f.bankCode, label: f.name })) || [],
          validation: { required: true, message: 'Vui lòng chọn FI' }
        },
        {
          name: 'branchCode',
          label: 'Chi nhánh',
          type: 'select',
          placeholder: 'Chọn chi nhánh',
          options: allBranches.data?.map(b => ({ value: b.code, label: b.name })) || [],
          validation: { required: true, message: 'Vui lòng chọn chi nhánh' }
        },
        {
          name: 'clientTypeCode',
          label: 'Client Type',
          type: 'select',
          placeholder: 'Chọn Client Type',
          options: allClientTypes.data?.map(ct => ({ value: ct.code, label: ct.name })) || [],
          validation: { required: true, message: 'Vui lòng chọn Client Type' }
        },
        {
          name: 'languageCode',
          label: 'Ngôn ngữ',
          type: 'select',
          placeholder: 'Chọn ngôn ngữ',
          options: allLangs.data?.map(l => ({ value: l.code, label: l.name })) || [],
          validation: { required: true, message: 'Vui lòng chọn ngôn ngữ' }
        },
        {
          name: 'clientNumber',
          label: 'Mã Merchant (Client Number)',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập mã Merchant',
          validation: { required: true, message: 'Vui lòng nhập mã Merchant' }
        }
      ]
    },
    {
      title: 'Đăng ký & Liên hệ',
      fields: [
        {
          name: 'registrationType',
          label: 'Loại đăng ký',
          type: 'input',
          inputType: 'text',
          placeholder: 'Loại đăng ký (ví dụ: BUS)',
          validation: { required: true, message: 'Vui lòng nhập loại đăng ký' }
        },
        {
          name: 'registrationNumber',
          label: 'Số đăng ký kinh doanh',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập số đăng ký kinh doanh',
          validation: { required: true, message: 'Vui lòng nhập số đăng ký kinh doanh' }
        },
        {
          name: 'registrationDetails',
          label: 'Chi tiết đăng ký',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập chi tiết nơi đăng ký'
        },
        {
          name: 'tin',
          label: 'Mã số thuế (TIN)',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập mã số thuế',
          validation: { required: true, message: 'Vui lòng nhập mã số thuế' }
        },
        {
          name: 'registrationDate',
          label: 'Ngày đăng ký',
          type: 'input',
          inputType: 'date',
          placeholder: 'YYYY-MM-DD',
          validation: { required: true, message: 'Vui lòng nhập ngày đăng ký' }
        },
        {
          name: 'phone',
          label: 'Điện thoại bàn',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập số điện thoại cố định'
        },
        {
          name: 'mobilePhone',
          label: 'Điện thoại di động',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nhập số điện thoại di động',
          validation: { required: true, message: 'Vui lòng nhập số điện thoại di động' }
        },
        {
          name: 'email',
          label: 'Email',
          type: 'input',
          inputType: 'email',
          placeholder: 'Nhập email liên hệ',
          validation: { 
            required: true, 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Vui lòng nhập email hợp lệ' 
          }
        },
        {
          name: 'reason',
          label: 'Lý do đăng ký',
          type: 'input',
          inputType: 'text',
          placeholder: 'Lý do tạo merchant',
          validation: { required: true, message: 'Vui lòng nhập lý do đăng ký' }
        }
      ]
    }
  ];

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      if (name === 'companyName') {
        newValues.shortName = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase();
        newValues.tradeName = value;
      }
      return newValues;
    });
  };

  const handleNext = (values) => {
    setFormValues(values);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitFinal = async (values) => {
    const finalValues = { ...formValues, ...values };
    
    // Convert text values to upper case to match core way4 requirements (similar to client registration)
    const formattedPayload = {
      ...finalValues,
      shortName: finalValues.shortName?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase().trim(),
      companyName: finalValues.companyName?.trim(),
      tradeName: finalValues.tradeName?.trim(),
      clientNumber: finalValues.clientNumber?.trim(),
      registrationNumber: finalValues.registrationNumber?.trim(),
      tin: finalValues.tin?.trim()
    };

    try {
      const response = await registrationApi.execute(formattedPayload, idempotencyKey);
      const serverResponse = response.data;

      console.log(`[Merchant Registration Success] Merchant ID: ${serverResponse.newMerchantId}`);
      setSubmittedValues({
        ...formattedPayload,
        serverResponse
      });
      setLocalError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký Merchant thất bại. Vui lòng thử lại.';
      console.error('[Merchant Registration Error]', errorMessage);
      setLocalError(errorMessage);
      setSubmittedValues(null);
    }
  };

  return (
    <section id="api-calls">
      <h2>{t('registration.merchantTitle')}</h2>

      {!submittedValues && (
        <>
          <Stepper 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={setCurrentStep} 
          />

          <div className="form-container card">
            <ApiForm
              fields={steps[currentStep].fields}
              values={formValues}
              onChange={setFormValues}
              onSubmit={currentStep === steps.length - 1 ? handleSubmitFinal : handleNext}
              onFieldChange={handleFieldChange}
            >
              <div className="form-navigation">
                {currentStep > 0 && (
                  <button 
                    type="button" 
                    className="back-button" 
                    onClick={handleBack}
                    disabled={registrationApi.loading}
                  >
                    {t('common.back')}
                  </button>
                )}
                <button 
                  className="submit-button" 
                  type="submit"
                  disabled={registrationApi.loading}
                >
                  {registrationApi.loading ? t('common.processing') : (currentStep === steps.length - 1 ? t('common.finishRegister') : t('common.continue'))}
                </button>
              </div>
              {localError && <div className="error-message">{localError}</div>}
            </ApiForm>
          </div>
        </>
      )}

      {submittedValues && (
        <div className="registration-success-container">
          <ResultCard 
            title={t('registration.merchantSuccess')}
            content={submittedValues} 
          />
          <div className="form-navigation" style={{ borderTop: 'none', justifyContent: 'center', gap: '15px' }}>
            <button 
              className="back-button" 
              onClick={() => {
                clearAllData();
                onComplete();
              }}
            >
              {t('common.backToList')}
            </button>
            <button 
              className="submit-button" 
              onClick={() => {
                const clientNum = submittedValues?.serverResponse?.newMerchantId;
                clearAllData();
                onComplete(clientNum);
              }}
            >
              {t('registration.continueContract')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
