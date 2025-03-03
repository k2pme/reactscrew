// src/components/DriverProvider.jsx
import React, { createContext, useReducer, useEffect } from 'react';
import localforage from 'localforage';
import { logRequest } from '../utils/logger';

export const DriverContext = createContext();

const createInitialState = (screws) => {

  const state = {};

  Object.keys(screws).forEach((key) => {
    state[key] = { isLoading: false, data: null, error: null };
  });

  return state;
};

function driverReducer(state, action) {

  switch (action.type) {

    case 'REQUEST_START':
      return {
        ...state,
        [action.screwName]: { ...state[action.screwName], isLoading: true, error: null }
      };

    case 'REQUEST_SUCCESS':
      return {
        ...state,
        [action.screwName]: { isLoading: false, data: action.payload, error: null }
      };

    case 'REQUEST_FAILURE':
      return {
        ...state,
        [action.screwName]: { isLoading: false, data: null, error: action.error }
      };

    default:
      return state;

  }
}

export const DriverProvider = ({ children, apiInstance, screws }) => {
  
  const initialState = createInitialState(screws);
  const [state, dispatch] = useReducer(driverReducer, initialState);

  // Fonction générique pour exécuter une méthode d'un screw
  const executeMethod = async (screwName, methodName, ...args) => {

    const screw = screws[screwName];

    if (!screw || !screw.methods[methodName]) {
      throw new Error(`La méthode ${methodName} n'est pas définie pour le screw ${screwName}`);
    }

    dispatch({ type: 'REQUEST_START', screwName });

    try {

      // Déterminer la route (si c'est une fonction, la générer avec les arguments)
      const routeDef = screw.methods[methodName].route;
      const route = typeof routeDef === 'function' ? routeDef(...args) : routeDef;
      const httpMethod = screw.methods[methodName].httpMethod || 'GET';

      // Construire la configuration de la requête
      const config = {
        method: httpMethod,
        url: route,
      };

      // Ajouter les headers personnalisés si fournis
      if (screw.methods[methodName].headers) {
        config.headers = screw.methods[methodName].headers;
      }

      // Pour les méthodes d'écriture, on attend éventuellement une data en premier argument
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod.toUpperCase()) && args[0]) {
        config.data = args[0];
      }

      const response = await apiInstance(config);
      const data = response.data;

      // Log complet de la requête en mode développement
      logRequest(httpMethod, route, response.status, response.headers, config.data || null, data);

      // Sauvegarde en cache si l'option persistence est activée
      if (screw.persistence) {
        await localforage.setItem(screw.name, data);
      }

      dispatch({ type: 'REQUEST_SUCCESS', screwName, payload: data });
      return data;
    } catch (error) {
      // En cas d'erreur, tenter de loguer la réponse d'erreur si elle est disponible
      if (error.response) {
        logRequest(
          screw.methods[methodName].httpMethod,
          routeDef,
          error.response.status,
          error.response.headers,
          config.data || null,
          error.response.data
        );
      }
      dispatch({ type: 'REQUEST_FAILURE', screwName, error });
      throw error;
    }
  };

  // Initialisation des screws qui demandent une exécution au lancement
  useEffect(() => {

    Object.values(screws).forEach(async (screw) => {

      if (screw.executeOnLaunch && screw.methods.init) {

        let data = null;

        if (screw.persistence) {
          data = await localforage.getItem(screw.name);
        }

        if (!data) {

          try {

            data = await executeMethod(screw.name, 'init');

          } catch (error) {

            console.error(`Erreur lors de l'initialisation du screw ${screw.name} :`, error);
          }

        } else {

          dispatch({ type: 'REQUEST_SUCCESS', screwName: screw.name, payload: data });
        }
      }
    });
    
  }, [apiInstance, screws]);

  const actions = {
    executeMethod,
  };

  return (
    <DriverContext.Provider value={{ state, actions }}>
      {children}
    </DriverContext.Provider>
  );
};
