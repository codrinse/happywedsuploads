// guest.js — JSON/base64 uploader for cross-origin uploads
(function () {
    var cfg      = window.HW_CONFIG || {};
    var WEB_APP  = cfg.WEB_APP_URL || '';
    var form     = document.getElementById('uploadForm');
    var picker   = document.getElementById('picker');
    var statusEl = document.getElementById('status');
    var resetBtn = document.getElementById('resetBtn');
  
    if (!WEB_APP) {
      console.error('[guest] Missing WEB_APP_URL in js/config.js');
      if (statusEl) statusEl.textContent = 'Configuration error.';
      return;
    }
  
    function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
  
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (picker) picker.value = '';
        setStatus('');
      });
    }
  
    if (!form) return;
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      if (!picker || !picker.files || !picker.files.length) {
        alert('Please choose at least one photo or video.');
        return;
      }
  
      var files = Array.prototype.slice.call(picker.files);
      var total = files.length;
      var done  = 0;
  
      setStatus('Uploading ' + total + ' file' + (total > 1 ? 's' : '') + '…');
  
      files.forEach(function (file) {
        // Optional size guard (e.g., 50 MB Apps Script per-request practical limit)
        var MAX_MB = 50;
        if (file.size > MAX_MB * 1024 * 1024) {
          done++;
          setStatus('Skipped large file: ' + file.name + ' (' + Math.round(file.size/1e6) + 'MB)');
          return;
        }
  
        var reader = new FileReader();
        reader.onload = function (ev) {
          var dataUrl = String(ev.target.result || '');
          var base64  = dataUrl.split(',')[1] || '';  // strip "data:...;base64,"
  
          // Build JSON payload for Apps Script
          var payload = {
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileData: base64
          };
  
          // Use no-cors: we don't need the response, and it avoids CORS complexity
          fetch(WEB_APP, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .catch(function () { /* ignore; upload happens server-side */ })
          .finally(function () {
            done++;
            if (done >= total) {
              setStatus('Thanks! Your files were uploaded.');
              picker.value = '';
            } else {
              setStatus('Uploaded ' + done + '/' + total + '…');
            }
          });
        };
        reader.readAsDataURL(file);
      });
    });
  })();
  