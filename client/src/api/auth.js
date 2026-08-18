import api from './client';export const register=d=>api.post('/auth/register',d);export const login=d=>api.post('/auth/login',d);export const profile=()=>api.get('/auth/profile');
