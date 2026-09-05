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
    <title>${msg("loginTitle",(realm.displayName!'Stack & Scale Identity'))}</title>
    <link rel="icon" type="image/svg+xml" href="${url.resourcesPath}/img/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}?v=${.now?long}" rel="stylesheet" />
        </#list>
    </#if>
    <style>
      .pf-v5-c-login {
        --pf-v5-c-login__container--PaddingLeft: 0 !important;
        --pf-v5-c-login__container--PaddingRight: 0 !important;
        --pf-v5-c-login__container--MaxWidth: 440px !important;
      }
      .pf-v5-c-login__container, .sso-container {
        width: 100% !important;
        max-width: 440px !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-inline-start: 0 !important;
        padding-inline-end: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        grid-template-columns: 1fr !important;
        grid-template-areas: "header" "main" "footer" !important;
      }
      .pf-v5-c-login__main, .sso-glass-card {
        width: 100% !important;
        max-width: 440px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        box-sizing: border-box !important;
      }
      .pf-v5-c-login__main-body, .sso-card-body,
      #kc-content, #kc-content-wrapper,
      #kc-form, #kc-form-wrapper,
      .pf-v5-c-form, #kc-form-login {
        width: 100% !important;
        max-width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .pf-v5-c-form__group {
        width: 100% !important;
        margin-bottom: 18px !important;
      }
      .pf-v5-c-form-control::before, .pf-v5-c-form-control::after {
        display: none !important;
      }
      .pf-v5-c-form-control {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 44px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.13) !important;
        border-radius: 9px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .pf-v5-c-form-control:focus-within {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        background: rgba(255, 255, 255, 0.06) !important;
      }
      .pf-v5-c-form-control input, #username, #password {
        flex: 1 1 100% !important;
        width: 100% !important;
        min-width: 0 !important;
        height: 100% !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        color: #ffffff !important;
        font-size: 14px !important;
        padding: 0 14px !important;
      }
      .pf-v5-c-input-group {
        display: flex !important;
        width: 100% !important;
        height: 44px !important;
      }
      .pf-v5-c-input-group__item.pf-m-fill {
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
      .pf-v5-c-input-group .pf-v5-c-form-control {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-right: none !important;
      }
      .pf-v5-c-input-group button.pf-v5-c-button, .pf-v5-c-button.pf-m-control {
        height: 44px !important;
        width: 44px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.13) !important;
        border-left: none !important;
        border-radius: 0 9px 9px 0 !important;
        color: #71717a !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .pf-v5-c-form__actions,
      button.pf-v5-c-button.pf-m-primary,
      #kc-login {
        width: 100% !important;
        height: 44px !important;
      }
    </style>
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
</head>

<body id="keycloak-bg" class="${properties.kcBodyClass!} stack-and-scale-sso">

<div class="ambient-glow ambient-glow-1" aria-hidden="true"></div>
<div class="ambient-glow ambient-glow-2" aria-hidden="true"></div>
<div class="grid-background" aria-hidden="true"></div>

<div class="${properties.kcLogin!} sso-page-shell">
  <div class="${properties.kcLoginContainer!} sso-container">
    <header id="kc-header" class="pf-v5-c-login__header sso-brand-header">
      <div id="kc-header-wrapper" class="sso-brand-wrapper">
        <a href="https://stackandscale.org" class="brand-logo-link" title="Stack & Scale">
            <svg class="brand-logo-icon" width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
        <p class="brand-subtitle">Enterprise Sovereign Identity</p>
      </div>
    </header>
    <main class="${properties.kcLoginMain!} sso-glass-card">
      <div class="${properties.kcLoginMainHeader!} sso-card-header">
        <h1 class="${properties.kcLoginMainTitle!} sso-page-title" id="kc-page-title"><#nested "header"></h1>
        <#if realm.internationalizationEnabled && locale.supported?size gt 1>
        <div class="${properties.kcLoginMainHeaderUtilities!}">
          <div class="${properties.kcInputClass!}">
            <select
              aria-label="${msg("languages")}"
              id="login-select-toggle"
              onchange="if (this.value) window.location.href=this.value"
            >
              <#list locale.supported?sort_by("label") as l>
                <option
                  value="${l.url}"
                  ${(l.languageTag == locale.currentLanguageTag)?then('selected','')}
                >
                  ${l.label}
                </option>
              </#list>
            </select>
            <span class="${properties.kcFormControlUtilClass}">
              <span class="${properties.kcFormControlToggleIcon!}">
                <svg
                  class="pf-v5-svg"
                  viewBox="0 0 320 512"
                  fill="currentColor"
                  aria-hidden="true"
                  role="img"
                  width="1em"
                  height="1em"
                >
                  <path
                    d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
                  >
                  </path>
                </svg>
              </span>
            </span>
          </div>
        </div>
        </#if>
      </div>
      <div class="${properties.kcLoginMainBody!} sso-card-body">
        <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
            <#if displayRequiredFields>
                <div class="${properties.kcContentWrapperClass!}">
                    <div class="${properties.kcLabelWrapperClass!} subtitle">
                        <span class="${properties.kcInputHelperTextItemTextClass!}">
                          <span class="${properties.kcInputRequiredClass!}">*</span> ${msg("requiredFields")}
                        </span>
                    </div>
                </div>
            </#if>
        <#else>
            <#if displayRequiredFields>
                <div class="${properties.kcContentWrapperClass!}">
                    <div class="${properties.kcLabelWrapperClass!} subtitle">
                        <span class="${properties.kcInputHelperTextItemTextClass!}">
                          <span class="${properties.kcInputRequiredClass!}">*</span> ${msg("requiredFields")}
                        </span>
                    </div>
                    <div class="${properties.kcFormClass} ${properties.kcContentWrapperClass}">
                        <#nested "show-username">
                        <@username />
                    </div>
                </div>
            <#else>
                <div class="${properties.kcFormClass} ${properties.kcContentWrapperClass}">
                  <#nested "show-username">
                  <@username />
                </div>
            </#if>
        </#if>

        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div class="${properties.kcAlertClass!} pf-m-${(message.type = 'error')?then('danger', message.type)} sso-alert">
                <div class="${properties.kcAlertIconClass!}">
                    <#if message.type = 'success'><span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
                    <#if message.type = 'warning'><span class="${properties.kcFeedbackWarningIcon!}"></span></#if>
                    <#if message.type = 'error'><span class="${properties.kcFeedbackErrorIcon!}"></span></#if>
                    <#if message.type = 'info'><span class="${properties.kcFeedbackInfoIcon!}"></span></#if>
                </div>
                <span class="${properties.kcAlertTitleClass!} kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
            </div>
        </#if>

        <#nested "form">

        <#if auth?has_content && auth.showTryAnotherWayLink()>
          <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post" novalidate="novalidate">
              <input type="hidden" name="tryAnotherWay" value="on"/>
              <a id="try-another-way" href="javascript:document.forms['kc-select-try-another-way-form'].requestSubmit()"
                  class="${properties.kcButtonSecondaryClass} ${properties.kcButtonBlockClass} ${properties.kcMarginTopClass} sso-subtle-link">
                    ${kcSanitize(msg("doTryAnotherWay"))?no_esc}
              </a>
          </form>
        </#if>

        <#if displayInfo>
          <div id="kc-info" class="${properties.kcSignUpClass!} sso-card-info">
              <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                  <#nested "info">
              </div>
          </div>
        </#if>
      </div>
      <div class="pf-v5-c-login__main-footer">
        <#nested "socialProviders">
      </div>

      <div class="sso-footer-badges">
        <span class="badge-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Zero-Trust SSO
        </span>
        <span class="badge-separator">&bull;</span>
        <span class="badge-item">FIDO2 / WebAuthn</span>
        <span class="badge-separator">&bull;</span>
        <span class="badge-item">Self-Hosted Sovereign</span>
      </div>
    </main>

    <@loginFooter.content/>
  </div>
</div>
</body>
</html>
</#macro>
