const core = require('@actions/core');
const {deployForEnv} = require('pm2-deploy');

init();

async function init() {
  try {
    const get = core.getInput;
 
    const options = {
      configFile: get('configFile')||process.env.CONFIG_FILE,
      environment: get('environment'),
      command: get('command')
    };

    
    
   console.log(options);

    runPM2(options);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function runPM2(options={}) {
  options.configFile=options.configFile||'ecosystem.config.js';
  
  options.environment=options.environment||'development';
  options.command=options.command||'update';
  deployForEnv(require(options.configFile).deploy,options.environment,[
    options.configFile,options.environment,options.command
  ],    (err,data)=> {
    if (err ) {
      core.setFailed('PM2 run failed!' + (err || ''));
    }
  });
}
