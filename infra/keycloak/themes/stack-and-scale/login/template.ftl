<#import "footer.ftl" as loginFooter>
<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="robots" content="noindex, nofollow">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    <title>${msg("loginTitle",(realm.displayName!'Stack & Scale | Unified Sign-In'))}</title>
    <link rel="icon" type="image/svg+xml" href="${url.resourcesPath}/img/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <script type="importmap">
        {
            "imports": {
                "rfc4648": "${url.resourcesCommonPath}/vendor/rfc4648/rfc4648.js"
            }
        }
    </script>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <script type="module" src="${url.resourcesPath}/js/passwordVisibility.js"></script>
    <script type="module">
        import { startSessionPolling } from "${url.resourcesPath}/js/authChecker.js";

        startSessionPolling(
            "${url.ssoLoginInOtherTabsUrl?no_esc}"
        );

        const DARK_MODE_CLASS = "pf-v5-theme-dark";
        document.documentElement.classList.add(DARK_MODE_CLASS);
    </script>

    <!-- Comprehensive Stack & Scale Brand Styles (Exact match to apps/web/app/globals.css) -->
    <style>
      :root {
        --font-brand: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        --font-body: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        --font-mono: 'Geist Mono', monospace;
        --background: #000000;
        --card: #0c0c0c;
        --seafoam: #80ddd1;
        --petrol: #135d61;
        --foreground: #ededed;
        --muted: #888888;
        --line: rgba(255, 255, 255, 0.08);
        --line-strong: rgba(255, 255, 255, 0.12);
        --input-bg: #141414;
      }

      *, *::before, *::after {
        box-sizing: border-box !important;
      }

      html, body, #keycloak-bg {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: 100% !important;
        height: auto !important;
        background-color: #000000 !important;
        background-image: none !important;
        color: #ededed !important;
        font-family: var(--font-body) !important;
        -webkit-font-smoothing: antialiased !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }

      /* Clean PatternFly overrides */
      .pf-v5-c-login, #keycloak-bg {
        background: transparent !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
      }

      /* Architectural Blueprint Grid Backdrop */
      .hero-backdrop {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        background-color: #000000;
      }

      .hero-horizon {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        max-width: 1280px;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
      }

      .hero-grid-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%);
      }

      /* Top Navigation Bar */
      .sso-top-nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
      }

      .sso-top-nav-inner {
        width: 100%;
        max-width: 1200px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .brand-logo-link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
      }

      .brand-logo-text {
        font-family: var(--font-brand);
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.025em;
        color: #ffffff;
        display: flex;
        align-items: center;
      }

      .brand-amp {
        color: rgba(255, 255, 255, 0.45);
        margin: 0 3px;
        font-size: 0.88em;
      }

      .sso-back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #888888;
        text-decoration: none;
        padding: 5px 12px;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        transition: all 0.15s ease;
      }

      .sso-back-link:hover {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.06);
      }

      /* Main Page Wrapper */
      .pf-v5-c-login, .sso-page-shell {
        position: relative !important;
        z-index: 5 !important;
        min-height: 100vh !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        padding: 72px 16px 28px !important;
        box-sizing: border-box !important;
      }

      .pf-v5-c-login__container {
        width: 100% !important;
        max-width: 440px !important;
        margin: auto auto !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 0 !important;
        grid-template-columns: 1fr !important;
        grid-template-areas: "header" "main" "footer" !important;
      }

      .pf-v5-c-login__header {
        display: none !important;
      }

      /* Hero Pill */
      .sso-hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        margin-bottom: 12px;
      }

      .sso-hero-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #80ddd1;
        box-shadow: 0 0 8px #80ddd1;
      }

      .sso-hero-text {
        font-size: 11.5px;
        font-weight: 500;
        color: #d4d4d8;
        letter-spacing: -0.01em;
      }

      /* The Main Signin Card (Exact match to .signin-card in globals.css) */
      .pf-v5-c-login__main {
        width: 100% !important;
        max-width: 440px !important;
        background: #0c0c0c !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 14px !important;
        padding: 1.5rem !important;
        box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.04) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        box-sizing: border-box !important;
      }

      /* Card Header */
      .sso-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .sso-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #80ddd1;
        flex-shrink: 0;
      }

      .sso-card-title-group {
        display: flex;
        flex-direction: column;
      }

      .sso-card-title, h1#kc-page-title {
        font-family: var(--font-brand) !important;
        font-size: 1.05rem !important;
        font-weight: 600 !important;
        color: #ffffff !important;
        margin: 0 !important;
        letter-spacing: -0.01em !important;
        line-height: 1.3 !important;
      }

      .sso-card-subtitle {
        font-family: var(--font-mono) !important;
        font-size: 0.75rem !important;
        color: #888888 !important;
        margin-top: 0.25rem !important;
        letter-spacing: -0.01em !important;
      }

      .pf-v5-c-login__main-header {
        display: none !important;
      }

      /* Form Structure */
      .pf-v5-c-login__main-body,
      #kc-content, #kc-content-wrapper,
      #kc-form, #kc-form-wrapper,
      .pf-v5-c-form, #kc-form-login {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }

      .pf-v5-c-form__group {
        width: 100% !important;
        margin-bottom: 1.25rem !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .pf-v5-c-form__label, label {
        font-family: var(--font-body) !important;
        font-size: 0.8125rem !important;
        font-weight: 500 !important;
        color: #a1a1aa !important;
        margin-bottom: 0.5rem !important;
        display: block !important;
      }

      .pf-v5-c-form__label-text {
        color: #a1a1aa !important;
        font-weight: 500 !important;
      }

      /* Input Elements — Complete PatternFly Override */
      .pf-v5-c-form-control::before,
      .pf-v5-c-form-control::after,
      .pf-v5-c-input-group::before,
      .pf-v5-c-input-group::after {
        display: none !important;
        content: none !important;
        border: none !important;
      }

      .pf-v5-c-form-control {
        all: unset !important;
        display: flex !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .pf-v5-c-form-control input, #username {
        width: 100% !important;
        height: 44px !important;
        background: #141414 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 8px !important;
        color: #ffffff !important;
        font-family: var(--font-body) !important;
        font-size: 0.875rem !important;
        padding: 0 14px !important;
        outline: none !important;
        box-sizing: border-box !important;
        transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
      }

      .pf-v5-c-form-control input:focus, #username:focus {
        border-color: rgba(255, 255, 255, 0.4) !important;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
        background: #181818 !important;
      }

      /* Password input group (Single unified box) */
      .pf-v5-c-input-group {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        height: 44px !important;
        background: #141414 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
      }

      .pf-v5-c-input-group:focus-within {
        border-color: rgba(255, 255, 255, 0.4) !important;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
        background: #181818 !important;
      }

      .pf-v5-c-input-group__item.pf-m-fill {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        height: 100% !important;
      }

      .pf-v5-c-input-group .pf-v5-c-form-control,
      .pf-v5-c-input-group .pf-v5-c-form-control input {
        height: 100% !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 14px !important;
        width: 100% !important;
      }

      .pf-v5-c-input-group__item:not(.pf-m-fill) {
        flex: 0 0 auto !important;
        height: 100% !important;
      }

      .pf-v5-c-input-group button.pf-v5-c-button,
      .pf-v5-c-button.pf-m-control {
        all: unset !important;
        height: 100% !important;
        width: 44px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        color: #888888 !important;
        transition: color 0.15s ease !important;
      }

      .pf-v5-c-input-group button.pf-v5-c-button:hover {
        color: #ffffff !important;
      }

      /* Forgot Password Link */
      .pf-v5-c-form__helper-text {
        margin-top: 6px !important;
        text-align: right !important;
        width: 100% !important;
      }

      .pf-v5-c-helper-text__item-text a, a.sso-subtle-link {
        color: #888888 !important;
        font-size: 0.8125rem !important;
        font-weight: 500 !important;
        text-decoration: none !important;
        transition: color 0.15s ease !important;
      }

      .pf-v5-c-helper-text__item-text a:hover, a.sso-subtle-link:hover {
        color: #ffffff !important;
        text-decoration: underline !important;
      }

      /* Signature Stack & Scale White Primary Button (.signin-button in globals.css) */
      .pf-v5-c-form__actions {
        width: 100% !important;
        margin-top: 0.75rem !important;
      }

      button.pf-v5-c-button.pf-m-primary,
      #kc-login {
        all: unset !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 100% !important;
        height: 44px !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: var(--font-brand) !important;
        font-weight: 600 !important;
        font-size: 0.9375rem !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 150ms ease !important;
        box-sizing: border-box !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
      }

      button.pf-v5-c-button.pf-m-primary:hover,
      #kc-login:hover {
        background: #ededed !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15) !important;
      }

      button.pf-v5-c-button.pf-m-primary:active,
      #kc-login:active {
        transform: translateY(0) !important;
        background: #e4e4e7 !important;
      }

      /* Enterprise helper callout */
      .sso-helper-callout {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 0.875rem;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-top: 1.125rem;
      }

      .sso-helper-icon {
        color: #80ddd1;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .sso-helper-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 0.25rem 0;
      }

      .sso-helper-text {
        font-size: 0.75rem;
        color: #888888;
        line-height: 1.5;
        margin: 0;
      }

      /* Security Trust Badges */
      .sso-card-notes {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.875rem;
        margin-top: 1.125rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .sso-note-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .sso-note-icon {
        flex-shrink: 0;
      }

      .text-seafoam {
        color: #80ddd1;
      }

      .text-muted {
        color: #888888;
      }

      .sso-note-text {
        font-size: 0.75rem;
        color: #888888;
        letter-spacing: -0.01em;
      }

      /* Mobile Adaptation */
      @media (max-width: 480px) {
        .pf-v5-c-login, .sso-page-shell {
          padding: 80px 12px 32px !important;
        }
        .pf-v5-c-login__main {
          padding: 1.5rem 1.15rem !important;
        }
        .sso-top-nav {
          padding: 0 16px;
        }
      }
    </style>
</head>

<body id="keycloak-bg" class="${properties.kcBodyClass!} sso-body">

<!-- Architectural Blueprint Grid Backdrop -->
<div class="hero-backdrop" aria-hidden="true">
  <div class="hero-horizon"></div>
  <svg class="hero-grid-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="sso-grid-minor" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
      </pattern>
      <pattern id="sso-grid-major" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="url(#sso-grid-minor)" />
        <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(255, 255, 255, 0.065)" stroke-width="1" />
        <path d="M 0 3 L 0 -3 M -3 0 L 3 0" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />
        <path d="M 64 3 L 64 -3 M 61 0 L 67 0" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />
        <path d="M 0 67 L 0 61 M -3 64 L 3 64" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />
        <path d="M 64 67 L 64 61 M 61 64 L 67 64" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#sso-grid-major)" />
  </svg>
</div>

<!-- Top Sticky Brand Navbar Header -->
<nav class="sso-top-nav">
  <div class="sso-top-nav-inner">
    <a href="https://stackandscale.org" class="brand-logo-link" title="Stack & Scale">
        <svg class="brand-logo-icon" width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="8" y="72" width="48" height="12" rx="3" fill="#ffffff" fill-opacity="0.35" />
            <rect x="26" y="47" width="48" height="13" rx="3" fill="#ffffff" fill-opacity="0.6" />
            <rect x="44" y="22" width="48" height="14" rx="3" fill="#ffffff" />
        </svg>
        <span class="brand-logo-text">
            <span class="brand-part">Stack</span>
            <span class="brand-amp">&amp;</span>
            <span class="brand-part">Scale</span>
        </span>
    </a>
    <a href="https://stackandscale.org" class="sso-back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      <span>Back to Site</span>
    </a>
  </div>
</nav>

<div class="${properties.kcLogin!} sso-page-shell">
  <div class="${properties.kcLoginContainer!}">
    
    <!-- Main Card (.pf-v5-c-login__main) -->
    <main class="${properties.kcLoginMain!}">
      
      <!-- Card Header (.signin-card-header) -->
      <div class="sso-card-header">
        <div class="sso-icon-wrap" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-1.414 1.414L11 12l-4 4-2 2-1 3 3-1 2-2 4-4 6.586-6.586a2 2 0 0 0 0-2.828l-2.828-2.828a2 2 0 0 0-2.828 0Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
        </div>
        <div class="sso-card-title-group">
          <h1 class="sso-card-title" id="kc-page-title"><#nested "header"></h1>
          <span class="sso-card-subtitle">OpenID Connect &middot; 256-bit TLS Encrypted</span>
        </div>
      </div>

      <div class="${properties.kcLoginMainBody!}">
        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div class="sso-alert alert-${message.type}">
                <span>${kcSanitize(message.summary)?no_esc}</span>
            </div>
        </#if>

        <#nested "form">

        <#if auth?has_content && auth.showTryAnotherWayLink()>
          <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post" novalidate="novalidate">
              <input type="hidden" name="tryAnotherWay" value="on"/>
              <a id="try-another-way" href="javascript:document.forms['kc-select-try-another-way-form'].requestSubmit()" class="sso-subtle-link">
                    ${kcSanitize(msg("doTryAnotherWay"))?no_esc}
              </a>
          </form>
        </#if>

        <#if displayInfo>
          <div id="kc-info" class="${properties.kcSignUpClass!}">
              <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                  <#nested "info">
              </div>
          </div>
        </#if>
      </div>
    </main>

    <@loginFooter.content/>
  </div>
</div>

</body>
</html>
</#macro>
