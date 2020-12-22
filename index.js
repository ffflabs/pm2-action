const core = require('@actions/core');
const {deployForEnv} = require('pm2-deploy');
const fs = require('fs');
const path = require('path');
const tv4 = require('tv4');

const schema = {
  type: 'object',
  properties: {
    user: {type: 'string', minLength: 1},
    host: {type: ['string', 'array']},
    repo: {type: 'string'},
    path: {type: 'string'},
    ref: {type: 'string'},
    fetch: {type: 'string'},
  },
  required: ['host', 'repo', 'path', 'ref'],
};
init();

async function init() {
  try {
    const get = core.getInput;

    const options = {
      configFile: get('configFile') || process.env.CONFIG_FILE,
      environment: get('environment') || process.env.DEPLOY_ENVIRONMENT,
      host: get('host') || process.env.DEPLOY_HOST,
      pathname: get('path') || process.env.DEPLOY_PATH,
      repo: get('repo') || process.env.DEPLOY_REPO_URL,
      user: get('user') || process.env.DEPLOY_USER,
      key: get('key') || process.env.DEPLOY_KEY_FILE,
      ref: get('ref') || process.env.DEPLOY_BRANCH,
      command: get('command') || process.env.DEPLOY_COMMAND,
      'post-deploy': get('postDeploy') || process.env.POST_DEPLOY,
    };

    console.log(options);

    runPM2(options);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function runPM2(options = {}) {
  let {
      host,
      pathname,
      repo,
      user,
      key,
      ref,
      environment = 'development',
      command = 'update',
      configFile = 'ecosystem.config.js',
      appName,
    } = options,
    placeholder = {},
    envConfig = {
      host,
      path: pathname,
      repo,
      user,
      key,
      ref,
      'post-deploy': options['post-deploy'],
    };
  placeholder[environment] = envConfig;
  if (command === 'dry') {
    core.debug(JSON.stringify(envConfig));
    return;
  }
  var result = tv4.validateResult(envConfig, schema);
  if (!result.valid) {
    return core.setFailed(result.error);
  }
  if (!fs.existsSync(configFile)) {
    core.debug(JSON.stringify(path.parse(configFile)));
    //core.setCommandEcho
    configFile = `.temp_config.json`;

    fs.writeFileSync(configFile, JSON.stringify(placeholder, null, 4));
  }
  try {
    deployForEnv(
      placeholder,
      environment,
      [configFile, environment, command],
      (err, data) => {
        if (err) {
          core.setFailed('PM2 run failed!' + (err || ''));
        }
      }
    );
  } catch (error) {
    console.warn(error);
    core.setFailed(error.message);
  }
}
