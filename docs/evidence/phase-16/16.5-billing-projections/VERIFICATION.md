# Phase 16.5 — billing projections

- Billing is a bounded projection keyed by a canonical invoice and source event;
  it does not invent payment truth or charge customers.
- The integration suite submits the same projection twice and asserts one
  stored invoice projection with the expected safe payment instruction.
