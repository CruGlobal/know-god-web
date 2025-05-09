export function shouldShowBackButton(page: {
  parentPage?: { position?: string | number };
}): boolean {
  return page.parentPage?.position !== undefined;
}

export function navigateBackIfPossible(
  page: { parentPage?: { position?: string | number } },
  ready: boolean,
  showBackButton: boolean,
  navigateFn: (position: string | number) => void
): void {
  if (!ready || !showBackButton) {
    return;
  }
  if (page.parentPage?.position !== undefined) {
    navigateFn(page.parentPage.position);
  }
}
