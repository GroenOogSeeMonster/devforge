import { ReactNode } from 'react';
import { Container, Paper, Title, Text, Anchor, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  altCta?: { text: string; to: string };
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, altCta, children }: AuthLayoutProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 600px at 100% 100%, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 60%), radial-gradient(800px 400px at 0% 0%, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <Container size={520} px={0}>
        <Group justify="center" mb="md">
          <Title order={1} ta="center" style={{ fontWeight: 900 }}>
            {title}
          </Title>
        </Group>
        {subtitle && (
          <Text c="dimmed" size="sm" ta="center" mb="md">
            {subtitle}{' '}
            {altCta && (
              <Anchor size="sm" component={Link} to={altCta.to}>
                {altCta.text}
              </Anchor>
            )}
          </Text>
        )}

        <Paper withBorder shadow="md" p={30} radius="md" style={{ backdropFilter: 'blur(4px)' }}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}


