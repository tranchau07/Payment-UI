import { useState, useEffect } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import ApiForm from '../../components/common/ApiForm';
import ResultCard from '../../components/ResultCard';
import Stepper from './components/Stepper';
import CustomDataSection from './components/CustomDataSection';
import { useApi } from '../../hooks/useApi';
import { salutationService } from '../../services/salutationApi';
import { branchService } from '../../services/branchApi';
import { clientTypeService } from '../../services/clientTypeApi';
import { maritalStatusService } from '../../services/maritalStatusApi';
import { countryService } from '../../services/countryApi';
import { clientService } from '../../services/clientApi';
import { INITIAL_FORM_VALUES } from '../../constants/initialValues';
import { getRegistrationSteps } from './utils/formSteps';
import { formatRegistrationData } from './utils/dataFormatter';
import { addressTypeService } from '../../services/addressTypeApi';
import IssuingContractForm from '../contract-creation/IssuingContractForm';

export default function ClientRegistration({ onComplete }) {
  const [submittedValues, setSubmittedValues, clearSubmittedValues] = useSessionStorage('cr_submittedValues', null);
  const [localError, setLocalError] = useState('');
  const [currentStep, setCurrentStep, clearCurrentStep] = useSessionStorage('cr_currentStep', 0);
  const [formValues, setFormValues, clearFormValues] = useSessionStorage('cr_formValues', INITIAL_FORM_VALUES);
  const [customData, setCustomData, clearCustomData] = useSessionStorage('cr_customData', [
    { addInfoType: 'AddInfo01', tagName: '', tagValue: '' }
  ]);
  const [contractCreationResponse, setContractCreationResponse, clearContractCreationResponse] = useSessionStorage('cr_contractCreationResponse', null);
  const [showContractForm, setShowContractForm, clearShowContractForm] = useSessionStorage('cr_showContractForm', false);

  const allSalutations = useApi(salutationService.getAll);
  const allBranches = useApi(branchService.getAll);
  const allClientTypes = useApi(clientTypeService.getAll);
  const allMaritalStatuses = useApi(maritalStatusService.getAll);
  const allCountries = useApi(countryService.getAll);
  const registrationApi = useApi(clientService.register);
  const allAddressTypes = useApi(addressTypeService.getAll);

  useEffect(() => {
    allSalutations.execute();
    allClientTypes.execute();
    allBranches.execute();
    allMaritalStatuses.execute();
    allCountries.execute();
    allClientTypes.execute();
    allAddressTypes.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllData = () => {
    clearSubmittedValues();
    clearCurrentStep();
    clearFormValues();
    clearCustomData();
    clearContractCreationResponse();
    clearShowContractForm();
  };

  const steps = getRegistrationSteps({
    branches: allBranches.data,
    clientTypes: allClientTypes.data,
    salutations: allSalutations.data,
    maritalStatuses: allMaritalStatuses.data,
    countries: allCountries.data,
    addressTypes: allAddressTypes.data
  });

  const handleCustomDataChange = (index, field, value) => {
    const newList = [...customData];
    newList[index][field] = value;
    setCustomData(newList);
  };

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };
      if (name === 'gender') {
        if (value === 'M') {
          newValues.salutationCode = 'MR';
        } else if (value === 'F') {
          newValues.salutationCode = 'MS';
        } else {
          newValues.salutationCode = 'MR'; // default
        }
      }

      if (name === 'firstName' || name === 'lastName') {
        const firstName = newValues.firstName || '';
        const lastName = newValues.lastName || '';
        if (firstName || lastName) {
          newValues.shortName = `${firstName} ${lastName}`.trim();
        } else {
          newValues.shortName = '';
        }
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
    const formattedData = formatRegistrationData(finalValues, customData);

    try {
      const response = await registrationApi.execute(formattedData);
      const serverResponse = response.data;

      if (serverResponse.retCode === 0) {
        console.log(`[Registration Success] Client ID: ${serverResponse.newClientId}, App Number: ${serverResponse.applicationNumber}`);
        setSubmittedValues({
          ...formattedData,
          serverResponse
        });
        setLocalError('');
        setContractCreationResponse(serverResponse);
        setShowContractForm(true);
      } else {
        console.warn(`[Registration Failed] Code: ${serverResponse.retCode}, Message: ${serverResponse.retMsg}`);
        setLocalError(serverResponse.retMsg || 'Đăng ký không thành công từ máy chủ.');
        setSubmittedValues(null);
        setContractCreationResponse(null);
        setShowContractForm(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      console.error('[Registration Error]', errorMessage);
      setLocalError(errorMessage);
    }
  };

  const handleContractCreated = (response) => {
    if (response.success) {
      console.log('[Issuing Contract Created Successfully]', response.data);
      clearAllData(); // Xoá session storage sau khi hoàn tất luồng
      if (onComplete) {
        onComplete();
      }
    } else {
      console.error('[Issuing Contract Creation Failed]', response.error);
      setLocalError(response.error);
      setShowContractForm(false); 
    }
  };

  return (
    <section id="api-calls">
      <h2>Đăng kí khách hàng</h2>
      <p className="section-description">
        Điền đầy đủ thông tin để đăng ký khách hàng mới.
      </p>

      {!showContractForm && (
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
              {currentStep === steps.length - 1 && (
                <CustomDataSection 
                  customData={customData}
                  onAdd={() => setCustomData([...customData, { addInfoType: 'AddInfo01', tagName: '', tagValue: '' }])}
                  onRemove={(index) => setCustomData(customData.filter((_, i) => i !== index))}
                  onChange={handleCustomDataChange}
                />
              )}

              <div className="form-navigation">
                {currentStep > 0 && (
                  <button 
                    type="button" 
                    className="back-button" 
                    onClick={handleBack}
                    disabled={registrationApi.loading}
                  >
                    Quay lại
                  </button>
                )}
                <button 
                  className="submit-button" 
                  type="submit"
                  disabled={registrationApi.loading}
                >
                  {registrationApi.loading ? "Đang xử lý..." : (currentStep === steps.length - 1 ? "Hoàn tất & Đăng ký" : "Tiếp tục")}
                </button>
              </div>
              {localError && <div className="error-message">{localError}</div>}
            </ApiForm>
          </div>
        </>
      )}

      {submittedValues && !showContractForm && (
        <div className="registration-success-container">
          <ResultCard 
            title="Đăng ký khách hàng thành công" 
            content={submittedValues} 
          />
          <div className="form-navigation" style={{ borderTop: 'none', justifyContent: 'center' }}>
            <button 
              className="submit-button" 
              onClick={() => setShowContractForm(true)}
            >
              Tiếp tục tạo hợp đồng
            </button>
          </div>
        </div>
      )}

      {showContractForm && contractCreationResponse && (
        <IssuingContractForm
          newClientId={contractCreationResponse.newClientId}
          contractCreationStatus={contractCreationResponse.contractCreationStatus}
          onContractCreated={handleContractCreated}
          onBack={() => setShowContractForm(false)}
        />
      )}
    </section>
  );
}
