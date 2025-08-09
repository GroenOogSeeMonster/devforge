 
import { UnstyledButton, Group, Text, Badge, useMantineTheme } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

interface NavbarItemProps {
  icon: (props: TablerIconsProps) => JSX.Element;
  label: string;
  path: string;
  badge?: string | number | null;
  active?: boolean;
  onClick: () => void;
}

export function NavbarItem({ icon: Icon, label, badge, active, onClick }: NavbarItemProps) {
  const theme = useMantineTheme();

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: 'var(--mantine-spacing-xs)',
        borderRadius: 'var(--mantine-radius-sm)',
        color: active ? 'var(--mantine-color-text)' : 'var(--mantine-color-dimmed)',
        backgroundColor: active ? 'var(--mantine-color-default-hover)' : 'transparent',
        border: active ? '1px solid var(--mantine-color-default-border)' : '1px solid transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <Group>
        <Icon size={18} color={active ? theme.primaryColor : 'var(--mantine-color-dimmed)'} />
        <Text size="sm" fw={active ? 600 : 400} style={{ flex: 1 }}>
          {label}
        </Text>
        {badge && (
          <Badge
            size="xs"
            variant="filled"
            color={theme.primaryColor}
            style={{ minWidth: 20 }}
          >
            {badge}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}
