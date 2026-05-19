import { useState } from 'react';

export default function ApiForm({ fields, initialValues, onSubmit, onFieldChange, values: controlledValues, onChange, children }) {
  const [internalValues, setInternalValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const values = controlledValues !== undefined ? controlledValues : internalValues;
  const setValues = controlledValues !== undefined ? onChange : setInternalValues;

  const validateField = (field, value) => {
    if (!field.validation) {
      return '';
    }

    if (field.validation.required && !value) {
      return field.validation.message || 'Trường này là bắt buộc';
    }

    if (field.validation.pattern && value) {
      const isValid = field.validation.pattern.test(value);
      if (!isValid) {
        return field.validation.message || 'Giá trị không hợp lệ';
      }
    }

    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      return field.validation.message || `Tối đa ${field.validation.maxLength} ký tự`;
    }

    if (field.validation.minLength && value.length < field.validation.minLength) {
      return field.validation.message || `Tối thiểu ${field.validation.minLength} ký tự`;
    }

    return '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    const field = fields.find((item) => item.name === name);
    if (field) {
      setErrors((current) => ({ ...current, [name]: validateField(field, value) }));
    }
    if (onFieldChange) {
      onFieldChange(name, value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    fields.forEach((field) => {
      const value = values[field.name];
      const error = validateField(field, value);
      if (error) {
        nextErrors[field.name] = error;
      }
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  return (
    <form className="api-form" onSubmit={handleSubmit}>
      {fields.map((field) => {
        // Skip rendering hidden fields visually
        if (field.type === 'hidden') {
          return (
            <input
              key={field.name}
              name={field.name}
              type="hidden"
              value={values[field.name] ?? ''}
            />
          );
        }

        return (
          <label key={field.name} className="api-form-field">
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={handleChange}
              >
                <option value="" disabled>
                  {field.placeholder}
                </option>
                {field.options?.map((option, index) => (
                  <option key={`${option.value}-${index}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.inputType || 'text'}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={handleChange}
                readOnly={field.readOnly}
                disabled={field.disabled}
              />
            )}
            {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
          </label>
        );
      })}
      
      {children}
    </form>
  );
}
