import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@ismo/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { FormAlert } from '@/components/common/FormAlert';
import { FormField } from '@/components/common/FormField';
import { ArrowSubmit } from '@/components/fx/ArrowSubmit';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { applyServerErrors } from '@/lib/forms';

export function LoginPage() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const expired = searchParams.get('reason') === 'expired';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  const fillDemo = () => {
    setValue('email', 'demo@ismo.test', { shouldValidate: true });
    setValue('password', 'Demo@1234', { shouldValidate: true });
  };

  return (
    <AuthLayout
      title={
        <>
          Welcome <span className="accent">back</span>
        </>
      }
      subtitle="Log in to pick up your projects and tasks, on the web or on Android."
    >
      {expired && !formError && (
        <FormAlert tone="warning" className="mb-5">
          Your session has expired. Please log in again.
        </FormAlert>
      )}
      {formError && <FormAlert className="mb-5">{formError}</FormAlert>}

      <Stagger inView={false} delay={0.15} stagger={0.05}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <StaggerItem>
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </FormField>
          </StaggerItem>
          <StaggerItem>
            <FormField id="password" label="Password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </FormField>
          </StaggerItem>
          <StaggerItem>
            <ArrowSubmit loading={isSubmitting}>Log in</ArrowSubmit>
          </StaggerItem>
        </form>

        <StaggerItem>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-4 w-full rounded-lg border border-dashed px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="font-medium text-foreground">Reviewing?</span> Use the demo account:{' '}
            <span className="font-mono">demo@ismo.test</span> / <span className="font-mono">Demo@1234</span>
          </button>
        </StaggerItem>

        <StaggerItem>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </StaggerItem>
      </Stagger>
    </AuthLayout>
  );
}
