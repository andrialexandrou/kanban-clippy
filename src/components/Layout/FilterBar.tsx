import React, { useState } from 'react';
import { 
  Box, 
  TextInput, 
  Button, 
  ThemeProvider
} from '@primer/react';
import { SearchIcon, XIcon } from '@primer/octicons-react';

interface FilterBarProps {
  onFilter: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter }) => {
  const [filterValue, setFilterValue] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setIsFiltering(e.target.value.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filterValue);
  };

  const handleClear = () => {
    setFilterValue('');
    setIsFiltering(false);
    onFilter('');
  };

  return (
    <ThemeProvider>
      <Box 
        sx={{ 
          p: 3, 
          borderBottom: '1px solid', 
          borderColor: 'border.default',
          bg: 'canvas.default'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <TextInput
                  aria-label="Filter cards"
                  placeholder="Filter by keyword or by field"
                  value={filterValue}
                  onChange={handleInputChange}
                  leadingVisual={SearchIcon}
                  sx={{ width: '100%' }}
                />
                {filterValue && (
                  <Box sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}>
                    <Button 
                      aria-label="Clear filter"
                      variant="invisible" 
                      size="small"
                      onClick={handleClear}
                      sx={{ p: 1 }}
                    >
                      <XIcon size={16} />
                    </Button>
                  </Box>
                )}
            </Box>
            
            {isFiltering && (
              <Box sx={{ display: 'flex', ml: 3 }}>
                <Button 
                  variant="invisible"
                  onClick={handleClear}
                  sx={{ mr: 2 }}
                >
                  Discard
                </Button>
                <Button 
                  variant="primary"
                  type="submit"
                >
                  Save
                </Button>
              </Box>
            )}
          </Box>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default FilterBar;
