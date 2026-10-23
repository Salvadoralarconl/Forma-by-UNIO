/** Self-contained so the same behavior can be shipped in standalone HTML exports. */
export function runPageSearch(form:HTMLElement):string{
 const page=form.closest('[data-page-id]');
 if(!page)return 'Search is unavailable.';
 page.querySelectorAll('.forma-search-match').forEach(el=>el.classList.remove('forma-search-match'));
 const query=(form.querySelector<HTMLInputElement>('input[type="search"]')?.value??'').trim().toLocaleLowerCase();
 if(!query)return 'Enter text to search.';
 const matches=Array.from(page.querySelectorAll<HTMLElement>('[data-kind="text"]')).filter(el=>!el.closest('[data-control]')&&el.getClientRects().length>0&&(el.textContent??'').toLocaleLowerCase().includes(query));
 matches.forEach(el=>el.classList.add('forma-search-match'));
 matches[0]?.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
 return matches.length?`${matches.length} ${matches.length===1?'match':'matches'} on this page.`:'No matches on this page.';
}
