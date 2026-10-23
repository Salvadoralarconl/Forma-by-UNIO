import React from 'react';
import { afterEach,it,expect } from 'vitest';
import { render,screen,cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from '../src/editor/Inspector';
afterEach(cleanup);
it('displays two decimals without rounding saved data merely on focus/blur',async()=>{
  const changes:string[]=[];const user=userEvent.setup();render(<Field label="Height" value={287.0126799211819} onCommit={v=>changes.push(v)}/>);
  expect(screen.getByLabelText('Height')).toHaveProperty('value','287.01');await user.click(screen.getByLabelText('Height'));await user.tab();expect(changes).toEqual([]);
});
it('leaves an intermediate draft intact while typing and displays integer values without trailing zeros',async()=>{
  const user=userEvent.setup();render(<Field label="Height" value={120} onCommit={()=>{}}/>);const input=screen.getByLabelText('Height');expect(input).toHaveProperty('value','120');await user.clear(input);await user.type(input,'-');expect(input).toHaveProperty('value','-');
});
