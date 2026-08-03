import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.PUBLIC_COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: import.meta.env.PUBLIC_COGNITO_DOMAIN,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [import.meta.env.PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:4321/'],
          redirectSignOut: [import.meta.env.PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:4321/'],
          responseType: 'code',
          providers: ['Google'],
        },
      },
    },
  },
});
