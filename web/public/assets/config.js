// Static fallback for hosts without the Node server (e.g. Netlify).
// When web/server.js runs, its /assets/config.js route takes precedence.
(function () {
  var host = window.location.hostname;
  window.SOEZY_CONFIG = Object.freeze({
    publicUrl: window.location.origin,
    publicHost: host,
    displayHost: host,
    apiOrigin: window.location.origin,
    socketOrigin: window.location.origin
  });
})();
