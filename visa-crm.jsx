import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://pztetotacahqkomoupoz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kzmDPmqG_QjcPx0yu10ETQ_p9O91Ch7";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VISA_STATUSES = [
  { key: "new", label: "New", color: "#6C8EBF", bg: "#EBF2FF" },
  { key: "docs_collecting", label: "Collecting Docs", color: "#D6A520", bg: "#FFF8E1" },
  { key: "submitted", label: "Submitted", color: "#7B68EE", bg: "#F0EEFF" },
  { key: "interview", label: "Interview", color: "#E07B39", bg: "#FFF0E8" },
  { key: "approved", label: "Approved ✓", color: "#2E9E6B", bg: "#E8F8F0" },
  { key: "rejected", label: "Rejected ✗", color: "#D94F4F", bg: "#FFECEC" },
  { key: "appeal", label: "Appeal", color: "#A0522D", bg: "#FFF3E8" },
];

const VISA_TYPES = ["Schengen", "USA", "UK", "Canada", "Australia", "UAE", "Other"];
const PRIORITIES = [
  { key: "low", label: "Normal", color: "#888" },
  { key: "medium", label: "Medium", color: "#D6A520" },
  { key: "high", label: "Urgent", color: "#D94F4F" },
];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #E4E8F0", fontSize: "13px", outline: "none", background: "#FAFBFF", fontFamily: "inherit", boxSizing: "border-box", color: "#222" };
const lbStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" };
const btnPrimary = { padding: "10px 22px", borderRadius: "10px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #0F2447, #1A3A6B)", color: "#fff", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap" };

function ClientModal({ client, onSave, onClose }) {
  const empty = { name: "", phone: "", email: "", nationality: "", visa_type: "Schengen", status: "new", priority: "medium", destination: "", submission_date: "", appointment_date: "", expiry_date: "", notes: "", comments: [], tasks: [] };
  const [form, setForm] = useState(client || empty);
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const commentRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addComment = () => {
    if (!newComment.trim()) return;
    set("comments", [...(form.comments || []), { id: generateId(), text: newComment.trim(), date: new Date().toISOString() }]);
    setNewComment("");
    setTimeout(() => commentRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };
  const addTask = () => {
    if (!newTask.trim()) return;
    set("tasks", [...(form.tasks || []), { id: generateId(), text: newTask.trim(), done: false, date: new Date().toISOString() }]);
    setNewTask("");
  };
  const toggleTask = (id) => set("tasks", form.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => set("tasks", form.tasks.filter(t => t.id !== id));
  const deleteComment = (id) => set("comments", form.comments.filter(c => c.id !== id));
  const handleSave = async () => { setSaving(true); await onSave(form); setSaving(false); };

  const statusObj = VISA_STATUSES.find(s => s.key === form.status) || VISA_STATUSES[0];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "800px", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "linear-gradient(135deg, #0F2447 0%, #1A3A6B 100%)", padding: "22px 28px 18px", color: "#fff", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🛂</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>{form.name || "New Client"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ background: statusObj.bg, color: statusObj.color, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>{statusObj.label}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{form.visa_type}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ position: "absolute", right: "20px", top: "20px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: "#fff", fontSize: "16px" }}>✕</button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #EEF0F4", padding: "0 24px" }}>
          {[["info", "📋 Info"], ["comments", `💬 Comments (${(form.comments||[]).length})`], ["tasks", `✅ Tasks (${(form.tasks||[]).length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ background: "none", border: "none", cursor: "pointer", padding: "14px 16px", fontSize: "13px", fontWeight: activeTab === key ? "700" : "500", color: activeTab === key ? "#0F2447" : "#888", borderBottom: activeTab === key ? "2px solid #0F2447" : "2px solid transparent", marginBottom: "-1px" }}>{label}</button>
          ))}
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
          {activeTab === "info" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[["name","Full Name","text","Client name"],["phone","Phone","tel","Phone number"],["email","Email","email","email@example.com"],["nationality","Nationality","text","Egyptian, Syrian..."],["destination","Destination","text","Paris, London..."]].map(([key,label,type,ph]) => (
                <div key={key} style={{ gridColumn: key === "name" ? "1/-1" : undefined }}>
                  <label style={lbStyle}>{label}</label>
                  <input value={form[key]||""} onChange={e=>set(key,e.target.value)} type={type} placeholder={ph} style={inputStyle}/>
                </div>
              ))}
              <div><label style={lbStyle}>Visa Type</label><select value={form.visa_type} onChange={e=>set("visa_type",e.target.value)} style={inputStyle}>{VISA_TYPES.map(v=><option key={v}>{v}</option>)}</select></div>
              <div><label style={lbStyle}>Status</label><select value={form.status} onChange={e=>set("status",e.target.value)} style={{...inputStyle,color:statusObj.color,fontWeight:"600"}}>{VISA_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
              <div><label style={lbStyle}>Priority</label><select value={form.priority} onChange={e=>set("priority",e.target.value)} style={inputStyle}>{PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></div>
              <div><label style={lbStyle}>Submission Date</label><input type="date" value={form.submission_date||""} onChange={e=>set("submission_date",e.target.value)} style={inputStyle}/></div>
              <div><label style={lbStyle}>Appointment Date</label><input type="date" value={form.appointment_date||""} onChange={e=>set("appointment_date",e.target.value)} style={inputStyle}/></div>
              <div><label style={lbStyle}>Passport Expiry</label><input type="date" value={form.expiry_date||""} onChange={e=>set("expiry_date",e.target.value)} style={inputStyle}/></div>
              <div style={{gridColumn:"1/-1"}}><label style={lbStyle}>General Notes</label><textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} placeholder="Any additional notes..." rows={3} style={{...inputStyle,resize:"vertical",lineHeight:1.6}}/></div>
            </div>
          )}

          {activeTab === "comments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div ref={commentRef} style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "340px", overflowY: "auto", paddingBottom: "8px" }}>
                {(form.comments||[]).length===0 && <div style={{textAlign:"center",color:"#bbb",padding:"40px 0",fontSize:"14px"}}>No comments yet</div>}
                {(form.comments||[]).map(c=>(
                  <div key={c.id} style={{background:"#F7F9FF",borderRadius:"12px",padding:"12px 16px",borderLeft:"3px solid #6C8EBF",position:"relative"}}>
                    <div style={{fontSize:"13px",color:"#222",lineHeight:1.6}}>{c.text}</div>
                    <div style={{fontSize:"11px",color:"#aaa",marginTop:"6px"}}>{formatDate(c.date)}</div>
                    <button onClick={()=>deleteComment(c.id)} style={{position:"absolute",right:"10px",top:"10px",background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:"13px"}}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
                <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),addComment())} placeholder="Write a comment... (Enter to send)" rows={2} style={{...inputStyle,flex:1,resize:"none"}}/>
                <button onClick={addComment} style={btnPrimary}>Add</button>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{display:"flex",gap:"8px"}}>
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="New task... (Enter to add)" style={{...inputStyle,flex:1}}/>
                <button onClick={addTask} style={btnPrimary}>+ Add</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {(form.tasks||[]).length===0&&<div style={{textAlign:"center",color:"#bbb",padding:"40px 0",fontSize:"14px"}}>No tasks yet</div>}
                {(form.tasks||[]).map(t=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:"12px",background:t.done?"#F0F9F4":"#F7F9FF",borderRadius:"10px",padding:"10px 14px",opacity:t.done?0.7:1}}>
                    <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{width:"16px",height:"16px",cursor:"pointer",accentColor:"#2E9E6B"}}/>
                    <span style={{flex:1,fontSize:"13px",textDecoration:t.done?"line-through":"none",color:t.done?"#888":"#222"}}>{t.text}</span>
                    <span style={{fontSize:"11px",color:"#bbb"}}>{formatDate(t.date)}</span>
                    <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ccc",fontSize:"13px"}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid #EEF0F4", display: "flex", gap: "10px" }}>
          <button onClick={handleSave} disabled={saving} style={{...btnPrimary,opacity:saving?0.7:1}}>{saving?"Saving...":"💾 Save"}</button>
          <button onClick={onClose} style={{...btnPrimary,background:"#F0F2F5",color:"#444"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function VisaCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisa, setFilterVisa] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("table");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) showToast("Failed to load: "+error.message, "error");
      else setClients(data||[]);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const saveClient = async (form) => {
    const payload = { name:form.name, phone:form.phone, email:form.email, nationality:form.nationality, visa_type:form.visa_type, status:form.status, priority:form.priority, destination:form.destination, submission_date:form.submission_date||null, appointment_date:form.appointment_date||null, expiry_date:form.expiry_date||null, notes:form.notes, comments:form.comments||[], tasks:form.tasks||[] };
    if (form.id) {
      const { data, error } = await supabase.from("clients").update(payload).eq("id",form.id).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>c.map(cl=>cl.id===form.id?data:cl));
      showToast("Client updated ✓");
    } else {
      const { data, error } = await supabase.from("clients").insert(payload).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>[data,...c]);
      showToast("Client added ✓");
    }
    setModal(null);
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from("clients").delete().eq("id",id);
    if (error) { showToast("Delete failed","error"); return; }
    setClients(c=>c.filter(cl=>cl.id!==id));
    setDeleteConfirm(null);
    showToast("Client deleted");
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (!q||[c.name,c.phone,c.nationality,c.destination].some(v=>v?.toLowerCase().includes(q)))
      &&(filterStatus==="all"||c.status===filterStatus)
      &&(filterVisa==="all"||c.visa_type===filterVisa);
  });

  const stats = { total:clients.length, approved:clients.filter(c=>c.status==="approved").length, pending:clients.filter(c=>["submitted","docs_collecting","interview"].includes(c.status)).length, urgent:clients.filter(c=>c.priority==="high").length };

  return (
    <div style={{ minHeight:"100vh", background:"#F4F6FB", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {toast && <div style={{position:"fixed",top:"20px",right:"20px",zIndex:9999,background:toast.type==="error"?"#D94F4F":"#2E9E6B",color:"#fff",padding:"12px 20px",borderRadius:"12px",fontSize:"13px",fontWeight:"600",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",animation:"slideIn 0.3s ease"}}>{toast.msg}</div>}

      <div style={{background:"linear-gradient(135deg,#0A1628 0%,#0F2447 60%,#1A3A6B 100%)",padding:"0 32px",color:"#fff",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",maxWidth:"1400px",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{fontSize:"26px"}}>🛂</div>
            <div>
              <div style={{fontSize:"17px",fontWeight:"800"}}>Visa CRM</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.45)"}}>Client Management System</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.08)",padding:"4px 10px",borderRadius:"20px"}}>☁️ Supabase Live</span>
            <button onClick={()=>setModal({client:null})} style={{...btnPrimary,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)"}}>+ New Client</button>
          </div>
        </div>
      </div>

      <div style={{padding:"28px 32px",maxWidth:"1400px",margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
          {[{label:"Total Clients",value:stats.total,icon:"👥",color:"#0F2447",bg:"#E8EEFF"},{label:"Approved",value:stats.approved,icon:"✅",color:"#2E9E6B",bg:"#E8F8F0"},{label:"In Progress",value:stats.pending,icon:"⏳",color:"#D6A520",bg:"#FFF8E1"},{label:"Urgent",value:stats.urgent,icon:"🔴",color:"#D94F4F",bg:"#FFECEC"}].map(s=>(
            <div key={s.label} style={{background:"#fff",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"14px",background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>{s.icon}</div>
              <div><div style={{fontSize:"26px",fontWeight:"800",color:s.color}}>{s.value}</div><div style={{fontSize:"12px",color:"#888"}}>{s.label}</div></div>
            </div>
          ))}
        </div>

        <div style={{background:"#fff",borderRadius:"16px",padding:"16px 20px",marginBottom:"20px",display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search name, phone, nationality..." style={{...inputStyle,maxWidth:"280px"}}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inputStyle,maxWidth:"160px"}}>
            <option value="all">All Statuses</option>
            {VISA_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={filterVisa} onChange={e=>setFilterVisa(e.target.value)} style={{...inputStyle,maxWidth:"140px"}}>
            <option value="all">All Visa Types</option>
            {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
          </select>
          <div style={{marginLeft:"auto",display:"flex",gap:"6px"}}>
            {[["table","☰ Table"],["kanban","⬛ Kanban"]].map(([k,l])=>(
              <button key={k} onClick={()=>setView(k)} style={{padding:"8px 14px",borderRadius:"8px",border:"none",cursor:"pointer",background:view===k?"#0F2447":"#F0F2F5",color:view===k?"#fff":"#666",fontSize:"12px",fontWeight:"600"}}>{l}</button>
            ))}
          </div>
        </div>

        {loading && <div style={{textAlign:"center",padding:"80px",color:"#aaa"}}><div style={{fontSize:"32px",marginBottom:"12px"}}>⏳</div><div>Connecting to database...</div></div>}

        {!loading && view==="table" && (
          <div style={{background:"#fff",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:"900px"}}>
              <thead>
                <tr style={{background:"#F7F9FF",borderBottom:"2px solid #EEF0F8"}}>
                  {["Name","Phone","Nationality","Visa","Destination","Status","Priority","Appointment","Tasks","Comments",""].map(h=>(
                    <th key={h} style={{padding:"14px 16px",textAlign:"left",fontWeight:"700",color:"#555",fontSize:"12px",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={11} style={{textAlign:"center",padding:"60px",color:"#bbb",fontSize:"14px"}}>{clients.length===0?"No clients yet — click \"+ New Client\" to get started":"No results match your search"}</td></tr>}
                {filtered.map(c=>{
                  const st=VISA_STATUSES.find(s=>s.key===c.status)||VISA_STATUSES[0];
                  const pr=PRIORITIES.find(p=>p.key===c.priority)||PRIORITIES[1];
                  const doneTasks=(c.tasks||[]).filter(t=>t.done).length;
                  return(
                    <tr key={c.id} style={{borderBottom:"1px solid #F0F2F8",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#FAFBFF"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"12px 16px",fontWeight:"700",color:"#0F2447"}}>{c.name||"—"}</td>
                      <td style={{padding:"12px 16px",color:"#555"}}>{c.phone||"—"}</td>
                      <td style={{padding:"12px 16px",color:"#555"}}>{c.nationality||"—"}</td>
                      <td style={{padding:"12px 16px"}}><span style={{background:"#EEF0FF",color:"#4A5FAF",borderRadius:"6px",padding:"3px 8px",fontSize:"11px",fontWeight:"600"}}>{c.visa_type}</span></td>
                      <td style={{padding:"12px 16px",color:"#555"}}>{c.destination||"—"}</td>
                      <td style={{padding:"12px 16px"}}><span style={{background:st.bg,color:st.color,borderRadius:"20px",padding:"4px 10px",fontSize:"11px",fontWeight:"700",whiteSpace:"nowrap"}}>{st.label}</span></td>
                      <td style={{padding:"12px 16px"}}><span style={{color:pr.color,fontWeight:"700",fontSize:"12px"}}>{pr.label}</span></td>
                      <td style={{padding:"12px 16px",color:"#777",fontSize:"12px",whiteSpace:"nowrap"}}>{formatDate(c.appointment_date)}</td>
                      <td style={{padding:"12px 16px",fontSize:"12px"}}>{(c.tasks||[]).length>0?<span style={{background:doneTasks===c.tasks.length?"#E8F8F0":"#FFF8E1",color:doneTasks===c.tasks.length?"#2E9E6B":"#D6A520",borderRadius:"6px",padding:"2px 8px",fontWeight:"600"}}>{doneTasks}/{c.tasks.length}</span>:"—"}</td>
                      <td style={{padding:"12px 16px",fontSize:"12px"}}>{(c.comments||[]).length>0?<span style={{background:"#F0EEFF",color:"#7B68EE",borderRadius:"6px",padding:"2px 8px",fontWeight:"600"}}>💬 {c.comments.length}</span>:"—"}</td>
                      <td style={{padding:"12px 8px"}}>
                        <div style={{display:"flex",gap:"4px"}}>
                          <button onClick={()=>setModal({client:c})} style={{background:"#EEF0FF",border:"none",borderRadius:"7px",padding:"6px 10px",cursor:"pointer",color:"#4A5FAF",fontSize:"12px",fontWeight:"600"}}>✏️ Edit</button>
                          <button onClick={()=>setDeleteConfirm(c.id)} style={{background:"#FFECEC",border:"none",borderRadius:"7px",padding:"6px 10px",cursor:"pointer",color:"#D94F4F",fontSize:"12px"}}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && view==="kanban" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:"16px",alignItems:"start"}}>
            {VISA_STATUSES.map(st=>{
              const cols=filtered.filter(c=>c.status===st.key);
              return(
                <div key={st.key} style={{background:"#fff",borderRadius:"16px",padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                    <span style={{background:st.bg,color:st.color,borderRadius:"20px",padding:"4px 10px",fontSize:"11px",fontWeight:"700"}}>{st.label}</span>
                    <span style={{background:"#F0F2F5",color:"#666",borderRadius:"20px",padding:"2px 8px",fontSize:"11px",fontWeight:"600"}}>{cols.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {cols.length===0&&<div style={{color:"#ddd",fontSize:"12px",textAlign:"center",padding:"16px 0"}}>Empty</div>}
                    {cols.map(c=>{
                      const pr=PRIORITIES.find(p=>p.key===c.priority)||PRIORITIES[1];
                      return(
                        <div key={c.id} onClick={()=>setModal({client:c})} style={{background:"#F7F9FF",borderRadius:"10px",padding:"12px",cursor:"pointer",borderLeft:`3px solid ${st.color}`,transition:"transform 0.15s,box-shadow 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                          <div style={{fontWeight:"700",fontSize:"13px",color:"#0F2447"}}>{c.name}</div>
                          <div style={{fontSize:"11px",color:"#888",marginTop:"4px"}}>{c.visa_type} · {c.nationality||"—"}</div>
                          <div style={{display:"flex",gap:"6px",marginTop:"8px",alignItems:"center"}}>
                            <span style={{fontSize:"10px",color:pr.color,fontWeight:"700"}}>{pr.label}</span>
                            {(c.comments||[]).length>0&&<span style={{fontSize:"10px",color:"#7B68EE"}}>💬 {c.comments.length}</span>}
                            {(c.tasks||[]).length>0&&<span style={{fontSize:"10px",color:"#2E9E6B"}}>✅ {(c.tasks||[]).filter(t=>t.done).length}/{c.tasks.length}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(10,15,30,0.7)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:"20px",padding:"32px",maxWidth:"360px",width:"90%",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>🗑️</div>
            <div style={{fontSize:"17px",fontWeight:"800",color:"#0F2447",marginBottom:"8px"}}>Delete Client?</div>
            <div style={{fontSize:"13px",color:"#888",marginBottom:"24px"}}>This will permanently delete the client and all their data from the database.</div>
            <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
              <button onClick={()=>deleteClient(deleteConfirm)} style={{...btnPrimary,background:"#D94F4F"}}>Yes, Delete</button>
              <button onClick={()=>setDeleteConfirm(null)} style={{...btnPrimary,background:"#F0F2F5",color:"#444"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modal&&<ClientModal client={modal.client} onSave={saveClient} onClose={()=>setModal(null)}/>}
    </div>
  );
}
