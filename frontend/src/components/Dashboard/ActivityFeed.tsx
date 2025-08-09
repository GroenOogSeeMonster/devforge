 
import { Card, Text, Group, Avatar, Stack, Badge, useMantineTheme } from '@mantine/core';
import { IconGitCommit, IconFileText, IconServer, IconDatabase, IconUsers } from '@tabler/icons-react';

interface Activity {
  id: string;
  type: 'commit' | 'file' | 'container' | 'database' | 'member';
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  project?: string;
}

export function ActivityFeed() {
  const theme = useMantineTheme();

  // Mock activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'commit',
      user: { name: 'John Doe', avatar: undefined },
      action: 'pushed',
      target: '3 commits to main',
      timestamp: '2 minutes ago',
      project: 'My React App',
    },
    {
      id: '2',
      type: 'file',
      user: { name: 'Jane Smith', avatar: undefined },
      action: 'created',
      target: 'src/components/Header.tsx',
      timestamp: '15 minutes ago',
      project: 'E-commerce Platform',
    },
    {
      id: '3',
      type: 'container',
      user: { name: 'Mike Johnson', avatar: undefined },
      action: 'started',
      target: 'web-server container',
      timestamp: '1 hour ago',
      project: 'API Service',
    },
    {
      id: '4',
      type: 'database',
      user: { name: 'Sarah Wilson', avatar: undefined },
      action: 'provisioned',
      target: 'PostgreSQL database',
      timestamp: '2 hours ago',
      project: 'User Management',
    },
    {
      id: '5',
      type: 'member',
      user: { name: 'Alex Brown', avatar: undefined },
      action: 'joined',
      target: 'the project',
      timestamp: '3 hours ago',
      project: 'Mobile App',
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'commit':
        return IconGitCommit;
      case 'file':
        return IconFileText;
      case 'container':
        return IconServer;
      case 'database':
        return IconDatabase;
      case 'member':
        return IconUsers;
      default:
        return IconFileText;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'commit':
        return 'green';
      case 'file':
        return 'blue';
      case 'container':
        return 'orange';
      case 'database':
        return 'violet';
      case 'member':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    // In a real app, you'd use a proper date library like date-fns
    return timestamp;
  };

  return (
    <Card withBorder>
      <Text size="lg" fw={600} mb="md">
        Recent Activity
      </Text>
      
      <Stack gap="md">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);
          
          return (
            <Group key={activity.id} align="flex-start" gap="sm">
              <Avatar
                size="sm"
                radius="xl"
                src={activity.user.avatar}
                color={theme.colors[color][6]}
              >
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              
              <div style={{ flex: 1 }}>
                <Group gap="xs" align="center">
                  <Text size="sm" fw={500}>
                    {activity.user.name}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {activity.action}
                  </Text>
                  <Text size="sm" fw={500}>
                    {activity.target}
                  </Text>
                </Group>
                
                {activity.project && (
                  <Text size="xs" color="dimmed" mt={2}>
                    in {activity.project}
                  </Text>
                )}
                
                <Text size="xs" color="dimmed" mt={2}>
                  {formatTimeAgo(activity.timestamp)}
                </Text>
              </div>
              
              <Badge
                size="xs"
                variant="light"
                color={color}
                leftSection={<Icon size={12} />}
              >
                {activity.type}
              </Badge>
            </Group>
          );
        })}
      </Stack>
      
      <Group justify="center" mt="lg">
        <Text size="sm" color="dimmed">
          View all activity
        </Text>
      </Group>
    </Card>
  );
}
