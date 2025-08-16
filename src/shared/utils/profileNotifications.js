// Sistema de notificaciones para cambios en el perfil
let observers = [];

export const addProfileObserver = (callback) => {
  observers.push(callback);
};

export const removeProfileObserver = (callback) => {
  observers = observers.filter(obs => obs !== callback);
};

export const notifyProfileUpdate = (updatedProfile) => {
  observers.forEach(callback => {
    try {
      callback(updatedProfile);
    } catch (error) {
      console.error('Error notifying profile observer:', error);
    }
  });
};