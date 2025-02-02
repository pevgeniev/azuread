export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: '021c83c1-d0d2-4128-abf8-fdda7f9a2d5d',
      authority: 'https://login.microsoftonline.com/common',
    },
  },
  apiConfig: {
    scopes: ['user.read', 'openid', 'email', 'profile'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
};
