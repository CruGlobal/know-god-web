interface Page {
  parentPage?: { position?: string | number };
}

export function shouldShowBackButton(page: Page): boolean {
  return page.parentPage?.position !== undefined;
}

export function navigateBackIfPossible(
  page: Page,
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
