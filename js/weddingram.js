(function(){
    var cfg = window.HW_CONFIG || {};
    var WEB_APP = cfg.WEB_APP_URL || '';
    if (!WEB_APP) { console.error('[weddingram] Missing WEB_APP_URL'); return; }
  
    var grid  = document.getElementById('wgGrid');
    var empty = document.getElementById('wgEmpty');
  
    // Forms
    var photoForm   = document.getElementById('wgPhotoForm');
    var photoInput  = document.getElementById('wgPhoto');
    var captionIn   = document.getElementById('wgCaption');
    var photoStatus = document.getElementById('wgPhotoStatus');
  
    var textForm    = document.getElementById('wgTextForm');
    var msgIn       = document.getElementById('wgMessage');
    var textStatus  = document.getElementById('wgTextStatus');
  
    // JSONP helper
    function jsonp(url, cb){
      var name = 'wg_cb_' + Math.random().toString(36).slice(2);
      window[name] = function(data){ try{ cb(data); } finally{ delete window[name]; } };
      var s = document.createElement('script');
      s.src = url + (url.indexOf('?')>-1?'&':'?') + 'callback=' + name;
      s.onerror = function(){ cb({ _error:'Network error' }); };
      document.body.appendChild(s);
    }
  
    function setText(el, msg){ if (el) el.textContent = msg || ''; }
  
    function render(items){
      grid.innerHTML = '';
      var list = Array.isArray(items) ? items : [];
      if (!list.length){ empty.style.display = 'block'; return; }
      empty.style.display = 'none';
  
      list.forEach(function(entry){
        var tile = document.createElement('div');
        tile.className = 'wg-tile';
  
        if (entry.type === 'photo' && entry.webContentLink){
          var img = document.createElement('img');
          img.src = entry.webContentLink;
          img.alt = 'Photo';
          img.loading = 'lazy';
          img.referrerPolicy = 'no-referrer';
          tile.appendChild(img);
  
          if (entry.caption){
            var cap = document.createElement('div');
            cap.className = 'wg-cap';
            cap.textContent = entry.caption;
            tile.appendChild(cap);
          }
        } else if (entry.type === 'text'){
          tile.classList.add('wg-text');
          var p = document.createElement('p');
          p.textContent = entry.caption || '';
          tile.appendChild(p);
        }
        grid.appendChild(tile);
      });
    }
  
    function loadFeed(){
      jsonp(WEB_APP + '?action=wg_list&ts=' + Date.now(), function(res){
        if (res && !res.error) render(res);
        else setText(empty, 'Could not load posts.');
      });
    }
  
    // Submit: photo + caption (multipart)
    if (photoForm){
      photoForm.addEventListener('submit', function(e){
        e.preventDefault();
        if (!photoInput.files || !photoInput.files.length) { setText(photoStatus, 'Choose a photo.'); return; }
        setText(photoStatus, 'Uploading…');
  
        var fd = new FormData();
        fd.append('action', 'wg_post');
        fd.append('caption', captionIn.value || '');
        fd.append('file', photoInput.files[0]);
  
        fetch(WEB_APP, { method:'POST', body: fd })
          .then(function(r){ return r.json ? r.json() : null; })
          .catch(function(){})
          .finally(function(){
            setText(photoStatus, 'Thanks! Your photo was posted.');
            photoInput.value = ''; captionIn.value = '';
            loadFeed();
          });
      });
    }
  
    // Submit: text-only message (JSON)
    if (textForm){
      textForm.addEventListener('submit', function(e){
        e.preventDefault();
        var msg = (msgIn.value || '').trim();
        if (!msg) { setText(textStatus, 'Write a message first.'); return; }
        setText(textStatus, 'Posting…');
  
        fetch(WEB_APP + '?action=wg_text', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ message: msg })
        })
        .catch(function(){})
        .finally(function(){
          setText(textStatus, 'Your message is live!');
          msgIn.value = '';
          loadFeed();
        });
      });
    }
  
    loadFeed(); // initial
  })();
  