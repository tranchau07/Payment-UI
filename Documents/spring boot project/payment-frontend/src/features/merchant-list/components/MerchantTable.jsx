export default function MerchantTable({ merchants, onCreateContract, onViewDetails }) {
  if (!merchants || merchants.length === 0) {
    return (
      <div className="no-data">
        Không tìm thấy Merchant nào thỏa mãn điều kiện
      </div>
    );
  }

  return (
    <div className="table-container card">
      <table className="client-table">
        <thead>
          <tr>
            <th>Mã Merchant</th>
            <th>Tên Merchant</th>
            <th>Số điện thoại</th>
            <th>Mã số thuế (TIN)</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.id}>
              <td>{merchant.clientNumber}</td>
              <td>{merchant.shortName}</td>
              <td>{merchant.mobilePhone || merchant.phone}</td>
              <td>{merchant.maskedItn}</td>
              <td>{merchant.email}</td>
              <td>{`${merchant.addressLine1 || ''}${merchant.city ? `, ${merchant.city}` : ''}`}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="submit-button" 
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => onViewDetails && onViewDetails(merchant.id)}
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    className="submit-button" 
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => onCreateContract && onCreateContract(merchant.id)}
                  >
                    Tạo Hợp Đồng
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
