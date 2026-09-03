import type { AuthContentModel } from "./auth-content";
import { Lock, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type SigninViewProps = {
  model: AuthContentModel;
};

export function SigninView({ model }: SigninViewProps) {
  return (
    <section className="signin" aria-labelledby="signin-heading">
      <div className="signin-container">
        <div className="signin-copy">
          <div className="signin-badge">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <p className="eyebrow">{model.eyebrow}</p>
          </div>
          <h1 id="signin-heading">{model.heading}</h1>
          <p className="signin-description">{model.description}</p>
        </div>

        <div className="signin-card">
          <div className="signin-card-header">
            <div className="signin-icon-wrap" aria-hidden="true">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="signin-card-title-group">
              <h2 className="signin-card-title">Staff Single Sign-On</h2>
              <span className="signin-card-subtitle">
                Keycloak OIDC &middot; 256-bit TLS Encrypted
              </span>
            </div>
          </div>

          <div className="signin-action-box">
            <Button
              className="signin-button"
              render={<a href="/api/auth/oidc/start" />}
            >
              <span>{model.primaryAction}</span>
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </div>

          <div className="signin-notes">
            <div className="signin-note-item">
              <ShieldCheck
                className="signin-note-icon text-petrol"
                aria-hidden="true"
              />
              <p className="signin-provider-note">{model.providerNote}</p>
            </div>
            <div className="signin-note-item">
              <Lock
                className="signin-note-icon text-muted"
                aria-hidden="true"
              />
              <p className="signin-legal-note">{model.legalNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
