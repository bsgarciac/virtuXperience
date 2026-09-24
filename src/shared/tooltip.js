var elTooltip = document.getElementById('tooltip');
export function showTooltip(x, y, html){
  elTooltip.innerHTML = html;
  elTooltip.style.left = x + 'px';
  elTooltip.style.top = y + 'px';
  elTooltip.classList.add('show');
}
export function hideTooltip(){ elTooltip.classList.remove('show'); }
