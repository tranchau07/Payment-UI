export const removeDiacriticsAndUpperCase = (str) => {
  if (!str) return str;
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .trim();
};

export const formatRegistrationData = (finalValues, customData) => {
  return {
    reason: finalValues.reason,
    clientInfo: {
      institutionCode: finalValues.institutionCode,
      branchCode: finalValues.branchCode,
      clientTypeCode: finalValues.clientTypeCode,
      shortName: removeDiacriticsAndUpperCase(finalValues.shortName),
      firstName: removeDiacriticsAndUpperCase(finalValues.firstName),
      lastName: removeDiacriticsAndUpperCase(finalValues.lastName),
      middleName: removeDiacriticsAndUpperCase(finalValues.middleName),
      maritalStatusCode: finalValues.maritalStatusCode,
      socialNumber: finalValues.socialNumber,
      salutationCode: finalValues.salutationCode,
      birthDate: finalValues.birthDate,
      gender: finalValues.gender,
      citizenship: finalValues.citizenship,
      individualTaxpayerNumber: finalValues.individualTaxpayerNumber,
      companyName: finalValues.companyName || null,
      identityCardNumber: finalValues.identityCardNumber,
      identityCardDetails: finalValues.identityCardDetails,
      clientNumber: finalValues.clientNumber,
      profession: finalValues.profession,
      email: finalValues.email,
      homePhone: finalValues.homePhone,
      mobilePhone: finalValues.mobilePhone,
    },
    addressInfo: {
      addressType: finalValues.addressType,
      country: finalValues.country,
      city: finalValues.city,
      addressZip: finalValues.addressZip,
      state: finalValues.state,
      addressLine1: finalValues.addressLine1,
      addressLine2: finalValues.addressLine2,
      addressLine3: finalValues.addressLine3,
      addressLine4: finalValues.addressLine4,
    },
    customData: customData.filter(item => item.tagName || item.tagValue)
  };
};
