const DAYS = ['월','화','수','목','금','토','일'];
const REGION_DISTRICTS = {
  '서울': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '경기': ['수원시','성남시','의정부시','안양시','부천시','광명시','평택시','동두천시','안산시','고양시','과천시','구리시','남양주시','오산시','시흥시','군포시','의왕시','하남시','용인시','파주시','이천시','안성시','김포시','화성시','광주시','양주시','포천시','여주시','연천군','가평군','양평군'],
  '인천': ['강화군','계양구','미추홀구','남동구','동구','부평구','서구','연수구','옹진군','중구'],
  '강원': ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  '충북': ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  '충남': ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  '대전': ['대덕구','동구','서구','유성구','중구'],
  '세종': ['세종시'],
  '전북': ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  '전남': ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  '광주': ['광산구','남구','동구','북구','서구'],
  '경북': ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  '경남': ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  '대구': ['남구','달서구','달성군','동구','북구','서구','수성구','중구','군위군'],
  '울산': ['남구','동구','북구','중구','울주군'],
  '부산': ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '제주': ['제주시','서귀포시']
};
const REGIONS = Object.keys(REGION_DISTRICTS);
const AMENITY_OPTIONS = ['예약','포장','배달','픽업가능','단체이용가능','무료주차','유료주차','발렛파킹','무선인터넷','남녀 화장실 구분','유아의자','노키즈존','야외석','반려동물 동반','대기공간','휴게공간','충전서비스','야간운영'];
const AMENITY_ICON = {'예약':'📅','포장':'🥡','배달':'🛵','픽업가능':'🚶','단체이용가능':'👥','무료주차':'🅿️','유료주차':'💳','발렛파킹':'🚗','무선인터넷':'📶','남녀 화장실 구분':'🚻','유아의자':'🍼','노키즈존':'🚫','야외석':'☀️','반려동물 동반':'🐾','대기공간':'🪑','휴게공간':'🛋️','충전서비스':'🔌','야간운영':'🌙'};

const SUPABASE_URL = 'https://xmuxoqjcxfxtqiockaum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdXhvcWpjeGZ4dHFpb2NrYXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NjY5MzYsImV4cCI6MjEwMTE0MjkzNn0.ZxGDpFf5g7yzMst8lpbU226PQHMeUL60-cu7bytNcoU';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let currentUser = null;

/* window.storage is provided automatically inside the Claude.ai artifact
   preview, but a plain page hosted elsewhere (e.g. GitHub Pages) has no
   such global. When it's missing, fall back to localStorage so saves still
   persist in the browser instead of silently failing on every write. */
(function ensureStorageShim(){
  if(window.storage && typeof window.storage.set === 'function') return;
  const PREFIX = 'meokgowatji:';
  window.storage = {
    async get(key){
      const raw = localStorage.getItem(PREFIX+key);
      if(raw === null) throw new Error('Key not found: '+key);
      return { key, value: raw, shared:false };
    },
    async set(key, value){
      try{
        localStorage.setItem(PREFIX+key, value);
        return { key, value, shared:false };
      }catch(e){
        return null;
      }
    },
    async delete(key){
      const existed = localStorage.getItem(PREFIX+key) !== null;
      localStorage.removeItem(PREFIX+key);
      return { key, deleted:existed, shared:false };
    },
    async list(prefix){
      const full = PREFIX + (prefix || '');
      const keys = [];
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && k.indexOf(full)===0) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix, shared:false };
    }
  };
})();

let places = [];
let filters = { cat:'전체', region:'전체', district:'전체', openNow:false, pet:false };
let editingId = null;
let wizard = null;
let step = 1;

function uid(){ return 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function squareCropFile(file, outSize, quality){
  quality = quality || 0.8;
  return new Promise((resolve)=>{
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const img = new Image();
      img.onload = ()=>{
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size)/2, sy = (img.height - size)/2;
        const canvas = document.createElement('canvas');
        canvas.width = outSize; canvas.height = outSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoStrip(overlay){
  const strip = overlay.querySelector('#photoStrip');
  if(!strip) return;
  const photosInput = overlay.querySelector('#photosInput');
  let html = wizard.photos.map((src, idx)=>`
    <div class="photo-thumb">
      <img src="${src}">
      <button type="button" class="photo-remove" data-idx="${idx}">✕</button>
    </div>`).join('');
  if(wizard.photos.length < 9){
    html += `<div class="photo-add-btn" id="photoAddBtn">＋</div>`;
  }
  strip.innerHTML = html;
  strip.querySelectorAll('.photo-remove').forEach(btn=>{
    btn.onclick = ()=>{
      wizard.photos.splice(Number(btn.dataset.idx), 1);
      renderPhotoStrip(overlay);
    };
  });
  const addBtn = strip.querySelector('#photoAddBtn');
  if(addBtn) addBtn.onclick = ()=> photosInput.click();
}
function showToast(msg, duration){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), duration || 1700);
}

async function loadPlaces(){
  places = [];

  if(currentUser && supabaseClient){
    try{
      const { data, error } = await supabaseClient
        .from('places')
        .select('id, data')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending:false });
      if(error) throw error;
      places = (data||[]).map(row=>{
        const p = row.data;
        if(!Array.isArray(p.photos)) p.photos = [];
        return p;
      });
    }catch(e){
      console.warn('Failed to load places from Supabase', e);
      places = [];
    }
    render();
    return;
  }

  try{
    const legacy = await window.storage.get('places', false).catch(()=>null);
    if(legacy && legacy.value){
      const legacyPlaces = JSON.parse(legacy.value);
      for(const p of legacyPlaces){
        if(!Array.isArray(p.photos)) p.photos = [];
        try{ await window.storage.set('place:'+p.id, JSON.stringify(p), false); }catch(e){}
      }
      try{ await window.storage.delete('places', false); }catch(e){}
    }
  }catch(e){}

  try{
    const listRes = await window.storage.list('place:', false);
    const keys = (listRes && listRes.keys) ? listRes.keys : [];
    const results = await Promise.all(keys.map(k => window.storage.get(k, false).catch(()=>null)));
    places = results.filter(r=>r && r.value).map(r=>{
      const p = JSON.parse(r.value);
      if(!Array.isArray(p.photos)) p.photos = [];
      return p;
    });
  }catch(e){ places = []; }

  render();
}
async function savePlace(place){
  // NOTE: save-failure popups are intentionally silenced for now (still
  // logged to the console for debugging). Re-add showToast(...) calls here
  // if you want the user to be warned when a save doesn't persist.
  if(currentUser && supabaseClient){
    try{
      const { error } = await supabaseClient
        .from('places')
        .upsert({ id: place.id, user_id: currentUser.id, data: place });
      if(error){
        console.warn('supabase save failed', error);
        return false;
      }
      return true;
    }catch(e){
      console.warn('supabase save threw', e);
      return false;
    }
  }

  if(!window.storage || typeof window.storage.set !== 'function'){
    console.warn('window.storage unavailable; save not persisted.');
    return false;
  }
  try{
    const result = await window.storage.set('place:'+place.id, JSON.stringify(place), false);
    if(!result){
      console.warn('window.storage.set returned falsy; save not persisted.');
      return false;
    }
    return true;
  }catch(e){
    console.warn('window.storage.set threw; save not persisted.', e);
    return false;
  }
}
async function deletePlaceKey(id){
  if(currentUser && supabaseClient){
    try{ await supabaseClient.from('places').delete().eq('id', id).eq('user_id', currentUser.id); }catch(e){}
    return;
  }
  try{ await window.storage.delete('place:'+id, false); }catch(e){}
}

function getUserDisplayName(user){
  return user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.preferred_username || '카카오 사용자';
}
function getUserAvatar(user){
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
}
async function loginWithKakao(){
  if(!supabaseClient){ showToast('로그인 기능을 사용할 수 없어요.'); return; }
  await supabaseClient.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
}
async function logout(){
  if(!supabaseClient) return;
  await supabaseClient.auth.signOut();
  const overlay = document.getElementById('sheetOverlay');
  if(overlay) overlay.remove();
  showToast('로그아웃했어요.');
}
async function migrateGuestPlacesToAccount(){
  if(!currentUser || !supabaseClient) return;
  try{
    const listRes = await window.storage.list('place:', false);
    const keys = (listRes && listRes.keys) ? listRes.keys : [];
    if(keys.length === 0) return;
    const results = await Promise.all(keys.map(k => window.storage.get(k, false).catch(()=>null)));
    const localPlaces = results.filter(r=>r && r.value).map(r=>JSON.parse(r.value));
    if(localPlaces.length === 0) return;

    const rows = localPlaces.map(p => ({ id: p.id, user_id: currentUser.id, data: p }));
    const { error } = await supabaseClient.from('places').upsert(rows);
    if(error){ console.warn('guest place migration failed', error); return; }

    await Promise.all(keys.map(k => window.storage.delete(k, false).catch(()=>{})));
    showToast('게스트로 기록했던 장소를 계정으로 옮겼어요.');
  }catch(e){ console.warn('guest place migration threw', e); }
}
async function initAuth(){
  if(!supabaseClient){ loadPlaces(); return; }
  const { data:{ session } } = await supabaseClient.auth.getSession();
  currentUser = session?.user ?? null;
  if(currentUser) await migrateGuestPlacesToAccount();
  await loadPlaces();
  supabaseClient.auth.onAuthStateChange(async (event, session)=>{
    currentUser = session?.user ?? null;
    if(event === 'SIGNED_IN' && currentUser) await migrateGuestPlacesToAccount();
    loadPlaces();
    const overlay = document.getElementById('sheetOverlay');
    if(overlay && overlay.querySelector('.settings-profile')) openSettings();
  });
}

function emptyPlace(){
  return {
    id: uid(), name:'', category:'맛집', region:'', district:'', address:'', thumbnail:null, photos:[],
    hoursMode:'same', hoursSame:{open:'11:00', close:'21:00', breakEnabled:false, breakStart:'15:00', breakEnd:'17:00'}, closedDays:[],
    hoursCustom: DAYS.map(d=>({day:d, closed:false, open:'11:00', close:'21:00', breakEnabled:false, breakStart:'15:00', breakEnd:'17:00'})),
    restroom:'unknown', amenities:[], memo:'', createdAt: Date.now()
  };
}

function todayIndex(){ const j = new Date().getDay(); return j===0?6:j-1; }
function isOpenOnDayIdx(p, idx){
  if(p.hoursMode === 'same') return !p.closedDays.includes(idx);
  const h = p.hoursCustom[idx]; return h && !h.closed;
}
function getHoursForDay(p, idx){
  if(p.hoursMode === 'same') return { closed: p.closedDays.includes(idx), open:p.hoursSame.open, close:p.hoursSame.close, breakEnabled:p.hoursSame.breakEnabled, breakStart:p.hoursSame.breakStart, breakEnd:p.hoursSame.breakEnd };
  return p.hoursCustom[idx];
}
function isBreakTimeNow(p){
  const idx = todayIndex();
  const h = getHoursForDay(p, idx);
  if(!h || h.closed || !h.breakEnabled) return false;
  const now = new Date(); const cur = now.getHours()*60+now.getMinutes();
  const [bsh,bsm]=h.breakStart.split(':').map(Number), [beh,bem]=h.breakEnd.split(':').map(Number);
  const bs_=bsh*60+bsm, be_=beh*60+bem;
  if(be_ <= bs_) return cur>=bs_ || cur<be_;
  return cur>=bs_ && cur<be_;
}
function isOpenNow(p){
  const idx = todayIndex();
  const h = getHoursForDay(p, idx);
  if(!h || h.closed) return false;
  if(isBreakTimeNow(p)) return false;
  const now = new Date(); const cur = now.getHours()*60+now.getMinutes();
  const [oh,om]=h.open.split(':').map(Number), [ch,cm]=h.close.split(':').map(Number);
  const om_=oh*60+om, cm_=ch*60+cm;
  if(cm_ <= om_) return cur>=om_ || cur<cm_;
  return cur>=om_ && cur<cm_;
}
function getStatus(p){
  const idx = todayIndex();
  if(!isOpenOnDayIdx(p, idx)) return {label:'휴무', cls:'holiday'};
  if(isBreakTimeNow(p)) return {label:'브레이크타임', cls:'closed'};
  if(isOpenNow(p)) return {label:'영업중', cls:'open'};
  return {label:'영업종료', cls:'closed'};
}
function buildHoursGroups(p){
  const dayData = DAYS.map((d,i)=>{
    const h = getHoursForDay(p, i);
    const breakKey = h.breakEnabled ? (h.breakStart+'~'+h.breakEnd) : 'nobreak';
    return { closed:h.closed, open:h.open, close:h.close, breakEnabled:h.breakEnabled, breakStart:h.breakStart, breakEnd:h.breakEnd, key: h.closed ? 'closed' : (h.open+'-'+h.close+'-'+breakKey) };
  });
  const groups = [];
  let i = 0;
  while(i < 7){
    let j = i;
    while(j+1 < 7 && dayData[j+1].key === dayData[i].key) j++;
    groups.push({ startIdx:i, endIdx:j, data:dayData[i] });
    i = j+1;
  }
  return groups;
}

function getFiltered(){
  return places.filter(p=>{
    if(filters.cat!=='전체' && p.category!==filters.cat) return false;
    if(filters.region!=='전체' && p.region!==filters.region) return false;
    if(filters.district!=='전체' && p.district!==filters.district) return false;
    if(filters.openNow && !isOpenNow(p)) return false;
    if(filters.pet && !p.amenities.includes('반려동물 동반')) return false;
    return true;
  }).sort((a,b)=>b.createdAt-a.createdAt);
}

function updateRegionOptions(){
  const sel = document.getElementById('regionSelect');
  const current = sel.value || '전체';
  sel.innerHTML = '<option value="전체">지역</option>' + REGIONS.map(r=>`<option value="${r}">${r}</option>`).join('');
  sel.value = current;
}
function updateDistrictFilterOptions(){
  const sel = document.getElementById('districtSelect');
  const region = filters.region;
  const districts = REGION_DISTRICTS[region] || [];
  if(region === '전체' || districts.length===0){
    sel.innerHTML = '<option value="전체">시군구</option>';
    sel.disabled = true;
  } else {
    sel.innerHTML = '<option value="전체">시군구</option>' + districts.map(d=>`<option value="${d}">${d}</option>`).join('');
    sel.disabled = false;
  }
  sel.value = '전체';
}

function render(){
  updateRegionOptions();
  const grid = document.getElementById('grid');
  const list = getFiltered();
  document.getElementById('emptyState').style.display = places.length===0 ? 'block':'none';
  grid.style.display = places.length===0 ? 'none':'grid';

  if(places.length>0 && list.length===0){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px 10px;color:var(--ink-soft);font-size:13.5px;">조건에 맞는 곳이 없어요</div>`;
    return;
  }

  grid.innerHTML = list.map(p=>{
    const st = getStatus(p);
    const regionTxt = [p.region, p.district].filter(Boolean).join(' ');
    const thumbHtml = p.thumbnail
      ? `<div class="thumb" style="background-image:url('${p.thumbnail}')"><span class="cat-pill">${p.category}</span></div>`
      : `<div class="thumb empty"><span class="cat-pill">${p.category}</span></div>`;
    return `
    <div class="card" onclick="openDetail('${p.id}')">
      ${thumbHtml}
      <div class="info">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="region">${escapeHtml(regionTxt)}</div>
        <div class="status-row">
          <span class="dot ${st.cls}"></span>
          <span class="stxt ${st.cls}">${st.label}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

['catAll','catFood','catCafe'].forEach(id=>{
  document.getElementById(id).onclick = ()=>{
    document.querySelectorAll('#catAll,#catFood,#catCafe').forEach(c=>c.classList.remove('active'));
    const el = document.getElementById(id);
    el.classList.add('active');
    filters.cat = el.dataset.cat;
    render();
  };
});
document.getElementById('regionSelect').onchange = e=>{
  filters.region = e.target.value;
  filters.district = '전체';
  document.getElementById('regionChip').classList.toggle('hasval', filters.region!=='전체');
  updateDistrictFilterOptions();
  document.getElementById('districtChip').classList.remove('hasval');
  render();
};
document.getElementById('districtSelect').onchange = e=>{
  filters.district = e.target.value;
  document.getElementById('districtChip').classList.toggle('hasval', filters.district!=='전체');
  render();
};
document.getElementById('openNowChip').onclick = ()=>{
  filters.openNow = !filters.openNow;
  document.getElementById('openNowChip').classList.toggle('active', filters.openNow);
  render();
};
document.getElementById('petChip').onclick = ()=>{
  filters.pet = !filters.pet;
  document.getElementById('petChip').classList.toggle('active', filters.pet);
  render();
};

document.getElementById('openAddBtn').onclick = ()=>{ editingId=null; wizard=emptyPlace(); step=1; renderWizardSheet(); };

/* ---------- detail view ---------- */
function openDetail(id){
  const p = places.find(x=>x.id===id); if(!p) return;
  const old = document.getElementById('sheetOverlay');
  if(old) old.remove();
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.id = 'sheetOverlay';
  const st = getStatus(p);
  const regionTxt = [p.region, p.district].filter(Boolean).join(' ');

  const groups = buildHoursGroups(p);
  const hoursHtml = groups.map(g=>{
    const label = g.startIdx===g.endIdx ? DAYS[g.startIdx] : `${DAYS[g.startIdx]}~${DAYS[g.endIdx]}`;
    const off = g.data.closed;
    const breakTxt = (!off && g.data.breakEnabled) ? ` (브레이크 ${g.data.breakStart}~${g.data.breakEnd})` : '';
    return `<div class="detail-hours-row"><span class="dname">${label}</span><span class="htime ${off?'off':''}">${off?'휴무':(g.data.open+' ~ '+g.data.close+breakTxt)}</span></div>`;
  }).join('');

  const tags = [];
  if(p.restroom !== 'unknown'){
    tags.push(`<span class="detail-tag">🚻 화장실 ${p.restroom==='yes'?'있음':'없음'}</span>`);
  }
  p.amenities.forEach(a=> tags.push(`<span class="detail-tag">${AMENITY_ICON[a]||'·'} ${escapeHtml(a)}</span>`));
  const amenitySection = tags.length
    ? `<div class="detail-section"><div class="dlabel">부가서비스</div><div class="detail-tags">${tags.join('')}</div></div>`
    : '';
  const addrHtml = p.address
    ? `<div class="detail-section"><div class="dlabel">주소</div><div class="detail-address">${escapeHtml(p.address)}</div></div>`
    : '';
  const memoHtml = p.memo
    ? `<div class="detail-section"><div class="dlabel">메모</div><div class="detail-memo">${escapeHtml(p.memo)}</div></div>`
    : '';

  const allPhotos = [p.thumbnail, ...(p.photos||[])].filter(Boolean);
  const galleryHtml = allPhotos.length > 1
    ? `<div class="detail-gallery">
         <div class="detail-gallery-scroll" id="gallerySc">
           ${allPhotos.map(src=>`<div class="detail-gallery-slide" style="background-image:url('${src}')"></div>`).join('')}
         </div>
         <button type="button" class="gallery-arrow prev" id="galleryPrev" aria-label="이전 사진">‹</button>
         <button type="button" class="gallery-arrow next" id="galleryNext" aria-label="다음 사진">›</button>
       </div>
       <div class="detail-gallery-dots" id="galleryDots">
         ${allPhotos.map((_, i)=>`<span class="${i===0?'active':''}" data-idx="${i}"></span>`).join('')}
       </div>`
    : `<div class="detail-thumb" style="${allPhotos[0]?`background-image:url('${allPhotos[0]}')`:''}"></div>`;

  overlay.innerHTML = `
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h2>상세 정보</h2>
      <button class="close-x" id="closeSheet">✕</button>
    </div>
    ${galleryHtml}
    <div class="detail-title-row">
      <span class="detail-cat">${p.category}</span>
    </div>
    <div class="detail-name">${escapeHtml(p.name)}</div>
    <div class="detail-region">${escapeHtml(regionTxt)}</div>
    <div class="detail-status stxt ${st.cls}"><span class="dot ${st.cls}"></span>${st.label}</div>

    ${addrHtml}

    <div class="detail-section">
      <div class="dlabel">영업시간</div>
      <div>${hoursHtml}</div>
    </div>

    ${amenitySection}
    ${memoHtml}

    <div class="sheet-actions" style="align-items:center; justify-content:space-between;">
      <button type="button" class="btn-danger-link" id="deleteFromDetail" style="margin-top:0;">이 장소 삭제하기</button>
      <button class="btn-primary" id="editFromDetail" style="flex:0 0 auto; padding:13px 26px;">수정하기</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  if(allPhotos.length > 1){
    const sc = overlay.querySelector('#gallerySc');
    const dots = overlay.querySelectorAll('#galleryDots span');
    const prevBtn = overlay.querySelector('#galleryPrev');
    const nextBtn = overlay.querySelector('#galleryNext');
    const currentIdx = ()=> Math.round(sc.scrollLeft / sc.clientWidth);
    const goTo = (idx)=>{
      idx = Math.max(0, Math.min(allPhotos.length-1, idx));
      sc.scrollTo({ left: idx*sc.clientWidth, behavior:'smooth' });
    };
    sc.onscroll = ()=>{
      const idx = currentIdx();
      dots.forEach((d,i)=> d.classList.toggle('active', i===idx));
      prevBtn.disabled = idx===0;
      nextBtn.disabled = idx===allPhotos.length-1;
    };
    prevBtn.onclick = ()=> goTo(currentIdx()-1);
    nextBtn.onclick = ()=> goTo(currentIdx()+1);
    dots.forEach(d=>{ d.onclick = ()=> goTo(Number(d.dataset.idx)); });
    prevBtn.disabled = true;
  }
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  overlay.querySelector('#closeSheet').onclick = ()=> overlay.remove();
  overlay.querySelector('#editFromDetail').onclick = ()=>{
    overlay.remove();
    editingId = id;
    wizard = JSON.parse(JSON.stringify(p));
    step = 1;
    renderWizardSheet();
  };
  overlay.querySelector('#deleteFromDetail').onclick = ()=>{
    showConfirmPopup({
      text: '이 장소를 삭제할까요?',
      sub: '삭제하면 되돌릴 수 없어요.',
      confirmLabel: '삭제',
      onConfirm: async ()=>{
        await deletePlaceKey(id);
        places = places.filter(x=>x.id!==id);
        overlay.remove();
        render();
        showToast('삭제했어요.');
      }
    });
  };
}
window.openDetail = openDetail;

/* ---------- generic confirm popup ---------- */
function showConfirmPopup({text, sub, confirmLabel, onConfirm}){
  const pop = document.createElement('div');
  pop.className = 'confirm-overlay';
  pop.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-text">${text}</div>
      <div class="confirm-sub">${sub || ''}</div>
      <div class="confirm-actions">
        <button type="button" id="cancelPop">취소</button>
        <button type="button" id="confirmPop">${confirmLabel}</button>
      </div>
    </div>`;
  document.body.appendChild(pop);
  pop.onclick = (e)=>{ if(e.target===pop) pop.remove(); };
  pop.querySelector('#cancelPop').onclick = ()=> pop.remove();
  pop.querySelector('#confirmPop').onclick = async ()=>{ await onConfirm(); pop.remove(); };
}

/* ---------- wizard (add / edit) ---------- */
function showDeleteConfirm(overlay){
  showConfirmPopup({
    text: '이 장소를 삭제할까요?',
    sub: '삭제하면 되돌릴 수 없어요.',
    confirmLabel: '삭제',
    onConfirm: async ()=>{
      await deletePlaceKey(editingId);
      places = places.filter(x=>x.id!==editingId);
      overlay.remove();
      render();
      showToast('삭제했어요.');
    }
  });
}

function renderWizardSheet(){
  const old = document.getElementById('sheetOverlay');
  if(old) old.remove();
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.id = 'sheetOverlay';
  overlay.innerHTML = step===1 ? step1Html() : step2Html();
  document.body.appendChild(overlay);
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  bindStepEvents(overlay);
}

function step1Html(){
  const p = wizard;
  return `
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h2>${editingId ? '장소 수정' : '새로운 장소'}</h2>
      <button class="close-x" id="closeSheet">✕</button>
    </div>
    <div class="steps-dots"><span class="on"></span><span></span></div>

    <div class="field">
      <label>대표 사진</label>
      <div class="thumb-upload-big" id="thumbBox">
        ${p.thumbnail ? `<img src="${p.thumbnail}">` : `<span class="plus">＋</span><span>탭해서 사진 추가</span>`}
      </div>
      <input type="file" id="thumbInput" accept="image/*" style="display:none;">
    </div>

    <div class="field">
      <label>추가 사진 <span style="font-weight:400;color:var(--ink-faint);">(최대 9장, 대표사진 포함 총 10장)</span></label>
      <div class="photo-strip" id="photoStrip"></div>
      <input type="file" id="photosInput" accept="image/*" multiple style="display:none;">
    </div>

    <div class="field">
      <label>종류</label>
      <div class="cat-select">
        <button type="button" class="pill-btn" data-cat="맛집">맛집</button>
        <button type="button" class="pill-btn" data-cat="카페">카페</button>
      </div>
    </div>

    <div class="field">
      <label>이름</label>
      <input type="text" id="f_name" value="${escapeHtml(p.name)}">
    </div>

    <div class="field">
      <label>지역</label>
      <div class="region-grid" id="regionGrid">
        ${REGIONS.map(r=>`<button type="button" class="pill-btn" data-r="${r}">${r}</button>`).join('')}
      </div>
      <div class="district-wrap" id="districtWrap" style="display:none;">
        <div class="district-grid" id="districtGrid"></div>
      </div>
    </div>

    <div class="field">
      <label>주소 <span style="font-weight:400;color:var(--ink-faint);">(선택)</span></label>
      <input type="text" id="f_address" value="${escapeHtml(p.address)}">
    </div>

    <div class="sheet-actions">
      <button class="btn-primary" id="toStep2" style="flex:1;">다음</button>
    </div>
  </div>`;
}

function step2Html(){
  const p = wizard;
  return `
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h2>${editingId ? '장소 수정' : '새로운 장소'}</h2>
      <button class="close-x" id="closeSheet">✕</button>
    </div>
    <div class="steps-dots"><span></span><span class="on"></span></div>

    <div class="field">
      <label>영업시간</label>
      <div class="hours-mode-toggle">
        <button type="button" class="pill-btn ${p.hoursMode==='same'?'active':''}" data-mode="same">매일 같은 시간</button>
        <button type="button" class="pill-btn ${p.hoursMode==='custom'?'active':''}" data-mode="custom">요일별로 다름</button>
      </div>

      <div id="sameHoursBox" style="${p.hoursMode==='custom'?'display:none;':''}">
        <div class="time-row">
          <input type="time" id="sameOpen" value="${p.hoursSame.open}">
          <span class="tilde">~</span>
          <input type="time" id="sameClose" value="${p.hoursSame.close}">
        </div>

        <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between;">
          <label style="margin:0;">브레이크타임</label>
          <button type="button" id="breakToggle" class="pill-btn ${p.hoursSame.breakEnabled?'active':''}" style="padding:6px 14px; font-size:12.5px;">${p.hoursSame.breakEnabled?'있음':'없음'}</button>
        </div>
        <div class="time-row" id="breakTimeRow" style="margin-top:8px; ${p.hoursSame.breakEnabled?'':'display:none;'}">
          <input type="time" id="breakStart" value="${p.hoursSame.breakStart || '15:00'}">
          <span class="tilde">~</span>
          <input type="time" id="breakEnd" value="${p.hoursSame.breakEnd || '17:00'}">
        </div>

        <label style="margin-top:12px;">휴무일 <span style="font-weight:400;color:var(--ink-faint);">(없으면 비워두세요)</span></label>
        <div class="day-grid" id="closedDayGrid">
          ${DAYS.map((d,i)=>`<button type="button" class="pill-btn ${p.closedDays.includes(i)?'active':''}" data-day="${i}">${d}</button>`).join('')}
        </div>
      </div>

      <div id="customHoursBox" style="${p.hoursMode==='same'?'display:none;':''}">
        <div class="custom-hours-list">
          ${DAYS.map((d,i)=>{
            const day = p.hoursCustom[i];
            const breakOn = !!day.breakEnabled;
            return `
            <div class="custom-hours-row">
              <span class="dname">${d}</span>
              <button type="button" class="closed-toggle ${day.closed?'on':''}" data-idx="${i}">휴무</button>
              <input type="time" class="cOpen" data-idx="${i}" value="${day.open}" ${day.closed?'disabled':''}>
              <input type="time" class="cClose" data-idx="${i}" value="${day.close}" ${day.closed?'disabled':''}>
            </div>
            <div class="custom-break-row" data-idx="${i}" style="display:${day.closed?'none':'flex'}; align-items:center; gap:6px; margin:0 0 8px 34px;">
              <button type="button" class="cBreakToggle pill-btn ${breakOn?'active':''}" data-idx="${i}" style="padding:4px 10px; font-size:11px;">${breakOn?'브레이크 있음':'브레이크 없음'}</button>
              <input type="time" class="cBreakStart" data-idx="${i}" value="${day.breakStart || '15:00'}" style="display:${breakOn?'block':'none'}; padding:6px; border:1.5px solid var(--line); border-radius:8px; font-size:11.5px; font-family:inherit; background:var(--surface); color:var(--ink);">
              <span class="cBreakTilde" data-idx="${i}" style="display:${breakOn?'inline':'none'}; color:var(--ink-faint); font-size:11px;">~</span>
              <input type="time" class="cBreakEnd" data-idx="${i}" value="${day.breakEnd || '17:00'}" style="display:${breakOn?'block':'none'}; padding:6px; border:1.5px solid var(--line); border-radius:8px; font-size:11.5px; font-family:inherit; background:var(--surface); color:var(--ink);">
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="field">
      <label>부가서비스</label>
      <div class="amenity-grid" id="amenityGrid">
        ${AMENITY_OPTIONS.map(a=>`<div class="amenity-chip ${p.amenities.includes(a)?'active':''}" data-a="${escapeHtml(a)}">${AMENITY_ICON[a]} ${escapeHtml(a)}</div>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>화장실</label>
      <div class="restroom-select">
        <button type="button" class="pill-btn" data-rv="yes">있음</button>
        <button type="button" class="pill-btn" data-rv="no">없음</button>
      </div>
    </div>

    <div class="field">
      <label>메모 <span style="font-weight:400;color:var(--ink-faint);">(선택)</span></label>
      <textarea id="f_memo">${escapeHtml(p.memo)}</textarea>
    </div>

    <div class="sheet-actions">
      <button class="btn-secondary" id="toStep1">이전</button>
      <button class="btn-primary" id="saveBtn">저장</button>
    </div>
  </div>`;
}

function renderDistrictGrid(overlay){
  const grid = overlay.querySelector('#districtGrid');
  const wrap = overlay.querySelector('#districtWrap');
  const districts = REGION_DISTRICTS[wizard.region] || [];
  if(!grid) return;
  if(districts.length===0){ wrap.style.display='none'; grid.innerHTML=''; return; }
  wrap.style.display='block';
  grid.innerHTML = districts.map(d=>`<button type="button" class="pill-btn ${wizard.district===d?'active':''}" data-d="${d}">${d}</button>`).join('');
  grid.querySelectorAll('.pill-btn').forEach(b=>{
    b.onclick = ()=>{
      grid.querySelectorAll('.pill-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); wizard.district = b.dataset.d;
    };
  });
}

function bindStepEvents(overlay){
  const closeBtn = overlay.querySelector('#closeSheet');
  if(closeBtn) closeBtn.onclick = ()=> overlay.remove();

  if(step===1){
    overlay.querySelectorAll('.cat-select .pill-btn').forEach(b=>{
      if(b.dataset.cat === wizard.category) b.classList.add('active');
      b.onclick=()=>{ overlay.querySelectorAll('.cat-select .pill-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); wizard.category=b.dataset.cat; };
    });
    overlay.querySelectorAll('#regionGrid .pill-btn').forEach(b=>{
      if(b.dataset.r === wizard.region) b.classList.add('active');
      b.onclick=()=>{
        overlay.querySelectorAll('#regionGrid .pill-btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        if(wizard.region !== b.dataset.r) wizard.district = '';
        wizard.region=b.dataset.r;
        renderDistrictGrid(overlay);
      };
    });
    renderDistrictGrid(overlay);

    const thumbBox = overlay.querySelector('#thumbBox');
    const thumbInput = overlay.querySelector('#thumbInput');
    thumbBox.onclick = ()=> thumbInput.click();
    thumbInput.onchange = (e)=>{
      const file = e.target.files[0]; if(!file) return;
      squareCropFile(file, 1000, 0.82).then(dataUrl=>{
        wizard.thumbnail = dataUrl;
        thumbBox.innerHTML = `<img src="${dataUrl}">`;
      });
    };

    const photosInput = overlay.querySelector('#photosInput');
    renderPhotoStrip(overlay);
    photosInput.onchange = async (e)=>{
      const files = Array.from(e.target.files || []);
      const remaining = 9 - wizard.photos.length;
      const toProcess = files.slice(0, Math.max(0, remaining));
      for(const file of toProcess){
        const dataUrl = await squareCropFile(file, 1000, 0.78);
        wizard.photos.push(dataUrl);
      }
      photosInput.value = '';
      renderPhotoStrip(overlay);
    };

    overlay.querySelector('#toStep2').onclick = ()=>{
      const name = overlay.querySelector('#f_name').value.trim();
      if(!name){ showToast('이름을 입력해주세요.'); return; }
      wizard.name = name;
      wizard.address = overlay.querySelector('#f_address').value.trim();
      step = 2; renderWizardSheet();
    };
  } else {
    overlay.querySelectorAll('.hours-mode-toggle .pill-btn').forEach(b=>{
      b.onclick=()=>{
        overlay.querySelectorAll('.hours-mode-toggle .pill-btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); wizard.hoursMode=b.dataset.mode;
        overlay.querySelector('#sameHoursBox').style.display = wizard.hoursMode==='same'?'block':'none';
        overlay.querySelector('#customHoursBox').style.display = wizard.hoursMode==='custom'?'block':'none';
      };
    });
    overlay.querySelectorAll('#closedDayGrid .pill-btn').forEach(b=>{
      b.onclick=()=>{ b.classList.toggle('active'); };
    });
    overlay.querySelector('#breakToggle').onclick = (e)=>{
      const btn = e.currentTarget;
      const on = btn.classList.toggle('active');
      btn.textContent = on ? '있음' : '없음';
      overlay.querySelector('#breakTimeRow').style.display = on ? 'flex' : 'none';
    };
    overlay.querySelectorAll('.closed-toggle').forEach(b=>{
      b.onclick=()=>{
        b.classList.toggle('on');
        const idx = b.dataset.idx;
        const on = b.classList.contains('on');
        overlay.querySelector(`.cOpen[data-idx="${idx}"]`).disabled = on;
        overlay.querySelector(`.cClose[data-idx="${idx}"]`).disabled = on;
        overlay.querySelector(`.custom-break-row[data-idx="${idx}"]`).style.display = on ? 'none' : 'flex';
      };
    });
    overlay.querySelectorAll('.cBreakToggle').forEach(b=>{
      b.onclick=()=>{
        const idx = b.dataset.idx;
        const on = b.classList.toggle('active');
        b.textContent = on ? '브레이크 있음' : '브레이크 없음';
        overlay.querySelector(`.cBreakStart[data-idx="${idx}"]`).style.display = on ? 'block' : 'none';
        overlay.querySelector(`.cBreakEnd[data-idx="${idx}"]`).style.display = on ? 'block' : 'none';
        overlay.querySelector(`.cBreakTilde[data-idx="${idx}"]`).style.display = on ? 'inline' : 'none';
      };
    });
    const restroomBtns = overlay.querySelectorAll('.restroom-select .pill-btn');
    restroomBtns.forEach(b=>{
      if(b.dataset.rv === wizard.restroom) b.classList.add('active');
      b.onclick = ()=>{
        restroomBtns.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        wizard.restroom = b.dataset.rv;
      };
    });
    overlay.querySelectorAll('.amenity-chip').forEach(chip=>{
      chip.onclick=()=>{
        const a = chip.dataset.a;
        const has = wizard.amenities.includes(a);
        if(has){ wizard.amenities = wizard.amenities.filter(x=>x!==a); chip.classList.remove('active'); }
        else { wizard.amenities.push(a); chip.classList.add('active'); }
      };
    });

    overlay.querySelector('#toStep1').onclick = ()=>{
      collectStep2(overlay);
      step = 1; renderWizardSheet();
    };
    overlay.querySelector('#saveBtn').onclick = async ()=>{
      collectStep2(overlay);
      await savePlace(wizard); // failures are silent for now; see savePlace()
      if(editingId){
        const idx = places.findIndex(x=>x.id===editingId);
        places[idx] = wizard;
      } else {
        places.unshift(wizard);
      }
      overlay.remove();
      render();
    };
  }
}

function collectStep2(overlay){
  wizard.hoursSame.open = overlay.querySelector('#sameOpen').value || '00:00';
  wizard.hoursSame.close = overlay.querySelector('#sameClose').value || '00:00';
  wizard.hoursSame.breakEnabled = overlay.querySelector('#breakToggle').classList.contains('active');
  wizard.hoursSame.breakStart = overlay.querySelector('#breakStart').value || '00:00';
  wizard.hoursSame.breakEnd = overlay.querySelector('#breakEnd').value || '00:00';
  wizard.closedDays = Array.from(overlay.querySelectorAll('#closedDayGrid .pill-btn.active')).map(b=>Number(b.dataset.day));
  wizard.hoursCustom = DAYS.map((d,i)=>({
    day:d,
    closed: overlay.querySelector(`.closed-toggle[data-idx="${i}"]`).classList.contains('on'),
    open: overlay.querySelector(`.cOpen[data-idx="${i}"]`).value || '00:00',
    close: overlay.querySelector(`.cClose[data-idx="${i}"]`).value || '00:00',
    breakEnabled: overlay.querySelector(`.cBreakToggle[data-idx="${i}"]`).classList.contains('active'),
    breakStart: overlay.querySelector(`.cBreakStart[data-idx="${i}"]`).value || '00:00',
    breakEnd: overlay.querySelector(`.cBreakEnd[data-idx="${i}"]`).value || '00:00'
  }));
  wizard.memo = overlay.querySelector('#f_memo').value.trim();
}

/* ---------- settings ---------- */
let themePref = 'system';
const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(pref){
  themePref = pref;
  const effective = pref === 'system' ? (darkMediaQuery.matches ? 'dark' : 'light') : pref;
  document.documentElement.setAttribute('data-theme', effective);
}
darkMediaQuery.addEventListener('change', ()=>{ if(themePref === 'system') applyTheme('system'); });

async function loadThemePref(){
  applyTheme('system');
  try{
    const res = await window.storage.get('themePref', false);
    if(res && res.value) applyTheme(res.value);
  }catch(e){}
}
loadThemePref();

function openSettings(){
  const old = document.getElementById('sheetOverlay');
  if(old) old.remove();
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.id = 'sheetOverlay';
  const displayName = currentUser ? getUserDisplayName(currentUser) : '게스트로 이용 중';
  const avatarUrl = currentUser ? getUserAvatar(currentUser) : null;
  const profileAvatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none;">`
    : `<div class="settings-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>`;
  overlay.innerHTML = `
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <h2>설정</h2>
      <button class="close-x" id="closeSheet">✕</button>
    </div>

    <div class="settings-card" style="margin-bottom:16px;">
      <div class="settings-profile">
        ${profileAvatarHtml}
        <div style="flex:1;min-width:0;">
          <div class="settings-profile-name">${escapeHtml(displayName)}</div>
          <div class="settings-profile-sub">${currentUser ? '카카오 계정으로 로그인됨' : '카카오로 로그인하면 여러 기기에서 볼 수 있어요'}</div>
        </div>
        ${currentUser
          ? `<button type="button" id="logoutBtn" class="pill-btn" style="flex:none;padding:8px 14px;font-size:12.5px;">로그아웃</button>`
          : `<button type="button" id="kakaoLoginBtn" class="pill-btn" style="flex:none;padding:8px 14px;font-size:12.5px;background:#FEE500;color:#191919;border-color:#FEE500;">카카오 로그인</button>`}
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">화면</div>
      <div class="settings-card">
        <div class="settings-row settings-theme-row" style="display:block; border-bottom:none;">
          <div class="settings-row-label">다크모드</div>
          <div class="cat-select" id="themeSelect">
            <button type="button" class="pill-btn ${themePref==='system'?'active':''}" data-theme-opt="system">시스템</button>
            <button type="button" class="pill-btn ${themePref==='light'?'active':''}" data-theme-opt="light">라이트</button>
            <button type="button" class="pill-btn ${themePref==='dark'?'active':''}" data-theme-opt="dark">다크</button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">데이터</div>
      <div class="settings-card">
        <div class="settings-row danger" id="resetDataRow" style="cursor:pointer;">
          <div>
            <div class="settings-row-label">모든 기록 초기화</div>
            <div class="settings-row-sub">저장된 장소를 전부 지워요</div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">앱 정보</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-label">버전</div>
          <div class="settings-row-value">1.0.0</div>
        </div>
        <div class="settings-row" id="feedbackRow" style="cursor:pointer;">
          <div>
            <div class="settings-row-label">피드백 보내기</div>
            <div class="settings-row-sub">불편한 점이나 개선 아이디어를 알려주세요</div>
          </div>
          <span style="color:var(--ink-faint); font-size:16px;" id="feedbackChevron">›</span>
        </div>
      </div>
      <div id="feedbackForm" style="display:none; padding-top:10px;">
        <textarea id="feedbackText" placeholder="여기에 자유롭게 적어주세요" style="width:100%; min-height:70px; padding:11px 12px; border:1.5px solid var(--line); border-radius:12px; font-family:inherit; font-size:13.5px; background:var(--surface); color:var(--ink); resize:vertical;"></textarea>
        <button type="button" id="submitFeedback" class="btn-primary" style="width:100%; margin-top:8px;">보내기</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  overlay.querySelector('#closeSheet').onclick = ()=> overlay.remove();

  const kakaoLoginBtn = overlay.querySelector('#kakaoLoginBtn');
  if(kakaoLoginBtn) kakaoLoginBtn.onclick = ()=> loginWithKakao();
  const logoutBtn = overlay.querySelector('#logoutBtn');
  if(logoutBtn) logoutBtn.onclick = ()=> logout();

  overlay.querySelector('#feedbackRow').onclick = ()=>{
    const form = overlay.querySelector('#feedbackForm');
    const open = form.style.display === 'block';
    form.style.display = open ? 'none' : 'block';
    overlay.querySelector('#feedbackChevron').textContent = open ? '›' : '⌄';
  };
  overlay.querySelector('#submitFeedback').onclick = async ()=>{
    const text = overlay.querySelector('#feedbackText').value.trim();
    if(!text){ showToast('내용을 입력해주세요.'); return; }
    try{
      if(supabaseClient){
        await supabaseClient.from('feedback').insert({ text, user_id: currentUser ? currentUser.id : null });
      }
    }catch(e){ console.warn('feedback submit failed', e); }
    overlay.querySelector('#feedbackForm').style.display = 'none';
    overlay.querySelector('#feedbackText').value = '';
    showToast('피드백을 남겨주셔서 감사해요!');
  };

  overlay.querySelectorAll('#themeSelect .pill-btn').forEach(btn=>{
    btn.onclick = async ()=>{
      overlay.querySelectorAll('#themeSelect .pill-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const pref = btn.dataset.themeOpt;
      applyTheme(pref);
      try{ await window.storage.set('themePref', pref, false); }catch(e){}
    };
  });

  overlay.querySelector('#resetDataRow').onclick = ()=>{
    showConfirmPopup({
      text: '모든 기록을 초기화할까요?',
      sub: '저장된 장소가 전부 삭제되고 되돌릴 수 없어요.',
      confirmLabel: '초기화',
      onConfirm: async ()=>{
        await Promise.all(places.map(p=> deletePlaceKey(p.id)));
        places = [];
        overlay.remove();
        render();
        showToast('모든 기록을 초기화했어요.');
      }
    });
  };
}
document.getElementById('openSettingsBtn').onclick = openSettings;

updateDistrictFilterOptions();
initAuth();
