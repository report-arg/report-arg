'use client';

export default function AuthSplitLayout({
  title,
  description,
  mobileSubtitle,
  children,
  formClassName = 'login-form',
}) {
  return (
    <div className="login-container" suppressHydrationWarning>
      
      {/* Panel izquierdo — visibilidad controlada SOLO por CSS */}
      <div className="login-left" aria-hidden="true">
        <img src="/logo.png" alt="" className="login-logo-img" />
        <div className="login-left-content">
          <h1 className="login-title">{title}</h1>
          <p className="login-description">{description}</p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-right">
        <div className={formClassName}>
          <div className="login-logo-mobile">
            <img src="/logo.png" alt="ReportARG" className="login-logo-mobile-img" />
            {mobileSubtitle && (
              <p className="login-logo-mobile-subtitle">{mobileSubtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

    </div>
  );
}