// hooks/useRedirectWithQuery.js
import { useNavigate, useLocation } from 'react-router-dom';

export default function useRedirectWithQuery() {
  const navigate = useNavigate();
  const location = useLocation();

  return (basePath = '/', overrides = {}) => {
    const params = new URLSearchParams(location.search);

    for (const key in overrides) {
      if (overrides[key] === null) {
        params.delete(key);
      } else {
        params.set(key, overrides[key]);
      }
    }

    const queryString = params.toString();
    navigate(`${basePath}${queryString ? `?${queryString}` : ''}`);
  };
}
