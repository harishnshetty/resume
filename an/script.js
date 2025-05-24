// Copy playbook text to clipboard
function copyToClipboard() {
  const output = document.getElementById('output');
  output.select();
  output.setSelectionRange(0, 99999); // For mobile devices

  navigator.clipboard.writeText(output.value).then(() => {
    alert('Playbook copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy, please copy manually.');
  });
}

// Show/hide app option groups based on selection
function toggleAppOptions() {
  const selectedApp = document.getElementById('appSelect').value;

  document.getElementById('nginxOptions').style.display = 'none';
  document.getElementById('tomcatOptions').style.display = 'none';
  document.getElementById('httpdOptions').style.display = 'none';

  if (selectedApp === 'nginx') {
    document.getElementById('nginxOptions').style.display = 'block';
  } else if (selectedApp === 'tomcat') {
    document.getElementById('tomcatOptions').style.display = 'block';
  } else if (selectedApp === 'httpd') {
    document.getElementById('httpdOptions').style.display = 'block';
  }
}

function generatePlaybook() {
  const os = document.getElementById('osSelect').value;
  const app = document.getElementById('appSelect').value;

  let pkgManager = 'apt';
  if (os === 'amazon') pkgManager = 'yum';
  else if (os === 'redhat') pkgManager = 'dnf';

  let tasks = [];

  tasks.push(`# Target OS: ${os}`);
  tasks.push(`# Selected Application: ${app}`);

  // Common user creation
  if (document.getElementById('createUser')?.checked) {
    tasks.push(`- name: Create webadmin user
  user:
    name: webadmin
    state: present
    create_home: yes`);
  }

  // nginx tasks
  if (app === 'nginx') {
    if (document.getElementById('installNginx')?.checked) {
      tasks.push(`- name: Ensure Nginx is installed
  ${pkgManager}:
    name: nginx
    state: present
    update_cache: yes`);
    }
    if (document.getElementById('startNginx')?.checked) {
      tasks.push(`- name: Ensure Nginx is running
  service:
    name: nginx
    state: started
    enabled: yes`);
    }
    if (document.getElementById('stopNginx')?.checked) {
      tasks.push(`- name: Stop Nginx service
  service:
    name: nginx
    state: stopped
    enabled: no`);
    }
    if (document.getElementById('uninstallNginx')?.checked) {
      tasks.push(`- name: Uninstall Nginx
  ${pkgManager}:
    name: nginx
    state: absent`);
    }
    if (document.getElementById('createWebDir')?.checked) {
      tasks.push(`- name: Create web directory
  file:
    path: /var/www/html
    state: directory
    owner: www-data
    group: www-data
    mode: '0755'`);
    }
    if (document.getElementById('copyIndex')?.checked) {
      tasks.push(`- name: Copy index.html
  copy:
    src: index.html
    dest: /var/www/html/index.html
    owner: www-data
    group: www-data
    mode: '0644'`);
    }
  }

  // tomcat tasks
  if (app === 'tomcat') {
    if (document.getElementById('installTomcat')?.checked) {
      tasks.push(`- name: Install Tomcat
  ${pkgManager}:
    name: tomcat9
    state: present`);
    }
    if (document.getElementById('startTomcat')?.checked) {
      tasks.push(`- name: Start Tomcat service
  service:
    name: tomcat9
    state: started
    enabled: yes`);
    }
    if (document.getElementById('stopTomcat')?.checked) {
      tasks.push(`- name: Stop Tomcat service
  service:
    name: tomcat9
    state: stopped
    enabled: no`);
    }
    if (document.getElementById('uninstallTomcat')?.checked) {
      tasks.push(`- name: Uninstall Tomcat
  ${pkgManager}:
    name: tomcat9
    state: absent`);
    }
    if (document.getElementById('configureTomcat')?.checked) {
      tasks.push(`- name: Configure Tomcat
  template:
    src: tomcat.conf.j2
    dest: /etc/tomcat9/server.xml`);
    }
  }

  // httpd tasks
  if (app === 'httpd') {
    if (document.getElementById('installHttpd')?.checked) {
      tasks.push(`- name: Install HTTPD
  ${pkgManager}:
    name: httpd
    state: present`);
    }
    if (document.getElementById('startHttpd')?.checked) {
      tasks.push(`- name: Start HTTPD service
  service:
    name: httpd
    state: started
    enabled: yes`);
    }
    if (document.getElementById('stopHttpd')?.checked) {
      tasks.push(`- name: Stop HTTPD service
  service:
    name: httpd
    state: stopped
    enabled: no`);
    }
    if (document.getElementById('uninstallHttpd')?.checked) {
      tasks.push(`- name: Uninstall HTTPD
  ${pkgManager}:
    name: httpd
    state: absent`);
    }
  }

  // lamp tasks
  if (app === 'lamp') {
    if (document.getElementById('installLamp')?.checked) {
      // Install apache2, mysql-server, php (package names for ubuntu; adapt for other OSes as needed)
      tasks.push(`- name: Install Apache, MySQL and PHP
  ${pkgManager}:
    name:
      - apache2
      - mysql-server
      - php
    state: present
    update_cache: yes`);
    }
    if (document.getElementById('startLamp')?.checked) {
      tasks.push(`- name: Start Apache service
  service:
    name: apache2
    state: started
    enabled: yes

- name: Start MySQL service
  service:
    name: mysql
    state: started
    enabled: yes`);
    }
    if (document.getElementById('stopLamp')?.checked) {
      tasks.push(`- name: Stop Apache service
  service:
    name: apache2
    state: stopped
    enabled: no

- name: Stop MySQL service
  service:
    name: mysql
    state: stopped
    enabled: no`);
    }
    if (document.getElementById('uninstallLamp')?.checked) {
      tasks.push(`- name: Uninstall Apache, MySQL and PHP
  ${pkgManager}:
    name:
      - apache2
      - mysql-server
      - php
    state: absent`);
    }
  }

  const playbook = `- name: Auto-generated playbook for ${os} - ${app}
  hosts: localhost
  become: yes
  tasks:
${tasks.join('\n\n')}`;

  document.getElementById('output').value = playbook;
}

document.getElementById('lampOptions').style.display = 'none';

if (selectedApp === 'lamp') {
  document.getElementById('lampOptions').style.display = 'block';
}

// Initialize app options visibility on load
window.onload = () => {
  toggleAppOptions();
};
