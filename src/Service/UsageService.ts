import { In } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { UsageEvent } from "../Entity/UsageEvent";
import { UsageSession } from "../Entity/UsageSession";
import { UsageEventType } from "../Entity/UsageEventTypes";

export const createUsageEvent = async (reqBody: any): Promise<responseRest> => {
  try {
    const response = getDefaultResponse('Event created successfully');
    if (reqBody == null || reqBody.length < 1) {
      return response;
    }
    const eventRepo = Repository.getUsageEvent();
    const eventTypeRepo = Repository.getUsageEventType();
    const personRepo = Repository.getPeople();

    const singleEvent = reqBody[0];
    const orgId: string = singleEvent.org;
    const email: string = singleEvent.personId;

    const currentUser = await personRepo.findOne({
      where: {
        email: email,
        organization: {
          id: orgId
        }
      },
      select: {
        company: { id: true }
      },
      relations: { company: true }
    });

    if (currentUser == null) {
      throw new Error('User not found');
    }

    const activitySet: string[] = []
    for (let i = 0; i < reqBody.length; i++) {
      activitySet.push(reqBody[i]?.activity?.toLowerCase());
    }

    const eventNameVsType = new Map<string, string>();
    const eventTypes = await eventTypeRepo.find({
      where: {
        organization: {
          id: orgId
        },
        eventName: In(activitySet)
      }
    });
    eventTypes.forEach(t => {
      eventNameVsType.set(t.eventName.toLowerCase(), t.eventType);
    });

    const toCreateEventTypes: UsageEventType[] = [];
    const toInsertEvent: UsageEvent[] = [];

    const activityTypeSet = new Set<string>();

    for (let i = 0; i < reqBody.length; i++) {
      const event = reqBody[i];
      const activity: string = event?.activity?.toLowerCase();
      
      if (!eventNameVsType.has(activity)) { 
        if(activityTypeSet.has(activity)){continue;}
        toCreateEventTypes.push({
          eventName : activity,
          eventType : 'Other',
          organization : orgId as any
        } as any);
        activityTypeSet.add(activity);
        continue;
      }

      const saveEvent = new UsageEvent();
      saveEvent.createdDate = event.createdDate,
      saveEvent.eventName = activity,
      saveEvent.eventType = eventNameVsType.get(activity),
      saveEvent.person = currentUser.id as any,
      saveEvent.company = currentUser.company.id as any
      saveEvent.extraInfo = '[]';

      toInsertEvent.push(saveEvent);
    }

    if(toCreateEventTypes.length > 0){
      await eventTypeRepo.save(toCreateEventTypes);
    }

    await eventRepo.save(toInsertEvent);
    return response;
  } catch (error) {
    logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    return getCustomResponse(null, 500, error.message, false)
  }
}

export const createUsageSession = async (reqBody: any): Promise<responseRest> => {
  try {
    const response = getDefaultResponse('Session created successfully');

    const personRepo = Repository.getPeople();
    const sessionRepo = Repository.getUsageSession();

    const sessionId = reqBody.sessionId;
    const startTime = reqBody.startTime;
    const endTime = reqBody.endTime;
    const duration = reqBody.duration;
    const userAgent = reqBody.userAgent;
    const userEmail = reqBody.personId;
    const orgId = reqBody.org;

    const currentUser = await personRepo.findOne({
      where: {
        email: userEmail,
        organization: {
          id: orgId
        }
      },
      select: {
        company: { id: true }
      },
      relations: { company: true }
    });

    let sessionData: UsageSession = null;
    if (endTime == null && duration == null) {
      //session is started
      sessionData = new UsageSession();
      sessionData.sessionId = sessionId;
      sessionData.startTime = startTime;
      sessionData.userAgent = userAgent;
      sessionData.person = currentUser.id as any;
      sessionData.company = currentUser.company.id as any;
      sessionData.ipAddress = 'N/A';
    } else {
      //session ended
      sessionData = await sessionRepo.findOne({ where: { sessionId: sessionId } });
      if (sessionData == null) {
        throw new Error('SessionId incorrect');
      }
      sessionData.endTime = endTime;
      sessionData.duration = duration;
    }

    if (sessionData != null) {
      await sessionRepo.save(sessionData);
    }

    return response;
  } catch (error) {
    logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    return getCustomResponse(null, 500, error.message, false)
  }
}

export const getUsageJavaScript = (): string => {
  const eventURL = `${process.env.SERVER_URL}usage/event/v1`;
  const sessionURL = `${process.env.SERVER_URL}usage/session/v1`;

  return `
    (function (window) {
        // Configure endpoint and initialize session state
        var apiEndpointEvent = "${eventURL}";
        var apiEndpointSession = "${sessionURL}";
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
          xhr.send(JSON.stringify(sessionData));
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
          return "session-" + Math.random().toString(36).substr(2, 9)+ Date.now().toString(36);
        }
      
        // Send batch of events to the server
        function sendBatchToServer(events) {
          var xhr = new XMLHttpRequest();
          xhr.open("POST", apiEndpointEvent, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(events));
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
          console.log('Checking batch...');
          saveEventBatch();
        }, 60000);
      
        function saveEventBatch() {
          if (
            window.feedbacksense_tmp_stack != null &&
            window.feedbacksense_tmp_stack.length > 0
          ) {
            sendBatchToServer(window.feedbacksense_tmp_stack);
          }
        }
      
        // End session on page unload
        window.addEventListener('beforeunload', endSession);
        window.onunload = function () {
          endSession();
        };
      })(window);      
      `;
}