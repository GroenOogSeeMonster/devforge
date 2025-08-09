import React, { useState } from 'react';
import { AppShell, Text, Burger, useMantineTheme, Group, ActionIcon, Avatar, Menu, Divider, Box, Stack, Badge, Tooltip } from '@mantine/core';
import {
  IconBrandGithub,
  IconSettings,
  IconLogout,
  IconUser,
  IconBell,
  IconPlus,
  IconFolder,
  IconCode,
  IconDatabase,
  IconServer,
  IconRocket,
  IconUsers,
  IconBookmark,
  IconHistory,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NavbarItem } from './NavbarItem';
import { SearchBar } from '../Common/SearchBar';
import { ThemeToggle } from '../Common/ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      icon: IconFolder,
      label: 'Projects',
      path: '/projects',
      badge: null,
    },
    {
      icon: IconCode,
      label: 'Editor',
      path: '/editor',
      badge: null,
    },
    {
      icon: IconDatabase,
      label: 'Databases',
      path: '/databases',
      badge: null,
    },
    {
      icon: IconServer,
      label: 'Containers',
      path: '/containers',
      badge: null,
    },
    {
      icon: IconRocket,
      label: 'Deployments',
      path: '/deployments',
      badge: null,
    },
    {
      icon: IconUsers,
      label: 'Collaboration',
      path: '/collaboration',
      badge: null,
    },
    {
      icon: IconBookmark,
      label: 'Templates',
      path: '/templates',
      badge: null,
    },
    {
      icon: IconHistory,
      label: 'Recent',
      path: '/recent',
      badge: null,
    },
  ];

  return (
    <AppShell header={{ height: { base: 50, md: 70 } }} navbar={{ width: { sm: 250, lg: 300 }, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="md" withBorder w={{ sm: 250, lg: 300 }} style={{ background: 'var(--mantine-color-body)', borderRight: '1px solid var(--mantine-color-default-border)' }}>
        <AppShell.Section>
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={700} color={theme.primaryColor}>
              DevForge
            </Text>
            <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm" color={theme.colors.gray[6]} hiddenFrom="sm" />
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavbarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                badge={item.badge}
                active={location.pathname.startsWith(item.path)}
                onClick={() => {
                  navigate(item.path);
                  setOpened(false);
                }}
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="md" />
          <Group justify="space-between">
            <Text size="xs" color="dimmed">
              {user?.email}
            </Text>
            <ThemeToggle />
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Header p="md" style={{ background: 'var(--mantine-color-body)', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Burger opened={opened} onClick={() => setOpened((o) => !o)} size="sm" color={theme.colors.gray[6]} mr="xl" hiddenFrom="sm" />

          <Group justify="space-between" style={{ flex: 1 }}>
            <SearchBar />

            <Group gap="xs">
              <Tooltip label="Create new project">
                <ActionIcon variant="subtle" color="blue" onClick={() => navigate('/projects/new')}>
                  <IconPlus size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Notifications">
                <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/notifications')}>
                  <IconBell size={18} />
                  {unreadNotifications > 0 && (
                    <Badge size="xs" color="red" variant="filled" style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, fontSize: 10 }}>
                      {unreadNotifications}
                    </Badge>
                  )}
                </ActionIcon>
              </Tooltip>

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <Avatar size="sm" radius="xl" src={user?.avatarUrl} color={theme.primaryColor}>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Account</Menu.Label>
                  <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/profile')}>
                    Profile
                  </Menu.Item>
                  <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/settings')}>
                    Settings
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Support</Menu.Label>
                  <Menu.Item leftSection={<IconBrandGithub size={14} />} onClick={() => window.open('https://github.com/devforge/devforge', '_blank')}>
                    GitHub
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <Box style={{ minHeight: 'calc(100vh - 70px)' }}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
}
