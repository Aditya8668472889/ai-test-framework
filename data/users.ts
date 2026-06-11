import * as dotenv from 'dotenv';
dotenv.config();

// Single shared password for all SauceDemo accounts.
// process.env first, fallback second — so the suite runs even with no .env (rule #4/#7).
const PASSWORD = process.env.TEST_PASSWORD || 'secret_sauce';

export const Users = {
  // The "happy path" account — username overridable via .env
  standard: {
    username: process.env.TEST_USERNAME || 'standard_user',
    password: PASSWORD,
  },

  // SauceDemo's intentionally locked account
  locked: {
    username: process.env.TEST_LOCKED_USERNAME || 'locked_out_user',
    password: PASSWORD,
  },

  // Valid username, deliberately wrong password (negative test)
  invalid: {
    username: process.env.TEST_USERNAME || 'standard_user',
    password: process.env.TEST_INVALID_PASSWORD || 'wrongpassword',
  },

  // Empty username (negative test) — intentionally blank, nothing to inject
  emptyUsername: {
    username: '',
    password: PASSWORD,
  },
};
