const fsPromises = require('node:fs/promises');
const path = require('node:path');

const HOSTS_FILE = 'C:/Windows/System32/drivers/etc/hosts';
const LARAGON_WWW = 'C:/laragon/www';
const APACHE_SITES_ENABLED = 'C:/laragon/etc/apache2/sites-enabled';

module.exports.createVirtualHosts = async (hosts) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const [isCreatedFile, isCreatedFolders] = await Promise.all([
    createHostsFile(hosts),
    createLaragonFolders(hosts),
    createSitesEnabled(hosts),
  ]);

  return isCreatedFile && isCreatedFolders;
}

async function createHostsFile (hosts) {
  let content = '';
  content += '127.0.0.1 localhost\n'
  content += '::1 localhost\n';

  for (const host of hosts) {
    content += `127.0.0.1 ${host.name}\n`;
  }

  try {
    await fsPromises.writeFile(path.resolve(HOSTS_FILE), content);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function createLaragonFolders (hosts) {
  try {
    const directoryFiles = await fsPromises.readdir(path.resolve(LARAGON_WWW));
    
    for (const directory of directoryFiles) {
      const fullPath = path.join(LARAGON_WWW, directory);
      const stats = await fsPromises.stat(fullPath);
      const isDirectory = stats.isDirectory();

      if (!isDirectory) {
        continue;
      }

      await fsPromises.rm(fullPath, { recursive: true, force: true });
    }

    for (const host of hosts) {
      const fullPath = path.join(LARAGON_WWW, host.name);
      await fsPromises.mkdir(fullPath);
      await fsPromises.writeFile(path.join(fullPath, 'index.php'), `<h1>${host.name}</h1>`);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function createSitesEnabled (hosts) {
  try {
    const directoryFiles = await fsPromises.readdir(path.resolve(APACHE_SITES_ENABLED));

    for (const file of directoryFiles) {
      if (file === '00-default.conf' || file === 'ssl-conf.example') {
        continue;
      }

      const fullPath = path.join(APACHE_SITES_ENABLED, file);
      await fsPromises.rm(fullPath, { recursive: true, force: true });
    }

    for (const host of hosts) {
      const fullPath = path.join(APACHE_SITES_ENABLED, `${host.name}.conf`);
      const layout = createLayoutSite(host.path, host.name);
      await fsPromises.writeFile(fullPath, layout);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function createLayoutSite (path, name) {
  const layout = `define ROOT "${path}"
define SITE "${name}"

<VirtualHost *:80> 
    DocumentRoot "\${ROOT}"
    ServerName \${SITE}
    ServerAlias *.\${SITE}
    <Directory "\${ROOT}">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:443>
    DocumentRoot "\${ROOT}"
    ServerName \${SITE}
    ServerAlias *.\${SITE}
    <Directory "\${ROOT}">
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile      C:/laragon/etc/ssl/laragon.crt
    SSLCertificateKeyFile   C:/laragon/etc/ssl/laragon.key
 
</VirtualHost>
`;

  return layout;
}
