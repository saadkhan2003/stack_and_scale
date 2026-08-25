import type { AuthContentModel } from "./auth-content";

type SigninViewProps = {
  model: AuthContentModel;
};

export function SigninView({ model }: SigninViewProps) {
  return (
    <section className="signin" aria-labelledby="signin-heading">
      <div className="signin-copy">
        <p className="eyebrow">{model.eyebrow}</p>
        <h1 id="signin-heading">{model.heading}</h1>
        <p>{model.description}</p>
      </div>

      <form className="signin-card" action="/api/auth/oidc/start" method="post">
        <label htmlFor="signin-email">{model.emailLabel}</label>
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={model.emailPlaceholder}
          required
        />
        <button className="button button-primary" type="submit">
          {model.primaryAction}
        </button>
        <p className="signin-provider-note">{model.providerNote}</p>
        <p className="signin-legal-note">{model.legalNote}</p>
      </form>
    </section>
  );
}
