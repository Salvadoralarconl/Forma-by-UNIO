export function applyButtonSelection(element:HTMLElement){
 const mode=element.getAttribute('data-button-selection');if(mode!=='toggle'&&mode!=='select')return;
 const selected=mode==='select'||element.getAttribute('data-button-selected')!=='true';element.setAttribute('data-button-selected',String(selected));element.setAttribute('aria-pressed',String(selected));
}
