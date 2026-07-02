export const acquiringDraftScope = (username, merchantId) =>
  `${username || 'anonymous'}:${merchantId || 'none'}`;

export const acquiringDraftKey = (name, username, merchantId) =>
  `${name}:${acquiringDraftScope(username, merchantId)}`;
