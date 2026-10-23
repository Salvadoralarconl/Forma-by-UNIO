import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ApplicationMenus} from '../src/editor/ApplicationMenus';
afterEach(cleanup);
it('keeps menus open after pointer leave, switches only one, closes on command/outside/Escape and supports arrows',async()=>{
 const action=vi.fn(),user=userEvent.setup();render(<><ApplicationMenus onHelp={()=>{}} sections={[{label:'Layer',content:<><button disabled>Unavailable</button><button onClick={action}>New text</button><button>New image</button></>},{label:'View',content:<button>Actual pixels</button>} ]}/><button>Outside</button></>);
 const layer=screen.getByRole('menuitem',{name:'Layer'}),view=screen.getByRole('menuitem',{name:'View'});await user.click(layer);await user.unhover(layer);expect(screen.getAllByRole('menu')).toHaveLength(1);await user.hover(view);expect(layer.getAttribute('aria-expanded')).toBe('true');await user.click(view);expect(screen.getAllByRole('menu')).toHaveLength(1);expect(layer.getAttribute('aria-expanded')).toBe('false');await user.click(view);expect(screen.queryByRole('menu')).toBeNull();
 layer.focus();await user.keyboard('{ArrowDown}');await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('menuitem',{name:'New text'})));await user.keyboard('{ArrowDown}');expect(document.activeElement).toBe(screen.getByRole('menuitem',{name:'New image'}));await user.keyboard('{ArrowRight}');await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('menuitem',{name:'Actual pixels'})));expect(screen.getAllByRole('menu')).toHaveLength(1);await user.keyboard('{Escape}');expect(screen.queryByRole('menu')).toBeNull();expect(document.activeElement).toBe(view);
 await user.click(layer);await user.click(screen.getByRole('menuitem',{name:'New text'}));expect(action).toHaveBeenCalledOnce();expect(screen.queryByRole('menu')).toBeNull();await user.click(layer);await user.click(screen.getByRole('button',{name:'Outside'}));expect(screen.queryByRole('menu')).toBeNull();
});
