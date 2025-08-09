import { useState } from 'react';
import {
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import { AuthLayout } from '../Layout/AuthLayout';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => 
        value.length < 8 ? 'Password must be at least 8 characters' :
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value) ?
        'Password must contain uppercase, lowercase, number, and special character' :
        null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(token, values.password);
      setSuccess(true);
      showNotification({
        title: 'Password reset successful',
        message: 'Your password has been reset successfully. You can now log in with your new password.',
        type: 'success',
        isRead: false,
      });
    } catch (err) {
      setError('Invalid or expired reset token. Please request a new password reset link.');
      showNotification({
        title: 'Reset failed',
        message: 'Invalid or expired reset token. Please request a new password reset link.',
        type: 'error',
        isRead: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link">
        <Alert icon={<IconAlertCircle size={16} />} title="Invalid token" color="red" mb="md">
          The password reset link is invalid or has expired. Please request a new password reset link.
        </Alert>
        
        <Button fullWidth component={Link} to="/forgot-password">
          Request new reset link
        </Button>
        
        <Text size="sm" c="dimmed" ta="center" mt="lg">
          Remember your password?{' '}
          <Anchor size="sm" component={Link} to="/login">
            Sign in
          </Anchor>
        </Text>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password reset successful">
        <Alert icon={<IconCheck size={16} />} title="Success" color="green" mb="md">
          Your password has been reset successfully. You can now log in with your new password.
        </Alert>
        
        <Button fullWidth component={Link} to="/login">
          Sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your new password below">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <PasswordInput
          label="New Password"
          placeholder="Your new password"
          required
          {...form.getInputProps('password')}
        />
        
        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm your new password"
          required
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        
        <Button fullWidth mt="xl" type="submit" loading={loading}>
          Reset password
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
