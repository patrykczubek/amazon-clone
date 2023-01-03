<br />
<p align="center">
  <a href="https://github.com/anilsenay/next-e-commerce">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZornJjUkPW2iXeEM45RhLrXC51Br53ui7wg&usqp=CAU" alt="Header photo" >
  </a>

  <h3 align="center">Amazon Clone in NextJS</h3>
  
  <h4 align="center">Demo: <a href="https://amazon-clone-khaki-ten.vercel.app/">https://amazon-clone-khaki-ten.vercel.app/</a></h4>

  <p align="center">
    An Amazon Clone website example built with NextJS. For now it's called an amazon clone, but maybe in the future I might repurpose the entire project into a different name and style.
    <br />
  There are still a lot of things to be <b>fixed</b>, was focusing on the backend more since frontend is not my thing.
    <br />
    <br />
    <a href="https://twitter.com/xpatrykc">Contact me</a>
    ·
    <a href="https://github.com/patrykczubek/amazon-clone/issues">Report Bug/Request Feature</a>
  </p>
</p>

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Issues / Feature Plans](#issues---future-plans)
- [Contributing - Feature Requests](#contributing---feature-requests)
- [License](#license)

## About The Project

I was really bored so I just decided I would create somewhat of an Amazon Clone. I was only doing backend since I realized I didn't have that much time to play around with the frontend. A lot of features are not very well tested.

<b>Some Features:</b>
- Server-Side Rendering
- Form Validation using React Hook Form
- Peermission based lists
- Cart:
  - Removing from cart, adding to cart, changing quantity, moving to save for later, adding to a list, and checkout.
- Account:
  - Account Info(not finished), Prime(not added), Changing password, Lists, Addresses, Payment Methods
- Searchbar using Algolia
- Search results using Algolia
- Order history:
  - Track, Return or Replace, Share Gift Receipt, Leave Seller Feedback (Not implemented yet)
- Many more...

### Built With

- [React](https://reactjs.org)
- [NextJS](https://nextjs.org/)
- [Next-Firebase-Auth](https://github.com/gladly-team/next-firebase-auth)
- [Firebase](https://firebase.google.com/docs/web/setup)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind](https://tailwindcss.com/docs/guides/nextjs)
- [Flowbite](https://flowbite.com/)
- [Algolia](https://www.algolia.com/)
- [Stripe](https://stripe.com/)

## Screenshots
<p>Currently the website doesn't look that great, but here's just a few screenshots of what it looks like so far.</p>

- https://i.ibb.co/jh2VcNR/3d-Vd-VHd8ag.png
- https://i.ibb.co/DWygJNf/GAp-Idmj0qn.png
- https://i.ibb.co/nbrnFBP/W1spb-Lm5-JM.png
- https://i.ibb.co/37MRGjd/Jk-IJTDQjsj.png
- https://i.ibb.co/2nthsQG/Du-Uky-TTIg-E.png

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- Firebase Project
- Algolia Account
- Stripe Account
- Redis Cloud Account

### Installation

1. Clone the repo
  ```git clone https://github.com/patrykczubek/amazon-clone.git```
2. Navigate to folder and install packages
  ```npm install```
3. Create your .env.local folder and add these variables:
```
FIREBASE_CLIENT_EMAIL=
NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET_ID=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_MEASUREMENT_ID=
FIREBASE_PRIVATE_KEY='" "'

COOKIE_SECRET_CURRENT=someSecretValue
COOKIE_SECRET_PREVIOUS=anotherSecretValue
NEXT_PUBLIC_COOKIE_SECURE=false

STRIPE_SECRET_KEY=
STRIPE_SIGNING_KEY=

REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=

ALGOLIA_APPID=
ALLGOLIA_API_KEY=
```

4. Run in development mode
```npm run dev```

## Issues - Future plans

- Fix frontend :)
- Fix app :)

## Contributing - Feature Requests

Any contributions or feature requests are greatly appreciated.

1. Fork the project.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a pull request.

## License

Distributed under the GPL License. See `LICENSE` for more information.
