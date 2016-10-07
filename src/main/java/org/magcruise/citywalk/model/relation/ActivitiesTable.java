package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.Map;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.Activity;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public abstract class ActivitiesTable<T extends Activity> extends RelationalModel<T> {

	private static final String ID = "id";
	private static final String CREATED = "created";
	private static final String CHECKPOINT_GROUP_ID = "checkpoint_group_id";
	public static final String USER_ID = "user_id";
	private static final String CHECKPOINT_ID = "checkpoint_id";
	private static final String TASK_ID = "task_id";
	private static final String INPUT = "input";
	private static final String SAVED = "saved";
	private static final String SCORE = "score";
	private static final String LAT = "lat";
	private static final String LON = "lon";

	public static final String SUM_OF_SCORE = "sum_of_score";

	public ActivitiesTable(String name) {
		super(name, ApplicationContext.getDbClient());
		setAttribute(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		setAttribute(CREATED, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		setAttribute(SAVED, Keyword.TIMESTAMP);
		setAttribute(USER_ID, Keyword.VARCHAR);
		setAttribute(CHECKPOINT_GROUP_ID, Keyword.VARCHAR);
		setAttribute(CHECKPOINT_ID, Keyword.VARCHAR);
		setAttribute(TASK_ID, Keyword.VARCHAR);
		setAttribute(SCORE, Keyword.DOUBLE);
		setAttribute(LAT, Keyword.DOUBLE);
		setAttribute(LON, Keyword.DOUBLE);
		setAttribute(INPUT, Keyword.VARCHAR);
	}

	public List<Activity> getActivities(String userId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + USER_ID + "=?", userId);

	}

	public List<Activity> getNewActivitiesOrderById(String checkpointGroupId, String checkpointId,
			long latestActivityId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + CHECKPOINT_GROUP_ID + "=? AND "
						+ CHECKPOINT_ID + "=? AND " + ID
						+ ">? ORDER BY "
						+ ID,
				checkpointGroupId, checkpointId, latestActivityId);
	}

	public List<Activity> getActivities(String userId, String checkpointId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + USER_ID
						+ "=? AND " + CHECKPOINT_ID + "=?",
				userId, checkpointId);
	}

	public List<Activity> getActivitiesLike(String userId, String partOfcheckpointId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + USER_ID
						+ "=? AND " + CHECKPOINT_ID + " LIKE ?",
				userId, partOfcheckpointId);
	}

	public List<Activity> getActivities(String userId, String checkpointId, String taskId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + USER_ID
						+ "=? AND " + CHECKPOINT_ID + "=? AND " + TASK_ID + "=?",
				userId, checkpointId, taskId);
	}

	public List<Activity> getActivities(String checkpointGroupId, String userId,
			String checkpointId, String taskId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + CHECKPOINT_GROUP_ID + "=? AND "
						+ USER_ID + "=? AND " + CHECKPOINT_ID + "=? AND " + TASK_ID + "=?",
				checkpointGroupId, userId, checkpointId, taskId);
	}

	public List<Map<String, Object>> sumsOfScoreGroupByUserIdOrderByScore() {
		return getClient().readMapList(
				"SELECT " + USER_ID + ", SUM(score) AS " + SUM_OF_SCORE + " FROM " + getName()
						+ " GROUP BY " + USER_ID + " ORDER BY sum_of_score");

	}

	public boolean contains(String chepointGroupId, String userId, String checkpointId,
			String taskId) {
		return getActivities(chepointGroupId, userId, checkpointId, taskId).size() != 0;
	}

}
