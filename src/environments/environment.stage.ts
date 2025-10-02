export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'ff50e6fb-1299-44ef-84d2-0b46429d33b9',
      authority: 'https://login.microsoftonline.com/3d461195-f3e9-4dd6-b2e8-ea8457c20fc8',
    },
    scopes: ['ff50e6fb-1299-44ef-84d2-0b46429d33b9/.default'],
  },
  apiConfig: {
    scopes: ['user.read', 'openid', 'email', 'profile'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
  backendConfig: {
    scopes: ['api://ff50e6fb-1299-44ef-84d2-0b46429d33b9/DevOcean.ReadWrite'],
    uri: 'https://localhost:7108',
  },
  powerBIConfig:{
    scopes: ['https://analysis.windows.net/powerbi/api/.default',
    ],
    uri: 'https://api.powerbi.com'
  },
  groups:{
    admin: "ee4fc09d-ae1f-4e87-9036-8a6efd95c71b",
    user: "76206681-b03d-4b4c-8d53-dcb799badcdb"
  }
};
