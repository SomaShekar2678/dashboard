import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Boxes, BrainCircuit,
  Building2, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Clock3,
  Command, Download, Factory, FileBarChart, Gauge, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings2,
  ShieldCheck, Sun, Thermometer, Wrench, X, Zap
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis
} from 'recharts';

type AssetStatus = 'Healthy' | 'Warning' | 'Critical';
type Asset = {
  id: string; name: string; plant: string; type: string; criticality: 'High' | 'Medium' | 'Low';
  health: number; temperature: number; vibration: number; rul: number; status: AssetStatus;
  failureMode: string; probability: number;
};
type WorkOrder = { id: string; asset: string; title: string; priority: string; status: string; due: string };

const initialAssets: Asset[] = [
  { id:'AST-001',name:'Main Air Compressor',plant:'Pune Plant',type:'Compressor',criticality:'High',health:42,temperature:86.4,vibration:7.2,rul:12,status:'Critical',failureMode:'Bearing degradation',probability:78 },
  { id:'AST-002',name:'Hydraulic Pump P-02',plant:'Pune Plant',type:'Hydraulic pump',criticality:'High',health:67,temperature:71.2,vibration:5.8,rul:34,status:'Warning',failureMode:'Seal wear',probability:41 },
  { id:'AST-003',name:'Induction Motor M-14',plant:'Bhopal Works',type:'Induction motor',criticality:'Medium',health:91,temperature:58.1,vibration:2.1,rul:164,status:'Healthy',failureMode:'No dominant failure mode',probability:8 },
  { id:'AST-004',name:'Cooling Fan F-08',plant:'Nagpur Line',type:'Cooling fan',criticality:'Low',health:76,temperature:63.8,vibration:3.9,rul:82,status:'Healthy',failureMode:'Imbalance',probability:19 },
  { id:'AST-005',name:'Gearbox GB-03',plant:'Bhopal Works',type:'Gearbox',criticality:'High',health:34,temperature:92.6,vibration:8.4,rul:6,status:'Critical',failureMode:'Gear tooth wear',probability:89 },
  { id:'AST-006',name:'Chiller CH-01',plant:'Indore Hub',type:'Chiller',criticality:'Medium',health:83,temperature:49.5,vibration:2.8,rul:121,status:'Healthy',failureMode:'No dominant failure mode',probability:11 },
  { id:'AST-007',name:'Conveyor Drive CV-11',plant:'Nagpur Line',type:'Conveyor drive',criticality:'Medium',health:61,temperature:78.3,vibration:6.1,rul:26,status:'Warning',failureMode:'Belt / bearing wear',probability:52 },
  { id:'AST-008',name:'Boiler Feed Pump BFP-1',plant:'Indore Hub',type:'Pump',criticality:'High',health:88,temperature:66.2,vibration:3.2,rul:138,status:'Healthy',failureMode:'Cavitation risk',probability:13 }
];
const plants = [
  { name:'Pune Plant', location:'Pune, Maharashtra', assets:2, health:55, alerts:2, availability:94.2 },
  { name:'Bhopal Works', location:'Bhopal, Madhya Pradesh', assets:2, health:63, alerts:1, availability:96.8 },
  { name:'Nagpur Line', location:'Nagpur, Maharashtra', assets:2, health:69, alerts:1, availability:97.1 },
  { name:'Indore Hub', location:'Indore, Madhya Pradesh', assets:2, health:86, alerts:0, availability:98.4 }
];
const trend = [
  {time:'06:00',vibration:3.2,temperature:61},{time:'08:00',vibration:3.8,temperature:64},
  {time:'10:00',vibration:4.1,temperature:67},{time:'12:00',vibration:5.7,temperature:72},
  {time:'14:00',vibration:5.1,temperature:70},{time:'16:00',vibration:6.4,temperature:78},
  {time:'18:00',vibration:5.8,temperature:75}
];
const history = [
  {day:'Mon',healthy:6,warning:1,critical:1},{day:'Tue',healthy:6,warning:1,critical:1},
  {day:'Wed',healthy:5,warning:2,critical:1},{day:'Thu',healthy:5,warning:2,critical:1},
  {day:'Fri',healthy:5,warning:1,critical:2},{day:'Sat',healthy:5,warning:1,critical:2},
  {day:'Sun',healthy:4,warning:2,critical:2}
];
const initialOrders: WorkOrder[] = [
  {id:'WO-2408',asset:'AST-001',title:'Inspect compressor bearing assembly',priority:'Critical',status:'Open',due:'Today'},
  {id:'WO-2407',asset:'AST-005',title:'Gearbox vibration inspection',priority:'High',status:'In progress',due:'Today'},
  {id:'WO-2406',asset:'AST-002',title:'Hydraulic seal condition check',priority:'Medium',status:'Scheduled',due:'Tomorrow'}
];
const nav = [
  {to:'/',label:'Overview',icon:Gauge,group:'OPERATIONS'},
  {to:'/plants',label:'Plants',icon:Factory,group:'OPERATIONS'},
  {to:'/assets',label:'Assets',icon:Boxes,group:'OPERATIONS'},
  {to:'/predictions',label:'AI Predictions',icon:BrainCircuit,group:'OPERATIONS'},
  {to:'/alerts',label:'Alerts',icon:AlertTriangle,group:'MAINTENANCE'},
  {to:'/work-orders',label:'Work orders',icon:ClipboardList,group:'MAINTENANCE'},
  {to:'/analytics',label:'Analytics & reports',icon:FileBarChart,group:'INSIGHTS'},
  {to:'/data-models',label:'Data & models',icon:Activity,group:'INSIGHTS'}
];

function Status({value}:{value:AssetStatus|string}) {
  return <span className={'status status-'+value.toLowerCase().replaceAll(' ','-')}><i/>{value}</span>;
}
function Health({value}:{value:number}) {
  const color = value < 40 ? 'var(--red)' : value < 70 ? 'var(--amber)' : 'var(--green)';
  return <div className='health-cell'><div className='health-track'><i style={{width:value+'%',background:color}}/></div><b>{value}%</b></div>;
}
function Metric({label,value,unit,detail,icon:Icon,tone='neutral',change}:{label:string;value:string;unit?:string;detail:string;icon:any;tone?:string;change?:'up'|'down'}) {
  return <article className='metric-card'><div className='metric-top'><span>{label}</span><span className={'metric-icon '+tone}><Icon size={17}/></span></div><div className='metric-value'>{value}<small>{unit}</small></div><div className='metric-detail'>{change==='down'?<ArrowDownRight size={13}/>:change==='up'?<ArrowUpRight size={13}/>:null}{detail}</div></article>;
}

const signalSamples = Array.from({length:96},(_,i)=>({
  sample:i,
  amplitude:0.72*Math.sin(2*Math.PI*7*i/96)+0.24*Math.sin(2*Math.PI*19*i/96)+0.08*Math.sin(2*Math.PI*31*i/96)
}));
const spectrumBins = Array.from({length:24},(_,k)=>{
  const re=signalSamples.reduce((sum,p,i)=>sum+p.amplitude*Math.cos(2*Math.PI*k*i/96),0);
  const im=signalSamples.reduce((sum,p,i)=>sum-p.amplitude*Math.sin(2*Math.PI*k*i/96),0);
  return {bin:k,magnitude:Math.sqrt(re*re+im*im)/48};
});

function HealthRing({value}:{value:number}) {
  const radius=43;
  const circumference=2*Math.PI*radius;
  const color=value<40?'var(--red)':value<70?'var(--amber)':'var(--green)';
  return <div className="health-ring-wrap"><svg viewBox="0 0 112 112" role="img" aria-label={`Asset health ${value} percent`}><circle className="ring-track" cx="56" cy="56" r={radius}/><circle className="ring-value" cx="56" cy="56" r={radius} stroke={color} strokeDasharray={circumference} strokeDashoffset={circumference*(1-value/100)}/></svg><div className="ring-label"><b>{value}</b><span>HEALTH</span></div></div>;
}

function AdvancedInsights({assets,onSelect}:{assets:Asset[];onSelect:(asset:Asset)=>void}) {
  const [signalAssetId,setSignalAssetId]=useState('AST-001');
  const [signalView,setSignalView]=useState<'waveform'|'spectrum'>('waveform');
  const selected=assets.find(a=>a.id===signalAssetId)??assets[0];
  const avg=Math.round(assets.reduce((sum,a)=>sum+a.health,0)/Math.max(assets.length,1));
  const ranked=assets.slice().sort((a,b)=>a.rul-b.rul).slice(0,4);
  const topologyIds=['AST-001','AST-002','AST-003','AST-005','AST-007','AST-008'];
  return <section className="advanced-stack">
    <div className="advanced-heading"><div><span className="eyebrow">ADVANCED CONDITION INTELLIGENCE</span><h2>Equipment intelligence</h2><p>Interactive topology, condition scoring and signal diagnostics</p></div><span className="subtle-pill">Synthetic demonstration</span></div>
    <div className="advanced-grid">
      <article className="panel health-intelligence">
        <div className="panel-heading"><div><h2>Fleet health index</h2><p>Aggregate of the displayed asset health scores</p></div><Gauge size={17}/></div>
        <div className="health-ring-row"><HealthRing value={avg}/><div className="health-ring-copy"><b>{assets.filter(a=>a.status==='Critical').length} critical assets</b><span>Require priority assessment</span><b>{assets.filter(a=>a.status==='Warning').length} warning assets</b><span>Require closer monitoring</span></div></div>
        <div className="ring-foot"><span>Health bands</span><span><i className="green-dot"/> ≥70</span><span><i className="amber-dot"/> 40–69</span><span><i className="red-dot"/> &lt;40</span></div>
      </article>
      <article className="panel topology-panel">
        <div className="panel-heading"><div><h2>Plant equipment topology</h2><p>Select a node to inspect its current demo condition</p></div><span className="subtle-pill">Logical view</span></div>
        <div className="topology-flow">
          <div className="topology-rail"><span>PROCESS INPUT</span><i/></div>
          <div className="topology-nodes">{topologyIds.map(id=>{const a=assets.find(x=>x.id===id);if(!a)return null;return <button key={id} className={`topology-node node-${a.status.toLowerCase()}`} onClick={()=>onSelect(a)}><span className="node-symbol"><Activity size={16}/></span><span><b>{a.name}</b><small>{a.id} · {a.plant}</small></span><strong>{a.health}%</strong><i className="node-status"/></button>})}</div>
          <div className="topology-rail"><i/><span>PROCESS OUTPUT</span></div>
        </div>
        <div className="topology-note"><span className="system-dot"/>Logical asset relationships are illustrative; no plant P&amp;ID or live connectivity is loaded.</div>
      </article>
    </div>
    <div className="advanced-grid advanced-grid-bottom">
      <article className="panel signal-panel">
        <div className="panel-heading"><div><h2>Vibration signal laboratory</h2><p>Deterministic synthetic waveform · Not measured telemetry</p></div><Activity size={17}/></div>
        <div className="signal-controls"><select value={signalAssetId} onChange={e=>setSignalAssetId(e.target.value)} aria-label="Select asset for signal demo">{assets.map(a=><option value={a.id} key={a.id}>{a.id} · {a.name}</option>)}</select><div className="segmented"><button className={signalView==='waveform'?'selected':''} onClick={()=>setSignalView('waveform')}>Waveform</button><button className={signalView==='spectrum'?'selected':''} onClick={()=>setSignalView('spectrum')}>FFT spectrum</button></div></div>
        <div className="signal-chart"><ResponsiveContainer width="100%" height="100%">{signalView==='waveform'?<LineChart data={signalSamples}><CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false}/><XAxis dataKey="sample" tickLine={false} axisLine={false} tick={{fontSize:9}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:9}}/><Tooltip contentStyle={{background:'var(--tooltip)',border:'1px solid var(--border)',borderRadius:8}}/><Line dataKey="amplitude" name="Normalised amplitude" stroke="#5b9ee8" strokeWidth={1.8} dot={false} isAnimationActive={false}/></LineChart>:<AreaChart data={spectrumBins}><CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false}/><XAxis dataKey="bin" tickLine={false} axisLine={false} tick={{fontSize:9}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:9}}/><Tooltip contentStyle={{background:'var(--tooltip)',border:'1px solid var(--border)',borderRadius:8}}/><Area dataKey="magnitude" name="Relative magnitude" stroke="#9b86e8" fill="#9b86e8" fillOpacity={.18} isAnimationActive={false}/></AreaChart>}</ResponsiveContainer></div>
        <div className="signal-foot"><span>Asset: <b>{selected?.id??'—'}</b></span><span>Live vibration reading: <b>{selected?.vibration.toFixed(1)??'—'} mm/s</b></span><span>Signal source: <b>synthetic</b></span></div>
      </article>
      <article className="panel rul-panel">
        <div className="panel-heading"><div><h2>RUL priority horizon</h2><p>Assets ranked by displayed remaining useful life</p></div><Clock3 size={17}/></div>
        <div className="rul-list">{ranked.map((a,index)=><button className="rul-row" key={a.id} onClick={()=>onSelect(a)}><span className="rul-rank">0{index+1}</span><span className="rul-main"><b>{a.name}</b><small>{a.id} · {a.failureMode}</small><i><em style={{width:`${Math.max(5,Math.min(100,a.rul/180*100))}%`}}/></i></span><strong className={a.rul<=14?'rul-urgent':''}>{a.rul}<small>days</small></strong></button>)}</div>
        <p className="rul-disclaimer">RUL values are illustrative point estimates. No confidence interval is shown because no validated uncertainty model is connected.</p>
      </article>
    </div>
  </section>;
}


function WorkOrderBoard({orders,onChange}:{orders:WorkOrder[];onChange:(next:WorkOrder[])=>void}) {
  const [dragging,setDragging]=useState<string|null>(null);
  const columns=['Open','In progress','Scheduled','Completed'];
  const moveOrder=(id:string,status:string)=>{
    onChange(orders.map(order=>order.id===id?{...order,status}:order));
    setDragging(null);
  };
  return <div className="work-board">
    {columns.map(status=>{
      const items=orders.filter(order=>order.status===status);
      return <section className="work-lane" key={status} onDragOver={event=>event.preventDefault()} onDrop={()=>dragging&&moveOrder(dragging,status)}>
        <header><span className="lane-title"><i className={'lane-dot lane-'+status.toLowerCase().replaceAll(' ','-')}/>{status}</span><b>{items.length}</b></header>
        <div className="work-lane-body">
          {items.map(order=><article className={'work-card '+(dragging===order.id?'is-dragging':'')} key={order.id} draggable onDragStart={()=>setDragging(order.id)} onDragEnd={()=>setDragging(null)}>
            <div className="work-card-top"><span>{order.id}</span><span className={'priority priority-'+order.priority.toLowerCase()}>{order.priority}</span></div>
            <h3>{order.title}</h3>
            <div className="work-card-meta"><span><Boxes size={12}/>{order.asset}</span><span><Clock3 size={12}/>{order.due}</span></div>
            <div className="work-card-actions">
              {status!=='Completed'&&<button onClick={()=>moveOrder(order.id,status==='Open'?'In progress':status==='In progress'?'Scheduled':'Completed')}>{status==='Open'?'Start work':status==='In progress'?'Schedule':'Complete'} <ChevronRight size={12}/></button>}
              {status==='Completed'&&<button onClick={()=>moveOrder(order.id,'Open')}>Reopen <ChevronRight size={12}/></button>}
            </div>
          </article>)}
          {items.length===0&&<div className="lane-empty">Drop a work order here</div>}
        </div>
      </section>;
    })}
  </div>;
}

function App() {
  const [assets,setAssets] = useState(initialAssets);
  const [orders,setOrders] = useState(initialOrders);
  const [search,setSearch] = useState('');
  const [theme,setTheme] = useState<'dark'|'light'>('dark');
  const [notice,setNotice] = useState(false);
  const [modal,setModal] = useState(false);
  const [command,setCommand] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [sidebarCollapsed,setSidebarCollapsed] = useState(false);
  const [selectedPlant,setSelectedPlant] = useState('All plants');
  const [selectedStatus,setSelectedStatus] = useState('All status');
  const [selectedAsset,setSelectedAsset] = useState<Asset|null>(null);
  const [workTitle,setWorkTitle] = useState('');
  const [workAsset,setWorkAsset] = useState('AST-001');
  const [workPriority,setWorkPriority] = useState('High');
  const location = useLocation();
  const navigate = useNavigate();
  const title = nav.find(n=>n.to===location.pathname)?.label ?? 'Overview';
  const filteredAssets = useMemo(()=>assets.filter(a=>(a.name+' '+a.id+' '+a.plant+' '+a.type).toLowerCase().includes(search.toLowerCase())&&(selectedPlant==='All plants'||a.plant===selectedPlant)&&(selectedStatus==='All status'||a.status===selectedStatus)),[assets,search,selectedPlant,selectedStatus]);
  const critical = assets.filter(a=>a.status==='Critical').length;
  const warning = assets.filter(a=>a.status==='Warning').length;
  const avgHealth = Math.round(assets.reduce((sum,a)=>sum+a.health,0)/assets.length);
  const openOrders = orders.filter(o=>o.status!=='Completed').length;

  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setCommand(v=>!v);}
      if(e.key==='Escape'){setCommand(false);setModal(false);setSelectedAsset(null);}
    };
    window.addEventListener('keydown',handler);
    return ()=>window.removeEventListener('keydown',handler);
  },[]);
  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const applyTheme = () => setTheme(nextTheme);
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> };
    };

    if (
      !transitionDocument.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyTheme();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = transitionDocument.startViewTransition(applyTheme);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 700,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  const createOrder=()=>{
    if(!workTitle.trim()) return;
    setOrders(prev=>[{id:'WO-'+(2409+prev.length),asset:workAsset,title:workTitle.trim(),priority:workPriority,status:'Open',due:'Unscheduled'},...prev]);
    setWorkTitle('');setModal(false);navigate('/work-orders');
  };
  const exportAssets=()=>{
    const headers=['Asset ID','Asset name','Plant','Type','Health %','Temperature C','Vibration mm/s','RUL days','Status','Failure mode','Failure probability %'];
    const rows=filteredAssets.map(a=>[a.id,a.name,a.plant,a.type,a.health,a.temperature,a.vibration,a.rul,a.status,a.failureMode,a.probability]);
    const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='apms-assets-demo.csv';link.click();URL.revokeObjectURL(url);
  };
  const assetTable=(rows:Asset[])=><div className='table-wrap'><table><thead><tr><th>ASSET</th><th>PLANT</th><th>HEALTH</th><th>TEMPERATURE</th><th>VIBRATION</th><th>RUL</th><th>STATUS</th><th/></tr></thead><tbody>{rows.map(a=><tr key={a.id} onClick={()=>setSelectedAsset(a)}><td><b>{a.name}</b><small>{a.id} · {a.type}</small></td><td>{a.plant}</td><td><Health value={a.health}/></td><td>{a.temperature.toFixed(1)} °C</td><td>{a.vibration.toFixed(1)} mm/s</td><td><b>{a.rul} days</b></td><td><Status value={a.status}/></td><td><ChevronRight size={15}/></td></tr>)}</tbody></table>{rows.length===0&&<div className='empty'>No assets match the selected filters.</div>}</div>;
  const heading=(eyebrow:string,h:string,sub:string,action?:React.ReactNode)=><div className='page-heading'><div><div className='eyebrow'>{eyebrow}</div><h1>{h}</h1><p>{sub}</p></div>{action}</div>;
  const assetFilters=<div className='filters'><label className='filter-search'><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search assets, IDs, plants...'/></label><select value={selectedPlant} onChange={e=>setSelectedPlant(e.target.value)}><option>All plants</option>{plants.map(p=><option key={p.name}>{p.name}</option>)}</select><select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)}><option>All status</option><option>Healthy</option><option>Warning</option><option>Critical</option></select><button className='button secondary' onClick={exportAssets}><Download size={15}/>Export CSV</button></div>;
  return <div className={'app '+theme}>
    <aside className={'sidebar '+(mobileNav?'mobile-open':'')+(sidebarCollapsed?' collapsed':'')}>
      <div className='brand'><div className='brand-mark'><Activity size={21}/></div><div className='brand-copy'><b>APMS</b><small>ASSET PERFORMANCE</small></div><button className='sidebar-fold' title={sidebarCollapsed?'Expand sidebar':'Collapse sidebar'} onClick={()=>setSidebarCollapsed(v=>!v)}>{sidebarCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button><button className='mobile-close' onClick={()=>setMobileNav(false)}><X size={17}/></button></div>
      <button className='plant-switch' onClick={()=>navigate('/plants')}><span className='plant-avatar'><Building2 size={16}/></span><span><b>Enterprise workspace</b><small>4 monitored plants</small></span><ChevronDown size={15}/></button>
      {['OPERATIONS','MAINTENANCE','INSIGHTS'].map(group=><div className='nav-group' key={group}><div className='nav-label'>{group}</div>{nav.filter(n=>n.group===group).map(n=><NavLink key={n.to} to={n.to} end={n.to==='/'} onClick={()=>setMobileNav(false)} className={({isActive})=>'nav-link '+(isActive?'active':'')}><n.icon size={17}/><span>{n.label}</span>{n.label==='Alerts'&&<em>{critical+warning}</em>}</NavLink>)}</div>)}
      <div className='sidebar-bottom'><div className='system-card'><div className='system-dot'/><span><b>Monitoring active</b><small>Demo environment · Local data</small></span></div><button className='nav-link' onClick={()=>navigate('/data-models')}><Settings2 size={17}/>System settings</button><div className='profile'><div className='profile-avatar'>SR</div><span><b>Maintenance admin</b><small>Administrator</small></span><ChevronDown size={14}/></div></div>
    </aside>
    <main className='main'>
      <header className='topbar'><button className='mobile-menu' onClick={()=>setMobileNav(true)}><Menu size={19}/></button><div className='breadcrumb'>APMS <ChevronRight size={14}/><b>{title}</b></div><div className='top-actions'><label className='global-search'><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search assets...'/><kbd>Ctrl K</kbd></label><button className='icon-button' title='Toggle theme' onClick={toggleTheme}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button className='icon-button notification-button' onClick={()=>setNotice(v=>!v)}><Bell size={18}/><i/></button><div className='top-avatar'>SR</div></div></header>
      {notice&&<div className='notification-pop'><b>Maintenance notifications</b><p>{critical} critical and {warning} warning assets need attention.</p><button onClick={()=>{setNotice(false);navigate('/alerts')}}>Review alerts <ChevronRight size={13}/></button></div>}
      <div className='content'>
        <Routes>
          <Route path='/' element={<>
            {heading('MONDAY, 03 NOVEMBER 2026','Asset health overview','Monitor equipment condition, detect emerging faults and plan maintenance.',<button className='button primary' onClick={()=>setModal(true)}><Plus size={16}/>New work order</button>)}
            <div className='metric-grid'>
              <Metric label='MONITORED ASSETS' value={String(assets.length)} unit=' assets' detail='Across 4 industrial plants' icon={Boxes} tone='violet'/>
              <Metric label='AVERAGE ASSET HEALTH' value={String(avgHealth)} unit='%' detail='Portfolio health index' icon={Gauge} tone='blue'/>
              <Metric label='CRITICAL ASSETS' value={String(critical)} detail='Immediate inspection recommended' icon={AlertTriangle} tone='red' change='up'/>
              <Metric label='PLANT AVAILABILITY' value='96.8' unit='%' detail='Illustrative operational KPI' icon={Zap} tone='green' change='down'/>
            </div>
            <div className='section-heading'><div><h2>Plant performance</h2><p>Asset condition summary by operating location</p></div><button className='text-button' onClick={()=>navigate('/plants')}>View all plants <ChevronRight size={14}/></button></div>
            <div className='plant-grid'>{plants.map(p=><article className='plant-card' key={p.name} onClick={()=>{setSelectedPlant(p.name);navigate('/assets')}}><div className='plant-card-top'><span className='plant-icon'><Factory size={18}/></span><span className='plant-alert'>{p.alerts>0?<><i/>{p.alerts} alerts</>:'No active alerts'}</span></div><h3>{p.name}</h3><p>{p.location}</p><div className='plant-stats'><span>Assets <b>{p.assets}</b></span><span>Availability <b>{p.availability}%</b></span></div><div className='plant-health'><span>Average health</span><Health value={p.health}/></div></article>)}</div>
            <AdvancedInsights assets={assets} onSelect={setSelectedAsset}/>
            <div className='dashboard-columns'><section className='panel'><div className='panel-heading'><div><h2>Asset condition trend</h2><p>Condition distribution · Last 7 days</p></div><span className='subtle-pill'>Demo data</span></div><div className='chart chart-large'><ResponsiveContainer width='100%' height='100%'><AreaChart data={history}><defs><linearGradient id='healthyFill' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor='#3bb98a' stopOpacity={.25}/><stop offset='100%' stopColor='#3bb98a' stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray='3 3' stroke='var(--grid)' vertical={false}/><XAxis dataKey='day' tickLine={false} axisLine={false}/><YAxis allowDecimals={false} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'var(--tooltip)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text)'}}/><Area dataKey='healthy' name='Healthy' type='monotone' stroke='#3bb98a' fill='url(#healthyFill)'/><Line dataKey='warning' name='Warning' type='monotone' stroke='#e5a642' strokeWidth={2}/><Line dataKey='critical' name='Critical' type='monotone' stroke='#e46c72' strokeWidth={2}/></AreaChart></ResponsiveContainer></div><div className='chart-legend'><span><i className='green-dot'/>Healthy</span><span><i className='amber-dot'/>Warning</span><span><i className='red-dot'/>Critical</span></div></section>
              <section className='panel'><div className='panel-heading'><div><h2>Priority attention</h2><p>Assets requiring closer monitoring</p></div><button className='text-button' onClick={()=>navigate('/alerts')}>All alerts <ChevronRight size={14}/></button></div><div className='attention-list'>{assets.filter(a=>a.status!=='Healthy').sort((a,b)=>a.health-b.health).map(a=><button className='attention-row' key={a.id} onClick={()=>setSelectedAsset(a)}><span className={'attention-icon '+a.status.toLowerCase()}><AlertTriangle size={16}/></span><span><b>{a.name}</b><small>{a.id} · {a.failureMode}</small></span><span className='attention-health'>{a.health}%<small>health</small></span></button>)}</div></section></div>
            <section className='panel table-panel'><div className='panel-heading'><div><h2>Asset register</h2><p>Latest condition indicators across monitored equipment</p></div><button className='text-button' onClick={()=>navigate('/assets')}>View asset register <ChevronRight size={14}/></button></div>{assetTable(assets.slice(0,5))}</section>
          </>}/>
          <Route path='/plants' element={<>{heading('OPERATIONS','Plant monitoring','Compare operational health and asset status across all monitored plants.')}<div className='plant-grid plant-grid-page'>{plants.map(p=><article className='plant-card' key={p.name}><div className='plant-card-top'><span className='plant-icon'><Factory size={18}/></span><span className='subtle-pill'>{p.assets} assets</span></div><h3>{p.name}</h3><p>{p.location}</p><div className='plant-health'><span>Average asset health</span><Health value={p.health}/></div><div className='plant-stats'><span>Availability <b>{p.availability}%</b></span><span>Open alerts <b>{p.alerts}</b></span></div><button className='button secondary full' onClick={()=>{setSelectedPlant(p.name);navigate('/assets')}}>View plant assets <ChevronRight size={14}/></button></article>)}</div></>}/>
          <Route path='/assets' element={<>{heading('OPERATIONS','Asset register','Explore equipment condition, sensor indicators and remaining useful life.',<button className='button primary' onClick={exportAssets}><Download size={15}/>Export CSV</button>)}{assetFilters}<section className='panel table-panel'>{assetTable(filteredAssets)}</section></>}/>
          <Route path='/predictions' element={<>{heading('MACHINE LEARNING','AI failure predictions','Review model-generated risk indicators and remaining useful life estimates.')}<div className='notice-banner'><BrainCircuit size={18}/><span><b>Illustrative prediction outputs</b><small>These values are mock data for UI development, not outputs from a trained or validated model.</small></span></div><div className='prediction-grid'>{assets.slice().sort((a,b)=>b.probability-a.probability).map(a=><article className='prediction-card' key={a.id} onClick={()=>setSelectedAsset(a)}><div className='prediction-top'><span>{a.id}</span><Status value={a.status}/></div><h3>{a.name}</h3><p>{a.plant} · {a.type}</p><div className='risk-number'>{a.probability}<small>%</small><span>30-day failure risk</span></div><div className='prediction-meta'><span>Estimated RUL <b>{a.rul} days</b></span><span>Health index <b>{a.health}%</b></span></div><div className='prediction-footer'><AlertTriangle size={14}/>{a.failureMode}</div></article>)}</div></>}/>
          <Route path='/alerts' element={<>{heading('MAINTENANCE','Condition alerts','Prioritised asset conditions based on the displayed demo thresholds.')}<div className='alert-summary'><div><b>{critical}</b><span>Critical</span></div><div><b>{warning}</b><span>Warning</span></div><div><b>{assets.length-critical-warning}</b><span>Healthy</span></div></div><section className='panel table-panel'><div className='panel-heading'><div><h2>Active condition alerts</h2><p>Review and investigate abnormal asset indicators</p></div></div><div className='alert-list'>{assets.filter(a=>a.status!=='Healthy').sort((a,b)=>a.health-b.health).map(a=><div className='alert-row' key={a.id}><span className={'attention-icon '+a.status.toLowerCase()}><AlertTriangle size={17}/></span><span className='alert-main'><b>{a.name}</b><small>{a.id} · {a.plant}</small><small>{a.failureMode}</small></span><span className='alert-reading'><b>{a.vibration.toFixed(1)} mm/s</b><small>Vibration</small></span><Status value={a.status}/><button className='button secondary compact' onClick={()=>setSelectedAsset(a)}>Investigate</button></div>)}</div></section></>}/>
          <Route path='/work-orders' element={<>{heading('MAINTENANCE','Work orders','Prioritise and move maintenance tasks through the execution workflow.',<button className='button primary' onClick={()=>setModal(true)}><Plus size={16}/>Create work order</button>)}<div className='metric-grid compact-metrics'><Metric label='OPEN WORK ORDERS' value={String(openOrders)} detail='Awaiting completion' icon={ClipboardList} tone='blue'/><Metric label='HIGH PRIORITY' value={String(orders.filter(o=>o.priority==='Critical'||o.priority==='High').length)} detail='Critical and high tasks' icon={AlertTriangle} tone='red'/><Metric label='COMPLETED' value={String(orders.filter(o=>o.status==='Completed').length)} detail='In this demo workspace' icon={Check} tone='green'/></div><div className='board-toolbar'><span><b>Execution board</b><small>Drag cards between stages or use their action button</small></span><span className='subtle-pill'>Session-only changes</span></div><WorkOrderBoard orders={orders} onChange={setOrders}/></>}/> <Route path='/analytics' element={<>{heading('INSIGHTS','Analytics & reports','Operational indicators and condition trends for the demo asset portfolio.')}<div className='metric-grid'><Metric label='MEAN TIME BETWEEN FAILURES' value='412' unit=' h' detail='Illustrative KPI' icon={Clock3} tone='blue'/><Metric label='MEAN TIME TO REPAIR' value='3.4' unit=' h' detail='Illustrative KPI' icon={Wrench} tone='violet'/><Metric label='AVAILABILITY' value='96.8' unit='%' detail='Illustrative KPI' icon={Zap} tone='green'/><Metric label='UNPLANNED DOWNTIME' value='18.5' unit=' h' detail='Illustrative KPI' icon={AlertTriangle} tone='red'/></div><div className='dashboard-columns'><section className='panel'><div className='panel-heading'><div><h2>Sensor trend sample</h2><p>Representative vibration and temperature readings</p></div><span className='subtle-pill'>Synthetic series</span></div><div className='chart chart-large'><ResponsiveContainer width='100%' height='100%'><LineChart data={trend}><CartesianGrid strokeDasharray='3 3' stroke='var(--grid)' vertical={false}/><XAxis dataKey='time' tickLine={false} axisLine={false}/><YAxis yAxisId='left' tickLine={false} axisLine={false}/><YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'var(--tooltip)',border:'1px solid var(--border)',borderRadius:9}}/><Line yAxisId='left' dataKey='vibration' name='Vibration (mm/s)' stroke='#8b7ce8' strokeWidth={2.5} dot={false}/><Line yAxisId='right' dataKey='temperature' name='Temperature (°C)' stroke='#e5a642' strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div></section><section className='panel'><div className='panel-heading'><div><h2>Portfolio status</h2><p>Current asset classification</p></div></div><div className='status-breakdown'>{[['Healthy',assets.filter(a=>a.status==='Healthy').length,'green'],['Warning',warning,'amber'],['Critical',critical,'red']].map(([label,count,color])=><div className='breakdown-row' key={String(label)}><span><i className={color+'-dot'}/>{label}</span><b>{count}</b></div>)}</div><p className='muted-note'>Status thresholds in this prototype: health below 40% = Critical; below 70% = Warning; otherwise Healthy.</p></section></div></>}/>
          <Route path='/data-models' element={<>{heading('PLATFORM','Data & model management','Integration and model governance placeholders for the APMS frontend.')}<div className='notice-banner'><CircleHelp size={18}/><span><b>Backend integration not configured</b><small>No live telemetry, database, inference endpoint or model registry is connected in this standalone frontend.</small></span></div><div className='integration-grid'><article className='panel integration-card'><span className='integration-icon'><Activity/></span><h3>Data ingestion</h3><p>Connect plant historians, PLC/SCADA gateways, IoT brokers or uploaded sensor datasets.</p><span className='subtle-pill'>Not connected</span></article><article className='panel integration-card'><span className='integration-icon'><BrainCircuit/></span><h3>Prediction service</h3><p>Integrate validated failure classification and remaining useful life inference APIs.</p><span className='subtle-pill'>Not connected</span></article><article className='panel integration-card'><span className='integration-icon'><ShieldCheck/></span><h3>Model governance</h3><p>Expose model version, validation metrics, training window, drift and deployment status.</p><span className='subtle-pill'>Not configured</span></article></div><section className='panel model-panel'><div className='panel-heading'><div><h2>Model performance</h2><p>Metrics to populate from an evaluated model run</p></div></div><div className='model-placeholders'>{['Accuracy','Precision','Recall','F1 score'].map(x=><div key={x}><span>{x}</span><b>—</b><small>Awaiting validated model metrics</small></div>)}</div></section></>}/>
        </Routes>
      </div>
      <footer><span><i className='footer-dot'/> APMS interface operational</span><span>Demo workspace · No live equipment connection</span></footer>
    </main>
    {command&&<div className='overlay' onMouseDown={e=>{if(e.target===e.currentTarget)setCommand(false)}}><div className='command-box'><div className='command-input'><Command size={17}/><input autoFocus placeholder='Search pages and actions...' value={search} onChange={e=>setSearch(e.target.value)}/><kbd>ESC</kbd><button onClick={()=>setCommand(false)}><X size={16}/></button></div>{nav.filter(n=>n.label.toLowerCase().includes(search.toLowerCase())).map(n=><button className='command-item' key={n.to} onClick={()=>{navigate(n.to);setCommand(false);setSearch('')}}><n.icon size={16}/>{n.label}<ChevronRight size={14}/></button>)}<div className='command-hint'>Navigate the APMS workspace</div></div></div>}
    {modal&&<div className='overlay' onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className='modal'><div className='modal-heading'><div><h2>Create work order</h2><p>Record a maintenance task for an asset.</p></div><button onClick={()=>setModal(false)}><X size={18}/></button></div><label>Work order description<input value={workTitle} onChange={e=>setWorkTitle(e.target.value)} placeholder='e.g. Inspect motor bearing'/></label><label>Asset<select value={workAsset} onChange={e=>setWorkAsset(e.target.value)}>{assets.map(a=><option value={a.id} key={a.id}>{a.id} · {a.name}</option>)}</select></label><label>Priority<select value={workPriority} onChange={e=>setWorkPriority(e.target.value)}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><div className='modal-actions'><button className='button secondary' onClick={()=>setModal(false)}>Cancel</button><button className='button primary' disabled={!workTitle.trim()} onClick={createOrder}>Create work order</button></div><small className='modal-note'>Saved in local browser state only; no backend persistence.</small></div></div>}
    {selectedAsset&&<div className='overlay' onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedAsset(null)}}><div className='detail-drawer'><div className='modal-heading'><div><div className='eyebrow'>ASSET DETAIL · {selectedAsset.id}</div><h2>{selectedAsset.name}</h2><p>{selectedAsset.plant} · {selectedAsset.type}</p></div><button onClick={()=>setSelectedAsset(null)}><X size={18}/></button></div><div className='drawer-health'><span>Asset health index</span><Health value={selectedAsset.health}/></div><Status value={selectedAsset.status}/><div className='drawer-grid'><div><small>Temperature</small><b>{selectedAsset.temperature} °C</b></div><div><small>Vibration</small><b>{selectedAsset.vibration} mm/s</b></div><div><small>Remaining useful life</small><b>{selectedAsset.rul} days</b></div><div><small>30-day failure risk</small><b>{selectedAsset.probability}%</b></div></div><div className='drawer-section'><h3>Potential failure mode</h3><p>{selectedAsset.failureMode}</p></div><div className='drawer-section'><h3>Suggested next step</h3><p>{selectedAsset.status==='Critical'?'Prioritise an inspection and assess safe operating conditions.':selectedAsset.status==='Warning'?'Schedule a targeted inspection and continue monitoring the trend.':'Continue routine monitoring and preventive maintenance.'}</p></div><button className='button primary full' onClick={()=>{setWorkAsset(selectedAsset.id);setSelectedAsset(null);setModal(true)}}><Plus size={15}/>Create work order</button><small className='modal-note'>All displayed measurements and predictions are illustrative demo values.</small></div></div>}
  </div>;
}
export default App;
