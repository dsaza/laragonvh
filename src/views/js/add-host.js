const $ = el => document.querySelector(el);

document.addEventListener('DOMContentLoaded', main);

function main() {
  const $formAddHost = $('#form-add-host');
  const $btnCancel = $('#btn-cancel');
  const $btnSubmit = $('#btn-submit');
  const $inputHost = $('#input-host');
  const $inputPath = $('#input-path');
  const $errorHost = $('#error-host');
  const $errorPath = $('#error-path');

  $inputHost.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9.-]/g, '');
    
    document.dispatchEvent(new CustomEvent('add-host:input'));

    $errorHost.classList.add('hidden');
    $errorHost.textContent = '';
    $inputHost.classList.remove('is-error');
  });

  $inputPath.addEventListener('input', (e) => {
    if (e.target.value.startsWith(' ')) {
      e.target.value = e.target.value.trim();
    }

    document.dispatchEvent(new CustomEvent('add-host:input'));

    $errorPath.classList.add('hidden');
    $errorPath.textContent = '';
    $inputPath.classList.remove('is-error');
  });

  $btnCancel.addEventListener('click', () => {
    $formAddHost.reset();
    $btnSubmit.setAttribute('disabled', 'disabled');
    
    $errorHost.classList.add('hidden');
    $errorHost.textContent = '';
    $inputHost.classList.remove('is-error');

    $errorPath.classList.add('hidden');
    $errorPath.textContent = '';
    $inputPath.classList.remove('is-error');

    laragonvh.closeAddHostWindow();
  });

  document.addEventListener('add-host:input', () => {
    const host = $inputHost.value.trim();
    const path = $inputPath.value.trim();

    if (host.length < 1 || path.length < 1) {
      $btnSubmit.setAttribute('disabled', 'disabled');
      return;
    }

    if (host.indexOf('.') === -1) {
      $btnSubmit.setAttribute('disabled', 'disabled');
      return;
    }
    
    if (host.endsWith('.')) {
      $btnSubmit.setAttribute('disabled', 'disabled');
      return;
    }

    if (host.indexOf('..') !== -1) {
      $btnSubmit.setAttribute('disabled', 'disabled');
      return;
    }

    $btnSubmit.removeAttribute('disabled');
  });

  $formAddHost.addEventListener('submit', async (e) => {
    e.preventDefault();
    let errors = 0;

    const host = $inputHost.value.trim();
    const path = $inputPath.value.trim();

    const existFolder = await laragonvh.existFolder(path);
    
    if (!existFolder) {
      $errorPath.textContent = 'The path does not exist.';
      $errorPath.classList.remove('hidden');
      $inputPath.classList.add('is-error');
      $inputPath.focus();
      
      errors++;
    }

    if (existHostName(host)) {
      $errorHost.textContent = 'The host name already exists.';
      $errorHost.classList.remove('hidden');
      $inputHost.classList.add('is-error');
      $inputHost.focus();
      
      errors++;
    }

    if (errors > 0) {
      return;
    }

    const newHost = {
      name: host.toLowerCase(),
      path: parsePath(path),
    };

    saveNewHost(newHost);

    $errorHost.classList.add('hidden');
    $errorHost.textContent = '';
    $inputHost.classList.remove('is-error');

    $errorPath.classList.add('hidden');
    $errorPath.textContent = '';
    $inputPath.classList.remove('is-error');

    $formAddHost.reset();
    $btnSubmit.setAttribute('disabled', 'disabled');

    laragonvh.closeAddHostWindow();
  });

}

function existHostName (hostName) {
  const hosts = getHosts();
  return hosts.find(host => host.name.toLowerCase() === hostName.toLowerCase()) ? true : false;
}

function saveNewHost(host) {
  const hosts = getHosts();
  hosts.push(host);
  localStorage.setItem('hosts', JSON.stringify(hosts));
}

function parsePath (path) {
  return path.replace(/\\/g, '/');
}

function getHosts() {
  const hosts = localStorage.getItem('hosts');
  return hosts ? JSON.parse(hosts) : [];
}