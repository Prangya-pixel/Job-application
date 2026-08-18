import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const modes={applicant:{title:'Applicant Login',description:'Sign in to find jobs and manage your applications.',button:'Sign In'},admin:{title:'Admin Login',description:'Sign in to manage jobs, applicants, and recruitment applications.',button:'Admin Sign In'}};

export default function Login(){
  const [mode,setMode]=useState('applicant');
  const [form,setForm]=useState({email:'',password:''});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const {login,logout}=useAuth();
  const nav=useNavigate();
  const copy=modes[mode];
  const switchMode=nextMode=>{setMode(nextMode);setError('');};
  const submit=async event=>{
    event.preventDefault();setBusy(true);setError('');
    try{const data=await login(form);if(mode==='admin'&&data.user.role!=='admin'){logout();setError('This account does not have administrator access.');return;}nav(data.user.role==='admin'?'/admin/dashboard':'/applicant/jobs');}
    catch(requestError){const status=requestError.response?.status;setError(status===500?'Unable to connect to the server. Please try again.':requestError.response?.data?.message||'Unable to sign in');}
    finally{setBusy(false);}
  };
  return <section className="auth login-page"><form onSubmit={submit} className="form-card login-card"><div className="portal-brand"><span className="portal-mark">R</span><span>Recruitment Portal</span></div><p className="eyebrow">Welcome</p><h1>{copy.title}</h1><p className="login-description">{copy.description}</p><div className="login-tabs" role="tablist" aria-label="Login type"><button type="button" role="tab" aria-selected={mode==='applicant'} className={mode==='applicant'?'active':''} onClick={()=>switchMode('applicant')}>Applicant Login</button><button type="button" role="tab" aria-selected={mode==='admin'} className={mode==='admin'?'active':''} onClick={()=>switchMode('admin')}>Admin Login</button></div>{error&&<p className="error" role="alert">{error}</p>}<label>Email<input type="email" autoComplete="email" required value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></label><label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={event=>setForm({...form,password:event.target.value})}/></label><button className="button" disabled={busy}>{busy?'Signing in...':copy.button}</button>{mode==='applicant'&&<p className="login-register">Don't have an account? <Link to="/register">Create Account</Link></p>}</form></section>;
}
