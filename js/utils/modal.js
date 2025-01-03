const closeModal = function(modalName) {
  document
    .getElementById(`modal-${modalName}-background`)
    .addEventListener('click', () => {
      document
        .getElementById(`modal-${modalName}`)
        .classList.remove('is-active');
    }); 
  document
    .getElementById(`modal-${modalName}-delete`)
    .addEventListener('click', () => {
      document
        .getElementById(`modal-${modalName}`)
        .classList.remove('is-active');
    }); 
};

export { closeModal };
