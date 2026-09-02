import type { AuthContentModel } from "./auth-content";

import { Button } from "@/components/ui/button";

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

      <div className="signin-card">
        <Button render={<a href="/api/auth/oidc/start" />}>
          {model.primaryAction}
        </Button>
        <p className="signin-provider-note">{model.providerNote}</p>
        <p className="signin-legal-note">{model.legalNote}</p>
      </div>
    </section>
  );
}
