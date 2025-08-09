import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Group,
  Divider,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { AuthLayout } from '../Layout/AuthLayout';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError('');

    try {
      await login(values.email, values.password);
      showNotification({
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
        type: 'success',
        isRead: false,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      showNotification({
        title: 'Login failed',
        message: err instanceof Error ? err.message : 'Please check your credentials and try again.',
        type: 'error',
        isRead: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'github' | 'google') => {
    // TODO: Implement social login
    showNotification({
      title: 'Coming soon',
      message: `${provider} login will be available soon.`,
      type: 'info',
      isRead: false,
    });
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Don't have an account yet?"
      altCta={{ text: 'Create account', to: '/register' }}
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox
            label="Remember me"
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />
          <Anchor component={Link} to="/forgot-password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" type="submit" loading={loading}>
          Sign in
        </Button>
      </form>

      <Divider label="Or continue with" labelPosition="center" my="lg" />

      <Group grow mb="md" mt="md">
        <Button variant="default" leftSection={<IconBrandGithub size={16} />} onClick={() => handleSocialLogin('github')}>
          GitHub
        </Button>
        <Button variant="default" leftSection={<IconBrandGoogle size={16} />} onClick={() => handleSocialLogin('google')}>
          Google
        </Button>
      </Group>
    </AuthLayout>
  );
}
