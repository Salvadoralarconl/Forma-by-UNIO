import React from 'react';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Elements} from '../src/editor/Elements';
import type {Editor} from '../src/editor/useEditor';
afterEach(cleanup);
const setup=()=>{const insertElement=vi.fn();render(<Elements editor={{busy:false,insertElement} as unknown as Editor} importImage={()=>{}}/>);return insertElement;};
describe('Elements accordions',()=>{
 it('uses independent keyboard-accessible category disclosures and keeps tile insertion',async()=>{const insert=setup(),user=userEvent.setup();const shapes=screen.getByRole('button',{name:'Shapes'}),buttons=screen.getByRole('button',{name:'Buttons'});expect(shapes.getAttribute('aria-expanded')).toBe('true');expect(buttons.getAttribute('aria-expanded')).toBe('false');buttons.focus();await user.keyboard('{Enter}');expect(buttons.getAttribute('aria-expanded')).toBe('true');expect(shapes.getAttribute('aria-expanded')).toBe('true');await user.click(screen.getByRole('button',{name:'Insert Solid button'}));expect(insert).toHaveBeenCalledWith('solidButton');buttons.focus();await user.keyboard(' ');expect(buttons.getAttribute('aria-expanded')).toBe('false');});
 it('reveals search matches across collapsed groups and restores prior expansion on clearing',async()=>{setup();const user=userEvent.setup();await user.click(screen.getByRole('button',{name:'Shapes'}));await user.click(screen.getByRole('button',{name:'Cards'}));await user.type(screen.getByLabelText('Search elements'),'home');expect(screen.getByRole('button',{name:'Insert Home'})).toBeTruthy();expect(screen.getByRole('button',{name:'Icons'}).getAttribute('aria-expanded')).toBe('true');await user.click(screen.getByRole('button',{name:'Clear element search'}));expect(screen.getByRole('button',{name:'Icons'}).getAttribute('aria-expanded')).toBe('false');expect(screen.getByRole('button',{name:'Shapes'}).getAttribute('aria-expanded')).toBe('false');expect(screen.getByRole('button',{name:'Cards'}).getAttribute('aria-expanded')).toBe('true');});
});
