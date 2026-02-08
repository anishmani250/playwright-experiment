export const UserSearchLocators = {
  // Input
  searchBarTestId: 'search-bar',

  // Button label (use getByRole + hasText)
  searchButtonText: /search/i,

  // UI validation strategy
  userLinkRole: 'link' as const,
};