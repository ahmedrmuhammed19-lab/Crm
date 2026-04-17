import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pztetotacahqkomoupoz.supabase.co",
  "sb_publishable_kzmDPmqG_QjcPx0yu10ETQ_p9O91Ch7"
);

// ── DATA ──────────────────────────────────────────────────────────────────────
const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China","Colombia","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const STATUSES = [
  { key:"new",          label:"New",                icon:"🆕", color:"#6B7FD7", bg:"rgba(107,127,215,0.12)" },
  { key:"onboarding",   label:"Onboarding",         icon:"👋", color:"#A78BFA", bg:"rgba(167,139,250,0.12)" },
  { key:"hunting",      label:"Appt Hunting",       icon:"🔍", color:"#F59E0B", bg:"rgba(245,158,11,0.12)"  },
  { key:"booked",       label:"Appt Booked",        icon:"📅", color:"#10B981", bg:"rgba(16,185,129,0.12)", autoDate:"appointment_date" },
  { key:"file_ready",   label:"File Ready",         icon:"📁", color:"#3B82F6", bg:"rgba(59,130,246,0.12)"  },
  { key:"submitted",    label:"Submitted",          icon:"📤", color:"#8B5CF6", bg:"rgba(139,92,246,0.12)", autoDate:"submission_date" },
  { key:"result",       label:"Result",             icon:"⏳", color:"#F97316", bg:"rgba(249,115,22,0.12)"  },
  { key:"closed",       label:"Closed ✓",          icon:"✅", color:"#10B981", bg:"rgba(16,185,129,0.12)"  },
  { key:"cancelled",    label:"Cancelled",          icon:"❌", color:"#EF4444", bg:"rgba(239,68,68,0.12)"   },
];

const BLOCKERS   = ["None","Missing Docs","Waiting Client","No Slots","Payment","Other"];
const VISA_TYPES = ["Tourism Visa","Business Visa","Medical Visa","Student Visa","Work Visa","Family Visa","Transit Visa","Online Visa","Other"];
const CENTERS    = ["TLS Sheikh Zayed","TLS Tagmoaa","TLS Hurgada","TLS Alexandria","BLS","VFS Cairo","VFS New Cairo","VFS Alexandria","Other"];
const APT_STATUS = ["Trying","Booked","Cancelled","Attended","Rescheduled"];
const PRIORITIES = [
  { key:"high",   label:"Urgent", color:"#EF4444" },
  { key:"medium", label:"Medium", color:"#F59E0B" },
  { key:"low",    label:"Normal", color:"#10B981" },
];
const TASK_TYPES = ["Contract Check","Create Case","Welcome Call","Missing Docs Follow-up","Application Form","Cover Letter","Itinerary","Hotel Booking","Flight Reservation","Insurance","Financial Docs","Translation","Appointment Search","OTP Handling","Booking Confirmation","Reschedule","File Review (QA)","Payment Follow-up"];
const TASK_STATUSES = [
  { key:"todo",    label:"To Do",   color:"#6B7280" },
  { key:"doing",   label:"Doing",   color:"#F59E0B" },
  { key:"blocked", label:"Blocked", color:"#EF4444" },
  { key:"done",    label:"Done",    color:"#10B981" },
];

// Auto tasks per status
const AUTO_TASKS = {
  new:        ["Contract Check","Create Case","Welcome Call"],
  onboarding: ["Missing Docs Follow-up","Application Form"],
  hunting:    ["Appointment Search","OTP Handling"],
  booked:     ["Booking Confirmation","Itinerary","Hotel Booking","Flight Reservation","Insurance"],
  file_ready: ["File Review (QA)","Financial Docs","Translation"],
  submitted:  ["Payment Follow-up"],
};

function uid()     { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function fDate(d)  { if(!d) return "—"; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
function fDT(d)    { if(!d) return ""; return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }

function sendWA(client) {
  const st = STATUSES.find(s=>s.key===client.status);
  const msg =
`Hello ${client.name||""}! 👋

This is an update on your *${client.visa_type||"visa"}* application to *${client.destination||"your destination"}*.

📌 Status: *${st?.label||client.status}*${client.appointment_date?`\n📅 Appointment: *${fDate(client.appointment_date)}*`:""}${client.center?`\n🏢 Center: *${client.center}*`:""}${client.blocker&&client.blocker!=="None"?`\n⚠️ Pending: *${client.blocker}*`:""}

Feel free to reach out anytime!
_Global EIS Team_ 🌐`;
  window.open(`https://wa.me/${(client.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
}

// ── THEME ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:"#F7F8FC", surface:"#FFFFFF", surface2:"#F0F2F8", border:"#E5E7EB",
  text:"#111827", text2:"#6B7280", text3:"#9CA3AF",
  header:"linear-gradient(135deg,#0F2447,#1A3A6B)", headerText:"#fff",
  card:"#FFFFFF", cardBorder:"#E5E7EB", shadow:"0 1px 8px rgba(0,0,0,0.08)",
  input:"#F9FAFB", inputBorder:"#E5E7EB",
};
const DARK = {
  bg:"#0F1117", surface:"#1A1D27", surface2:"#22263A", border:"#2D3147",
  text:"#F1F5F9", text2:"#94A3B8", text3:"#64748B",
  header:"linear-gradient(135deg,#0A0F1E,#111827)", headerText:"#F1F5F9",
  card:"#1A1D27", cardBorder:"#2D3147", shadow:"0 1px 8px rgba(0,0,0,0.4)",
  input:"#22263A", inputBorder:"#2D3147",
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function StatusBadge({ statusKey }) {
  const s = STATUSES.find(x=>x.key===statusKey)||STATUSES[0];
  return <span style={{background:s.bg,color:s.color,borderRadius:"8px",padding:"3px 10px",fontSize:"11px",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px",whiteSpace:"nowrap"}}>{s.icon} {s.label}</span>;
}
function PriorityDot({ p }) {
  const pr = PRIORITIES.find(x=>x.key===p)||PRIORITIES[1];
  return <span style={{width:"8px",height:"8px",borderRadius:"50%",background:pr.color,display:"inline-block",flexShrink:0}} title={pr.label}/>;
}

function Toast({ msg, type }) {
  return <div style={{position:"fixed",top:"16px",right:"16px",zIndex:9999,background:type==="error"?"#EF4444":"#10B981",color:"#fff",padding:"12px 18px",borderRadius:"12px",fontSize:"13px",fontWeight:"600",boxShadow:"0 8px 24px rgba(0,0,0,0.25)",animation:"slideDown 0.3s ease"}}>{msg}</div>;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ clients, T }) {
  const byStatus = STATUSES.map(s=>({ ...s, count:clients.filter(c=>c.status===s.key).length }));
  const urgent = clients.filter(c=>c.priority==="high"&&!["closed","cancelled"].includes(c.status));
  const upcoming = clients.filter(c=>c.appointment_date&&c.appointment_date>=todayStr()).sort((a,b)=>a.appointment_date>b.appointment_date?1:-1).slice(0,5);
  const blocked = clients.filter(c=>c.blocker&&c.blocker!=="None"&&!["closed","cancelled"].includes(c.status));

  return (
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"16px"}}>
      {/* Status grid */}
      <div>
        <div style={{fontSize:"11px",fontWeight:"700",color:T.text3,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"10px"}}>Pipeline Overview</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
          {byStatus.map(s=>(
            <div key={s.key} style={{background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:"12px",padding:"12px",boxShadow:T.shadow}}>
              <div style={{fontSize:"20px",marginBottom:"4px"}}>{s.icon}</div>
              <div style={{fontSize:"22px",fontWeight:"800",color:s.color}}>{s.count}</div>
              <div style={{fontSize:"10px",color:T.text2,marginTop:"1px",lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming appointments */}
      {upcoming.length>0&&(
        <div>
          <div style={{fontSize:"11px",fontWeight:"700",color:T.text3,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"10px"}}>📅 Upcoming Appointments</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {upcoming.map(c=>(
              <div key={c.id} style={{background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:"12px",padding:"12px",boxShadow:T.shadow,display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{background:"rgba(139,92,246,0.12)",borderRadius:"10px",padding:"8px 10px",textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:"14px",fontWeight:"800",color:"#8B5CF6"}}>{new Date(c.appointment_date).getDate()}</div>
                  <div style={{fontSize:"9px",color:"#8B5CF6"}}>{new Date(c.appointment_date).toLocaleString("en",{month:"short"})}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"700",fontSize:"13px",color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                  <div style={{fontSize:"11px",color:T.text2}}>{c.center||c.destination}</div>
                </div>
                <StatusBadge statusKey={c.status}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent */}
      {urgent.length>0&&(
        <div>
          <div style={{fontSize:"11px",fontWeight:"700",color:"#EF4444",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"10px"}}>🔴 Urgent Cases ({urgent.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {urgent.slice(0,4).map(c=>(
              <div key={c.id} style={{background:T.card,border:"1px solid rgba(239,68,68,0.3)",borderRadius:"12px",padding:"12px",display:"flex",alignItems:"center",gap:"10px"}}>
                <PriorityDot p="high"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"700",fontSize:"13px",color:T.text}}>{c.name}</div>
                  <div style={{fontSize:"11px",color:T.text2}}>{c.destination} · {c.visa_type}</div>
                </div>
                <StatusBadge statusKey={c.status}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked */}
      {blocked.length>0&&(
        <div>
          <div style={{fontSize:"11px",fontWeight:"700",color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"10px"}}>⚠️ Blocked ({blocked.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {blocked.slice(0,4).map(c=>(
              <div key={c.id} style={{background:T.card,border:"1px solid rgba(245,158,11,0.3)",borderRadius:"12px",padding:"12px",display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{fontSize:"13px"}}>🚫</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"700",fontSize:"13px",color:T.text}}>{c.name}</div>
                  <div style={{fontSize:"11px",color:"#F59E0B",fontWeight:"600"}}>{c.blocker}</div>
                </div>
                <StatusBadge statusKey={c.status}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENT DETAIL ─────────────────────────────────────────────────────────────
function ClientDetail({ client, onSave, onBack, onDelete, T, dark }) {
  const blank = { name:"",phone:"",email:"",nationality:"Egyptian",visa_type:"Tourism Visa",status:"new",priority:"medium",destination:"France",blocker:"None",task_status:"todo",center:"VFS Cairo",appointment_status:"Trying",submission_date:"",appointment_date:"",notes:"",comments:[],tasks:[],logs:[],images:[] };
  const [form, setForm] = useState(client ? {...blank,...client} : blank);
  const [tab, setTab] = useState("info");
  const [newComment, setNewComment] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskType, setNewTaskType] = useState(TASK_TYPES[0]);
  const [saving, setSaving] = useState(false);
  const [imgViewer, setImgViewer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(()=>{ setForm(client?{...blank,...client}:blank); setTab("info"); },[client?.id]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const changeStatus = (newStatus) => {
    const st = STATUSES.find(s=>s.key===newStatus);
    const updates = { status:newStatus };
    if (st?.autoDate) updates[st.autoDate] = todayStr();

    // Auto-generate tasks
    const autoList = AUTO_TASKS[newStatus]||[];
    const existingTexts = (form.tasks||[]).map(t=>t.text);
    const newAutoTasks = autoList
      .filter(tt=>!existingTexts.includes(tt))
      .map(tt=>({ id:uid(), text:tt, type:tt, status:"todo", auto:true, date:new Date().toISOString() }));

    const log = { id:uid(), text:`Status → "${st?.label}"${newAutoTasks.length?` · ${newAutoTasks.length} tasks auto-added`:""}`, date:new Date().toISOString(), type:"status" };
    setForm(f=>({ ...f, ...updates, tasks:[...(f.tasks||[]),...newAutoTasks], logs:[...(f.logs||[]),log] }));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const c = { id:uid(), text:newComment.trim(), date:new Date().toISOString() };
    const log = { id:uid(), text:`Note: "${newComment.slice(0,50)}"`, date:new Date().toISOString(), type:"comment" };
    setForm(f=>({...f,comments:[...(f.comments||[]),c],logs:[...(f.logs||[]),log]}));
    setNewComment("");
    setTimeout(()=>commentsEndRef.current?.scrollIntoView({behavior:"smooth"}),60);
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const t = { id:uid(), text:newTaskText.trim(), type:newTaskType, status:"todo", date:new Date().toISOString() };
    setForm(f=>({...f,tasks:[...(f.tasks||[]),t]}));
    setNewTaskText("");
  };

  const setTaskStatus = (id,status) => setForm(f=>({...f,tasks:f.tasks.map(t=>t.id===id?{...t,status}:t)}));
  const delTask = (id) => setForm(f=>({...f,tasks:f.tasks.filter(t=>t.id!==id)}));
  const delComment = (id) => setForm(f=>({...f,comments:f.comments.filter(c=>c.id!==id)}));

  const uploadImg = (e) => {
    Array.from(e.target.files).forEach(file=>{
      const r = new FileReader();
      r.onload = ev => setForm(f=>({...f,images:[...(f.images||[]),{id:uid(),url:ev.target.result,name:file.name,date:new Date().toISOString()}]}));
      r.readAsDataURL(file);
    });
  };

  const handleSave = async () => { setSaving(true); await onSave(form); setSaving(false); };

  const st = STATUSES.find(s=>s.key===form.status)||STATUSES[0];
  const pr = PRIORITIES.find(p=>p.key===form.priority)||PRIORITIES[1];
  const tasksDone = (form.tasks||[]).filter(t=>t.status==="done").length;
  const totalTasks = (form.tasks||[]).length;

  const inp = { width:"100%", padding:"10px 12px", borderRadius:"10px", border:`1.5px solid ${T.inputBorder}`, fontSize:"13px", outline:"none", background:T.input, fontFamily:"inherit", boxSizing:"border-box", color:T.text };
  const lbl = { display:"block", fontSize:"11px", fontWeight:"700", color:T.text3, marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px" };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg}}>
      {imgViewer&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setImgViewer(null)}>
          <img src={imgViewer} style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:"12px"}} alt="doc"/>
        </div>
      )}

      {/* Top bar */}
      <div style={{background:T.header,padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#fff",padding:"7px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"600",display:"flex",alignItems:"center",gap:"4px"}}>← Clients</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontWeight:"800",fontSize:"16px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.name||"New Client"}</div>
          </div>
          <button onClick={()=>sendWA(form)} style={{background:"#25D366",border:"none",borderRadius:"9px",color:"#fff",width:"36px",height:"36px",cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}} title="Send WhatsApp">💬</button>
          <button onClick={handleSave} disabled={saving} style={{background:saving?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:"9px",color:"#fff",padding:"7px 14px",cursor:"pointer",fontSize:"13px",fontWeight:"700"}}>{saving?"...":"Save"}</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          <StatusBadge statusKey={form.status}/>
          <span style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",borderRadius:"8px",padding:"3px 10px",fontSize:"11px"}}>{form.visa_type}</span>
          <span style={{background:"rgba(255,255,255,0.1)",color:pr.color,borderRadius:"8px",padding:"3px 10px",fontSize:"11px",fontWeight:"700"}}>● {pr.label}</span>
          {form.blocker&&form.blocker!=="None"&&<span style={{background:"rgba(239,68,68,0.2)",color:"#FCA5A5",borderRadius:"8px",padding:"3px 10px",fontSize:"11px",fontWeight:"600"}}>🚫 {form.blocker}</span>}
          {totalTasks>0&&<span style={{background:"rgba(16,185,129,0.15)",color:"#34D399",borderRadius:"8px",padding:"3px 10px",fontSize:"11px",fontWeight:"600"}}>✅ {tasksDone}/{totalTasks}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",flexShrink:0}}>
        {[["info","📋 Info"],["tasks",`✅ Tasks ${totalTasks>0?`(${tasksDone}/${totalTasks})`:""}`.trim()],["notes",`💬 Notes (${(form.comments||[]).length})`],["docs",`📎 Docs (${(form.images||[]).length})`],["logs","🕓 Logs"]].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{background:"none",border:"none",cursor:"pointer",padding:"12px 14px",fontSize:"12px",fontWeight:tab===key?"700":"500",color:tab===key?"#6B7FD7":T.text2,borderBottom:tab===key?"2px solid #6B7FD7":"2px solid transparent",marginBottom:"-1px",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>

        {/* ── INFO ── */}
        {tab==="info"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {/* Status quick-change */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"14px"}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:T.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"10px"}}>Status Pipeline</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {STATUSES.map(s=>(
                  <button key={s.key} onClick={()=>changeStatus(s.key)} style={{padding:"6px 12px",borderRadius:"8px",border:`1.5px solid ${form.status===s.key?s.color:T.border}`,cursor:"pointer",background:form.status===s.key?s.bg:"transparent",color:form.status===s.key?s.color:T.text2,fontSize:"11px",fontWeight:"600",transition:"all 0.15s"}}>{s.icon} {s.label}</button>
                ))}
              </div>
              {AUTO_TASKS[form.status]&&<div style={{marginTop:"8px",fontSize:"11px",color:T.text3}}>⚡ Auto-tasks: {AUTO_TASKS[form.status].join(", ")}</div>}
            </div>

            {/* Basic info */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"14px",display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={lbl}>Full Name</label><input value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="Client full name" style={inp}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>Phone</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} type="tel" style={inp}/></div>
                <div><label style={lbl}>Email</label><input value={form.email||""} onChange={e=>set("email",e.target.value)} type="email" style={inp}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>Nationality</label><select value={form.nationality} onChange={e=>set("nationality",e.target.value)} style={inp}><option>Egyptian</option><option>Foreign Citizen</option></select></div>
                <div><label style={lbl}>Priority</label><select value={form.priority} onChange={e=>set("priority",e.target.value)} style={inp}>{PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></div>
              </div>
            </div>

            {/* Visa info */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"14px",display:"flex",flexDirection:"column",gap:"10px"}}>
              <div><label style={lbl}>Destination</label><select value={form.destination} onChange={e=>set("destination",e.target.value)} style={inp}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={lbl}>Visa Type</label><select value={form.visa_type} onChange={e=>set("visa_type",e.target.value)} style={inp}>{VISA_TYPES.map(v=><option key={v}>{v}</option>)}</select></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>Center</label><select value={form.center||"VFS Cairo"} onChange={e=>set("center",e.target.value)} style={inp}>{CENTERS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={lbl}>Blocker</label><select value={form.blocker||"None"} onChange={e=>set("blocker",e.target.value)} style={inp}>{BLOCKERS.map(b=><option key={b}>{b}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>Appt Status</label><select value={form.appointment_status||"Trying"} onChange={e=>set("appointment_status",e.target.value)} style={inp}>{APT_STATUS.map(a=><option key={a}>{a}</option>)}</select></div>
                <div><label style={lbl}>Task Status</label><select value={form.task_status||"todo"} onChange={e=>set("task_status",e.target.value)} style={inp}>{TASK_STATUSES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                <div><label style={lbl}>Submission Date</label><input type="date" value={form.submission_date||""} onChange={e=>set("submission_date",e.target.value)} style={inp}/></div>
                <div><label style={lbl}>Appointment Date</label><input type="date" value={form.appointment_date||""} onChange={e=>set("appointment_date",e.target.value)} style={inp}/></div>
              </div>
              <div><label style={lbl}>Notes</label><textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Notes..." style={{...inp,resize:"vertical",lineHeight:1.7}}/></div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{width:"100%",padding:"13px",borderRadius:"12px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6B7FD7,#8B5CF6)",color:"#fff",fontSize:"15px",fontWeight:"700",opacity:saving?0.7:1}}>{saving?"Saving...":"💾 Save Client"}</button>

            {client?.id&&!confirmDelete&&<button onClick={()=>setConfirmDelete(true)} style={{width:"100%",padding:"11px",borderRadius:"12px",border:`1px solid ${T.border}`,cursor:"pointer",background:"transparent",color:"#EF4444",fontSize:"13px",fontWeight:"600"}}>🗑 Delete Client</button>}
            {confirmDelete&&(
              <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"12px",padding:"14px"}}>
                <div style={{fontWeight:"700",color:"#EF4444",marginBottom:"6px"}}>Delete this client?</div>
                <div style={{fontSize:"12px",color:T.text2,marginBottom:"12px"}}>This cannot be undone.</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>onDelete(client.id)} style={{flex:1,padding:"10px",borderRadius:"10px",border:"none",background:"#EF4444",color:"#fff",fontWeight:"700",cursor:"pointer"}}>Yes, Delete</button>
                  <button onClick={()=>setConfirmDelete(false)} style={{flex:1,padding:"10px",borderRadius:"10px",border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:"600",cursor:"pointer"}}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS ── */}
        {tab==="tasks"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {totalTasks>0&&(
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <span style={{fontSize:"12px",fontWeight:"600",color:T.text2}}>Progress</span>
                  <span style={{fontSize:"12px",fontWeight:"800",color:"#10B981"}}>{Math.round(tasksDone/totalTasks*100)}%</span>
                </div>
                <div style={{background:T.surface2,borderRadius:"20px",height:"6px",overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#6B7FD7,#10B981)",height:"100%",width:`${tasksDone/totalTasks*100}%`,borderRadius:"20px",transition:"width 0.5s"}}/>
                </div>
              </div>
            )}

            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"14px"}}>
              <div style={{fontSize:"12px",fontWeight:"700",color:T.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"10px"}}>Add Task</div>
              <input value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Task description..." style={{...inp,marginBottom:"8px"}}/>
              <select value={newTaskType} onChange={e=>setNewTaskType(e.target.value)} style={{...inp,marginBottom:"8px"}}>
                {TASK_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
              <button onClick={addTask} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6B7FD7,#8B5CF6)",color:"#fff",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>+ Add Task</button>
            </div>

            {TASK_STATUSES.map(ts=>{
              const group = (form.tasks||[]).filter(t=>t.status===ts.key);
              if (!group.length) return null;
              return (
                <div key={ts.key}>
                  <div style={{fontSize:"11px",fontWeight:"700",color:ts.color,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"6px",display:"flex",alignItems:"center",gap:"6px"}}>
                    <span style={{width:"6px",height:"6px",borderRadius:"50%",background:ts.color,display:"inline-block"}}/>
                    {ts.label} ({group.length})
                  </div>
                  {group.map(t=>(
                    <div key={t.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"12px",marginBottom:"6px",borderLeft:`3px solid ${ts.color}`}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"13px",fontWeight:"600",color:T.text,marginBottom:"3px",textDecoration:t.status==="done"?"line-through":"none",opacity:t.status==="done"?0.6:1}}>{t.text}</div>
                          <div style={{fontSize:"11px",color:T.text3,display:"flex",alignItems:"center",gap:"4px"}}>{t.auto&&<span style={{background:"rgba(107,127,215,0.15)",color:"#6B7FD7",borderRadius:"4px",padding:"1px 5px",fontSize:"10px"}}>⚡ auto</span>}{t.type}</div>
                        </div>
                        <button onClick={()=>delTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.text3,fontSize:"14px",padding:"2px",flexShrink:0}}>✕</button>
                      </div>
                      <div style={{display:"flex",gap:"5px",marginTop:"8px",flexWrap:"wrap"}}>
                        {TASK_STATUSES.map(s=>(
                          <button key={s.key} onClick={()=>setTaskStatus(t.id,s.key)} style={{padding:"4px 10px",borderRadius:"6px",border:"none",cursor:"pointer",background:t.status===s.key?s.color:T.surface2,color:t.status===s.key?"#fff":T.text2,fontSize:"11px",fontWeight:"600",transition:"all 0.15s"}}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── NOTES ── */}
        {tab==="notes"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",gap:"8px"}}>
              <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),addComment())} placeholder="Add a note... (Enter to send)" rows={3} style={{...inp,flex:1,resize:"none"}}/>
              <button onClick={addComment} style={{padding:"10px 14px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6B7FD7,#8B5CF6)",color:"#fff",fontWeight:"700",cursor:"pointer",alignSelf:"flex-end"}}>Add</button>
            </div>
            {(form.comments||[]).length===0&&<div style={{textAlign:"center",color:T.text3,padding:"30px",fontSize:"13px"}}>No notes yet</div>}
            {[...(form.comments||[])].reverse().map(c=>(
              <div key={c.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"12px",borderLeft:"3px solid #6B7FD7",position:"relative"}}>
                <div style={{fontSize:"13px",color:T.text,lineHeight:1.7,paddingRight:"20px"}}>{c.text}</div>
                <div style={{fontSize:"11px",color:T.text3,marginTop:"5px"}}>{fDT(c.date)}</div>
                <button onClick={()=>delComment(c.id)} style={{position:"absolute",right:"10px",top:"10px",background:"none",border:"none",cursor:"pointer",color:T.text3,fontSize:"13px"}}>✕</button>
              </div>
            ))}
            <div ref={commentsEndRef}/>
          </div>
        )}

        {/* ── DOCS ── */}
        {tab==="docs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <label style={{width:"100%",padding:"13px",borderRadius:"12px",border:`2px dashed ${T.border}`,cursor:"pointer",textAlign:"center",color:T.text2,fontSize:"13px",fontWeight:"600",display:"block"}}>
              📁 Tap to Upload Images
              <input type="file" accept="image/*" multiple onChange={uploadImg} style={{display:"none"}}/>
            </label>
            {(form.images||[]).length===0&&<div style={{textAlign:"center",color:T.text3,padding:"30px",fontSize:"13px"}}>No documents uploaded</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {(form.images||[]).map(img=>(
                <div key={img.id} style={{position:"relative",borderRadius:"12px",overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <img src={img.url} onClick={()=>setImgViewer(img.url)} style={{width:"100%",height:"110px",objectFit:"cover",cursor:"pointer",display:"block"}} alt={img.name}/>
                  <div style={{padding:"6px 8px",background:T.surface,fontSize:"10px",color:T.text2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{img.name}</div>
                  <button onClick={()=>setForm(f=>({...f,images:f.images.filter(i=>i.id!==img.id)}))} style={{position:"absolute",top:"6px",right:"6px",background:"rgba(0,0,0,0.55)",border:"none",borderRadius:"50%",width:"22px",height:"22px",color:"#fff",cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGS ── */}
        {tab==="logs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {(form.logs||[]).length===0&&<div style={{textAlign:"center",color:T.text3,padding:"30px",fontSize:"13px"}}>No activity yet</div>}
            {[...(form.logs||[])].reverse().map(l=>(
              <div key={l.id} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"10px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:"10px"}}>
                <span style={{fontSize:"15px",flexShrink:0}}>{l.type==="status"?"🔄":l.type==="comment"?"💬":l.type==="task"?"✅":"📝"}</span>
                <div>
                  <div style={{fontSize:"12px",color:T.text,lineHeight:1.5}}>{l.text}</div>
                  <div style={{fontSize:"11px",color:T.text3,marginTop:"2px"}}>{fDT(l.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DAILY TASKS ───────────────────────────────────────────────────────────────
function DailyTasks({ onBack, T }) {
  const [tasks, setTasks] = useState(()=>{ try { return JSON.parse(localStorage.getItem("daily_v3")||"[]"); } catch { return []; } });
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState(TASK_TYPES[0]);
  const [newPri, setNewPri]   = useState("medium");
  const [filter, setFilter]   = useState("all");

  useEffect(()=>{ localStorage.setItem("daily_v3",JSON.stringify(tasks)); },[tasks]);

  const add = () => {
    if (!newText.trim()) return;
    setTasks(t=>[{id:uid(),text:newText.trim(),type:newType,priority:newPri,status:"todo",date:new Date().toISOString()},...t]);
    setNewText("");
  };
  const setStatus = (id,status) => setTasks(t=>t.map(x=>x.id===id?{...x,status}:x));
  const del = (id) => setTasks(t=>t.filter(x=>x.id!==id));

  const filtered = tasks.filter(t=>filter==="all"||(filter==="done"?t.status==="done":t.status!=="done"));
  const done = tasks.filter(t=>t.status==="done").length;

  const inp = { width:"100%",padding:"10px 12px",borderRadius:"10px",border:`1.5px solid ${T.inputBorder}`,fontSize:"13px",outline:"none",background:T.input,fontFamily:"inherit",boxSizing:"border-box",color:T.text };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg}}>
      <div style={{background:T.header,padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#fff",padding:"7px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>← Back</button>
          <div>
            <div style={{color:"#fff",fontWeight:"800",fontSize:"16px"}}>📋 Daily Tasks</div>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:"11px"}}>{fDate(new Date().toISOString())} · {done}/{tasks.length} done</div>
          </div>
        </div>
        {tasks.length>0&&(
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:"20px",height:"4px",marginTop:"8px",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(90deg,#6B7FD7,#10B981)",height:"100%",width:`${(done/tasks.length)*100}%`,borderRadius:"20px",transition:"width 0.5s"}}/>
          </div>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:"12px"}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add task..." style={inp}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <select value={newType} onChange={e=>setNewType(e.target.value)} style={{...inp,fontSize:"12px"}}>{TASK_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select value={newPri} onChange={e=>setNewPri(e.target.value)} style={{...inp,fontSize:"12px"}}>{PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select>
          </div>
          <button onClick={add} style={{padding:"10px",borderRadius:"10px",border:"none",background:"linear-gradient(135deg,#6B7FD7,#8B5CF6)",color:"#fff",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>+ Add Task</button>
        </div>

        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {[["all","All"],["pending","Pending"],["done","Done"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:"20px",border:`1px solid ${filter===k?"#6B7FD7":T.border}`,cursor:"pointer",background:filter===k?"#6B7FD7":"transparent",color:filter===k?"#fff":T.text2,fontSize:"12px",fontWeight:"600"}}>{l}</button>
          ))}
          {done>0&&<button onClick={()=>setTasks(t=>t.filter(x=>x.status!=="done"))} style={{padding:"6px 14px",borderRadius:"20px",border:"1px solid rgba(239,68,68,0.3)",cursor:"pointer",background:"transparent",color:"#EF4444",fontSize:"12px",fontWeight:"600",marginLeft:"auto"}}>Clear Done</button>}
        </div>

        {filtered.map(t=>{
          const ts = TASK_STATUSES.find(s=>s.key===t.status)||TASK_STATUSES[0];
          const pr = PRIORITIES.find(p=>p.key===t.priority)||PRIORITIES[1];
          return(
            <div key={t.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"12px",borderLeft:`3px solid ${ts.color}`}}>
              <div style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"13px",fontWeight:"600",color:T.text,textDecoration:t.status==="done"?"line-through":"none",opacity:t.status==="done"?0.5:1,marginBottom:"3px"}}>{t.text}</div>
                  <div style={{fontSize:"11px",color:T.text3}}>{t.type} · <span style={{color:pr.color,fontWeight:"600"}}>{pr.label}</span></div>
                </div>
                <button onClick={()=>del(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.text3,fontSize:"14px"}}>✕</button>
              </div>
              <div style={{display:"flex",gap:"5px",marginTop:"8px",flexWrap:"wrap"}}>
                {TASK_STATUSES.map(s=>(
                  <button key={s.key} onClick={()=>setStatus(t.id,s.key)} style={{padding:"4px 10px",borderRadius:"6px",border:"none",cursor:"pointer",background:t.status===s.key?s.color:T.surface2,color:t.status===s.key?"#fff":T.text2,fontSize:"11px",fontWeight:"600"}}>{s.label}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]       = useState(()=>localStorage.getItem("dark")==="1");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen]   = useState("list"); // list | client | daily | dashboard
  const [active, setActive]   = useState(null);
  const [search, setSearch]   = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fVisa,   setFVisa]   = useState("all");
  const [toast,   setToast]   = useState(null);

  const T = dark ? DARK : LIGHT;

  useEffect(()=>{ localStorage.setItem("dark",dark?"1":"0"); },[dark]);

  const toast$ = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };

  useEffect(()=>{
    supabase.from("clients").select("*").order("created_at",{ascending:false})
      .then(({data,error})=>{
        if(error) toast$(error.message,"error");
        else setClients(data||[]);
        setLoading(false);
      });
  },[]);

  const save = async (form) => {
    const p = {
      name:form.name||"", phone:form.phone||"", email:form.email||"",
      nationality:form.nationality, visa_type:form.visa_type,
      status:form.status, priority:form.priority,
      destination:form.destination, blocker:form.blocker||"None",
      task_status:form.task_status||"todo", center:form.center||"",
      appointment_status:form.appointment_status||"Trying",
      task_type:form.task_type||"",
      submission_date:form.submission_date||null,
      appointment_date:form.appointment_date||null,
      notes:form.notes||"",
      comments:form.comments||[], tasks:form.tasks||[],
      logs:form.logs||[], images:form.images||[]
    };
    if (form.id) {
      const {data,error} = await supabase.from("clients").update(p).eq("id",form.id).select().single();
      if (error) { toast$(error.message,"error"); return; }
      setClients(c=>c.map(x=>x.id===form.id?data:x));
      setActive(data);
      toast$("Saved ✓");
    } else {
      const {data,error} = await supabase.from("clients").insert(p).select().single();
      if (error) { toast$(error.message,"error"); return; }
      setClients(c=>[data,...c]);
      setActive(data);
      toast$("Client added ✓");
    }
  };

  const del = async (id) => {
    const {error} = await supabase.from("clients").delete().eq("id",id);
    if (error) { toast$(error.message,"error"); return; }
    setClients(c=>c.filter(x=>x.id!==id));
    setScreen("list"); setActive(null);
    toast$("Deleted");
  };

  const filtered = clients.filter(c=>{
    const q=search.toLowerCase();
    return (!q||[c.name,c.phone,c.nationality,c.destination].some(v=>v?.toLowerCase().includes(q)))
      &&(fStatus==="all"||c.status===fStatus)
      &&(fVisa==="all"||c.visa_type===fVisa);
  });

  if (screen==="client") return (
    <div style={{height:"100vh",overflow:"hidden",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      {toast&&<Toast {...toast}/>}
      <ClientDetail client={active} onSave={save} onBack={()=>setScreen("list")} onDelete={del} T={T} dark={dark}/>
    </div>
  );

  if (screen==="daily") return (
    <div style={{height:"100vh",overflow:"hidden",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <DailyTasks onBack={()=>setScreen("list")} T={T}/>
    </div>
  );

  // LIST / DASHBOARD
  const stats = {
    total:clients.length,
    closed:clients.filter(c=>c.status==="closed").length,
    active:clients.filter(c=>!["closed","cancelled"].includes(c.status)).length,
    urgent:clients.filter(c=>c.priority==="high"&&!["closed","cancelled"].includes(c.status)).length,
  };

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{CSS}</style>
      {toast&&<Toast {...toast}/>}

      {/* HEADER */}
      <div style={{background:T.header,padding:"10px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"34px",height:"34px",background:"rgba(255,255,255,0.15)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",border:"1px solid rgba(255,255,255,0.2)"}}>🌐</div>
            <div>
              <div style={{color:"#fff",fontWeight:"800",fontSize:"16px",letterSpacing:"0.3px"}}>GLOBAL EIS</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:"10px",letterSpacing:"0.5px"}}>VISA CRM</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
            <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"8px",color:"#fff",width:"34px",height:"34px",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
            <button onClick={()=>{setActive(null);setScreen("client");}} style={{background:"linear-gradient(135deg,#6B7FD7,#8B5CF6)",border:"none",borderRadius:"9px",color:"#fff",padding:"8px 14px",cursor:"pointer",fontSize:"13px",fontWeight:"700"}}>+ New</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"10px"}}>
          {[{l:"Total",v:stats.total,c:"#A5B4FC"},{l:"Closed",v:stats.closed,c:"#34D399"},{l:"Active",v:stats.active,c:"#FCD34D"},{l:"Urgent",v:stats.urgent,c:"#F87171"}].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"800",color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(255,255,255,0.4)",marginTop:"2px",textTransform:"uppercase",letterSpacing:"0.4px"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search clients..." style={{width:"100%",padding:"9px 14px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.07)",color:"#fff",fontSize:"13px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>

      {/* NAV TABS */}
      <div style={{display:"flex",background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",flexShrink:0}}>
        {[["list","👥 Clients"],["dashboard","📊 Dashboard"],["daily","📋 Daily"]].map(([k,l])=>(
          <button key={k} onClick={()=>setScreen(k)} style={{background:"none",border:"none",cursor:"pointer",padding:"11px 16px",fontSize:"12px",fontWeight:screen===k?"700":"500",color:screen===k?"#6B7FD7":T.text2,borderBottom:screen===k?"2px solid #6B7FD7":"2px solid transparent",marginBottom:"-1px",whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
        ))}
        {/* Filter */}
        <div style={{display:"flex",gap:"6px",alignItems:"center",padding:"6px 12px",marginLeft:"auto",flexShrink:0}}>
          <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{padding:"5px 8px",borderRadius:"8px",border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:"11px",outline:"none",fontFamily:"inherit"}}>
            <option value="all">All</option>
            {STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={fVisa} onChange={e=>setFVisa(e.target.value)} style={{padding:"5px 8px",borderRadius:"8px",border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:"11px",outline:"none",fontFamily:"inherit"}}>
            <option value="all">All Types</option>
            {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto"}}>
        {screen==="dashboard"&&<Dashboard clients={clients} T={T}/>}

        {screen==="list"&&(
          <div style={{padding:"12px"}}>
            {loading&&<div style={{textAlign:"center",padding:"60px",color:T.text3,fontSize:"14px"}}>⏳ Loading...</div>}
            {!loading&&filtered.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px",color:T.text3}}>
                <div style={{fontSize:"44px",marginBottom:"12px"}}>👤</div>
                <div style={{fontSize:"14px"}}>{clients.length===0?'No clients yet — tap "+ New"':"No results"}</div>
              </div>
            )}
            {!loading&&filtered.map(c=>{
              const st=STATUSES.find(s=>s.key===c.status)||STATUSES[0];
              const pr=PRIORITIES.find(p=>p.key===c.priority)||PRIORITIES[1];
              const td=(c.tasks||[]).filter(t=>t.status==="done").length;
              const tt=(c.tasks||[]).length;
              return(
                <div key={c.id} onClick={()=>{setActive(c);setScreen("client");}}
                  style={{background:T.card,border:`1px solid ${T.cardBorder}`,borderRadius:"14px",padding:"14px",marginBottom:"10px",cursor:"pointer",boxShadow:T.shadow,borderLeft:`3px solid ${st.color}`,transition:"transform 0.15s,box-shadow 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.12)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=T.shadow;}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"10px",marginBottom:"8px"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px"}}>
                        <PriorityDot p={c.priority}/>
                        <div style={{fontWeight:"800",fontSize:"15px",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"—"}</div>
                      </div>
                      <div style={{fontSize:"12px",color:T.text2}}>{c.destination} · {c.visa_type}</div>
                      {c.phone&&<div style={{fontSize:"11px",color:T.text3,marginTop:"1px"}}>{c.phone}</div>}
                    </div>
                    <StatusBadge statusKey={c.status}/>
                  </div>
                  <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                    {c.center&&<span style={{fontSize:"10px",background:T.surface2,color:T.text2,borderRadius:"6px",padding:"2px 7px"}}>{c.center}</span>}
                    {c.blocker&&c.blocker!=="None"&&<span style={{fontSize:"10px",background:"rgba(239,68,68,0.1)",color:"#EF4444",borderRadius:"6px",padding:"2px 7px",fontWeight:"600"}}>🚫 {c.blocker}</span>}
                    {c.appointment_date&&<span style={{fontSize:"10px",background:"rgba(107,127,215,0.1)",color:"#6B7FD7",borderRadius:"6px",padding:"2px 7px"}}>📅 {fDate(c.appointment_date)}</span>}
                    {tt>0&&<span style={{fontSize:"10px",background:"rgba(16,185,129,0.1)",color:"#10B981",borderRadius:"6px",padding:"2px 7px",fontWeight:"600"}}>✅ {td}/{tt}</span>}
                    {(c.comments||[]).length>0&&<span style={{fontSize:"10px",background:"rgba(107,127,215,0.1)",color:"#6B7FD7",borderRadius:"6px",padding:"2px 7px"}}>💬 {c.comments.length}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
  @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(107,127,215,0.3); border-radius: 4px; }
  input::placeholder, textarea::placeholder { color: #94A3B8; }
  select option { background: #1A1D27; color: #F1F5F9; }
`;
