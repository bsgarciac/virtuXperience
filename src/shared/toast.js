var elToast = document.getElementById('toast');
var toastTimer = null;
export function showToast(msg){
  elToast.textContent = msg;
  elToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ elToast.classList.remove('show'); }, 2600);
}
