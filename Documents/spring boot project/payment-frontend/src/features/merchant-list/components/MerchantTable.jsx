import useI18n from '../../../hooks/useI18n';

export default function MerchantTable({ merchants, onCreateContract, onViewDetails }) {
  const { t } = useI18n();
  if (!merchants || merchants.length === 0) {
    return (
      <div className="no-data">
        {t('merchant.notFound')}
      </div>
    );
  }

  return (
    <div className="table-container card">
      <table className="client-table">
        <thead>
          <tr>
            <th>{t('merchant.number')}</th>
            <th>{t('merchant.name')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.id}>
              <td>{merchant.clientNumber}</td>
              <td>{merchant.shortName}</td>
              <td>
                <div className="table-action-group">
                  <button 
                    className="table-action-button table-action-secondary"
                    onClick={() => onViewDetails && onViewDetails(merchant.id)}
                  >
                    {t('common.detailsShort')}
                  </button>
                  <button 
                    className="table-action-button table-action-primary"
                    onClick={() => onCreateContract && onCreateContract(merchant.id)}
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
