import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      variant="subtle"
      color={colorScheme === 'dark' ? 'yellow' : 'blue'}
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
    >
      {colorScheme === 'dark' ? (
        <IconSun size={18} />
      ) : (
        <IconMoon size={18} />
      )}
    </ActionIcon>
  );
}
