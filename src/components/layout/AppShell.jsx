export default function AppShell({ sidebar, navbar, children, bottomNav }) {
  return (
    <div className="home-layout">
      {sidebar}
      <div className="home-main">
        {navbar}
        {children}
      </div>
      {bottomNav}
    </div>
  );
}
