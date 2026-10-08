import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@ismo/shared';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { AuthShell } from '@/components/AuthShell';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Field } from '@/components/Field';
import { Notice } from '@/components/Notice';
import { Accent, Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/lib/auth';
import { applyServerErrors } from '@/lib/forms';
import { fonts, useTheme } from '@/lib/theme';

export default function LoginScreen() {
  const { login, sessionExpired } = useAuth();
  const { theme } = useTheme();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values); // the route guard takes over on success
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  return (
    <AuthShell
      eyebrow="Sign in"
      title={
        <>
          Welcome <Accent size={38}>back</Accent>
        </>
      }
      subtitle="Log in with the same account you use on the web."
    >
      {sessionExpired && !formError && (
        <Notice tone="warning" message="Your session has expired. Please log in again." />
      )}
      {formError && <Notice tone="error" message={formError} />}

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
            textContentType="emailAddress"
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
            placeholder="Your password"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
        )}
      />
      <ArrowButton title="Log in" loading={isSubmitting} onPress={onSubmit} style={{ marginTop: 4 }} />

      <Pressable
        onPress={() => {
          setValue('email', 'demo@ismo.test', { shouldValidate: true });
          setValue('password', 'Demo@1234', { shouldValidate: true });
        }}
        style={[styles.demo, { borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel="Fill in the demo account"
      >
        <Text variant="caption" muted style={{ lineHeight: 17 }}>
          <Text variant="caption" style={{ fontFamily: fonts.medium }}>
            Reviewing?
          </Text>{' '}
          Tap to use the demo account (demo@ismo.test)
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text muted>New here? </Text>
        <TextLink href="/register" replace label="Create an account" />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  demo: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
});
