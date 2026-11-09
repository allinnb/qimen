import {describe,it,expect} from 'vitest';
import fixtures from './fixtures.json';
import {chartAt} from '../src/qimenEngine';

describe('时家奇门 24 条核验夹具',()=>{
  for(const fixture of fixtures as any[]){
    it(`${fixture.source}: ${fixture.expect.time} ${fixture.ref}`,()=>{
      const actual=chartAt(...fixture.input as [number,number,number,number,number]);
      expect(actual).toEqual(fixture.expect);
    });
  }
});
