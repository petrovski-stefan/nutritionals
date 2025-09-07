import { useLocation } from 'react-router-dom';

export default function Search() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('query');

  return <div>Search {search}</div>;
}
