/* ═══ 零工驿站 · 软木板招聘公告栏 ═══ */

(() => {
  "use strict";

  /* ---------- 预置招工便签 ---------- */
  const SEED = [
    { title: "周末烘焙坊帮厨", pay: 25, place: "朝阳区 · 望京", type: "周末", desc: "周六日 9:00-17:00，帮忙备料装裱，管一顿午餐，当日现金结算。", mine: false, taken: false },
    { title: "展会发传单+引导", pay: 180, place: "顺义新国展", type: "短期", desc: "三天展会，日结 180 元整，要求穿黑裤白鞋，中午轮休一小时。", mine: false, taken: false },
    { title: "仓库夜间分拣", pay: 23, place: "通州马驹桥", type: "日结", desc: "晚 8 点到早 6 点，快递分拣流水线，日结可预支 50 车费。", mine: false, taken: false },
    { title: "公众号文案远程写", pay: 120, place: "线上 · 不限城市", type: "远程", desc: "每周 2 篇 1500 字推文，按篇结算，长期合作优先。", mine: false, taken: false },
    { title: "宠物店周末洗护助理", pay: 20, place: "海淀区 · 五道口", type: "周末", desc: "协助洗澡吹毛，不怕狗猫即可，店长人很好，送员工洗宠一次。", mine: false, taken: false },
    { title: "婚宴宴会服务员", pay: 200, place: "丰台区 · 榴乡路", type: "日结", desc: "周六午宴，11:00-16:00，着装要求正装，散场即结账。", mine: false, taken: false },
    { title: "普通话方言录音采集", pay: 90, place: "线上 · 有麦就行", type: "远程", desc: "读 200 句录音约 40 分钟，普通话或方言皆可，周结。", mine: false, taken: false },
    { title: "双十一前置客服", pay: 22, place: "昌平区 · 回龙观", type: "短期", desc: "10 月中旬起一个月，晚班 18:00-24:00，有培训，周结。", mine: false, taken: false },
    { title: "老年人智能手机教学", pay: 35, place: "西城区 · 德胜门", type: "周末", desc: "社区公益活动协助，教叔叔阿姨用手机，时薪 35，心态好即可。", mine: false, taken: false },
    { title: "搬家小工两名", pay: 30, place: "东城区 · 随车", type: "日结", desc: "周四上午半天，跟车搬运小件，日结 240 左右，干完就散。", mine: false, taken: false }
  ];

  const LS_KEY = "gigboard-v1";
  const PIN_COLORS = ["", "b", "g", "y", "p"];

  const $ = (id) => document.getElementById(id);
  const notes = $("notes"), emptyTip = $("emptyTip"), search = $("search");

  let jobs = [];
  let filter = "all";

  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    jobs = Array.isArray(saved) && saved.length ? saved : SEED.slice();
  } catch (e) { jobs = SEED.slice(); }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(jobs)); } catch (e) {}
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const kw = (search.value || "").trim();
    const list = jobs.filter((j) => {
      const okF = filter === "all" || j.type === filter;
      const okK = !kw ||
        j.title.includes(kw) || j.place.includes(kw) ||
        j.desc.includes(kw) || j.type.includes(kw);
      return okF && okK;
    });

    notes.innerHTML = "";
    emptyTip.hidden = list.length > 0;
    $("jobCount").textContent = jobs.filter((j) => !j.taken).length;

    list.forEach((job, idx) => {
      const realIdx = jobs.indexOf(job);
      const el = document.createElement("article");
      // 轻微随机倾斜，公告板质感
      const tilt = ((realIdx * 7) % 9 - 4) * 0.55;
      el.className = "note c" + (realIdx % 5);
      el.style.transform = "rotate(" + tilt + "deg)";

      const pin = document.createElement("div");
      pin.className = "pin " + PIN_COLORS[realIdx % 5];

      const type = document.createElement("span");
      type.className = "note-type";
      type.textContent = job.type + (job.mine ? " · 我发的" : "");

      const title = document.createElement("h3");
      title.className = "note-title";
      title.textContent = job.title;

      const pay = document.createElement("div");
      pay.className = "note-pay";
      pay.innerHTML = "¥" + job.pay + "<small>" + (job.pay > 100 ? " / 天" : " / 时") + "</small>";

      const place = document.createElement("div");
      place.className = "note-place";
      place.textContent = "📍 " + job.place;

      const desc = document.createElement("p");
      desc.className = "note-desc";
      desc.textContent = job.desc;

      const acts = document.createElement("div");
      acts.className = "note-acts";
      const take = document.createElement("button");
      take.className = "take" + (job.taken ? " taken" : "");
      take.textContent = job.taken ? "已揭榜 ✓" : "揭榜 · 我去干";
      take.disabled = job.taken;
      take.addEventListener("click", () => {
        job.taken = true;
        save(); render();
        confetti(take);
        toast("揭榜成功！联系活主安排上岗（演示）");
      });
      acts.appendChild(take);

      // 自己发的可以撤下
      if (job.mine) {
        const del = document.createElement("button");
        del.className = "note-del";
        del.textContent = "撤下";
        del.title = "把这张便签取下来";
        del.addEventListener("click", () => {
          jobs.splice(realIdx, 1);
          save(); render();
          toast("便签已取下");
        });
        acts.appendChild(del);
      }

      el.append(pin, type, title, pay, place, desc, acts);
      notes.appendChild(el);
    });
  }

  /* ---------- 筛选 & 搜索 ---------- */
  $("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".fbtn");
    if (!btn) return;
    document.querySelectorAll(".fbtn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.f;
    render();
  });
  search.addEventListener("input", render);

  /* ---------- 发布 ---------- */
  const veil = $("veil");
  function openForm() {
    veil.hidden = false;
    $("fTitle").focus();
  }
  function closeForm() {
    veil.hidden = true;
    ["fTitle", "fPay", "fPlace", "fDesc"].forEach((id) => ($(id).value = ""));
    $("fType").value = "日结";
  }
  $("pinNewBtn").addEventListener("click", openForm);
  $("fCancel").addEventListener("click", closeForm);
  veil.addEventListener("click", (e) => { if (e.target === veil) closeForm(); });

  $("fOk").addEventListener("click", () => {
    const title = $("fTitle").value.trim();
    const pay = Number($("fPay").value);
    const place = $("fPlace").value.trim();
    const desc = $("fDesc").value.trim();
    if (!title) return toast("活儿名还没写呢");
    if (!pay || pay < 1) return toast("时薪得填个数");
    if (!place) return toast("地点总得让人知道吧");
    jobs.unshift({
      title, pay: Math.round(pay), place,
      type: $("fType").value,
      desc: desc || "详情面议，直接联系即可。",
      mine: true, taken: false
    });
    save(); render(); closeForm();
    toast("已钉上板！等人揭榜");
  });

  /* ---------- 彩带 ---------- */
  function confetti(anchor) {
    const r = anchor.getBoundingClientRect();
    const colors = ["#d23b2e", "#2e7d32", "#2b6cb0", "#c9a227", "#b83b7a"];
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.left = (r.left + r.width / 2 + (Math.random() * 60 - 30)) + "px";
      c.style.top = (r.top - 6) + "px";
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.2) + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1500);
    }
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- 启动 ---------- */
  render();
})();
