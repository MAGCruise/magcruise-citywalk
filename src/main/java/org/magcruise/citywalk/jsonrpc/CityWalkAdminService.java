package org.magcruise.citywalk.jsonrpc;

import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.EntryJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.UserAccountJson;
import org.magcruise.citywalk.model.relation.EntriesTable;
import org.magcruise.citywalk.model.relation.MovementsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.log4j.LogManager;

import jp.go.nict.langrid.servicecontainer.service.AbstractService;

public class CityWalkAdminService extends AbstractService implements CityWalkAdminServiceInterface {
	protected static Logger log = LogManager.getLogger();

	private VerifiedActivitiesTable verifiedActivities = new VerifiedActivitiesTable(getDbClient());
	private UserAccountsTable users = new UserAccountsTable(getDbClient());
	private TasksTable tasks = new TasksTable(getDbClient());
	private MovementsTable movementsTable = new MovementsTable(getDbClient());
	private EntriesTable entries = new EntriesTable(getDbClient());

	private DbClient getDbClient() {
		return ApplicationContext.getDbClient();
	}

	@Override
	public ActivityJson[] getCheckinLogs(String checkpointId) {
		ActivityJson[] result = verifiedActivities.getActivitiesAtCheckpoint(checkpointId).stream()
				.filter(
						va -> tasks.readByPrimaryKey(va.getTaskId()).getContentObject().isCheckin())
				.map(va -> new ActivityJson(va, tasks.readByPrimaryKey(va.getTaskId())))
				.collect(Collectors.toList()).toArray(new ActivityJson[0]);
		return result;
	}

	@Override
	public ActivityJson[] getCheckinLogs(String userId, String courseId) {
		ActivityJson[] result = verifiedActivities.getActivitiesInCourse(userId, courseId).stream()
				.filter(
						va -> tasks.readByPrimaryKey(va.getTaskId()).getContentObject().isCheckin())
				.map(va -> new ActivityJson(va, tasks.readByPrimaryKey(va.getTaskId())))
				.collect(Collectors.toList()).toArray(new ActivityJson[0]);
		return result;
	}

	@Override
	public MovementJson[] getMovements(String userId, String courseId, int incrementSize) {
		if (userId == null || userId.length() == 0) {
			return movementsTable.findByCourseId(courseId, incrementSize).stream()
					.map(m -> m.toMovmentJson()).collect(Collectors.toList())
					.toArray(new MovementJson[0]);
		}
		return movementsTable.findByUserIdAndCourseId(userId, courseId, incrementSize).stream()
				.map(m -> m.toMovmentJson()).collect(Collectors.toList())
				.toArray(new MovementJson[0]);
	}

	@Override
	public UserAccountJson[] getUsers() {
		return users.readAll().stream().map(u -> new UserAccountJson(u))
				.collect(Collectors.toList())
				.toArray(new UserAccountJson[0]);
	}

	@Override
	public EntryJson[] getEntries() {
		return entries.readAll().stream().map(e -> new EntryJson(e)).collect(Collectors.toList())
				.toArray(new EntryJson[0]);
	}

	@Override
	public EntryJson[] getEntries(String userId) {
		return entries.findUserId(userId).stream().map(e -> new EntryJson(e))
				.collect(Collectors.toList())
				.toArray(new EntryJson[0]);
	}

}
