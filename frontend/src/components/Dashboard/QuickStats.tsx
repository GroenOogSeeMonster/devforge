import { SimpleGrid, Card, Text, Group, RingProgress, useMantineTheme } from '@mantine/core';
import { IconFolder, IconCode, IconDatabase, IconServer } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

interface StatsData {
  totalProjects: number;
  activeProjects: number;
  totalFiles: number;
  totalContainers: number;
  totalDatabases: number;
  totalDeployments: number;
  recentActivity: number;
}

export function QuickStats() {
  const theme = useMantineTheme();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // In a real app, you'd have a dedicated stats endpoint
      // For now, we'll simulate the data
      return {
        totalProjects: 12,
        activeProjects: 8,
        totalFiles: 156,
        totalContainers: 5,
        totalDatabases: 3,
        totalDeployments: 7,
        recentActivity: 23,
      } as StatsData;
    },
  });

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: IconFolder,
      color: 'blue',
      progress: ((stats?.activeProjects || 0) / (stats?.totalProjects || 1)) * 100,
    },
    {
      title: 'Active Containers',
      value: stats?.totalContainers || 0,
      icon: IconServer,
      color: 'green',
      progress: 75,
    },
    {
      title: 'Databases',
      value: stats?.totalDatabases || 0,
      icon: IconDatabase,
      color: 'violet',
      progress: 60,
    },
    {
      title: 'Deployments',
      value: stats?.totalDeployments || 0,
      icon: IconCode,
      color: 'orange',
      progress: 85,
    },
  ];

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} withBorder p="md">
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: 20, backgroundColor: theme.colors.gray[3], borderRadius: 4 }} />
            </div>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
      {statCards.map((stat) => (
        <Card key={stat.title} withBorder p="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" color="dimmed" tt="uppercase" fw={700}>
                {stat.title}
              </Text>
              <Text size="xl" fw={700} mt={5}>
                {stat.value}
              </Text>
            </div>
            <RingProgress
              size={60}
              thickness={4}
              sections={[{ value: stat.progress, color: theme.colors[stat.color][6] }]}
              label={
                <stat.icon
                  size={20}
                  color={theme.colors[stat.color][6]}
                  style={{ margin: 'auto' }}
                />
              }
            />
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
