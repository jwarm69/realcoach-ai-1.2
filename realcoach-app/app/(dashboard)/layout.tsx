import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RealCoachNavigation } from '@/components/layout/realcoach-navigation';
import { AISidebar } from '@/components/layout/ai-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="h-screen flex flex-col bg-background dark">
      {/* Navigation */}
      <RealCoachNavigation />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* AI Sidebar */}
        <AISidebar />
      </div>
    </div>
  );
}
