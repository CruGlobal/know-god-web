export function shouldShowBackButton(page: {
  parentPage?: { position?: any };
}): boolean {
  return !!page.parentPage?.position;
}

export function navigateBackIfPossible(
  page: { parentPage?: { position?: any } },
  ready: boolean,
  showBackButton: boolean,
  navigateFn: (position: any) => void
): void {
  if (!ready || !showBackButton) return;
  if (page.parentPage?.position !== undefined) {
    navigateFn(page.parentPage.position);
  }
}
