package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.Map;

import org.magcruise.citywalk.model.row.Activity;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.Table;

public abstract class ActivitiesTable<T extends Activity> extends Table<T> {

	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	private static final String COURSE_ID = "course_id";
	protected static final String USER_ID = "user_id";
	protected static final String CHECKPOINT_ID = "checkpoint_id";
	protected static final String TASK_ID = "task_id";
	private static final String INPUT = "input";
	private static final String SCORE = "score";
	private static final String LAT = "lat";
	private static final String LON = "lon";
	private static final String OPTIONS = "options";

	public static final String SUM_OF_SCORE = "sum_of_score";

	public ActivitiesTable(String name, DbClient client) {
		super(name, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
		addColumnDefinition(CHECKPOINT_ID, Keyword.VARCHAR);
		addColumnDefinition(TASK_ID, Keyword.VARCHAR);
		addColumnDefinition(SCORE, Keyword.DOUBLE);
		addColumnDefinition(LAT, Keyword.DOUBLE);
		addColumnDefinition(LON, Keyword.DOUBLE);
		addColumnDefinition(OPTIONS, Keyword.VARCHAR);
		addColumnDefinition(INPUT, Keyword.VARCHAR);
	}

	public List<T> getActivitiesInCourse(String userId, String courseId) {
		return readListBy(USER_ID, userId, COURSE_ID, courseId);
	}

	public List<T> getActivitiesAtCheckpoint(String userId, String checkpointId) {
		return readListBy(USER_ID, userId, CHECKPOINT_ID, checkpointId);
	}

	public List<T> getActivitiesAtCheckpoint(String checkpointId) {
		return readListBy(CHECKPOINT_ID, checkpointId);
	}

	public List<Activity> getNewActivitiesOrderById(String courseId, long latestActivityId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + COURSE_ID + "=? AND "
						+ ID + ">? ORDER BY " + ID + " DESC LIMIT ?",
				courseId, latestActivityId, 16);
	}

	public List<Activity> getNewActivitiesOrderById(String courseId, String checkpointId,
			long latestActivityId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + COURSE_ID + "=? AND "
						+ CHECKPOINT_ID
						+ "=? AND " + ID + ">? ORDER BY " + ID + " DESC LIMIT ?",
				courseId, checkpointId, latestActivityId, 16);
	}

	public List<Activity> getActivitiesLike(String userId, String partOfcheckpointId) {
		return getClient().readList(Activity.class,
				"SELECT * FROM " + getName() + " WHERE " + USER_ID + "=? AND " + CHECKPOINT_ID
						+ " LIKE ?",
				userId, partOfcheckpointId);
	}

	public List<T> getActivities(String userId, String checkpointId, String taskId) {
		return readListBy(USER_ID, userId, CHECKPOINT_ID, checkpointId,
				TASK_ID, taskId);
	}

	public List<T> getActivities(String courseId, String userId, String checkpointId,
			String taskId) {
		return readListBy(COURSE_ID, courseId, USER_ID, userId, CHECKPOINT_ID, checkpointId,
				TASK_ID, taskId);
	}

	public List<Map<String, Object>> sumsOfScoreGroupByUserIdOrderByScore(
			String courseId) {
		return getClient().readMapList("SELECT " + USER_ID + ", SUM(score) AS " + SUM_OF_SCORE
				+ " FROM " + getName() + " WHERE " + COURSE_ID + "=? GROUP BY " + USER_ID
				+ " ORDER BY sum_of_score DESC", courseId);

	}

	public boolean contains(String chepointGroupId, String userId, String checkpointId,
			String taskId) {
		return getActivities(chepointGroupId, userId, checkpointId, taskId).size() != 0;
	}

}
