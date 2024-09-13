const $ = el => document.querySelector(el);

document.addEventListener('DOMContentLoaded', main);
window.addEventListener('storage', printHosts);

function main() {
  const $btnNew = $('#btn-new');
  const $btnSync = $('#btn-sync');

  printHosts();
  
  $btnNew.addEventListener('click', () => {
    laragonvh.showAddHostWindow();
  });

  $btnSync.addEventListener('click', syncHosts);
  laragonvh.onSyncHosts(syncHosts);
}

async function syncHosts() {
  const $btnNew = $('#btn-new');
  const $btnSync = $('#btn-sync');

  document.body.classList.add('is-sync');
  $btnSync.setAttribute('disabled', 'disabled');
  $btnNew.setAttribute('disabled', 'disabled');

  const hosts = getHosts();
  const isSynced = await laragonvh.syncHosts(hosts);
  
  if (!isSynced) {
    alert('An error occurred while syncing hosts');
  }

  $btnSync.removeAttribute('disabled');
  $btnNew.removeAttribute('disabled');
  document.body.classList.remove('is-sync');
}

function printHosts() {
  const $listHosts = $('#list-hosts');
  const $noResults = $('#no-results');

  const hosts = getOrderHosts();

  $listHosts.classList.add('hidden');
  $noResults.classList.add('hidden');

  $listHosts.innerHTML = '';

  if (hosts.length > 0) {
    const $list = document.createElement('ul');
    $list.classList.add('list');

    hosts.forEach(host => {
      const item = document.createElement('li');
      item.classList.add('list-item');

      const content = document.createElement('div');
      content.classList.add('list-content');

      const title = document.createElement('h6');
      title.textContent = host.name;

      const text = document.createElement('p');
      text.textContent = host.path;

      content.appendChild(title);
      content.appendChild(text);

      const buttons = document.createElement('div');
      buttons.classList.add('list-buttons');

      const buttonDelete = document.createElement('button');
      buttonDelete.classList.add('list-btn-remove');
      buttonDelete.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      `;

      buttonDelete.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete the host ${host.name}?`)) {
          deleteHost(host.name);
        }
      });

      buttons.appendChild(buttonDelete);

      item.appendChild(content);
      item.appendChild(buttons);

      $list.appendChild(item);
    });

    $listHosts.appendChild($list);
    $listHosts.classList.remove('hidden');
  } else {
    $noResults.classList.remove('hidden');
  }
}

function getOrderHosts() {
  const hosts = getHosts();
  hosts.sort((a, b) => a.name.localeCompare(b.name));
  return hosts;
}

function getHosts() {
  const hosts = localStorage.getItem('hosts');
  return hosts ? JSON.parse(hosts) : [];
}

function deleteHost(hostName) {
  const hosts = getHosts();
  const newHosts = hosts.filter(host => host.name.toLowerCase() !== hostName.toLowerCase());
  localStorage.setItem('hosts', JSON.stringify(newHosts));
  printHosts();
}
