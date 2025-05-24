function generatePlaybook() {
  const os = document.getElementById('osSelect').value;

  // Choose package manager based on OS
  let pkgManager = 'apt';
  if (os === 'amazon') pkgManager = 'yum';
  else if (os === 'redhat') pkgManager = 'dnf';

  let tasks = [];

  tasks.push(`# Target OS: ${os}`);

  if (document.getElementById('createUser').checked) {
    tasks.push(`- name: Create webadmin user
  user:
    name: webadmin
    state: present
    create_home: yes`);
  }

  if (document.getElementById('installNginx').checked) {
    tasks.push(`- name: Ensure Nginx is installed
  ${pkgManager}:
    name: nginx
    state: present
    update_cache: yes`);
  }

  if (document.getElementById('startNginx').checked) {
    tasks.push(`- name: Ensure Nginx is running
  service:
    name: nginx
    state: started
    enabled: yes`);
  }

  if (document.getElementById('createWebDir').checked) {
    tasks.push(`- name: Create web directory
  file:
    path: /var/www/html
    state: directory
    owner: www-data
    group: www-data
    mode: '0755'`);
  }

  if (document.getElementById('copyIndex').checked) {
    tasks.push(`- name: Copy index.html
  copy:
    src: index.html
    dest: /var/www/html/index.html
    owner: www-data
    group: www-data
    mode: '0644'`);
  }

  const playbook = `- name: Auto-generated playbook for ${os}
  hosts: localhost
  become: yes
  tasks:
${tasks.join('\n\n')}`;

  document.getElementById('output').value = playbook;
}
