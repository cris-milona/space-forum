//variables
const dropIcon = document.querySelector('[data-menu-dropdown-icon]');
const nav = document.querySelector('[data-menu-navbar]');
const menu = document.querySelector('[data-menu]');
const logoutBtn = document.querySelector('[data-btn-logout]');
const searchTopicBtn = document.querySelector('[data-topic-search-btn]');
const deleteAccountBtn = document.querySelector('[data-delete-account-btn]');
const deleteAvatarBtn = document.querySelector('[data-delete-avatar-btn]');
const deletePostBtns = document.querySelectorAll('[data-delete-post-btn]');

//logout btn
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await axios.post('/logout');
    window.location.href = '/signin';
  });
}

//search topic button
if (searchTopicBtn) {
  searchTopicBtn.addEventListener('click', async () => {
    await axios.post('/topics/search');
    window.location.href = '/topics/search';
  });
}

// Delete account button
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', async () => {
    await axios.delete('/account/delete');
    window.location.href = '/signup';
  });
}

// Delete avatar button
if (deleteAvatarBtn) {
  deleteAvatarBtn.addEventListener('click', async () => {
    await axios.delete('/users/me/avatar');
    window.location.href = '/account';
  });
}

//delete a post by the user
if (deletePostBtns.length > 0) {
  deletePostBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener('click', () => {
      axios.delete(`/posts/delete/${deleteBtn.dataset.deletePostBtn}`);
      window.location.href = '/account';
    });
  });
}

// Dropdown menu functionallity
menu.addEventListener('click', () => {
  nav.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target)) {
    nav.classList.remove('active');
  }
});

//intersection observer for the nav bar
const mainHeader = document.querySelector('[data-main-heading]');
const header = document.querySelector('[data-header]');

const options = {
  rootMargin: '-200px',
};

const headerObserver = new IntersectionObserver((entries, headerObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      header.classList.add('opaque');
    } else {
      header.classList.remove('opaque');
    }
  });
}, options);

headerObserver.observe(mainHeader);
