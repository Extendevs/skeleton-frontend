import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../auth/hooks/useSession';

export const AppLayout = (): JSX.Element => {
  const { user, logout } = useSession();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Categories Console</p>
            <h1 className="text-xl font-bold text-slate-900">Catalog Manager</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-6xl gap-4 px-6 py-3 text-sm">
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-1.5 font-medium transition',
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'
                ].join(' ')
              }
              end
            >
              Categories
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
