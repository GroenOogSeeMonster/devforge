import { useState } from 'react';
import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

export function SearchBar() {
  
  const [value, setValue] = useState('');

  const handleClear = () => {
    setValue('');
  };

  const handleSearch = (searchTerm: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  return (
    <TextInput
      placeholder="Search projects, files, or commands..."
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyPress={(event) => {
        if (event.key === 'Enter') {
          handleSearch(value);
        }
      }}
      leftSection={<IconSearch size={16} />}
      rightSection={
        value && (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={handleClear}
          >
            <IconX size={14} />
          </ActionIcon>
        )
      }
      styles={(theme: any) => ({
        input: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
          border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          '&:focus': {
            borderColor: theme.primaryColor,
          },
        },
      })}
      style={{ minWidth: 300 }}
    />
  );
}
