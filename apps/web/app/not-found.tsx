import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div>
        <h1>404</h1>
        <h2>This page could not be found.</h2>
        <Button render={<a href="/" />}>
          Return home <span aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  );
}
