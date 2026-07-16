/** Site-wide configuration */
export const SITE_URL = "https://modelx.anyllmtoken.com";
export const API_URL = "https://modelx.anyllmtoken.com";

/** GitHub repository */
export const REPO_URL = "https://github.com/anyllmtoken/modelx-web";
export const ISSUES_URL = `${REPO_URL}/issues`;
export const NEW_ISSUE_URL = `${ISSUES_URL}/new`;
export const COMMIT_URL = (hash: string) => `${REPO_URL}/commit/${hash}`;
