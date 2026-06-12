export const generateClientNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CL-${timestamp}-${random}`.toUpperCase();
};

export const INITIAL_FORM_VALUES = {
  reason: 'Đăng ký khách hàng mới qua Mobile App',
  institutionCode: '0001',
  branchCode: '',
  clientTypeCode: '',
  shortName: '',
  firstName: '',
  lastName: '', 
  middleName: '',
  maritalStatusCode: '',
  socialNumber: '',
  birthDate: '',
  gender: '',
  salutationCode: 'MR',
  citizenship: '',
  individualTaxpayerNumber: '',
  companyName: '',
  identityCardNumber: '',
  identityCardDetails: '',
  profession: '',
  clientNumber: generateClientNumber(),
  email: '',
  homePhone: '',
  mobilePhone: '',
  // Address Info
  addressType: '',
  country: '',
  city: '',
  addressZip: '',
  state: '',
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  addressLine4: '',
};

