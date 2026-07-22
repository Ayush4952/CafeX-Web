# CafeX pages

- `Home.jsx` is the CafeX application entry used by the hosted route.
- `About.jsx` and `Contact.jsx` contain public café information.
- `Login.jsx` and `Register.jsx` provide authentication forms.
- `User.jsx` and `EditUser.jsx` provide account views.
- `ErrorFound.jsx` provides the not-found state.

Shared login, cart, menu, and dashboard state remains coordinated by
`src/App.jsx` so it persists while a customer moves between views.
