import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchBar.css';

/**
 * SearchBar - Componente de búsqueda reutilizable
 */
export const SearchBar = ({ 
  placeholder,
  onSearch,
  isLoading = false,
  debounceMs = 500
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef();

  // Ejecutar búsqueda - memoizada para evitar re-creaciones
  const triggerSearch = useCallback(async (term) => {
    if (!onSearch) return;
    
    setIsSearching(true);
    try {
      await onSearch(term);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch]);

  // Debounce effect - solo ejecutar cuando searchTerm cambie
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm === '') {
      triggerSearch('');
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      triggerSearch(searchTerm);
    }, debounceMs);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, triggerSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      triggerSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-bar">
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={placeholder || t('common.search', 'Buscar...')}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            autoComplete="off"
          />
          {(isSearching || isLoading) && (
            <div className="search-loading">
              <div className="spinner-small"></div>
            </div>
          )}
          {searchTerm && !isSearching && !isLoading && (
            <button
              onClick={handleClear}
              className="clear-search-btn"
              title={t('common.clear', 'Limpiar')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};