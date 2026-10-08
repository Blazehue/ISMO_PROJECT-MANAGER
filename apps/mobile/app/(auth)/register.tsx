import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@ismo/shared';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { AuthShell } from '@/components/AuthShell';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Field } from '@/components/Field';
import { Notice } from '@/components/Notice';
import { Accent, Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/lib/auth';
import { applyServerErrors } from '@/lib/forms';
import { useTheme } from '@/lib/theme';

// Mirrors passwordSchema in packages/shared.
const rules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'A letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { label: 'A number', test: (v: string) => /\d/.test(v) },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const { theme } = useTheme();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const password = watch('password') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register(values);
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  return (
    <AuthShell
      eyebrow="New account"
      title={
        <>
          Create your <Accent size={38}>account</Accent>
        </>
      }
      subtitle="One account for the Android app and the web dashboard."
    >
      {formError && <Notice tone="error" message={formError} />}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Field
            label="Full name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
            placeholder="Jane Doe"
            autoComplete="name"
            textContentType="name"
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Field
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Field
            label="Password"
            password
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />
      <View style={styles.rules}>
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <View key={rule.label} style={styles.rule}>
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: ok ? theme.brandStrong : theme.border,
                    backgroundColor: ok ? theme.brandStrong : 'transparent',
                  },
                ]}
              >
                {ok && <Feather name="check" size={9} color="#FFFFFF" />}
              </View>
              <Text variant="caption" muted={!ok}>
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
      <ArrowButton title="Create account" loading={isSubmitting} onPress={onSubmit} />
      <View style={styles.footer}>
        <Text muted>Already have an account? </Text>
        <TextLink href="/login" replace label="Log in" />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: -4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
});
