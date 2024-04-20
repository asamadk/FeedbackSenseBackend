(function (window) {
  // Configure endpoint and initialize session state
  var apiEndpointEvent = "https://api.feedbacksense.io/usage/event/v1";
  var apiEndpointSession = "https://api.feedbacksense.io/usage/session/v1";
  var sessionActive = false;
  var sessionId = null;
  var sessionStartTime = null;

  // Start a new session
  function startSession() {
    sessionActive = true;
    sessionId = generateSessionId();
    sessionStartTime = new Date().toISOString();
    console.log("Session started:", sessionId);

    sendSession({
      sessionId: sessionId,
      startTime: sessionStartTime,
    });
  }

  // End the current session
  function endSession() {
    if (sessionActive && sessionId) {
      var sessionEndTime = new Date().toISOString();
      var duration = new Date(sessionEndTime) - new Date(sessionStartTime);
      sendSession({
        sessionId: sessionId,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        duration: duration,
      });
      saveEventBatch();
      console.log("Session ended:", sessionId);
      sessionActive = false;
      sessionId = null;
      sessionStartTime = null;
      sessionEndTime = null;
    }
  }

  function sendSession(sessionData) {
    sessionData = {
        ...sessionData,
        userAgent : window.navigator.userAgent,
        personId : window.feedbacksense_options.person.id,
        companyId : window.feedbacksense_options.company.id,
        org : window.feedbacksense_options.organization_id,
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiEndpointSession, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ session: sessionData }));
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Session sent successfully");
      } else {
        console.error("Failed to send events:", xhr.status, xhr.statusText);
        // Optionally handle retries or log failures locally
      }
    };
  }

  // Generate a unique session ID
  function generateSessionId() {
    return "session-" + Math.random().toString(36).substr(2, 9);
  }

  // Send batch of events to the server
  function sendBatchToServer(events) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiEndpointEvent, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ events: events }));
    window.feedbacksense_tmp_stack = [];
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Events sent successfully");
        window.feedbacksense_tmp_stack = [];
      } else {
        console.error("Failed to send events:", xhr.status, xhr.statusText);
        // Optionally handle retries or log failures locally
      }
    };
  }

  // Automatically start a session when the script loads
  startSession();

  setInterval(function () {
    saveEventBatch();
  }, 5000);

  function saveEventBatch() {
    if (
      window.feedbacksense_tmp_stack != null &&
      window.feedbacksense_tmp_stack.length > 0
    ) {
      sendBatchToServer(window.feedbacksense_tmp_stack);
    }
  }

  // End session on page unload
  // window.addEventListener('beforeunload', endSession);
  window.onunload = function () {
    endSession();
  };
})(window);
