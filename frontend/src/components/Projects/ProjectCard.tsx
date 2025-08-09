 
import {
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Avatar,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconSettings,
  IconGitBranch,
  IconUsers,
  IconClock,
  IconFolder,
  IconServer,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { projectsAPI } from '../../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    filesCount: number;
    containersCount: number;
    databasesCount: number;
    deploymentsCount: number;
    membersCount: number;
  };
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const handleDelete = async () => {
    try {
      await projectsAPI.delete(project.id);
      showNotification({
        title: 'Project deleted',
        message: 'The project has been deleted successfully.',
        type: 'success',
        isRead: false,
      });
      // Refetch projects
      window.location.reload();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete project. Please try again.',
        type: 'error',
        isRead: false,
      });
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'yellow',
      typescript: 'blue',
      python: 'green',
      java: 'orange',
      go: 'cyan',
      rust: 'red',
      php: 'violet',
      ruby: 'pink',
    };
    return colors[language.toLowerCase()] || 'gray';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card
      withBorder
      padding="md"
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group gap="sm">
          <Avatar
            size="md"
            radius="md"
            color={theme.primaryColor}
          >
            <IconFolder size={20} />
          </Avatar>
          <div>
            <Text size="lg" fw={600} lineClamp={1}>
              {project.name}
            </Text>
            <Text size="sm" color="dimmed" lineClamp={1}>
              {project.description}
            </Text>
          </div>
        </Group>
        
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${project.id}`);
              }}
            >
              View Project
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${project.id}/edit`);
              }}
            >
              Edit Project
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${project.id}/settings`);
              }}
            >
              Project Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete Project
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

              <Stack gap="xs">
        <Group gap="xs">
          {project.language && (
            <Badge
              size="sm"
              variant="light"
              color={getLanguageColor(project.language)}
            >
              {project.language}
            </Badge>
          )}
          {project.framework && (
            <Badge size="sm" variant="outline">
              {project.framework}
            </Badge>
          )}
          {project.isPublic ? (
            <Badge size="sm" variant="light" color="green">
              Public
            </Badge>
          ) : (
            <Badge size="sm" variant="light" color="gray">
              Private
            </Badge>
          )}
        </Group>

        {project.stats && (
          <Group gap="lg">
            <Group gap="xs">
              <IconFolder size={14} color={theme.colors.gray[5]} />
              <Text size="xs" color="dimmed">
                {project.stats.filesCount} files
              </Text>
            </Group>
            <Group gap="xs">
              <IconUsers size={14} color={theme.colors.gray[5]} />
              <Text size="xs" color="dimmed">
                {project.stats.membersCount} members
              </Text>
            </Group>
            <Group gap="xs">
              <IconServer size={14} color={theme.colors.gray[5]} />
              <Text size="xs" color="dimmed">
                {project.stats.containersCount} containers
              </Text>
            </Group>
          </Group>
        )}

                <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconClock size={14} color={theme.colors.gray[5]} />
            <Text size="xs" color="dimmed">
              Updated {formatDate(project.updatedAt)}
            </Text>
          </Group>
          
          <Group gap="xs">
            <IconGitBranch size={14} color={theme.colors.gray[5]} />
            <Text size="xs" color="dimmed">
              main
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
