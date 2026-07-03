import { useState } from 'react';
import useI18n from '../../hooks/useI18n';

export default function ApiForm({ fields, initialValues, onSubmit, onFieldChange, values: controlledValues, onChange, children }) {
  const { language, translate } = useI18n();
  const [internalValues, setInternalValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const values = controlledValues !== undefined ? controlledValues : internalValues;
  const setValues = controlledValues !== undefined ? onChange : setInternalValues;

  const validateField = (field, value) => {
    if (!field.validation) {
      return '';
    }

    if (field.validation.required && !value) {
      return translate(field.validation.message || 'Trường này là bắt buộc');
    }

    if (field.validation.pattern && value) {
      const isValid = field.validation.pattern.test(value);
      if (!isValid) {
        return translate(field.validation.message || 'Giá trị không hợp lệ');
      }
    }

    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      return field.validation.message ? translate(field.validation.message) : (language === 'en' ? `Maximum ${field.validation.maxLength} characters` : `Tối đa ${field.validation.maxLength} ký tự`);
    }

    if (field.validation.minLength && value.length < field.validation.minLength) {
      return field.validation.message ? translate(field.validation.message) : (language === 'en' ? `Minimum ${field.validation.minLength} characters` : `Tối thiểu ${field.validation.minLength} ký tự`);
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
        const errorId = `${field.name}-error`;
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
            <span>{translate(field.label)}</span>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={handleChange}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? errorId : undefined}
              >
                <option value="" disabled>
                  {translate(field.placeholder)}
                </option>
                {field.options?.map((option, index) => (
                  <option key={`${option.value}-${index}`} value={option.value}>
                    {translate(option.label)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.inputType || 'text'}
                value={values[field.name] ?? ''}
                placeholder={translate(field.placeholder)}
                onChange={handleChange}
                readOnly={field.readOnly}
                disabled={field.disabled}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? errorId : undefined}
              />
            )}
            {errors[field.name] && <p className="field-error" id={errorId} role="alert">{errors[field.name]}</p>}
          </label>
        );
      })}
      
      {children}
    </form>
  );
}
