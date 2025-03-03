// src/utils/persistence.js
import localforage from 'localforage';

export const saveData = async (key, data) => {
  try {
    await localforage.setItem(key, data);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error);
  }
};

export const getData = async (key) => {
  try {
    return await localforage.getItem(key);
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
};
