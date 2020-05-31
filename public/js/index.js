import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
//DOM ELEMENTS
const updateButton = document.querySelector('.form-user-data');
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.formLogin');
const logoutButton = document.querySelector('.nav__el--logout');
const passwordChange = document.querySelector('.form-user-password');
const bookingButton = document.getElementById('book-tour');
//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (passwordChange) {
  passwordChange.addEventListener('submit', async event => {
    event.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating....';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (updateButton) {
  updateButton.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(); // creating a enctype-form-data
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (bookingButton) {
  bookingButton.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
