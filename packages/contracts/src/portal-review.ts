export type PortalReviewRequest = Readonly<{
  assignedUserId: string;
  status: string;
  expiresAt: string;
  targetVersion: string;
  renderedChecksumSha256: string;
}>;

/** A portal decision is valid only for the exact still-open review version. */
export function authorizePortalReviewDecision(
  input: Readonly<{
    actorId: string;
    review: PortalReviewRequest | null;
    now: string;
    targetVersion: string;
    renderedChecksumSha256: string;
  }>,
): boolean {
  const { actorId, review } = input;
  return (
    review !== null &&
    review.assignedUserId === actorId &&
    review.status === "open" &&
    Date.parse(review.expiresAt) > Date.parse(input.now) &&
    review.targetVersion === input.targetVersion &&
    review.renderedChecksumSha256 === input.renderedChecksumSha256
  );
}
