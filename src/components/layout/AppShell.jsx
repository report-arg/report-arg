export default function AppShell({ sidebar, navbar, children, bottomNav }) {
  return (
    <div className="home-layout">
      {sidebar}
      <div className="home-main">
        {navbar}
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
      {bottomNav}
    </div>
  );
}
