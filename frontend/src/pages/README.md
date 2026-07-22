# CafeX pages

CafeX currently uses one responsive application shell with five views: Home,
Menu, Customer Dashboard, Orders, and Admin. `Home.tsx` is the route entry point;
the view-specific UI is coordinated by `app/cafex-app.tsx` so the cart and login
state remain shared when a customer moves between views.
