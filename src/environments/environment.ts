// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://34.240.133.118/admin/ajax/?action=',
  socketUrl: 'http://34.240.133.118:58080',
  socketScoreUrl: 'https://score.allexch.com:443',
  port: 58080
};
