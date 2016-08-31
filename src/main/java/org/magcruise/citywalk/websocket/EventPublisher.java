package org.magcruise.citywalk.websocket;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnOpen;
import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Activity;
import org.nkjmlab.util.log4j.ServletLogManager;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;

@ServerEndpoint("/websocket/activity/{checkpointGroupId}/{checkpointId}/{userId}")
public class EventPublisher {

	protected static Logger log = ServletLogManager.getLogger();

	private static Map<String, ScheduledFuture<?>> workers = new ConcurrentHashMap<>();
	private static ScheduledExecutorService pool = Executors.newScheduledThreadPool(20);

	/** Map<Session.id, activityId> **/
	private static Map<String, Long> latestReadActivityIds = new ConcurrentHashMap<>();

	@OnOpen
	public synchronized void onOpen(@PathParam("userId") String userId,
			@PathParam("checkpointGroupId") String checkpointGroupId,
			@PathParam("checkpointId") String checkpointId, Session session) {

		if (workers.get(session.getId()) != null) {
			log.warn("session {} has been already registered.", session.getId());
			return;
		}
		Basic b = session.getBasicRemote();

		ScheduledFuture<?> f = pool.scheduleWithFixedDelay(() -> {
			try {
				if (Thread.interrupted()) {
					return;
				}
				List<Activity> events = readEvents(session.getId(), checkpointGroupId,
						checkpointId);
				if (events.size() == 0) {
					return;
				}
				b.sendText(JSON.encode(events));
			} catch (Exception e) {
				log.error(e, e);
			}
		}, 0, 1, TimeUnit.SECONDS);

		workers.put(session.getId(), f);
	}

	private List<Activity> readEvents(String sessionId, String checkpointGroupId,
			String checkpointId) {
		long readId = getLatestReadId(sessionId);
		List<Activity> result = new VerifiedActivitiesTable().getNewActivitiesOrderById(
				checkpointGroupId, checkpointId, readId);
		if (result.size() == 0) {
			return result;
		}
		latestReadActivityIds.put(sessionId, result.get(result.size() - 1).getId());
		return result;
	}

	private long getLatestReadId(String userId) {
		latestReadActivityIds.putIfAbsent(userId, -1L);
		return latestReadActivityIds.get(userId);
	}

	@OnClose
	public synchronized void onClose(@PathParam("userId") String userId,
			Session session) {
		finlizeSession(session);
	}

	private void finlizeSession(Session session) {
		try {
			session.close();
		} catch (IOException e) {
			log.warn(e.getMessage());
		}

		ScheduledFuture<?> f = workers.remove(session.getId());
		if (f != null) {
			f.cancel(true);
		}

	}

	@OnError
	public void onError(Session session, Throwable cause) {
		finlizeSession(session);
		log.warn(cause.getMessage());
	}

}
