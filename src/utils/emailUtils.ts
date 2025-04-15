
/**
 * Constructs a mailto link for sharing a proposal via email
 * @param proposalId - The ID of the proposal to share
 * @param baseUrl - Optional base URL for the proposal (defaults to window.location.origin)
 * @returns The constructed mailto URL string
 */
export const constructMailtoLink = (proposalId: string, baseUrl?: string) => {
  const origin = baseUrl || window.location.origin;
  const proposalUrl = `${origin}/proposal/print/${proposalId}`;
  
  const subject = encodeURIComponent("Your Painting Proposal from Paintergrowth.ai");
  const body = encodeURIComponent(
    `Hello,\n\nHere's your painting proposal:\n${proposalUrl}\n\nThank you for considering our services!`
  );
  
  return `mailto:?subject=${subject}&body=${body}`;
};
