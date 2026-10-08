import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@ismo/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { FormAlert } from '@/components/common/FormAlert';
import { FormField } from '@/components/common/FormField';
import { ArrowSubmit } from '@/components/fx/ArrowSubmit';
import { PasswordChecklist } from '@/components/common/PasswordChecklist';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { applyServerErrors } from '@/lib/forms';

export function RegisterPage() {
  useDocumentTitle('Create account');
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(values);
      toast.success('Account created. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  return (
    <AuthLayout
      title={
        <>
          Create your <span className="accent">account</span>
        </>
      }
      subtitle="One account for the web app and the Android app. Your data stays private to you."
    >
      {formError && <FormAlert className="mb-5">{formError}</FormAlert>}
      <Stagger inView={false} delay={0.15} stagger={0.05}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <StaggerItem>
            <FormField id="name" label="Full name" error={errors.name?.message}>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </FormField>
          </StaggerItem>
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
          <StaggerItem className="space-y-3">
            <FormField id="password" label="Password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </FormField>
            <PasswordChecklist value={watch('password') ?? ''} />
          </StaggerItem>
          <StaggerItem>
            <ArrowSubmit loading={isSubmitting}>Create account</ArrowSubmit>
          </StaggerItem>
        </form>
      </Stagger>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
