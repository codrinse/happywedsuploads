// dashboard.js
(function () {
    // ---- Config ----
    var cfg = (window.HW_CONFIG || {});
    var WEB_APP = cfg.WEB_APP_URL || '';
    var TOKEN   = cfg.ADMIN_TOKEN || ''; // if empty, user will type it at login
  
    // ---- Elements ----
    var loginBtn       = document.getElementById('loginBtn');
    var pwdInput       = document.getElementById('pwd');
    var loginMsg       = document.getElementById('loginMsg');
    var loginSection   = document.getElementById('loginSection');
    var gallerySection = document.getElementById('gallerySection');
    var grid           = document.getElementById('grid');
    var empty          = document.getElementById('empty');
    var dlAllBtn       = document.getElementById('dlAll');
  
    if (!WEB_APP) {
      if (loginMsg) loginMsg.textContent = 'Missing WEB_APP_URL in js/config.js';
      console.error('[dashboard] Missing WEB_APP_URL');
      return;
    }
  
    // ---- JSONP helper (avoids CORS for listing) ----
    function jsonp(url, cb) {
      var cbName = 'hw_cb_' + Math.random().toString(36).slice(2);
      window[cbName] = function (data) {
        try { cb(data); }
        finally {
          delete window[cbName];
          if (script && script.parentNode) script.parentNode.removeChild(script);
        }
      };
      var script = document.createElement('script');
      script.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + cbName;
      script.onerror = function () { cb({ _error: 'Network error' }); };
      document.body.appendChild(script);
    }
  
    // ---- Render grid ----
    function render(items) {
      grid.innerHTML = '';
      var files = Array.isArray(items) ? items : [];
  
      if (!files.length) {
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';
  
      files.forEach(function (f) {
        var tile = document.createElement('div');
        tile.className = 'tile';
  
        var mediaWrap = document.createElement('div');
        mediaWrap.style.background = '#000';
        mediaWrap.style.height = '180px';
        mediaWrap.style.display = 'flex';
        mediaWrap.style.alignItems = 'center';
        mediaWrap.style.justifyContent = 'center';
        mediaWrap.style.overflow = 'hidden';
  
        var isImg = (f.mimeType || '').indexOf('image/') === 0;
        var isVid = (f.mimeType || '').indexOf('video/') === 0;
  
        if (isImg) {
          var img = document.createElement('img');
          img.src = f.webContentLink; // works inline if folder is "Anyone with link: Viewer"
          img.alt = f.name;
          img.loading = 'lazy';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.onerror = function () {
            // fallback if private
            img.parentNode && img.parentNode.removeChild(img);
            var a = document.createElement('a');
            a.textContent = 'Open image';
            a.href = WEB_APP + '?action=file&id=' + encodeURIComponent(f.id) +
                     '&token=' + encodeURIComponent(TOKEN);
            a.target = '_blank';
            a.rel = 'noopener';
            a.style.color = '#fff';
            mediaWrap.appendChild(a);
          };
          mediaWrap.appendChild(img);
        } else if (isVid) {
          var v = document.createElement('video');
          v.src = f.webContentLink;
          v.controls = true;
          v.style.maxWidth = '100%';
          v.style.maxHeight = '100%';
          v.onerror = function () {
            v.parentNode && v.parentNode.removeChild(v);
            var a2 = document.createElement('a');
            a2.textContent = 'Open video';
            a2.href = WEB_APP + '?action=file&id=' + encodeURIComponent(f.id) +
                      '&token=' + encodeURIComponent(TOKEN);
            a2.target = '_blank';
            a2.rel = 'noopener';
            a2.style.color = '#fff';
            mediaWrap.appendChild(a2);
          };
          mediaWrap.appendChild(v);
        } else {
          var span = document.createElement('span');
          span.textContent = f.name;
          span.style.color = '#fff';
          span.style.fontSize = '12px';
          mediaWrap.appendChild(span);
        }
  
        var bar = document.createElement('div');
        bar.style.display = 'flex';
        bar.style.justifyContent = 'space-between';
        bar.style.alignItems = 'center';
        bar.style.padding = '8px 10px';
        bar.style.background = '#fff';
        bar.style.borderTop = '1px solid #eadfd7';
  
        var name = document.createElement('div');
        name.textContent = f.name;
        name.style.fontSize = '12px';
        name.style.overflow = 'hidden';
        name.style.whiteSpace = 'nowrap';
        name.style.textOverflow = 'ellipsis';
        name.style.maxWidth = '70%';
  
        var dl = document.createElement('a');
        dl.href = WEB_APP + '?action=file&id=' + encodeURIComponent(f.id) +
                 '&token=' + encodeURIComponent(TOKEN) + '&download=true';
        dl.textContent = 'Download';
        dl.target = '_blank';
        dl.rel = 'noopener';
  
        bar.appendChild(name);
        bar.appendChild(dl);
  
        tile.appendChild(mediaWrap);
        tile.appendChild(bar);
        grid.appendChild(tile);
      });
    }
  
    // ---- Load list ----
    function loadList() {
      var url = WEB_APP + '?action=list&token=' + encodeURIComponent(TOKEN) + '&ts=' + Date.now();
      jsonp(url, function (res) {
        if (!res) {
          if (loginMsg) loginMsg.textContent = 'No response from server.';
          return;
        }
        if (res.error) {
          if (loginMsg) loginMsg.textContent = 'Auth error: ' + res.error;
          return;
        }
        render(res);
      });
    }
  
    // ---- Download all (ZIP) ----
    if (dlAllBtn) {
      dlAllBtn.addEventListener('click', function () {
        if (!TOKEN) { alert('Please login first.'); return; }
        window.location.href = WEB_APP + '?action=zip&token=' + encodeURIComponent(TOKEN);
      });
    }
  
    // ---- Login flow ----
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        if (!WEB_APP) { alert('WEB_APP_URL missing in js/config.js'); return; }
  
        if (!TOKEN) {
          var typed = (pwdInput && pwdInput.value) || '';
          if (!typed) { if (loginMsg) loginMsg.textContent = 'Enter password.'; return; }
          TOKEN = typed; // keep for this session
        } else {
          if (pwdInput && pwdInput.value && pwdInput.value !== TOKEN) {
            if (loginMsg) loginMsg.textContent = 'Incorrect password.';
            return;
          }
        }
  
        if (loginSection) loginSection.style.display = 'none';
        if (gallerySection) gallerySection.style.display = 'block';
        loadList();
      });
    }
  })();
  