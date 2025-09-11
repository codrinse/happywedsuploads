(function(){
    var cfg = (window.HW_CONFIG||{});
    var form = document.getElementById('uploadForm');
    var picker = document.getElementById('picker');
    var statusEl = document.getElementById('status');
  
    if (form && cfg.WEB_APP_URL) {
      form.action = cfg.WEB_APP_URL;  // multipart -> Apps Script doPost(e.files)
    }
  
    document.getElementById('resetBtn')?.addEventListener('click', function(){
      if (picker) picker.value = '';
      if (statusEl) statusEl.textContent = '';
    });
  
    form?.addEventListener('submit', function(){
      if (!picker || !picker.files || !picker.files.length){
        alert('Please choose at least one photo or video.');
        return false;
      }
      if (statusEl) statusEl.textContent = 'Uploading…';
      // We can’t read cross-origin iframe response; assume success after a pause.
      setTimeout(function(){
        if (statusEl) statusEl.textContent = 'Thanks! Your files were uploaded.';
        if (picker) picker.value = '';
      }, 2500);
    });
  })();
  