
export default function CustomDataSection({ 
  customData, 
  onAdd, 
  onRemove, 
  onChange 
}) {
  return (
    <div className="custom-data-section">
      <h3>Thông tin bổ sung (Custom Data)</h3>
      {customData.map((item, index) => (
        <div key={index} className="custom-data-item">
          <div className="custom-data-grid">
            <label>
              <span>Loại thông tin</span>
              <select
                value={item.addInfoType}
                onChange={(e) => onChange(index, 'addInfoType', e.target.value)}
              >
                <option value="AddInfo01">Add Info 01</option>
                <option value="AddInfo02">Add Info 02</option>
                <option value="AddInfo03">Add Info 03</option>
                <option value="AddInfo04">Add Info 04</option>
              </select>
            </label>
            <label>
              <span>Tag Name</span>
              <input
                type="text"
                value={item.tagName}
                placeholder="Tag Name"
                maxLength={32}
                onChange={(e) => onChange(index, 'tagName', e.target.value)}
              />
            </label>
            <label>
              <span>Tag Value</span>
              <input
                type="text"
                value={item.tagValue}
                placeholder="Tag Value"
                maxLength={255}
                onChange={(e) => onChange(index, 'tagValue', e.target.value)}
              />
            </label>
            {customData.length > 1 && (
              <button
                type="button"
                className="remove-button"
                onClick={() => onRemove(index)}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="add-button" onClick={onAdd}>
        + Thêm thông tin bổ sung
      </button>
    </div>
  );
}
