// src/hooks/useScrew.js
import { useContext } from 'react';
import { DriverContext } from '../components/DriverProvider';

export const useScrew = (screwName) => {
  const { state, actions } = useContext(DriverContext);

  const refetch = async () => {
    await actions.executeMethod(screwName, 'init');
  };

  return {
    ...state[screwName],
    refetch,
    executeMethod: (methodName, ...args) => actions.executeMethod(screwName, methodName, ...args)
  };
};
