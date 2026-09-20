// detect changebutton being pressed
const changeDateBtn = document.querySelector('.changeDate');
const dateInput = document.getElementById('datepicker')

changeDateBtn.addEventListener('click', () => {
    dateInput.showPicker(); 
});

// ALL event changes
dateInput.addEventListener('change', (event) => {
  const rawValue = event.target.value;

  if (rawValue === "") {
    specified = null; // target changed
    
    updateList(target); 
    return;
  }
  
  // not clear event
  specified = new Date(rawValue);
  updateList(specified);
});
