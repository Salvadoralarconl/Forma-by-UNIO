import {render,screen} from '@testing-library/react';
import {it,expect} from 'vitest';
import {EqualGapGuides} from '../src/editor/EqualGapGuides';
it('renders two visible measurements without intercepting canvas input',()=>{
 const {container}=render(<EqualGapGuides gaps={[{axis:'x',start:130,end:200,cross:130,value:70},{axis:'x',start:280,end:350,cross:130,value:70}]}/>);
 expect(screen.getByTestId('equal-gap-guides').style.pointerEvents).toBe('none');
 expect(container.querySelectorAll('[data-gap-value="70"]')).toHaveLength(2);
 expect(container.querySelectorAll('text')).toHaveLength(2);
 expect(container.querySelector('text')?.textContent).toBe('70');
});
