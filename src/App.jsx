import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pztetotacahqkomoupoz.supabase.co";
const SUPABASE_KEY = "sb_publishable_kzmDPmqG_QjcPx0yu10ETQ_p9O91Ch7";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── DATA ──────────────────────────────────────────────────────────────────────
const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Djibouti","Dominica","Dominican Republic","DR Congo",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast",
  "Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar",
  "Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam",
  "Yemen",
  "Zambia","Zimbabwe"
];

const VISA_STATUSES = [
  { key:"new", label:"New", color:"#5B8DEF", bg:"#EBF2FF" },
  { key:"onboarding", label:"Onboarding", color:"#7B68EE", bg:"#F0EEFF" },
  { key:"appointment_hunting", label:"Appointment Hunting", color:"#E07B39", bg:"#FFF0E8" },
  { key:"appointment_booked", label:"Appointment Booked", color:"#2E9E6B", bg:"#E8F8F0", autoDate:"appointment_date" },
  { key:"file_ready", label:"File Ready", color:"#D6A520", bg:"#FFF8E1" },
  { key:"submitted", label:"Submitted", color:"#7B68EE", bg:"#F0EEFF", autoDate:"submission_date" },
  { key:"result", label:"Result", color:"#A0522D", bg:"#FFF3E8" },
  { key:"closed", label:"Closed ✓", color:"#2E9E6B", bg:"#E8F8F0" },
  { key:"cancelled", label:"Cancelled ✗", color:"#D94F4F", bg:"#FFECEC" },
];

const BLOCKERS = ["None","Missing Docs","Waiting Client","No Slots","Payment","Other"];

const VISA_TYPES = ["Business Visa","Tourism Visa","Medical Visa","Online Visa","Student Visa","Work Visa","Transit Visa","Family Visa","Other"];

const TASK_STATUSES = [
  { key:"todo", label:"To Do", color:"#888" },
  { key:"doing", label:"Doing", color:"#D6A520" },
  { key:"blocked", label:"Blocked", color:"#D94F4F" },
  { key:"done", label:"Done", color:"#2E9E6B" },
];

const CENTERS = ["TLS Sheikh Zayed","TLS Tagmoaa","TLS Hurgada","TLS Alexandria","BLS","VFS Cairo","VFS New Cairo","VFS Alexandria","Other"];

const APPOINTMENT_STATUSES = ["Trying","Booked","Cancelled","Attended","Rescheduled"];

const TASK_TYPES = [
  "Contract Check (Review)","Create Case / Assign VO","Welcome Message / Greeting Call",
  "Missing Docs Follow-up","Application Form Filling","Cover Letter","Travel Plan (Itinerary)",
  "Hotel Booking","Flight Reservation","Insurance Issuance","Financial Docs Check",
  "Translation Request","Appointment Search","OTP / Verification Handling",
  "Appointment Booking Confirmation","Appointment Reschedule / Change",
  "File Review (QA)","Fee/Payment Follow-up"
];

const PRIORITIES = [
  { key:"high", label:"High", color:"#D94F4F" },
  { key:"medium", label:"Medium", color:"#D6A520" },
  { key:"low", label:"Low", color:"#2E9E6B" },
];

const NATIONALITIES = ["Egyptian","Foreign Citizen"];

function today() { return new Date().toISOString().split("T")[0]; }
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function generateId() { return Date.now().toString(36)+Math.random().toString(36).substr(2,5); }

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  input: { width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1.5px solid #E4E8F0", fontSize:"14px", outline:"none", background:"#FAFBFF", fontFamily:"inherit", boxSizing:"border-box", color:"#1a1a2e" },
  label: { display:"block", fontSize:"11px", fontWeight:"700", color:"#666", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px" },
  btn: { padding:"11px 22px", borderRadius:"10px", border:"none", cursor:"pointer", background:"linear-gradient(135deg,#0F2447,#1A3A6B)", color:"#fff", fontSize:"14px", fontWeight:"700", whiteSpace:"nowrap" },
  card: { background:"#fff", borderRadius:"14px", padding:"14px", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", marginBottom:"10px" },
};

// ─── WHATSAPP REMINDER ─────────────────────────────────────────────────────────
function sendWhatsApp(client) {
  const st = VISA_STATUSES.find(s=>s.key===client.status);
  const msg = `Hello ${client.name || ""},\n\nThis is a reminder regarding your ${client.visa_type || "visa"} application to ${client.destination || "your destination"}.\n\nCurrent Status: ${st?.label || client.status}\n${client.appointment_date ? `Appointment Date: ${formatDate(client.appointment_date)}\n` : ""}${client.blocker && client.blocker !== "None" ? `Pending: ${client.blocker}\n` : ""}\nPlease don't hesitate to contact us if you have any questions.\n\nBest regards,\nGlobal EIS Team`;
  const phone = client.phone?.replace(/\D/g,"");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url,"_blank");
}

// ─── OCR SCANNER ──────────────────────────────────────────────────────────────
function ScannerModal({ onExtract, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("upload"); // upload | camera

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t=>t.stop()); };
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setMode("camera");
    } catch { alert("Camera not available"); }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video,0,0);
    const dataUrl = canvas.toDataURL("image/jpeg",0.85);
    setPhoto(dataUrl);
    if (stream) stream.getTracks().forEach(t=>t.stop());
    setMode("preview");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target.result); setMode("preview"); };
    reader.readAsDataURL(file);
  };

  const extractText = async () => {
    if (!photo) return;
    setProcessing(true);
    try {
      const { createWorker } = await import("https://esm.sh/tesseract.js@5");
      const worker = await createWorker("eng+ara");
      const { data: { text } } = await worker.recognize(photo);
      await worker.terminate();
      setResult(text);
    } catch (e) {
      setResult("OCR failed. Please try again or type manually.\n\n" + e.message);
    }
    setProcessing(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:2000,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0F2447",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:"#fff",fontWeight:"700",fontSize:"15px"}}>📷 Document Scanner</div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"8px",color:"#fff",padding:"6px 12px",cursor:"pointer",fontSize:"13px"}}>✕ Close</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>
        {mode==="upload"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px",alignItems:"center",paddingTop:"20px"}}>
            <div style={{fontSize:"60px"}}>📄</div>
            <div style={{color:"#fff",fontSize:"14px",textAlign:"center"}}>Upload a document or use camera to extract text</div>
            <label style={{...S.btn,background:"#2E9E6B",display:"block",textAlign:"center",cursor:"pointer"}}>
              📁 Upload Image / PDF
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{display:"none"}}/>
            </label>
            <button onClick={startCamera} style={{...S.btn,background:"#E07B39"}}>📷 Use Camera</button>
          </div>
        )}

        {mode==="camera"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px",alignItems:"center"}}>
            <video ref={videoRef} autoPlay playsInline style={{width:"100%",maxWidth:"500px",borderRadius:"12px"}}/>
            <canvas ref={canvasRef} style={{display:"none"}}/>
            <button onClick={capturePhoto} style={{...S.btn,background:"#D94F4F",fontSize:"16px",padding:"14px 30px"}}>📸 Capture</button>
          </div>
        )}

        {mode==="preview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <img src={photo} style={{width:"100%",maxWidth:"500px",borderRadius:"12px",margin:"0 auto",display:"block"}} alt="captured"/>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              <button onClick={extractText} disabled={processing} style={{...S.btn,background:"#2E9E6B",opacity:processing?0.7:1}}>
                {processing?"⏳ Processing...":"🔍 Extract Text"}
              </button>
              <button onClick={()=>{setPhoto(null);setMode("upload");setResult("");}} style={{...S.btn,background:"#666"}}>Retake</button>
            </div>
          </div>
        )}

        {result&&(
          <div style={{background:"#1a2a4a",borderRadius:"12px",padding:"14px"}}>
            <div style={{color:"#aaa",fontSize:"11px",marginBottom:"8px",textTransform:"uppercase"}}>Extracted Text</div>
            <textarea value={result} onChange={e=>setResult(e.target.value)} style={{...S.input,background:"#0d1b35",color:"#e8f0ff",border:"1px solid #2a3a5a",minHeight:"150px",resize:"vertical"}}/>
            <button onClick={()=>onExtract(result)} style={{...S.btn,background:"#2E9E6B",width:"100%",marginTop:"10px",textAlign:"center"}}>✅ Use This Text as Note</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IMAGE VIEWER ──────────────────────────────────────────────────────────────
function ImageViewer({ url, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <img src={url} style={{maxWidth:"95vw",maxHeight:"90vh",borderRadius:"10px"}} alt="document"/>
      <button onClick={onClose} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:"36px",height:"36px",color:"#fff",fontSize:"18px",cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ─── CLIENT FORM ──────────────────────────────────────────────────────────────
function ClientForm({ client, onSave, onBack, onDelete }) {
  const empty = {
    name:"", phone:"", email:"", nationality:"Egyptian",
    visa_type:"Tourism Visa", status:"new", priority:"medium",
    destination:"France", blocker:"None", task_status:"todo",
    center:"VFS Cairo", appointment_status:"Trying", task_type:"",
    submission_date:"", appointment_date:"", notes:"",
    comments:[], tasks:[], logs:[], images:[]
  };
  const [form, setForm] = useState(client ? {...empty,...client} : empty);
  const [activeTab, setActiveTab] = useState("info");
  const [newComment, setNewComment] = useState("");
  const [newTask, setNewTask] = useState({ text:"", type:TASK_TYPES[0], status:"todo" });
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const commentRef = useRef(null);
  const fileInputRef = useRef(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const setStatus = (newStatus) => {
    const st = VISA_STATUSES.find(s=>s.key===newStatus);
    const updates = { status:newStatus };
    if (st?.autoDate) updates[st.autoDate] = today();
    const log = { id:generateId(), text:`Status → "${st?.label}"`, date:new Date().toISOString(), type:"status" };
    setForm(f=>({...f,...updates, logs:[...(f.logs||[]),log]}));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const c = { id:generateId(), text:newComment.trim(), date:new Date().toISOString() };
    const log = { id:generateId(), text:`Comment: "${newComment.trim().slice(0,60)}"`, date:new Date().toISOString(), type:"comment" };
    setForm(f=>({...f, comments:[...(f.comments||[]),c], logs:[...(f.logs||[]),log]}));
    setNewComment("");
    setTimeout(()=>commentRef.current?.scrollTo({top:9999,behavior:"smooth"}),50);
  };

  const addTask = () => {
    if (!newTask.text.trim()) return;
    const t = { id:generateId(), text:newTask.text.trim(), type:newTask.type, status:newTask.status, date:new Date().toISOString() };
    const log = { id:generateId(), text:`Task added: "${newTask.text.trim()}"`, date:new Date().toISOString(), type:"task" };
    setForm(f=>({...f, tasks:[...(f.tasks||[]),t], logs:[...(f.logs||[]),log]}));
    setNewTask({text:"",type:TASK_TYPES[0],status:"todo"});
  };

  const updateTaskStatus = (id,status) => {
    setForm(f=>({...f, tasks:f.tasks.map(t=>t.id===id?{...t,status}:t)}));
  };

  const deleteTask = (id) => setForm(f=>({...f,tasks:f.tasks.filter(t=>t.id!==id)}));
  const deleteComment = (id) => setForm(f=>({...f,comments:f.comments.filter(c=>c.id!==id)}));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = { id:generateId(), url:ev.target.result, name:file.name, date:new Date().toISOString() };
        setForm(f=>({...f, images:[...(f.images||[]),img]}));
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteImage = (id) => setForm(f=>({...f,images:f.images.filter(i=>i.id!==id)}));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const statusObj = VISA_STATUSES.find(s=>s.key===form.status)||VISA_STATUSES[0];
  const pr = PRIORITIES.find(p=>p.key===form.priority)||PRIORITIES[1];
  const tasksDone = (form.tasks||[]).filter(t=>t.status==="done").length;

  const tabs = [
    ["info","Info"],
    ["tasks",`Tasks(${(form.tasks||[]).length})`],
    ["comments",`Notes(${(form.comments||[]).length})`],
    ["docs",`Docs(${(form.images||[]).length})`],
    ["logs","Logs"],
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#F4F6FB"}}>
      {showScanner&&<ScannerModal onExtract={txt=>{set("notes",(form.notes||"")+"\n"+txt);setShowScanner(false);}} onClose={()=>setShowScanner(false)}/>}
      {viewImage&&<ImageViewer url={viewImage} onClose={()=>setViewImage(null)}/>}

      {/* Top Bar */}
      <div style={{background:"linear-gradient(135deg,#0A1628,#0F2447)",padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"8px",color:"#fff",padding:"7px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>← Back</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontWeight:"800",fontSize:"16px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{form.name||"New Client"}</div>
          </div>
          <button onClick={()=>sendWhatsApp(form)} style={{background:"#25D366",border:"none",borderRadius:"8px",color:"#fff",padding:"7px 10px",cursor:"pointer",fontSize:"16px"}}>💬</button>
          <button onClick={handleSave} disabled={saving} style={{...S.btn,padding:"7px 14px",fontSize:"13px",opacity:saving?0.7:1}}>{saving?"...":"💾"}</button>
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          <span style={{background:statusObj.bg,color:statusObj.color,borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:"700"}}>{statusObj.label}</span>
          <span style={{background:"rgba(255,255,255,0.1)",color:"#fff",borderRadius:"20px",padding:"3px 10px",fontSize:"11px"}}>{form.visa_type}</span>
          <span style={{color:pr.color,background:"rgba(255,255,255,0.08)",borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:"700"}}>{pr.label}</span>
          {form.blocker&&form.blocker!=="None"&&<span style={{background:"#FFECEC",color:"#D94F4F",borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:"600"}}>🚫 {form.blocker}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"2px solid #E8EAF0",background:"#fff",overflowX:"auto",flexShrink:0}}>
        {tabs.map(([key,label])=>(
          <button key={key} onClick={()=>setActiveTab(key)} style={{background:"none",border:"none",cursor:"pointer",padding:"11px 14px",fontSize:"12px",fontWeight:activeTab===key?"800":"500",color:activeTab===key?"#0F2447":"#999",borderBottom:activeTab===key?"3px solid #0F2447":"3px solid transparent",marginBottom:"-2px",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{overflowY:"auto",flex:1,padding:"14px"}}>

        {activeTab==="info"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {/* Quick Status Row */}
            <div style={{...S.card,padding:"12px"}}>
              <div style={S.label}>Quick Status Update</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {VISA_STATUSES.map(s=>(
                  <button key={s.key} onClick={()=>setStatus(s.key)} style={{padding:"6px 12px",borderRadius:"20px",border:"none",cursor:"pointer",background:form.status===s.key?s.color:"#F0F2F5",color:form.status===s.key?"#fff":"#555",fontSize:"11px",fontWeight:"600",transition:"all 0.15s"}}>{s.label}</button>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <div><label style={S.label}>Full Name *</label><input value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="Client full name" style={S.input}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div><label style={S.label}>Phone</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} type="tel" style={S.input}/></div>
                  <div><label style={S.label}>Email</label><input value={form.email||""} onChange={e=>set("email",e.target.value)} type="email" style={S.input}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div>
                    <label style={S.label}>Nationality</label>
                    <select value={form.nationality} onChange={e=>set("nationality",e.target.value)} style={S.input}>
                      {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Priority</label>
                    <select value={form.priority} onChange={e=>set("priority",e.target.value)} style={S.input}>
                      {PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <div>
                  <label style={S.label}>Destination</label>
                  <select value={form.destination} onChange={e=>set("destination",e.target.value)} style={S.input}>
                    {ALL_COUNTRIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Visa Type</label>
                  <select value={form.visa_type} onChange={e=>set("visa_type",e.target.value)} style={S.input}>
                    {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div>
                    <label style={S.label}>Center</label>
                    <select value={form.center} onChange={e=>set("center",e.target.value)} style={S.input}>
                      {CENTERS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Blocker</label>
                    <select value={form.blocker} onChange={e=>set("blocker",e.target.value)} style={S.input}>
                      {BLOCKERS.map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div>
                    <label style={S.label}>Appointment Status</label>
                    <select value={form.appointment_status} onChange={e=>set("appointment_status",e.target.value)} style={S.input}>
                      {APPOINTMENT_STATUSES.map(a=><option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Task Status</label>
                    <select value={form.task_status} onChange={e=>set("task_status",e.target.value)} style={S.input}>
                      {TASK_STATUSES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <div><label style={S.label}>Submission Date</label><input type="date" value={form.submission_date||""} onChange={e=>set("submission_date",e.target.value)} style={S.input}/></div>
                  <div><label style={S.label}>Appointment Date</label><input type="date" value={form.appointment_date||""} onChange={e=>set("appointment_date",e.target.value)} style={S.input}/></div>
                </div>
                <div>
                  <label style={S.label}>Notes</label>
                  <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} placeholder="Notes..." rows={3} style={{...S.input,resize:"vertical",lineHeight:1.6}}/>
                  <button onClick={()=>setShowScanner(true)} style={{...S.btn,background:"#E07B39",width:"100%",marginTop:"6px",fontSize:"13px",textAlign:"center"}}>📷 Scan Document → Extract Text</button>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{...S.btn,width:"100%",textAlign:"center",padding:"13px",fontSize:"15px",opacity:saving?0.7:1}}>{saving?"Saving...":"💾 Save Client"}</button>

            {client?.id&&(
              <button onClick={()=>setShowDeleteConfirm(true)} style={{...S.btn,background:"#FFECEC",color:"#D94F4F",width:"100%",textAlign:"center",padding:"11px"}}>🗑 Delete Client</button>
            )}

            {showDeleteConfirm&&(
              <div style={{background:"#FFF5F5",borderRadius:"12px",padding:"14px",border:"1px solid #FFCDD2"}}>
                <div style={{fontWeight:"700",color:"#D94F4F",marginBottom:"8px"}}>Delete this client?</div>
                <div style={{fontSize:"13px",color:"#888",marginBottom:"12px"}}>This cannot be undone.</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>onDelete(client.id)} style={{...S.btn,background:"#D94F4F",flex:1,textAlign:"center"}}>Yes, Delete</button>
                  <button onClick={()=>setShowDeleteConfirm(false)} style={{...S.btn,background:"#F0F2F5",color:"#444",flex:1,textAlign:"center"}}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="tasks"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {/* Progress */}
            {(form.tasks||[]).length>0&&(
              <div style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <span style={{fontSize:"12px",color:"#666"}}>Progress</span>
                  <span style={{fontSize:"12px",fontWeight:"700",color:"#0F2447"}}>{tasksDone}/{(form.tasks||[]).length}</span>
                </div>
                <div style={{background:"#EEF0F8",borderRadius:"20px",height:"6px",overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#2E9E6B,#52C99A)",height:"100%",width:`${(tasksDone/Math.max(form.tasks.length,1))*100}%`,borderRadius:"20px",transition:"width 0.4s"}}/>
                </div>
              </div>
            )}

            {/* Add task */}
            <div style={S.card}>
              <div style={{fontSize:"12px",fontWeight:"700",color:"#0F2447",marginBottom:"10px"}}>+ Add Task</div>
              <input value={newTask.text} onChange={e=>setNewTask(t=>({...t,text:e.target.value}))} placeholder="Task description..." style={{...S.input,marginBottom:"8px"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
                <select value={newTask.type} onChange={e=>setNewTask(t=>({...t,type:e.target.value}))} style={{...S.input,fontSize:"12px"}}>
                  {TASK_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                <select value={newTask.status} onChange={e=>setNewTask(t=>({...t,status:e.target.value}))} style={{...S.input,fontSize:"12px"}}>
                  {TASK_STATUSES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <button onClick={addTask} style={{...S.btn,width:"100%",textAlign:"center"}}>+ Add Task</button>
            </div>

            {/* Task list */}
            {(form.tasks||[]).map(t=>{
              const ts = TASK_STATUSES.find(s=>s.key===t.status)||TASK_STATUSES[0];
              return(
                <div key={t.id} style={{...S.card,borderLeft:`3px solid ${ts.color}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:"600",color:"#1a1a2e",marginBottom:"4px"}}>{t.text}</div>
                      <div style={{fontSize:"11px",color:"#888"}}>{t.type}</div>
                    </div>
                    <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"14px",padding:"2px"}}>✕</button>
                  </div>
                  <div style={{display:"flex",gap:"5px",marginTop:"8px",flexWrap:"wrap"}}>
                    {TASK_STATUSES.map(s=>(
                      <button key={s.key} onClick={()=>updateTaskStatus(t.id,s.key)} style={{padding:"4px 10px",borderRadius:"20px",border:"none",cursor:"pointer",background:t.status===s.key?s.color:"#F0F2F5",color:t.status===s.key?"#fff":"#666",fontSize:"11px",fontWeight:"600"}}>{s.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab==="comments"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div ref={commentRef} style={{display:"flex",flexDirection:"column",gap:"8px",maxHeight:"50vh",overflowY:"auto"}}>
              {(form.comments||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No comments yet</div>}
              {(form.comments||[]).map(c=>(
                <div key={c.id} style={{...S.card,borderLeft:"3px solid #6C8EBF",padding:"10px 12px",position:"relative"}}>
                  <div style={{fontSize:"13px",color:"#222",lineHeight:1.6,paddingRight:"20px"}}>{c.text}</div>
                  <div style={{fontSize:"11px",color:"#bbb",marginTop:"4px"}}>{formatDateTime(c.date)}</div>
                  <button onClick={()=>deleteComment(c.id)} style={{position:"absolute",right:"8px",top:"8px",background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"13px"}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),addComment())} placeholder="Add note... (Enter to send)" rows={3} style={{...S.input,flex:1,resize:"none"}}/>
              <button onClick={addComment} style={{...S.btn,padding:"10px 16px"}}>Add</button>
            </div>
          </div>
        )}

        {activeTab==="docs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",gap:"8px"}}>
              <label style={{...S.btn,background:"#2E9E6B",flex:1,textAlign:"center",cursor:"pointer",display:"block"}}>
                📁 Upload Image
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display:"none"}}/>
              </label>
              <button onClick={()=>setShowScanner(true)} style={{...S.btn,background:"#E07B39",flex:1}}>📷 Scan</button>
            </div>
            {(form.images||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No documents uploaded</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              {(form.images||[]).map(img=>(
                <div key={img.id} style={{position:"relative",borderRadius:"10px",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                  <img src={img.url} onClick={()=>setViewImage(img.url)} style={{width:"100%",height:"120px",objectFit:"cover",cursor:"pointer",display:"block"}} alt={img.name}/>
                  <div style={{padding:"6px 8px",background:"#fff",fontSize:"11px",color:"#666",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{img.name}</div>
                  <button onClick={()=>deleteImage(img.id)} style={{position:"absolute",top:"6px",right:"6px",background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",width:"24px",height:"24px",color:"#fff",cursor:"pointer",fontSize:"12px"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==="logs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {(form.logs||[]).length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"30px 0",fontSize:"13px"}}>No activity yet</div>}
            {[...(form.logs||[])].reverse().map(l=>(
              <div key={l.id} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"10px 12px",background:"#fff",borderRadius:"10px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:"16px"}}>{l.type==="status"?"🔄":l.type==="comment"?"💬":l.type==="task"?"✅":"📝"}</div>
                <div>
                  <div style={{fontSize:"13px",color:"#333"}}>{l.text}</div>
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

// ─── DAILY TASKS PAGE ──────────────────────────────────────────────────────────
function DailyTasksPage({ onBack }) {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("daily_tasks_v2")||"[]"); } catch { return []; }
  });
  const [newTask, setNewTask] = useState({ text:"", type:TASK_TYPES[0], priority:"medium" });
  const [filter, setFilter] = useState("all");

  useEffect(()=>{ localStorage.setItem("daily_tasks_v2",JSON.stringify(tasks)); },[tasks]);

  const addTask = () => {
    if (!newTask.text.trim()) return;
    setTasks(t=>[{id:generateId(),...newTask,status:"todo",date:new Date().toISOString()},...t]);
    setNewTask({text:"",type:TASK_TYPES[0],priority:"medium"});
  };

  const updateStatus = (id,status) => setTasks(t=>t.map(x=>x.id===id?{...x,status}:x));
  const deleteTask = (id) => setTasks(t=>t.filter(x=>x.id!==id));
  const clearDone = () => setTasks(t=>t.filter(x=>x.status!=="done"));

  const filtered = tasks.filter(t=>filter==="all"||(filter==="done"?t.status==="done":t.status!=="done"));
  const doneCount = tasks.filter(t=>t.status==="done").length;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#F4F6FB"}}>
      <div style={{background:"linear-gradient(135deg,#0A1628,#0F2447)",padding:"12px 16px",flexShrink:0,display:"flex",alignItems:"center",gap:"10px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:"8px",color:"#fff",padding:"7px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:"800",fontSize:"16px"}}>📋 Daily Tasks</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"11px"}}>{formatDate(new Date().toISOString())} · {doneCount}/{tasks.length} done</div>
        </div>
      </div>

      <div style={{overflowY:"auto",flex:1,padding:"14px",display:"flex",flexDirection:"column",gap:"12px"}}>
        {tasks.length>0&&(
          <div style={{background:"#EEF0F8",borderRadius:"20px",height:"6px",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(90deg,#2E9E6B,#52C99A)",height:"100%",width:`${(doneCount/tasks.length)*100}%`,borderRadius:"20px",transition:"width 0.4s"}}/>
          </div>
        )}

        <div style={S.card}>
          <input value={newTask.text} onChange={e=>setNewTask(t=>({...t,text:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Add today's task..." style={{...S.input,marginBottom:"8px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
            <select value={newTask.type} onChange={e=>setNewTask(t=>({...t,type:e.target.value}))} style={{...S.input,fontSize:"12px"}}>
              {TASK_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={newTask.priority} onChange={e=>setNewTask(t=>({...t,priority:e.target.value}))} style={{...S.input,fontSize:"12px"}}>
              {PRIORITIES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <button onClick={addTask} style={{...S.btn,width:"100%",textAlign:"center"}}>+ Add Task</button>
        </div>

        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {[["all","All"],["pending","Pending"],["done","Done"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:filter===k?"#0F2447":"#F0F2F5",color:filter===k?"#fff":"#666",fontSize:"12px",fontWeight:"600"}}>{l}</button>
          ))}
          {doneCount>0&&<button onClick={clearDone} style={{padding:"6px 14px",borderRadius:"20px",border:"none",cursor:"pointer",background:"#FFECEC",color:"#D94F4F",fontSize:"12px",fontWeight:"600",marginLeft:"auto"}}>Clear Done</button>}
        </div>

        {filtered.map(t=>{
          const ts = TASK_STATUSES.find(s=>s.key===t.status)||TASK_STATUSES[0];
          const pr = PRIORITIES.find(p=>p.key===t.priority)||PRIORITIES[1];
          return(
            <div key={t.id} style={{...S.card,borderLeft:`3px solid ${ts.color}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"13px",fontWeight:"600",color:"#1a1a2e",textDecoration:t.status==="done"?"line-through":"none"}}>{t.text}</div>
                  <div style={{fontSize:"11px",color:"#888",marginTop:"2px"}}>{t.type} · <span style={{color:pr.color,fontWeight:"700"}}>{pr.label}</span></div>
                </div>
                <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",fontSize:"14px"}}>✕</button>
              </div>
              <div style={{display:"flex",gap:"5px",marginTop:"8px",flexWrap:"wrap"}}>
                {TASK_STATUSES.map(s=>(
                  <button key={s.key} onClick={()=>updateStatus(t.id,s.key)} style={{padding:"4px 10px",borderRadius:"20px",border:"none",cursor:"pointer",background:t.status===s.key?s.color:"#F0F2F5",color:t.status===s.key?"#fff":"#666",fontSize:"11px",fontWeight:"600"}}>{s.label}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function VisaCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("list"); // list | client | daily
  const [activeClient, setActiveClient] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVisa, setFilterVisa] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    async function fetchClients() {
      setLoading(true);
      const {data,error} = await supabase.from("clients").select("*").order("created_at",{ascending:false});
      if (error) showToast("Failed to load: "+error.message,"error");
      else setClients(data||[]);
      setLoading(false);
    }
    fetchClients();
  },[]);

  const saveClient = async (form) => {
    const payload = {
      name:form.name, phone:form.phone, email:form.email,
      nationality:form.nationality, visa_type:form.visa_type,
      status:form.status, priority:form.priority,
      destination:form.destination, blocker:form.blocker,
      task_status:form.task_status, center:form.center,
      appointment_status:form.appointment_status, task_type:form.task_type,
      submission_date:form.submission_date||null,
      appointment_date:form.appointment_date||null,
      notes:form.notes,
      comments:form.comments||[], tasks:form.tasks||[],
      logs:form.logs||[], images:form.images||[]
    };
    if (form.id) {
      const {data,error} = await supabase.from("clients").update(payload).eq("id",form.id).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>c.map(cl=>cl.id===form.id?data:cl));
      setActiveClient(data);
      showToast("Saved ✓");
    } else {
      const {data,error} = await supabase.from("clients").insert(payload).select().single();
      if (error) { showToast("Save failed: "+error.message,"error"); return; }
      setClients(c=>[data,...c]);
      setActiveClient(data);
      showToast("Client added ✓");
    }
  };

  const deleteClient = async (id) => {
    const {error} = await supabase.from("clients").delete().eq("id",id);
    if (error) { showToast("Delete failed","error"); return; }
    setClients(c=>c.filter(cl=>cl.id!==id));
    setScreen("list");
    setActiveClient(null);
    showToast("Deleted");
  };

  const openClient = (c) => { setActiveClient(c); setScreen("client"); };
  const newClient = () => { setActiveClient(null); setScreen("client"); };

  const filtered = clients.filter(c=>{
    const q=search.toLowerCase();
    return (!q||[c.name,c.phone,c.nationality,c.destination].some(v=>v?.toLowerCase().includes(q)))
      &&(filterStatus==="all"||c.status===filterStatus)
      &&(filterVisa==="all"||c.visa_type===filterVisa);
  });

  const stats = {
    total:clients.length,
    approved:clients.filter(c=>c.status==="closed").length,
    pending:clients.filter(c=>["onboarding","appointment_hunting","appointment_booked","file_ready","submitted"].includes(c.status)).length,
    urgent:clients.filter(c=>c.priority==="high").length,
  };

  if (screen==="client") return (
    <div style={{height:"100vh",overflow:"hidden"}}>
      {toast&&<div style={{position:"fixed",top:"14px",right:"14px",zIndex:9999,background:toast.type==="error"?"#D94F4F":"#2E9E6B",color:"#fff",padding:"10px 16px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",boxShadow:"0 6px 20px rgba(0,0,0,0.2)"}}>{toast.msg}</div>}
      <ClientForm client={activeClient} onSave={saveClient} onBack={()=>setScreen("list")} onDelete={deleteClient}/>
    </div>
  );

  if (screen==="daily") return (
    <div style={{height:"100vh",overflow:"hidden"}}>
      <DailyTasksPage onBack={()=>setScreen("list")}/>
    </div>
  );

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#F4F6FB",fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`*{box-sizing:border-box} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {toast&&<div style={{position:"fixed",top:"14px",right:"14px",zIndex:9999,background:toast.type==="error"?"#D94F4F":"#2E9E6B",color:"#fff",padding:"10px 16px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",boxShadow:"0 6px 20px rgba(0,0,0,0.2)"}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0A1628,#0F2447,#1A3A6B)",padding:"10px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <div style={{width:"32px",height:"32px",background:"#fff",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🌐</div>
            <div>
              <div style={{color:"#fff",fontWeight:"800",fontSize:"15px",letterSpacing:"0.3px"}}>GLOBAL EIS</div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:"10px"}}>Visa CRM</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={()=>setScreen("daily")} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"8px",color:"#fff",padding:"7px 10px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>📋 Daily</button>
            <button onClick={newClient} style={{...S.btn,padding:"7px 14px",fontSize:"13px",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)"}}>+ New</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"6px",marginBottom:"8px"}}>
          {[{l:"Total",v:stats.total,c:"#5B8DEF"},{l:"Closed",v:stats.approved,c:"#2E9E6B"},{l:"Active",v:stats.pending,c:"#D6A520"},{l:"Urgent",v:stats.urgent,c:"#D94F4F"}].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:"10px",padding:"8px",textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"800",color:s.c}}>{s.v}</div>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.5)"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search clients..." style={{...S.input,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:"13px"}}/>
      </div>

      {/* Filters */}
      <div style={{padding:"8px 16px",background:"#fff",borderBottom:"1px solid #EAECF0",display:"flex",gap:"6px",overflowX:"auto",flexShrink:0}}>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...S.input,fontSize:"12px",maxWidth:"160px",padding:"7px 10px"}}>
          <option value="all">All Statuses</option>
          {VISA_STATUSES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filterVisa} onChange={e=>setFilterVisa(e.target.value)} style={{...S.input,fontSize:"12px",maxWidth:"140px",padding:"7px 10px"}}>
          <option value="all">All Visa Types</option>
          {VISA_TYPES.map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Client List */}
      <div style={{overflowY:"auto",flex:1,padding:"12px 16px"}}>
        {loading&&<div style={{textAlign:"center",padding:"40px",color:"#aaa",fontSize:"14px"}}>⏳ Loading...</div>}
        {!loading&&filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px",color:"#ccc"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>👤</div>
            <div style={{fontSize:"14px"}}>{clients.length===0?"No clients yet\nTap \"+ New\" to add your first client":"No results found"}</div>
          </div>
        )}
        {!loading&&filtered.map(c=>{
          const st=VISA_STATUSES.find(s=>s.key===c.status)||VISA_STATUSES[0];
          const pr=PRIORITIES.find(p=>p.key===c.priority)||PRIORITIES[1];
          const tasksDone=(c.tasks||[]).filter(t=>t.status==="done").length;
          return(
            <div key={c.id} onClick={()=>openClient(c)} style={{background:"#fff",borderRadius:"14px",padding:"14px",marginBottom:"10px",cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderLeft:`4px solid ${st.color}`,animation:"fadeIn 0.2s ease"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"8px"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"800",fontSize:"15px",color:"#0F2447",marginBottom:"2px"}}>{c.name||"—"}</div>
                  <div style={{fontSize:"12px",color:"#888"}}>{c.destination} · {c.visa_type}</div>
                  {c.phone&&<div style={{fontSize:"12px",color:"#aaa",marginTop:"1px"}}>{c.phone}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"4px",flexShrink:0}}>
                  <span style={{background:st.bg,color:st.color,borderRadius:"20px",padding:"3px 10px",fontSize:"11px",fontWeight:"700",whiteSpace:"nowrap"}}>{st.label}</span>
                  <span style={{color:pr.color,fontSize:"11px",fontWeight:"700"}}>{pr.label}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",marginTop:"8px",flexWrap:"wrap",alignItems:"center"}}>
                {c.center&&<span style={{fontSize:"10px",background:"#F0F2F5",color:"#666",borderRadius:"6px",padding:"2px 7px"}}>{c.center}</span>}
                {c.blocker&&c.blocker!=="None"&&<span style={{fontSize:"10px",background:"#FFECEC",color:"#D94F4F",borderRadius:"6px",padding:"2px 7px"}}>🚫 {c.blocker}</span>}
                {c.appointment_date&&<span style={{fontSize:"10px",background:"#F0EEFF",color:"#7B68EE",borderRadius:"6px",padding:"2px 7px"}}>📅 {formatDate(c.appointment_date)}</span>}
                {(c.tasks||[]).length>0&&<span style={{fontSize:"10px",background:"#E8F8F0",color:"#2E9E6B",borderRadius:"6px",padding:"2px 7px"}}>✅ {tasksDone}/{c.tasks.length}</span>}
                {(c.comments||[]).length>0&&<span style={{fontSize:"10px",background:"#EBF2FF",color:"#5B8DEF",borderRadius:"6px",padding:"2px 7px"}}>💬 {c.comments.length}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
