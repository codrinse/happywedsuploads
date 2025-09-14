// weddingram.js
(function () {
    var cfg = window.HW_CONFIG || {};
    var WEB_APP = cfg.WEB_APP_URL || '';
    if (!WEB_APP) { console.error('[weddingram] Missing WEB_APP_URL'); return; }
  
    // Feed
    var grid  = document.getElementById('wgGrid');
    var empty = document.getElementById('wgEmpty');
  
    // Forms & controls
    var photoForm    = document.getElementById('wgPhotoForm');
    var photoInput   = document.getElementById('wgPhoto');
    var captionIn    = document.getElementById('wgCaption');
    var photoStatus  = document.getElementById('wgPhotoStatus');
  
    var showMsgBtn   = document.getElementById('showMsgBtn');
    var textForm     = document.getElementById('wgTextForm');
    var msgIn        = document.getElementById('wgMessage');
    var textStatus   = document.getElementById('wgTextStatus');
  
    // JSONP helper (no CORS headaches)
    function jsonp(url, cb){
      var name = 'wg_cb_' + Math.random().toString(36).slice(2);
      window[name] = function(data){ try{ cb(data); } finally{ delete window[name]; } };
      var s = document.createElement('script');
      s.src = url + (url.indexOf('?')>-1?'&':'?') + 'callback=' + name;
      s.onerror = function(){ cb({ _error:'Network error' }); };
      document.body.appendChild(s);
    }
  
    function setText(el, msg){ if (el) el.textContent = msg || ''; }
  
    // ----- UI behaviors -----
  
    // Caption shows only after a file is chosen
    if (photoInput && captionIn){
      captionIn.classList.add('hidden'); // ensure hidden on load
      photoInput.addEventListener('change', function(){
        var hasFile = photoInput.files && photoInput.files.length > 0;
        captionIn.classList.toggle('hidden', !hasFile);
      });
    }
  
    // Message textarea appears only after clicking "Post a message"
    if (showMsgBtn && textForm){
      textForm.classList.add('hidden'); // ensure hidden on load
      showMsgBtn.addEventListener('click', function(){
        textForm.classList.toggle('hidden');
        if (!textForm.classList.contains('hidden')) {
          // focus the textarea when opening
          setTimeout(function(){ msgIn && msgIn.focus(); }, 0);
        }
      });
    }
  
    // ----- Feed render -----
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
        else { empty.style.display = 'block'; setText(empty, 'Could not load posts.'); }
      });
    }
  
    // ----- Submit: photo + caption (multipart) -----
    if (photoForm){
      photoForm.addEventListener('submit', function(e){
        e.preventDefault();
        if (!photoInput || !photoInput.files || !photoInput.files.length) {
          setText(photoStatus, 'Please choose a photo or video.');
          return;
        }
  
        setText(photoStatus, 'Uploading…');
        var submitBtn = photoForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
  
        var fd = new FormData();
        fd.append('action', 'wg_post');
        fd.append('caption', (captionIn && captionIn.value) ? captionIn.value : '');
        fd.append('file', photoInput.files[0]);
  
        fetch(WEB_APP, { method:'POST', body: fd })
          .then(function(r){ return (r && r.json) ? r.json() : null; })
          .then(function(){
            setText(photoStatus, 'Thanks! Your post was added.');
            if (photoInput) photoInput.value = '';
            if (captionIn){
              captionIn.value = '';
              captionIn.classList.add('hidden');
            }
            loadFeed();
          })
          .catch(function(){
            setText(photoStatus, 'Upload failed. Please try again.');
          })
          .finally(function(){
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  
    // Submit: text-only message (FormData, no preflight)
    if (textForm){
        textForm.addEventListener('submit', function(e){
        e.preventDefault();
        var msg = (msgIn.value || '').trim();
        if (!msg) { setText(textStatus, 'Write a message first.'); return; }
        setText(textStatus, 'Posting…');
    
        var fd = new FormData();
        fd.append('action', 'wg_text');      // Apps Script router
        fd.append('message', msg);
    
        // no headers, no preflight
        fetch(WEB_APP, {
            method: 'POST',
            body: fd,
            // mode: 'no-cors' is optional here; you don't read the response anyway
            // mode: 'no-cors'
        })
        .catch(function(){ /* ignore */ })
        .finally(function(){
            setText(textStatus, 'Your message is live!');
            msgIn.value = '';
            loadFeed();
        });
        });
    }
  
    // Initial load
    loadFeed();
  })();
  