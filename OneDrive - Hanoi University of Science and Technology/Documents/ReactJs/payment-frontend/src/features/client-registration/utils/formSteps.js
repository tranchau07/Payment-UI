export const getRegistrationSteps = (data) => {
  const {
    branches = [],
    clientTypes = [],
    salutations = [],
    maritalStatuses = [],
    countries = [],
    addressTypes = []
  } = data;

  return [
    {
      title: 'Thông tin chung',
      fields: [
        {
          name: 'reason',
          label: 'Lý do',
          type: 'input',
          inputType: 'text',
          placeholder: 'Lý do đăng ký',
          validation: {
            required: true,
            message: 'Vui lòng nhập lý do',
          },
        },
        {
          name: 'branchCode',
          label: 'Chi nhánh',
          type: 'select',
          placeholder: 'Chọn chi nhánh',
          options:
            branches?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn một chi nhánh',
          },
        },
        {
          name: 'clientTypeCode',
          label: 'Loại khách hàng',
          type: 'select',
          placeholder: 'Chọn loại khách hàng',
          options:
            clientTypes?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn một loại khách hàng',
          },
        },
      ]
    },
    {
      title: 'Thông tin cá nhân',
      fields: [
        {
          name: 'shortName',
          label: 'Tên viết tắt',
          type: 'input',
          inputType: 'text',
          placeholder: 'Tên viết tắt',
          validation: {
            required: true,
            pattern: /^[a-zA-Z0-9\s]+$/,
            message: 'Tên viết tắt chỉ được chứa chữ cái, số và khoảng trắng',
          },
        },
        {
          name: 'firstName',
          label: 'Họ',
          type: 'input',
          inputType: 'text',
          placeholder: 'Họ',
          validation: {
            required: true,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Họ chỉ được chứa chữ cái và khoảng trắng',
          },
        },
        {
          name: 'lastName',
          label: 'Tên',
          type: 'input',
          inputType: 'text',
          placeholder: 'Tên',
          validation: {
            required: true,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Tên chỉ được chứa chữ cái và khoảng trắng',
          },
        },
        {
          name: 'middleName',
          label: 'Tên đệm',
          type: 'input',
          inputType: 'text',
          placeholder: 'Tên đệm',
          validation: {
            required: true,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Tên đệm chỉ được chứa chữ cái và khoảng trắng',
          },
        },
        {
          name: 'birthDate',
          label: 'Ngày sinh',
          type: 'input',
          inputType: 'date',
          placeholder: 'YYYY-MM-DD',
          validation: {
            required: true,
            message: 'Vui lòng nhập ngày sinh',
          },
        },
        {
          name: 'gender',
          label: 'Giới tính',
          type: 'select',
          placeholder: 'Chọn giới tính',
          options: [
            { value: 'M', label: 'Nam' },
            { value: 'F', label: 'Nữ' },
            { value: 'N', label: 'Không xác định' },
          ],
          validation: {
            required: true,
            message: 'Vui lòng chọn giới tính',
          },
        },
        {
          name: 'salutationCode',
          label: 'Danh xưng',
          type: 'select',
          placeholder: 'Chọn danh xưng',
          options:
            salutations?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn danh xưng',
          },
        },
        {
          name: 'maritalStatusCode',
          label: 'Tình trạng hôn nhân',
          type: 'select',
          placeholder: 'Chọn tình trạng hôn nhân',
          options:
            maritalStatuses?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: false,
          },
        },
        {
          name: 'citizenship',
          label: 'Quốc tịch',
          type: 'select',
          placeholder: 'Chọn quốc tịch',
          options:
            countries?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn quốc tịch',
          },
        },
      ]
    },
    {
      title: 'Định danh & Nghề nghiệp',
      fields: [
        {
          name: 'identityCardNumber',
          label: 'Số CMND/CCCD',
          type: 'input',
          inputType: 'text',
          placeholder: 'Số CMND/CCCD',
          validation: {
            required: true,
            pattern: /^\d+$/,
            message: 'Số CMND/CCCD chỉ được chứa số',
          },
        },
        {
          name: 'identityCardDetails',
          label: 'Nơi cấp/Ngày cấp',
          type: 'input',
          inputType: 'text',
          placeholder: 'Chi tiết CMND/CCCD',
          validation: {
            required: true,
            message: 'Vui lòng nhập chi tiết CMND/CCCD',
          },
        },
        {
          name: 'socialNumber',
          label: 'Số an sinh xã hội',
          type: 'input',
          inputType: 'text',
          placeholder: 'Số an sinh xã hội',
          validation: {
            required: true,
            pattern: /^\d+$/,
            message: 'Số an sinh xã hội chỉ được chứa số',
          },
        },
        {
          name: 'individualTaxpayerNumber',
          label: 'Mã số thuế',
          type: 'input',
          inputType: 'text',
          placeholder: 'Mã số thuế cá nhân',
          validation: {
            required: true,
            pattern: /^\d+$/,
            message: 'Mã số thuế chỉ được chứa số',
          },
        },
        {
          name: 'profession',
          label: 'Nghề nghiệp',
          type: 'input',
          inputType: 'text',
          placeholder: 'Nghề nghiệp',
          validation: {
            required: true,
            message: 'Vui lòng nhập nghề nghiệp',
          },
        },
        {
          name: 'companyName',
          label: 'Tên công ty',
          type: 'input',
          inputType: 'text',
          placeholder: 'Tên công ty (nếu có)',
          validation: {
            required: false,
          },
        },
      ]
    },
    {
      title: 'Liên lạc',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'input',
          inputType: 'email',
          placeholder: 'Email',
          validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email không hợp lệ',
          },
        },
        {
          name: 'mobilePhone',
          label: 'Số điện thoại di động',
          type: 'input',
          inputType: 'text',
          placeholder: 'Số điện thoại di động',
          validation: {
            required: true,
            pattern: /^\d+$/,
            message: 'Số điện thoại chỉ được chứa số',
          },
        },
        {
          name: 'homePhone',
          label: 'Số điện thoại nhà',
          type: 'input',
          inputType: 'text',
          placeholder: 'Số điện thoại cố định',
          validation: {
            required: false,
            pattern: /^\d+$/,
          },
        },
      ]
    },
    {
      title: 'Địa chỉ',
      fields: [
        {
          name: 'addressType',
          label: 'Loại địa chỉ',
          type: 'select',
          placeholder: 'Chọn loại địa chỉ',
          options:
            addressTypes?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn loại địa chỉ',
          },
        },

        
        {
          name: 'country',
          label: 'Quốc gia',
          type: 'select',
          placeholder: 'Chọn quốc gia',
          options:
            countries?.map((item) => ({
              value: item.code,
              label: item.name,
            })) || [],
          validation: {
            required: true,
            message: 'Vui lòng chọn quốc gia',
          },
        },
        {
          name: 'city',
          label: 'Thành phố/Tỉnh',
          type: 'input',
          inputType: 'text',
          placeholder: 'Thành phố/Tỉnh',
          validation: {
            required: true,
            message: 'Vui lòng nhập thành phố/tỉnh',
          },
        },
        {
          name: 'state',
          label: 'Quận/Huyện/Bang',
          type: 'input',
          inputType: 'text',
          placeholder: 'Quận/Huyện/Bang',
          validation: {
            required: true,
            message: 'Vui lòng nhập quận/huyện/bang',
          },
        },
        {
          name: 'addressZip',
          label: 'Mã bưu chính',
          type: 'input',
          inputType: 'text',
          placeholder: 'Mã bưu chính',
          validation: {
            required: false,
          },
        },
        {
          name: 'addressLine1',
          label: 'Địa chỉ dòng 1',
          type: 'input',
          inputType: 'text',
          placeholder: 'Số nhà, tên đường',
          validation: {
            required: true,
            message: 'Vui lòng nhập địa chỉ dòng 1',
          },
        },
        {
          name: 'addressLine2',
          label: 'Địa chỉ dòng 2',
          type: 'input',
          inputType: 'text',
          placeholder: 'Phường/Xã (tùy chọn)',
          validation: {
            required: false,
          },
        },
        {
          name: 'addressLine3',
          label: 'Địa chỉ dòng 3',
          type: 'input',
          inputType: 'text',
          placeholder: 'Ghi chú thêm (tùy chọn)',
          validation: {
            required: false,
          },
        },
        {
          name: 'addressLine4',
          label: 'Địa chỉ dòng 4',
          type: 'input',
          inputType: 'text',
          placeholder: 'Ghi chú khác (tùy chọn)',
          validation: {
            required: false,
          },
        },
      ]
    },
    {
      title: 'Thông tin bổ sung',
      fields: []
    }
  ];
};
