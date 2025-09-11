(function(){
    var cfg = (window.HW_CONFIG||{});
    var WEB_APP = cfg.WEB_APP_URL || '';
    var TOKEN   = cfg.ADMIN_TOKEN || '';
  
    var loginBtn = document.getElementById('loginBtn');
    var pwdInput = document.getElementById('pwd');
    var loginMsg = document.getElementById('loginMsg');
    var gallerySection = document.getElementById('gallerySection');
    var grid = document.getElementById('grid');
    var empty = document.getElementById('empty');
  
    function jsonp(url, cb){
      var name = 'cb_' + Math.random().toString(36).slice(2);
      window[name] = function(data){ try{ cb(data); } finally{ delete window[name]; } };
      var s = document.createElement('script');
      s.src = url + (url.indexOf('?')>-1?'&':'?') + 'callback=' + name;
      s.onerror = function(){ cb({ _error:'Network error' }); };
      document.body.appendChild(s);
    }
  
    function render(items){
      grid.innerHTML = '';
      var files = Array.isArray(items) ? items : [];
      if (!files.length){
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';
  
      files.forEach(function(f){
        var tile = document.createElement('div');
        tile.className = 'tile';
  
        if ((f.mimeType||'').indexOf('image/') === 0){
          var img = document.createElement('img');
          img.src = f.webContentLink; // Requires Drive folder: "Anyone with link → Viewer"
          img.alt = f.name;
          img.loading = 'lazy';
          tile.appendChild(img);
        } else if ((f.mimeType||'').indexOf('video/') === 0){
          var v = document.createElement('video');
          v.src = f.webContentLink;
          v.controls = true;
          tile.appendChild(v);
        } else {
          var span = document.createElement('span');
          span.textContent = f.name;
          span.style.display = 'block';
          span.style.padding = '8px';
          tile.appendChild(span);
        }
  
        // Per-item download link bar (simple)
        var bar = document.createElement('div');
        bar.style.display = 'flex';
        bar.style.justifyContent = 'space-between';
        bar.style.alignItems = 'center';
        bar.style.padding = '6px 10px';
        bar.style.background = '#fff';
  
        var name = document.createElement('div');
        name.textContent = f.name;
        name.style.fontSize = '12px';
        name.style.overflow = 'hidden';
        name.style.whiteSpace = 'nowrap';
        name.style.textOverflow = 'ellipsis';
        name.style.maxWidth = '70%';
  
        var dl = document.createElement('a');
        dl.href = WEB_APP + '?action=file&id=' + encodeURIComponent(f.id) + '&token=' + encodeURIComponent(TOKEN) + '&download=true';
        dl.textContent = 'Download';
        dl.target = '_blank';
  
        bar.appendChild(name);
        bar.appendChild(dl);
        tile.appendChild(bar);
  
        grid.appendChild(tile);
      });
    }
  
    function loadList(){
      var url = WEB_APP + '?action=list&token=' + encodeURIComponent(TOKEN) + '&ts=' + Date.now();
      jsonp(url, function(res){
        if (res && res.error){ loginMsg.textContent = 'Auth error: ' + res.error; return; }
        render(res);
      });
    }
  
    document.getElementById('dlAll')?.addEventListener('click', function(){
      window.location.href = WEB_APP + '?action=zip&token=' + encodeURIComponent(TOKEN);
    });
  
    loginBtn?.addEventListener('click', function(){
      if (!WEB_APP){ alert('WEB_APP_URL missing in js/config.js'); return; }
      if ((pwdInput?.value||'') !== TOKEN){
        loginMsg.textContent = 'Incorrect password.';
        return;
      }
      document.getElementById('loginSection').style.display = 'none';
      gallerySection.style.display = 'block';
      loadList();
    });
  })();
  