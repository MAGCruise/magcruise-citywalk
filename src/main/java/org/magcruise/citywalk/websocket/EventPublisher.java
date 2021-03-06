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
import org.magcruise.citywalk.CityWalkApplicationContext;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Activity;
import org.magcruise.citywalk.model.row.Task;
import org.nkjmlab.util.log4j.LogManager;

import jp.go.nict.langrid.repackaged.net.arnx.jsonic.JSON;

public class EventPublisher {

	protected static Logger log = LogManager.getLogger();

	private static Map<String, ScheduledFuture<?>> workers = new ConcurrentHashMap<>();
	private static ScheduledExecutorService pool = Executors.newScheduledThreadPool(20);

	/** Map<Session.id, activityId> **/
	private static Map<String, Long> latestReadActivityIds = new ConcurrentHashMap<>();

	private static VerifiedActivitiesTable verifiedActivitiesTable = new VerifiedActivitiesTable(
			CityWalkApplicationContext.getDbClient());
	private static TasksTable tasksTable = new TasksTable(CityWalkApplicationContext.getDbClient());

	public void onOpen(String userId, String courseId, String checkpointId, Session session) {

		if (workers.get(session.getId()) != null) {
			log.warn("session {} has been already registered.", session.getId());
			return;
		}

		ScheduledFuture<?> f = pool.scheduleWithFixedDelay(() -> {
			try {
				if (Thread.interrupted()) {
					return;
				}
				List<Activity> events = readEvents(session.getId(), courseId);
				if (events.size() == 0) {
					return;
				}
				synchronized (session) {
					Basic b = session.getBasicRemote();
					b.sendText(JSON.encode(events));
				}
			} catch (Exception e) {
				log.error(e, e);
			}
		}, 0, 3, TimeUnit.SECONDS);

		workers.put(session.getId(), f);
	}

	private synchronized List<Activity> readEvents(String sessionId, String courseId) {
		long readId = getLatestReadId(sessionId);
		List<Activity> result = verifiedActivitiesTable.getNewActivitiesOrderById(
				courseId, readId).stream().filter(a -> {
					return (System.currentTimeMillis() < a.getCreatedAt().getTime()
							+ 30 * 60 * 1000);
				}).filter(
						a -> {
							Task t = tasksTable.getTask(a.getTaskId());
							if (t == null) {
								return false;
							}
							return t.getContentObject().isCheckin();
						})
				.sorted((a1, a2) -> Long.compare(a1.getId(), a2.getId()))
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

	public void onClose(@PathParam("userId") String userId, Session session) {
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
		if (cause.getMessage().contains("writing data to the APR")) {
			log.debug(cause.getMessage());
		} else {
			log.warn(cause.getMessage());
		}
	}

}
