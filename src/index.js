// // // src/index.jsx
// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import { DriverProvider } from './components/DriverProvider';
// import App from '../App';
// import api from './services/api';
// import { userScrew } from './services/screws/client';
// import { postScrew } from './services/screws/post';

// const screws = {
//   user: userScrew,
//   post: postScrew
// };

// const container = document.getElementById('root');
// const root = createRoot(container);

// root.render(
//   <DriverProvider apiInstance={api} screws={screws}>
//     <App />
//   </DriverProvider>
// );


// // src/index.js


export { DriverProvider } from './components/DriverProvider';
export { useScrew } from './hooks/useScrew';

