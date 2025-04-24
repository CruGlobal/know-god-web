export function shouldShowBackButton(page: {
  parentPage?: { position?: number };
}): boolean {
  return page.parentPage?.position !== undefined;
}

export function navigateBackIfPossible(
  page: { parentPage?: { position?: number } },
  ready: boolean,
  showBackButton: boolean,
  navigateFn: (position: number) => void
): void {
  if (!ready || !showBackButton) return;
  if (page.parentPage?.position !== undefined) {
    navigateFn(page.parentPage.position);
  }
}
