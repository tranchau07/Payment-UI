import SharedPagination from '../../../components/common/Pagination';
import useI18n from '../../../hooks/useI18n';

export default function Pagination(props) {
  const { t } = useI18n();
  return <SharedPagination {...props} itemLabel={t('customer.found')} />;
}
