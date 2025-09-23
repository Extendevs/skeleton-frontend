import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Location } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useToast } from '../../shared/components/ToastProvider';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSession();
  const { notify } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      notify({
        type: 'success',
        title: 'Session started',
        description: 'Welcome back!'
      });
      const fallback = '/categories';
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? fallback;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed');
      notify({ type: 'error', title: 'Login failed', description: 'Check your credentials and try again.' });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Access Console</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your credentials to continue.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          {formError && <p className="text-sm text-rose-600">{formError}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
