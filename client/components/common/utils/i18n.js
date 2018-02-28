export function i18n(id = '', defaultMessage) {
  return defaultMessage !== undefined ? defaultMessage : id;
}
