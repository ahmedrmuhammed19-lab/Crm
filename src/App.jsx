import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pztetotacahqkomoupoz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kzmDPmqG_QjcPx0yu10ETQ_p9O91Ch7";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COUNTRIES = [
  "France","Germany","Italy","Spain","Netherlands","Belgium","Switzerland","Austria","Portugal","Greece",
  "Sweden","Norway","Denmark","Finland","Poland","Czech Republic","Hungary","Romania","Croatia","Slovenia",
  "United States","United Kingdom","Canada","Australia","UAE","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Japan","China","South Korea","India","Turkey","Morocco","Tunisia","Algeria","Jordan","Lebanon",
  "New Zealand","Singapore","Malaysia","Thailand","Indonesia","Brazil","Argentina","South Africa","Russia","Ukraine"
];

const VISA_STATUSES = [
  { key:"new", label:"New", color:"#6C8EBF", bg:"#EBF2FF" },
  { key:"docs_collecting", label:"Collecting Docs", color:"#D6A520", bg:"#FFF8E1" },
  { key:"submitted", label:"Submitted", color:"#7B68EE", bg:"#F0EEFF", autoDate:"submission_date" },
  { key:"appointment_booked", label:"Appointment Booked", color:"#E07B39", bg:"#FFF0E8", autoDate:"appointment_date" },
  { key:"interview", label:"Interview", color:"#E07B39", bg:"#FFF0E8" },
  { key:"approved", label:"Approved ✓", color:"#2E9E6B", bg:"#E8F8F0" },
  { key:"rejected", label:"Rejected ✗", color:"#D94F4F", bg:"#FFECEC" },
  { key:"appeal", label:"Appeal", color:"#A0522D", bg:"#FFF3E8" },
];

const VISA_TYPES = ["Schengen","USA","UK","Canada","Australia","UAE","Other"];
const NATIONALITIES = ["Egyptian","Foreign Citizen"];
const PRIORITIES = [
  { key:"low", label:"Normal", color:"#888" },
  { key:"medium", label:"Medium", color:"#D6A520" },
  { key:"high", label:"Urgent", color:"#D94F4F" },
];

function today() { return new Date().toISOString().split("T")[0]; }
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB",{year:"numeric",month:"short",day:"numeric"});
}
function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function generateId() { return Math.random().toString(36).substr(2,9); }

const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:"9px", border:"1.5px solid #E4E8F0", fontSize:"13px", outline:"none", background:"#FAFBFF", fontFamily:"inherit", boxSizing:"border-box", color:"#222" };
const lbStyle = { display:"block", fontSize:"11px", fontWeight:"700", color:"#666", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.4px" };
const btnPrimary = { padding:"9px 20px", borderRadius:"9px", border:"none", cursor:"pointer", background:"linear-gradient(135deg,#0F2447,#1A3A6B)", color:"#fff", fontSize:"13px", fontWeight:"700", whiteSpace:"nowrap" };

function ClientPanel({ client, onSave, onClose }) {
  const empty = { name:"", phone:"", email:"", nationality:"Egyptian", visa_type:"Schengen", status:"new", priority:"medium", destination:"France", submission_date:"", appointment_date:"", notes:"", comments:[], tasks:[], logs:[] };
  const [form, setForm] = useState(client || empty);
  const [activeTab, setActiveTab] = useState("info");
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => { setForm(client || empty); setActiveTab("info"); }, [client?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setStatus = (newStatus) => {
    const st = VISA_STATUSES.find(s => s.key === newStatus);
    const updates = { status: newStatus };
    if (st?.autoDate) updates[st.autoDate] = today();
    const logEntry = { id:generateId(), text:`Status → "${st?.label}"`, date:new Date().toISOString(), type:"status" };
    setForm(f => ({ ...f, ...updates, logs:[...(f.logs||[]), logEntry] }));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const c = { id:generateId(), text:newComment.trim(), date:new Date().toISOString() };
    const log = { id:generateId(), text:`Comment: "${newComment.trim().slice(0,50)}"`, date:new Date().toISOString(), type:"comment" };
    setForm(f => ({ ...f, comments:[...(f.comments||[]),c], logs:[...(f.logs||[]),log] }));
    setNewComment("");
    setTimeout(() => commentRef.current?.scrollTo({top:9999,behavior:"smooth"}), 50);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const log = { id:generateId(), text:`Task added: "${newTask.trim()}"`, date:new Date().toISOString(), type:"task" };
    setForm(f => ({ ...f, tasks:[...(f.tasks||[]),{id:generateId(),text:newTask.trim(),done:false,date:new Date().toISOString()}], logs:[...(f.logs||[]),log] }));
    setNewTask("");
  };

  const toggleTask = (id) => {
    const task = form.tasks.find(t => t.id === id);
    const log = { id:generateId(), text:`Task "${task?.text}" → ${task?.done?"pending":"done"}`, date:new Date().toISOString(), type:"task" };
    setForm(f => ({ ...f, tasks:f.tasks.map(t=>t.id===id?{...t,done:!t.done}:t), logs:[...(f.logs||[]),log] }));
  };

  const deleteTask = (id) => setForm(f => ({ ...f, tasks:f.tasks.filter(t=>t.id!==id) }));
  const deleteComment = (id) => setForm(f => ({ ...f, comments:f.comments.filter(c=>c.id!==id) }));
  const handleSave = async () => { setSaving(true); await onSave(form); setSaving(false); };

  const statusObj = VISA_STATUSES.find(s => s.key === form.status) || VISA_STATUSES[0];
  const pr = PRIORITIES.find(p => p.key === form.priority) || PRIORITIES[1];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#fff"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0F2447,#1A3A6B)",padding:"16px 18px",color:"#fff",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"16px",fontWeight:"800"}}>{form.name||"New Client"}</div>
            <div style={{display:"flex",gap:"5px",marginTop:"5px",flexWrap:"wrap"}}>
              <span style={{background:statusObj.bg,color:statusObj.color,borderRadius:"20px",padding:"2px 9px",fontSize:"10px",fontWeight:"700"}}>{statusObj.label}</span>
              <span style={{background:"rgba(255,255,255,0.12)",color:"#fff",borderRadius:"20px",padding:"2px 9px",fontSize:"10px"}}>{form.visa_type}</span>
              <span style={{color:pr.color,background:"rgba(255,255,255,0.1)",borderRadius:"20px",padding:"2px 9px",fontSize:"10px",fontWeight:"700"}}>{pr.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"7px",width:"28px",height:"28px",cursor:"pointer",color:"#fff",fontSize:"14px",flexShrink:0}}>✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #EEF0F4",padding:"0 4px",overflowX:"auto",flexShrink:0}}>
        {[["info","📋 Info"],["comments",`💬 (${(form.comments||[]).length})`],["tasks",`✅ (${(form.tasks||[]).length})`],["logs","📜 Logs"]].map(([key,label])=>(
          <button key={key} onClick={()=>setActiveTab(key)} style={{background:"none",border:"none",cursor:"pointer",padding:"10px 12px",fontSize:"12px",fontWeight:activeTab===key?"700":"500",color:activeTab===key?"#0F2447":"#999",borderBottom:activeTab===key?"2px solid #0F2447":"2px solid transparent",marginBottom:"-1px",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{overflowY:"auto",flex:1,padding:"14px 16px"}}>

        {activeTab==="info"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"11px"}}>
            <div><label style={lbStyle}>Full Name</label><input value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="Client name" style={inputStyle}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              <div><label style={lbStyle}>Phone</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inputStyle}/></div>
              <div><label style={lbStyle}>Email</label><input value={form.email||""} onChange={e=>set("email",e.target.value)} type="email" style={inputStyle}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              <div>
                <label style={lbStyle}>Nationality</label>
                <select value={form.nationality} onChange={e=>set("nationality",e.target.value)} style={inputStyle}>
                  {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={lbStyle}>Visa Type</label>
                <select value={form.visa_type} onChange={e=>set("visa_type",e.target.value)} style={inputStyle}>
                  {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbStyle}>Destination</label>
              <select value={form.destination} onChange={e=>set("destination",e.target.value)} style={inputStyle}>
                {COUNTRIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              <div>
                <label style={lbStyle}>Status</label>
                <select value={form.status} onChange={e=>setStatus(e.target.value)} style={{...inputStyle,color:statusObj.color,fontWeight:"700"}}>
                  {VISA_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbStyle}>Priority</label>
                <select value={form.priority} onChange={e=>set("priority",e.target.value)} style={inputStyle}>
                  {PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              <div><label style={lbStyle}>Submission Date</label><input type="date" value={form.submission_date||""} onChange={e=>set("submission_date",e.target.value)} style={inputStyle}/></div>
              <div><label style={lbStyle}>Appointment Date</label><input type="date" value={form.appointment_date||""} onChange={e=>set("appointment_date",e.target.value)} style={inputStyle}/></div>
            </div>
            <div><label style={lbStyle}>Notes</label><textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} placeholder="Any notes..." rows={3} style={{...inputStyle,resize:"vertical",lineHeight:1.6}}/></div>
            <button onClick={handleSave} disabled={saving} style={{...btnPrimary,opacity:saving?0.7:1,width:"100%",textAlign:"center"}}>{saving?"Saving...":"💾 Save Client"}</button>
          </div>
        )}

        {activeTab==="comments"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div ref={commentRef} style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"420px",overflowY:"auto"}}>
              {(form.comments||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No comments yet</div>}
              {(form.comments||[]).map(c=>(
                <div key={c.id} style={{background:"#F7F9FF",borderRadius:"10px",padding:"10px 12px",borderLeft:"3px solid #6C8EBF",position:"relative"}}>
                  <div style={{fontSize:"13px",color:"#222",lineHeight:1.6,paddingRight:"18px"}}>{c.text}</div>
                  <div style={{fontSize:"11px",color:"#bbb",marginTop:"4px"}}>{formatDateTime(c.date)}</div>
                  <button onClick={()=>deleteComment(c.id)} style={{position:"absolute",right:"8px",top:"8px",background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"12px"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),addComment())} placeholder="Write comment... (Enter to send)" rows={2} style={{...inputStyle,flex:1,resize:"none"}}/>
              <button onClick={addComment} style={btnPrimary}>Add</button>
            </div>
          </div>
        )}

        {activeTab==="tasks"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",gap:"8px"}}>
              <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="New task..." style={{...inputStyle,flex:1}}/>
              <button onClick={addTask} style={btnPrimary}>+ Add</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              {(form.tasks||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No tasks yet</div>}
              {(form.tasks||[]).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:"10px",background:t.done?"#F0F9F4":"#F7F9FF",borderRadius:"9px",padding:"9px 12px",opacity:t.done?0.7:1}}>
                  <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{width:"15px",height:"15px",cursor:"pointer",accentColor:"#2E9E6B"}}/>
                  <span style={{flex:1,fontSize:"13px",textDecoration:t.done?"line-through":"none",color:t.done?"#888":"#222"}}>{t.text}</span>
                  <span style={{fontSize:"11px",color:"#bbb"}}>{formatDate(t.date)}</span>
                  <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"12px"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==="logs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {(form.logs||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No activity yet</div>}
            {[...(form.logs||[])].reverse().map(l=>(
              <div key={l.id} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}>
                <div style={{fontSize:"15px",marginTop:"1px"}}>{l.type==="status"?"🔄":l.type==="comment"?"💬":l.type==="task"?"✅":"📝"}</div>
                <div>
                  <div style={{fontSize:"12px",color:"#333"}}>{l.text}</div>
                  <div style={{fontSize:"11px",color:"#bbb",marginTop:"2px"}}>{formatDateTime(l.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DailyTasksPage() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("daily_tasks_v1")||"[]"); } catch { return []; }
  });
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { localStorage.setItem("daily_tasks_v1",JSON.stringify(tasks)); }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(t=>[{id:generateId(),text:newTask.trim(),done:false,date:new Date().toISOString(),priority:"medium"},...t]);
    setNewTask("");
  };
  const toggleTask = (id) => setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x));
  const deleteTask = (id) => setTasks(t=>t.filter(x=>x.id!==id));
  const setPriority = (id,p) => setTasks(t=>t.map(x=>x.id===id?{...x,priority:p}:x));
  const clearDone = () => setTasks(t=>t.filter(x=>!x.done));

  const filtered = tasks.filter(t=>filter==="all"||(filter==="done"?t.done:!t.done));
  const doneCount = tasks.filter(t=>t.done).length;

  return (
    <div style={{padding:"24px",maxWidth:"680px",margin:"0 auto"}}>
      <div style={{marginBottom:"20px"}}>
        <div style={{fontSize:"20px",fontWeight:"800",color:"#0F2447",marginBottom:"4px"}}>📋 Daily Tasks</div>
        <div style={{fontSize:"13px",color:"#888"}}>{formatDate(new Date().toISOString())} · {doneCount}/{tasks.length} completed</div>
      </div>
      {tasks.length>0&&(
        <div style={{background:"#EEF0F8",borderRadius:"20px",height:"6px",marginBottom:"20px",overflow:"hidden"}}>
          <div style={{background:"linear-gradient(90deg,#2E9E6B,#52C99A)",height:"100%",width:`${(doneCount/tasks.length)*100}%`,borderRadius:"20px",transition:"width 0.4s"}}/>
        </div>
      )}
      <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Add a task for today..." style={{...inputStyle,flex:1}}/>
        <button onClick={addTask} style={btnPrimary}>+ Add</button>
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
        {[["all","All"],["pending","Pending"],["done","Done"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:filter===k?"#0F2447":"#F0F2F5",color:filter===k?"#fff":"#666",fontSize:"12px",fontWeight:"600"}}>{l}</button>
        ))}
        {doneCount>0&&<button onClick={clearDone} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:"#FFECEC",color:"#D94F4F",fontSize:"12px",fontWeight:"600",marginLeft:"auto"}}>Clear Done</button>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {filtered.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"40px 0",fontSize:"14px"}}>No tasks</div>}
        {filtered.map(t=>{
          const pr=PRIORITIES.find(p=>p.key===t.priority)||PRIORITIES[1];
          return(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:"10px",background:t.done?"#F8FFF8":"#fff",borderRadius:"12px",padding:"12px 14px",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",opacity:t.done?0.7:1,border:"1px solid #F0F2F8"}}>
              <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{width:"16px",height:"16px",cursor:"pointer",accentColor:"#2E9E6B"}}/>
              <span style={{flex:1,fontSize:"13px",textDecoration:t.done?"line-through":"none",color:t.done?"#aaa":"#222"}}>{t.text}</span>
              <select value={t.priority} onChange={e=>setPriority(t.id,e.target.value)} style={{fontSize:"11px",color:pr.color,border:"none",background:"transparent",cursor:"pointer",fontWeight:"700"}}>
                {PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"13px"}}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VisaCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisa, setFilterVisa] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState("clients");

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const {data,error} = await supabase.from("clients").select("*").order("created_at",{ascending:false});
      if (error) showToast("Failed to load: "+error.message,"error");
      else setClients(data||[]);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const saveClient = async (form) => {
    const payload = { name:form.name, phone:form.phone, email:form.email, nationality:form.nationality, visa_type:form.visa_type, status:form.status, priority:form.priority, destination:form.destination, submission_date:form.submission_date||null, appointment_date:form.appointment_date||null, notes:form.notes, comments:form.comments||[], tasks:form.tasks||[], logs:form.logs||[] };
    if (form.id) {
      const {data,error} = await supabase.from("clients").update(payload).eq("id",form.id).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>c.map(cl=>cl.id===form.id?data:cl));
      setSelectedClient(data);
      showToast("Saved ✓");
    } else {
      const {data,error} = await supabase.from("clients").insert(payload).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>[data,...c]);
      setSelectedClient(data);
      setIsNewClient(false);
      showToast("Client added ✓");
    }
  };

  const deleteClient = async (id) => {
    const {error} = await supabase.from("clients").delete().eq("id",id);
    if (error) { showToast("Delete failed","error"); return; }
    setClients(c=>c.filter(cl=>cl.id!==id));
    if (selectedClient?.id===id) setSelectedClient(null);
    setDeleteConfirm(null);
    showToast("Deleted");
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (!q||[c.name,c.phone,c.nationality,c.destination].some(v=>v?.toLowerCase().includes(q)))
      &&(filterStatus==="all"||c.status===filterStatus)
      &&(filterVisa==="all"||c.visa_type===filterVisa);
  });

  const stats = { total:clients.length, approved:clients.filter(c=>c.status==="approved").length, pending:clients.filter(c=>["submitted","docs_collecting","interview","appointment_booked"].includes(c.status)).length, urgent:clients.filter(c=>c.priority==="high").length };
  const panelOpen = selectedClient || isNewClient;

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#F4F6FB",fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>

      {toast&&<div style={{position:"fixed",top:"14px",right:"14px",zIndex:9999,background:toast.type==="error"?"#D94F4F":"#2E9E6B",color:"#fff",padding:"10px 16px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",boxShadow:"0 6px 20px rgba(0,0,0,0.2)",animation:"slideIn 0.3s ease"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0A1628,#0F2447,#1A3A6B)",padding:"0 20px",color:"#fff",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:"52px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"20px"}}>🛂</span>
            <span style={{fontSize:"15px",fontWeight:"800"}}>Visa CRM</span>
            <div style={{display:"flex",gap:"2px",marginLeft:"12px"}}>
              {[["clients","👥 Clients"],["daily","📋 Daily"]].map(([k,l])=>(
                <button key={k} onClick={()=>setPage(k)} style={{background:page===k?"rgba(255,255,255,0.15)":"transparent",border:"none",cursor:"pointer",color:page===k?"#fff":"rgba(255,255,255,0.5)",padding:"5px 12px",borderRadius:"7px",fontSize:"12px",fontWeight:"600"}}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.07)",padding:"3px 8px",borderRadius:"20px"}}>☁️ Live</span>
            {page==="clients"&&<button onClick={()=>{setSelectedClient(null);setIsNewClient(true);}} style={{...btnPrimary,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",padding:"6px 12px",fontSize:"12px"}}>+ New</button>}
          </div>
        </div>
      </div>

      {page==="daily"?<DailyTasksPage/>:(
        <div style={{display:"flex",flex:1,overflow:"hidden"}}>

          {/* LEFT PANEL */}
          <div style={{display:"flex",flexDirection:"column",width:panelOpen?"320px":"100%",minWidth:panelOpen?"260px":"auto",flexShrink:0,borderRight:panelOpen?"1px solid #E8EAF0":"none",overflow:"hidden"}}>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",padding:"10px 12px",flexShrink:0}}>
              {[{l:"Total",v:stats.total,c:"#0F2447",bg:"#E8EEFF"},{l:"Approved",v:stats.approved,c:"#2E9E6B",bg:"#E8F8F0"},{l:"Active",v:stats.pending,c:"#D6A520",bg:"#FFF8E1"},{l:"Urgent",v:stats.urgent,c:"#D94F4F",bg:"#FFECEC"}].map(s=>(
                <div key={s.l} style={{background:"#fff",borderRadius:"9px",padding:"8px",boxShadow:"0 1px 5px rgba(0,0,0,0.06)",textAlign:"center"}}>
                  <div style={{fontSize:"18px",fontWeight:"800",color:s.c}}>{s.v}</div>
                  <div style={{fontSize:"10px",color:"#999"}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Filters */}
            <div style={{padding:"0 12px 10px",display:"flex",flexDirection:"column",gap:"6px",flexShrink:0}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search..." style={{...inputStyle,fontSize:"12px"}}/>
              <div style={{display:"flex",gap:"5px"}}>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inputStyle,fontSize:"11px",flex:1}}>
                  <option value="all">All Statuses</option>
                  {VISA_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <select value={filterVisa} onChange={e=>setFilterVisa(e.target.value)} style={{...inputStyle,fontSize:"11px",flex:1}}>
                  <option value="all">All Types</option>
                  {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            {/* Client List */}
            <div style={{overflowY:"auto",flex:1,padding:"0 12px 12px"}}>
              {loading&&<div style={{textAlign:"center",padding:"40px",color:"#aaa",fontSize:"13px"}}>⏳ Loading...</div>}
              {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#ccc",fontSize:"13px"}}>{clients.length===0?'No clients yet':'No results'}</div>}
              {!loading&&filtered.map(c=>{
                const st=VISA_STATUSES.find(s=>s.key===c.status)||VISA_STATUSES[0];
                const pr=PRIORITIES.find(p=>p.key===c.priority)||PRIORITIES[1];
                const isSelected=selectedClient?.id===c.id;
                return(
                  <div key={c.id} onClick={()=>{setSelectedClient(c);setIsNewClient(false);}} style={{background:isSelected?"#EEF2FF":"#fff",borderRadius:"11px",padding:"11px 12px",marginBottom:"7px",cursor:"pointer",border:isSelected?"1.5px solid #7B68EE":"1.5px solid transparent",boxShadow:"0 1px 5px rgba(0,0,0,0.06)",transition:"all 0.15s"}}
                    onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="#F7F9FF";}}
                    onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="#fff";}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"6px"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:"700",fontSize:"13px",color:"#0F2447",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name||"—"}</div>
                        <div style={{fontSize:"11px",color:"#888",marginTop:"2px"}}>{c.visa_type} · {c.destination||"—"}</div>
                        {c.phone&&<div style={{fontSize:"11px",color:"#bbb"}}>{c.phone}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"3px",flexShrink:0}}>
                        <span style={{background:st.bg,color:st.color,borderRadius:"20px",padding:"2px 7px",fontSize:"10px",fontWeight:"700",whiteSpace:"nowrap"}}>{st.label}</span>
                        <span style={{color:pr.color,fontSize:"10px",fontWeight:"700"}}>{pr.label}</span>
                      </div>
                    </div>
                    {c.appointment_date&&<div style={{fontSize:"10px",color:"#7B68EE",marginTop:"5px"}}>📅 {formatDate(c.appointment_date)}</div>}
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:"5px"}}>
                      <button onClick={e=>{e.stopPropagation();setDeleteConfirm(c.id);}} style={{background:"#FFECEC",border:"none",borderRadius:"5px",padding:"2px 7px",cursor:"pointer",color:"#D94F4F",fontSize:"11px"}}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          {panelOpen&&(
            <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <ClientPanel client={isNewClient?null:selectedClient} onSave={saveClient} onClose={()=>{setSelectedClient(null);setIsNewClient(false);}}/>
            </div>
          )}
          {!panelOpen&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",flexDirection:"column",gap:"10px"}}>
              <div style={{fontSize:"40px"}}>👈</div>
              <div style={{fontSize:"13px"}}>Select a client to view details</div>
            </div>
          )}
        </div>
      )}

      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,15,30,0.7)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:"18px",padding:"26px",maxWidth:"300px",width:"90%",textAlign:"center"}}>
            <div style={{fontSize:"34px",marginBottom:"10px"}}>🗑️</div>
            <div style={{fontSize:"15px",fontWeight:"800",color:"#0F2447",marginBottom:"6px"}}>Delete Client?</div>
            <div style={{fontSize:"12px",color:"#888",marginBottom:"18px"}}>This will permanently delete all data.</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              <button onClick={()=>deleteClient(deleteConfirm)} style={{...btnPrimary,background:"#D94F4F"}}>Delete</button>
              <button onClick={()=>setDeleteConfirm(null)} style={{...btnPrimary,background:"#F0F2F5",color:"#444"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
