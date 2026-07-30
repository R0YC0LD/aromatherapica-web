/**
 * Ticimax Dinamik Script — hazır yapıştırma şablonları
 * (Admin panelinden kopyalanır)
 */

export const CUSTOM_SITE_URL = "https://r0yc0ld.github.io/aromatherapica-web";

export const TICIMAX_DINAMIK_URL =
  "https://aromatherapica.com/Admin/DinamikScriptYonetimi.aspx?adminlang=tr&lang=tr";

/** Önerilen: vitrini özel siteye yönlendir, ticaret Ticimax'te kalsın */
export function buildRedirectScript(customUrl = CUSTOM_SITE_URL): string {
  const base = customUrl.replace(/\/$/, "");
  return `<!-- Aromatherapica özel vitrin yönlendirme -->
<script>
(function(){
  try{
    var path=String(location.pathname||"/").toLowerCase();
    var href=String(location.href||"");
    var keep=["/admin","/uyegiris","/uyekayit","/uye/","/uyeler","/sepet","/sepetim","/odeme","/siparis","/servis","/handlers","/taksit","/banka","/3dsecure"];
    for(var i=0;i<keep.length;i++){ if(path.indexOf(keep[i])!==-1) return; }
    var CUSTOM=${JSON.stringify(base)};
    if(href.indexOf(CUSTOM)===0) return;
    location.replace(CUSTOM+"/");
  }catch(e){}
})();
</script>`;
}

/** Alternatif: aynı domainde iframe ile göm */
export function buildEmbedScript(customUrl = CUSTOM_SITE_URL): string {
  const base = customUrl.replace(/\/$/, "") + "/";
  return `<!-- Aromatherapica özel vitrin gömme -->
<script>
(function(){
  try{
    var path=String(location.pathname||"/").toLowerCase();
    var keep=["/admin","/uyegiris","/uyekayit","/uye/","/sepet","/sepetim","/odeme","/siparis","/servis","/handlers"];
    for(var i=0;i<keep.length;i++){ if(path.indexOf(keep[i])!==-1) return; }
    if(window.__aromIframeBooted) return; window.__aromIframeBooted=true;
    var CUSTOM=${JSON.stringify(base)};
    var s=document.createElement("style");
    s.textContent="html,body{margin:0!important;padding:0!important;overflow:hidden!important;height:100%!important}#arom-custom-shell{position:fixed;inset:0;z-index:2147483000;background:#fbfaf7}#arom-custom-shell iframe{border:0;width:100%;height:100%;display:block}";
    document.documentElement.appendChild(s);
    var shell=document.createElement("div"); shell.id="arom-custom-shell";
    var f=document.createElement("iframe"); f.title="Aromatherapica"; f.src=CUSTOM;
    shell.appendChild(f);
    function mount(){ document.body.innerHTML=""; document.body.appendChild(shell); }
    if(document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  }catch(e){}
})();
</script>`;
}
