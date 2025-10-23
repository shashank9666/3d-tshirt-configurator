// store.js
import { proxy } from 'valtio';

export const state = proxy({
  tshirtColor: '#ffffff',
  tshirtTexture: null,
  decalTextures: [],
  activeDecalIndex: 0,
});