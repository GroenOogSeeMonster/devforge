import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Group,
  Divider,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { AuthLayout } from '../Layout/AuthLayout';

interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      username: (value) => 
        value.length < 3 ? 'Username must be at least 3 characters' :
        !/^[a-zA-Z0-9_-]+$/.test(value) ? 'Username can only contain letters, numbers, underscores, and hyphens' :
        null,
      password: (value) => 
        value.length < 8 ? 'Password must be at least 8 characters' :
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value) ?
        'Password must contain uppercase, lowercase, number, and special character' :
        null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
      firstName: (value) => 
        value.length < 1 ? 'First name is required' :
        value.length > 50 ? 'First name must be less than 50 characters' :
        null,
      lastName: (value) => 
        value.length < 1 ? 'Last name is required' :
        value.length > 50 ? 'Last name must be less than 50 characters' :
        null,
      agreeToTerms: (value) => 
        !value ? 'You must agree to the terms and conditions' : null,
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError('');

    try {
      await register({
        email: values.email,
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      
      showNotification({
        title: 'Welcome to DevForge!',
        message: 'Your account has been created successfully.',
        type: 'success',
        isRead: false,
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      showNotification({
        title: 'Registration failed',
        message: err instanceof Error ? err.message : 'Please check your information and try again.',
        type: 'error',
        isRead: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: 'github' | 'google') => {
    // TODO: Implement social registration
    showNotification({
      title: 'Coming soon',
      message: `${provider} registration will be available soon.`,
      type: 'info',
      isRead: false,
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Already have an account?"
      altCta={{ text: 'Sign in', to: '/login' }}
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group grow>
          <TextInput
            label="First Name"
            placeholder="John"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            required
            {...form.getInputProps('lastName')}
          />
        </Group>
        
        <TextInput
          label="Username"
          placeholder="johndoe"
          required
          mt="md"
          {...form.getInputProps('username')}
        />
        
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          mt="md"
          {...form.getInputProps('email')}
        />
        
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        
        <Checkbox
          label="I agree to the terms and conditions"
          mt="lg"
          {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
        />
        
        <Button fullWidth mt="xl" type="submit" loading={loading}>
          Create account
        </Button>
      </form>

      <Divider label="Or continue with" labelPosition="center" my="lg" />

      <Group grow mb="md" mt="md">
        <Button variant="default" leftSection={<IconBrandGithub size={16} />} onClick={() => handleSocialRegister('github')}>
          GitHub
        </Button>
        <Button variant="default" leftSection={<IconBrandGoogle size={16} />} onClick={() => handleSocialRegister('google')}>
          Google
        </Button>
      </Group>
    </AuthLayout>
  );
}
