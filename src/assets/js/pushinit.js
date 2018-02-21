if ('serviceWorker' in navigator && 'PushManager' in window) {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s;
      s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  loadScript('./assets/js/push.js');
} else {
  // var info;
  // info = document.createElement('p');
  // info.className = 'message message--error';
  // info.textContent = "Sorry, your browser doesn't support push notifications";
  // document.body.appendChild(info);
}
