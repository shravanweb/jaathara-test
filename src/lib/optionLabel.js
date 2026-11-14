/** Visible option-section wording, e.g. Choice of protein -> Select protein. */
export function optionNoun(label) {
  const raw = String(label || 'protein').trim();
  const stripped = raw.replace(/^choice of\s+/i, '').trim() || 'protein';
  return stripped;
}

export function selectOptionLabel(label) {
  const noun = optionNoun(label);
  const rest = noun.charAt(0).toLowerCase() + noun.slice(1);
  return 'Select ' + rest;
}
