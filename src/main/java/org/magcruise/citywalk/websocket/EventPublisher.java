package org.magcruise.citywalk.websocket;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;
import javax.websocket.server.PathParam;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Activity;
import org.nkjmlab.util.log4j.LogManager;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;

public class EventPublisher {

	protected static Logger log = LogManager.getLogger();

	private static Map<String, ScheduledFuture<?>> workers = new ConcurrentHashMap<>();
	private static ScheduledExecutorService pool = Executors.newScheduledThreadPool(20);

	/** Map<Session.id, activityId> **/
	private static Map<String, Long> latestReadActivityIds = new ConcurrentHashMap<>();

	private static VerifiedActivitiesTable verifiedActivitiesTable = new VerifiedActivitiesTable();
	private static TasksTable tasksTable = new TasksTable();

	public synchronized void onOpen(String userId, String checkpointGroupId, String checkpointId,
			Session session) {

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
		List<Activity> result = verifiedActivitiesTable.getNewActivitiesOrderById(
				checkpointGroupId, checkpointId, readId).stream().filter(
						a -> tasksTable.getTask(a.getTaskId()).getContentObject().isCheckin())
				.collect(Collectors.toList());

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

	public synchronized void onClose(@PathParam("userId") String userId,
			Session session) {
		finalizeSession(session);
	}

	protected void finalizeSession(Session session) {
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

	public void onError(Session session, Throwable cause) {
		finalizeSession(session);
		log.warn(cause.getMessage());
	}

}
