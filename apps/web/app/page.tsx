import { healthPageModel } from '../src/health-page.js'

export default function HomePage() {
  return (
    <main>
      <h1>{healthPageModel.heading}</h1>
      <p role="status" aria-live="polite">
        {healthPageModel.message}
      </p>
    </main>
  )
}
