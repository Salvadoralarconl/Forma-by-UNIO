import React,{useState} from 'react';
import {afterEach,it,expect} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {ColorField} from '../src/editor/ColorField';
import {createProject} from '../src/domain/model';
afterEach(cleanup);
it('applies HSV, RGB and alpha immediately while preserving hue through white',()=>{
 function Picker(){const [color,setColor]=useState('#ffffff');return <><output data-testid="color">{color}</output><ColorField label="Fill" value={color} onCommit={setColor} project={createProject()}/></>;}
 render(<Picker/>);fireEvent.click(screen.getByRole('button',{name:'Open Fill picker'}));
 fireEvent.change(screen.getByLabelText('Fill Hue'),{target:{value:'240'}});
 fireEvent.change(screen.getByLabelText('Fill Saturation'),{target:{value:'100'}});
 expect(screen.getByTestId('color').textContent).toBe('#0000ff');
 fireEvent.change(screen.getByLabelText('Fill Alpha'),{target:{value:'50'}});
 expect(screen.getByTestId('color').textContent).toBe('#0000ff80');
 fireEvent.change(screen.getByLabelText('Fill R'),{target:{value:'128'}});
 expect(screen.getByTestId('color').textContent).toBe('#8000ff80');
 fireEvent.keyDown(screen.getByLabelText('Fill R'),{key:'Enter'});
 expect(screen.getByRole('button',{name:'Recent #8000ff80'})).toBeTruthy();
 const hex=screen.getByLabelText('Fill');hex.focus();fireEvent.change(hex,{target:{value:'#123456'}});fireEvent.keyDown(hex,{key:'Enter'});
 expect(screen.getByTestId('color').textContent).toBe('#123456');
});
