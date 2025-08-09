import React, { useState } from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  Button,
  Stack,
  SimpleGrid,
  Modal,
  TextInput,
  Textarea,
  Select,
  LoadingOverlay,
} from '@mantine/core';
import { IconPlus, IconFolder, IconUsers, IconBrandGithub } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { ProjectCard } from '../../components/Projects/ProjectCard';
import { ActivityFeed } from '../../components/Dashboard/ActivityFeed';
import { QuickStats } from '../../components/Dashboard/QuickStats';

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

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch projects
  const { isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll({ limit: 6 });
      return response.data.data;
    },
  });

  // Fetch recent projects
  const { data: recentProjects = [] } = useQuery({
    queryKey: ['recent-projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll({ limit: 4, sort: 'updated_at' });
      return response.data.data;
    },
  });

  const handleCreateProject = async (values: any) => {
    setLoading(true);
    try {
      await projectsAPI.create(values);
      showNotification({
        title: 'Project created',
        message: 'Your new project has been created successfully.',
        type: 'success',
        isRead: false,
      });
      setCreateModalOpen(false);
      // Refetch projects
      window.location.reload();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to create project. Please try again.',
        type: 'error',
        isRead: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: IconPlus,
      label: 'New Project',
      description: 'Create a new project from scratch',
      action: () => setCreateModalOpen(true),
      color: 'blue',
    },
    {
      icon: IconFolder,
      label: 'Browse Templates',
      description: 'Start with a pre-built template',
      action: () => navigate('/templates'),
      color: 'green',
    },
    {
      icon: IconBrandGithub,
      label: 'Import from Git',
      description: 'Import an existing repository',
      action: () => navigate('/projects/import'),
      color: 'gray',
    },
    {
      icon: IconUsers,
      label: 'Invite Team',
      description: 'Collaborate with your team',
      action: () => navigate('/team'),
      color: 'violet',
    },
  ];

  return (
    <div>
      <LoadingOverlay visible={projectsLoading} />
      
      {/* Welcome Section */}
      <Card mb="lg" withBorder>
        <Group justify="space-between" align="flex-start">
          <div>
             <Text size="xl" fw={700} mb={5}>
              Welcome back, {user?.firstName}!
            </Text>
            <Text color="dimmed" size="sm">
              Ready to build something amazing today?
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)} size="md">
            New Project
          </Button>
        </Group>
      </Card>

      {/* Quick Stats */}
      <QuickStats />

      {/* Quick Actions */}
      <Card mb="lg" withBorder>
        <Text size="lg" fw={600} mb="md">
          Quick Actions
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              withBorder
              padding="md"
              style={{ cursor: 'pointer' }}
              onClick={action.action}
             
            >
              <Group>
                <action.icon size={24} color={`var(--mantine-color-${action.color}-6)`} />
                <div>
                  <Text size="sm" fw={600}>
                    {action.label}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {action.description}
                  </Text>
                </div>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Card>

      <Grid>
        {/* Recent Projects */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                Recent Projects
              </Text>
              <Button variant="subtle" size="sm" onClick={() => navigate('/projects')}>
                View All
              </Button>
            </Group>
            
            {recentProjects.length === 0 ? (
              <Card withBorder p="xl" style={{ textAlign: 'center' }}>
                <IconFolder size={48} color="var(--mantine-color-gray-4)" />
                <Text size="lg" fw={500} mt="md">
                  No projects yet
                </Text>
                <Text color="dimmed" size="sm" mb="lg">
                  Create your first project to get started
                </Text>
                <Button onClick={() => setCreateModalOpen(true)}>
                  Create Project
                </Button>
              </Card>
            ) : (
              <Stack gap="md">
                {recentProjects.map((project: Project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </Stack>
            )}
          </Card>
        </Grid.Col>

        {/* Activity Feed */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <ActivityFeed />
        </Grid.Col>
      </Grid>

      {/* Create Project Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        size="lg"
      >
        <CreateProjectForm
          onSubmit={handleCreateProject}
          loading={loading}
          onCancel={() => setCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Create Project Form Component
interface CreateProjectFormProps {
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

function CreateProjectForm({ onSubmit, loading, onCancel }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: '',
    framework: '',
    isPublic: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Project Name"
          placeholder="My Awesome Project"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <Textarea
          label="Description"
          placeholder="Describe your project..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        
        <Select
          label="Primary Language"
          placeholder="Select language"
          data={[
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' },
            { value: 'go', label: 'Go' },
            { value: 'rust', label: 'Rust' },
            { value: 'php', label: 'PHP' },
            { value: 'ruby', label: 'Ruby' },
          ]}
          value={formData.language}
          onChange={(value) => setFormData({ ...formData, language: value || '' })}
        />
        
        <Select
          label="Framework"
          placeholder="Select framework (optional)"
          data={[
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'express', label: 'Express.js' },
            { value: 'django', label: 'Django' },
            { value: 'flask', label: 'Flask' },
            { value: 'spring', label: 'Spring Boot' },
            { value: 'gin', label: 'Gin' },
          ]}
          value={formData.framework}
          onChange={(value) => setFormData({ ...formData, framework: value || '' })}
        />
        
        <Group justify="space-between" mt="xl">
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Project
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
