import { useState, useEffect, useCallback } from 'react';
import { merchantService } from '../../services/merchantApi';
import { branchService } from '../../services/branchApi';
import { useApi } from '../../hooks/useApi';
import ApiForm from '../../components/common/ApiForm';
import MerchantTable from './components/MerchantTable';
import Pagination from './components/Pagination';
import useI18n from '../../hooks/useI18n';

const INITIAL_SEARCH_VALUES = {
  shortName: '',
  phoneNumber: '',
  clientNumber: '',
  itn: '',
  branchCode: '',
  pcat: '',
  conCat: '',
  ccat: ''
};

export default function MerchantList({ onCreateContract, onViewDetails, onAddMerchant }) {
  const { t } = useI18n();
  const [searchValues, setSearchValues] = useState(INITIAL_SEARCH_VALUES);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  const searchApi = useApi(merchantService.search);
  const branchesApi = useApi(branchService.getAll);

  const fetchMerchants = useCallback(async (page = 0, filters = searchValues) => {
    const params = {
      ...filters,
      page,
      size: pageSize,
      sort: 'id,desc'
    };
    // Remove empty strings, null, or undefined from params
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    try {
      await searchApi.execute(params);
    } catch (err) {
      console.error('Fetch merchants error:', err);
    }
  }, [searchValues, pageSize, searchApi]);

  useEffect(() => {
    branchesApi.execute();
    fetchMerchants(0, INITIAL_SEARCH_VALUES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (values) => {
    setSearchValues(values);
    setCurrentPage(0);
    fetchMerchants(0, values);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchMerchants(newPage, searchValues);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchFields = [
    { name: 'shortName', label: t('merchant.name'), placeholder: t('merchant.namePlaceholder') },
    { name: 'phoneNumber', label: t('customer.phone'), placeholder: t('customer.phonePlaceholder') },
    { name: 'clientNumber', label: t('merchant.number'), placeholder: t('merchant.numberPlaceholder') },
    { name: 'itn', label: t('customer.taxNumber'), placeholder: t('customer.taxPlaceholder') },
    { 
      name: 'branchCode', 
      label: t('customer.branch'),
      type: 'select', 
      placeholder: t('customer.branchPlaceholder'),
      options: branchesApi.data?.map(b => ({ value: b.code, label: b.name })) || []
    }
  ];

  const merchantData = searchApi.data?.retCode === 0 ? (searchApi.data?.data || []) : [];
  const pagination = {
    totalElements: searchApi.data?.totalElements || 0,
    totalPages: searchApi.data?.totalPages || 0,
    currentPage: currentPage,
    hasNext: searchApi.data?.hasNext || false
  };

  const errorMessage = searchApi.error || (searchApi.data?.retCode !== undefined && searchApi.data?.retCode !== 0 ? searchApi.data?.retMsg : '');

  return (
    <section id="api-calls">
      <div className="page-header-container" style={{ marginBottom: '24px' }}>
        <h2>{t('nav.merchants')}</h2>
      </div>

      <div className="search-section search-card">
        <ApiForm
          fields={searchFields}
          values={searchValues}
          onChange={setSearchValues}
          onSubmit={handleSearch}
        >
          <div className="form-navigation">
            <button 
              type="button" 
              className="back-button" 
              onClick={() => {
                setSearchValues(INITIAL_SEARCH_VALUES);
                handleSearch(INITIAL_SEARCH_VALUES);
              }}
              disabled={searchApi.loading}
            >
              {t('common.clear')}
            </button>
            <button 
              className="submit-button" 
              type="submit"
              disabled={searchApi.loading}
            >
              {searchApi.loading ? t('common.searching') : t('common.search')}
            </button>
          </div>
        </ApiForm>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>{t('common.searchResults')}</h3>
        <button className="submit-button add-new-button" onClick={onAddMerchant}>{t('common.addNew')}</button>
      </div>

      <MerchantTable merchants={merchantData} onCreateContract={onCreateContract} onViewDetails={onViewDetails} />

      {merchantData.length > 0 && (
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
