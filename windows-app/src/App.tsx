import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { useLocalApp } from '@/hooks/use-local-app';
import { Dashboard, History, Practice, Results, SettingsPage } from '@/pages/pages';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const app = useLocalApp();
  return (
    <AppShell settings={app.settings} onThemeToggle={() => app.updateSettings({ theme: app.settings.theme === 'light' ? 'dark' : 'light' })}>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={() => <Dashboard results={app.results} />} />
          <Route path="/practice" component={() => <Practice saveResult={app.saveResult} />} />
          <Route path="/results" component={() => <Results results={app.results} />} />
          <Route path="/history" component={() => <History results={app.results} />} />
          <Route path="/settings" component={() => <SettingsPage settings={app.settings} updateSettings={app.updateSettings} resetData={app.resetData} />} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AppShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;