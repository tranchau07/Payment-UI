import useI18n from '../../../hooks/useI18n';

export default function ClientTable({ clients, onCreateContract, onViewDetails }) {
  const { t } = useI18n();
  if (!clients || clients.length === 0) {
    return (
      <div className="no-data">
        {t('customer.notFound')}
      </div>
    );
  }

  return (
    <div className="table-container card">
      <table className="client-table">
        <thead>
          <tr>
            <th>{t('customer.number')}</th>
            <th>{t('customer.fullName')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.clientNumber}</td>
              <td>{client.shortName}</td>
              <td>
                <div className="table-action-group">
                  <button 
                    className="table-action-button table-action-secondary"
                    onClick={() => onViewDetails && onViewDetails(client.id)}
                  >
                    {t('common.detailsShort')}
                  </button>
                  <button 
                    className="table-action-button table-action-primary"
                    onClick={() => onCreateContract && onCreateContract(client.clientNumber)}
                  >
                    {t('common.openContractShort')}
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
