

# ReactScrew

ReactScrew is a lightweight React context tool designed to centralize and simplify API communication in your React applications. It introduces the innovative concept of *screws* and a *driver* to modularize your API endpoints and state management, allowing you to configure and call your API endpoints with minimal boilerplate.

- [Introduction](#Introduction)
- [Installation](#Installation)
- [ReactScrew](#What ReactScrew Can Do ?)
- [Screw]()
- [Driver]()
- [Create a Screw]()
- [Create your API Instance]()
- [Integrate and Test ReactScrew]()
- [Limits of ReactScrew]()
- [How to Contribute]()
- [Acknowledgements](#Acknowledgements)
- [About the Developer]()

--

## Introduction

ReactScrew leverages a declarative configuration to define "screws"— modules that group related API endpoints (e.g., users, posts)—and a "driver" that acts as a centralized context provider. With ReactScrew, you can:

- Configure multiple HTTP methods (*GET*, *POST*, *PUT*, *PATCH*, *DELETE*)
- Customize headers and request data for advanced API interactions
- Automatically manage loading, error, and data states
- Log detailed request/response information in development mode


## Installation

Install ReactScrew via npm:

```bash
npm install reactscrew

```


## What ReactScrew Can Do ?

- **Centralize API Communication** :
Provides a unified context that handles all your API calls.

- **Declarative API Configuration** :
Define each module (screw) with its endpoints, HTTP methods, and headers in a simple JSON-like format.

- **Automatic State Management** :
Manages the isLoading, data, and error states for every API request.

- **Comprehensive Logging** :
In development mode, it logs request details (time, method, URL, headers, body, response, status) to the terminal and optionally to a log file.

- **Supports Data Mutations** :
Easily handle not only data retrieval (GET) but also create (POST), update (PUT/PATCH), and delete (DELETE) operations.



## What Is a Screw ?
A screw is a module representing a group of related API endpoints. It is defined as a JavaScript object that includes:

- **name**:
A unique identifier for the screw.

- **executeOnLaunch**:
A boolean that determines if the screw's init method should automatically run on application startup.

- **persistence** :
A flag to enable data persistence (via localForage) for caching purposes.

- **methods**:
An object where each key is a method name (e.g., init, getById, create) and each value is a configuration object defining:

> **httpMethod**: The HTTP method to use (GET, POST, PUT, PATCH, DELETE).
> **headers** (optional): Any custom headers required for that endpoint.


## What Is a Driver?

The driver is the React context provider (DriverProvider) that integrates all screws into your application. It:

- Executes the init method for each screw that has executeOnLaunch enabled.
- Manages the global state of all screws (loading, error, and data).
- Exposes actions and a hook (useScrew) for easy API interactions in your components.
- Incorporates a comprehensive logging system in development mode.
Concept of Screw-Driver


### ReactScrew introduces a modular approach where:

Screws define the "what" — the specific endpoints and methods for different parts of your API.
The Driver defines the "how" — centralizing the API call logic, state management, and logging.
This separation of concerns makes your codebase easier to maintain, extend, and test.


## How to Create a Screw

A screw is a simple JavaScript object. Here’s an example for a `user` screw:

```javascript

    export const userScrew = {
    name: 'user',
    executeOnLaunch: true, // Automatically runs the init method on startup
    persistence: false,    // Disable persistence for this example
    methods: {
        // Retrieve the list of users
        init: {
        route: '/users',
        httpMethod: 'GET'
        },
        // Retrieve a user by their ID
        getById: {
        route: (id) => `/users/${id}`,
        httpMethod: 'GET'
        },
        // Create a new user
        create: {
        route: '/users',
        httpMethod: 'POST',
        headers: { 'Content-Type': 'application/json' }
        },
        // Update an existing user
        update: {
        route: (id) => `/users/${id}`,
        httpMethod: 'PUT',
        headers: { 'Content-Type': 'application/json' }
        },
        // Delete a user
        remove: {
        route: (id) => `/users/${id}`,
        httpMethod: 'DELETE'
        }
    }
    };
```


### Screw Properties Explained

- **name**: Unique identifier (e.g., 'user').
- **executeOnLaunch**: If set to true, the driver's initialization effect will call the init method for this screw.
- **persistence**: If true, the driver's logic will cache and retrieve this screw's data using localForage.
- **methods**: An object containing each API operation. Each method configuration includes:

    > *route*: A string or function returning the endpoint path.
    > *httpMethod*: The HTTP method used for the request.
    > *headers* (optional): Custom headers required for the API call.


## How to Create an API Instance

Create an API instance using Axios (or your preferred HTTP client):

```javascript

    import axios from 'axios';

    const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com', // Change to your API base URL
    timeout: 5000
    });

    export default api;

```

## How to Integrate and Test ReactScrew

- **Step 1** : Wrap Your Application with the DriverProvider


```javascript

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider } from 'reactscrew';
import App from './App';
import api from './services/api';
import { userScrew } from './services/screws/user';
import { postScrew } from './services/screws/post';



const screws = {
  user: userScrew, 
  post: postScrew
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <DriverProvider apiInstance={api} screws={screws}>
    <App />
  </DriverProvider>
);


```
**Notice** :  *pay attention to `userScrew.name` and his key in `screws` dict, they have to be the same, otherwise you will occure an issue while init your screw.

for instance if the `name` of your screw is 'order' this is how you will create your `screws` dict

```jsx
const screws = {
  order: orderScrew, // orderScrew.name === screws.name 
};

```


- **Step 2** : Use the useScrew Hook in Your Components

    `useScrew` hook for getting a screw data or action

    **what useScrew returns**

    - `isLoading` : screw loading state, 
    - `data` : screw data, 
    - `error` : screw error, 
    - `refetch` : updating screw data, 
    - `executeMethod` : method for calling screw action

```jsx

    import React from 'react';
    import { useScrew } from 'reactscrew'; // or your relative path

    const App = () => {

    const { isLoading, data, error, refetch, executeMethod } = useScrew('user');

    const handleCreateUser = async () => {

        try {

            const newUser = { name: 'John Doe', email: 'john@example.com' };

            const response = await executeMethod('create', newUser);

        } catch (err) {
            console.error(err);
        }

    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>User List</h1>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
            <button onClick={refetch}>Refresh</button>
            <button onClick={handleCreateUser}>Create User</button>
        </div>
    );
    };

    export default App;
```

## Limits of ReactScrew

Basic Caching and State Management:
While ReactScrew offers basic state management and optional persistence, it does not provide advanced caching strategies like React Query or Apollo Client.

- **Simplified Logging and Error Handling**:
The logging mechanism is basic and writes to the console and an optional file (in Node environments). For production-grade logging, consider integrating a dedicated logging service.

- **No Advanced Authentication**:
The tool does not handle complex authentication flows out-of-the-box. You will need to extend or integrate additional middleware for such use cases.

- **Browser Limitations**:
File system logging using Node’s fs module only works in Node environments. In browsers, logging is limited to the console.


## How to Contribute

Contributions are welcome! To contribute:

1. **Fork the Repository**:
Create your own fork of the project on GitHub.

2. **Create a Feature Branch**:
Develop your feature or bugfix on a separate branch.

3. **Submit a Pull Request**:
Once your changes are ready, submit a pull request for review.

4. **Follow Code Guidelines**:
Please adhere to existing coding styles and write tests for your changes.

Feel free to open issues for any bugs or feature requests.

## Acknowledgements

Thanks to the contributors and the open-source community for their valuable input.
Special thanks to the developers of Axios, React, and localForage for the tools that make this project possible.


## About the Developer

ReactScrew was developed by *K2pme*.
I am passionate about creating modular, easy-to-use tools that help developers build robust applications with minimal overhead.
For more information, check out my GitHub profile and website.


--

Happy coding with ReactScrew!