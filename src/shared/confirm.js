// Generic confirm dialog (used for the skip-ahead warning).
var confirmOverlay = document.getElementById('confirm-overlay');
var confirmTitle = document.getElementById('confirm-title');
var confirmMsg = document.getElementById('confirm-msg');
var confirmOk = document.getElementById('confirm-ok');
var confirmCancel = document.getElementById('confirm-cancel');
export function showConfirm(title, msg, onConfirm){
  confirmTitle.textContent = title;
  confirmMsg.textContent = msg;
  confirmOverlay.classList.add('open');
  confirmOk.onclick = function(){ confirmOverlay.classList.remove('open'); onConfirm(); };
  confirmCancel.onclick = function(){ confirmOverlay.classList.remove('open'); };
}
confirmOverlay.addEventListener('click', function(e){ if(e.target === confirmOverlay) confirmOverlay.classList.remove('open'); });

export function isConfirmOpen(){ return confirmOverlay.classList.contains('open'); }
