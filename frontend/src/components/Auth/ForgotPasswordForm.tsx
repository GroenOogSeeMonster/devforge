import { useState } from 'react';
import {
  TextInput,
  Anchor,
  Text,
  Button,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { AuthLayout } from '../Layout/AuthLayout';

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordForm() {
  const { showNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(values.email);
      setSuccess(true);
      showNotification({
        title: 'Reset link sent',
        message: 'If an account with that email exists, a password reset link has been sent.',
        type: 'success',
        isRead: false,
      });
    } catch (err) {
      // Don't show specific error to prevent email enumeration
      setSuccess(true);
      showNotification({
        title: 'Reset link sent',
        message: 'If an account with that email exists, a password reset link has been sent.',
        type: 'success',
        isRead: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email">
        <Alert icon={<IconCheck size={16} />} title="Email sent" color="green" mb="md">
          If an account with that email exists, we've sent a password reset link to your email address.
        </Alert>
        
        <Text size="sm" c="dimmed" ta="center" mb="lg">
          Didn't receive the email? Check your spam folder or{' '}
          <Anchor size="sm" component={Link} to="/forgot-password">
            try again
          </Anchor>
        </Text>
        
        <Button fullWidth variant="subtle" component={Link} to="/login">
          Back to login
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email address and we'll send you a reset link">
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
        
        <Button fullWidth mt="xl" type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>

      <Text size="sm" c="dimmed" ta="center" mt="lg">
        Remember your password?{' '}
        <Anchor size="sm" component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>
    </AuthLayout>
  );
}
