const formatGender = (gender) => {
  if (gender === 'M') return 'Nam';
  if (gender === 'F') return 'Nữ';
  return 'Khác';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function ClientTable({ clients, onCreateContract }) {
  if (!clients || clients.length === 0) {
    return (
      <div className="no-data">
        Không tìm thấy khách hàng nào thỏa mãn điều kiện
      </div>
    );
  }

  return (
    <div className="table-container card">
      <table className="client-table">
        <thead>
          <tr>
            <th>Mã khách hàng</th>
            <th>Họ và tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
            <th>Số điện thoại</th>
            <th>Mã số thuế</th>
            <th>CMT/CCCD</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.clientNumber}>
              <td>{client.clientNumber}</td>
              <td>{client.shortName}</td>
              <td>{formatGender(client.gender)}</td>
              <td>{formatDate(client.birthDate)}</td>
              <td>{client.mobilePhone}</td>
              <td>{client.maskedItn}</td>
              <td>{client.maskedSocialNumber}</td>
              <td>{client.email}</td>
              <td>{`${client.addressLine1 || ''}${client.city ? `, ${client.city}` : ''}`}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="submit-button" style={{ padding: '4px 8px', fontSize: '12px' }}>Xem chi tiết</button>
                  <button 
                    className="submit-button" 
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => onCreateContract && onCreateContract(client.clientNumber)}
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
