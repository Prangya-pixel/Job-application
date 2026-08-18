import {createContext,useContext,useEffect,useState} from 'react';
import * as auth from '../api/auth';

const AuthContext=createContext();
export const useAuth=()=>useContext(AuthContext);

export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    const token = localStorage.getItem('recruitment_token');
    if (!token) {
      setLoading(false);
      return;
    }
    auth.profile()
      .then(response=>{if(active)setUser(response.data.user);})
      .catch(()=>{localStorage.removeItem('recruitment_token');if(active)setUser(null);})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);

  const save=({token,user:nextUser})=>{localStorage.setItem('recruitment_token',token);setUser(nextUser);};
  const login=async credentials=>{const response=await auth.login(credentials);save(response.data);return response.data;};
  const register=async details=>{const response=await auth.register(details);save(response.data);return response.data;};
  const logout=()=>{localStorage.removeItem('recruitment_token');setUser(null);};

  return <AuthContext.Provider value={{user,loading,save,login,register,logout}}>{children}</AuthContext.Provider>;
}
