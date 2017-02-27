package org.magcruise.citywalk.model.relation;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.json.RankJson;
import org.magcruise.citywalk.model.row.Activity;
import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.row.VerifiedActivity;
import org.nkjmlab.util.db.DbClient;

public class VerifiedActivitiesTable extends ActivitiesTable<VerifiedActivity> {

	public static final String TABLE_NAME = "VERIFIED_ACTIVITIES";
	private CheckpointsTable checkpoints = new CheckpointsTable(ApplicationContext.getDbClient());

	public VerifiedActivitiesTable(DbClient client) {
		super(TABLE_NAME, client);
	}

	public RankJson getRankJson(String userId, String courseId) {
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore(courseId);
		int rank = 0;
		double lastScore = Integer.MAX_VALUE;
		for (int i = 0; i < scores.size(); i++) {
			try {
				if (lastScore != (double) scores.get(i).get(SUM_OF_SCORE)) {
					lastScore = (double) scores.get(i).get(SUM_OF_SCORE);
					rank++;
				}
				if (userId.equals(scores.get(i).get(USER_ID))) {
					return new RankJson(scores.get(i).get(USER_ID).toString(), rank,
							(double) scores.get(i).get(SUM_OF_SCORE));
				}
			} catch (Throwable t) {
				log.error(t);
			}
		}
		return new RankJson(userId, -1, 0);
	}

	public List<RankJson> getRanksJson(String courseId) {
		return getRanksJson(courseId, Integer.MAX_VALUE);
	}

	public List<RankJson> getRanksJson(String courseId, int rankLimit) {
		List<RankJson> result = new ArrayList<>();
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore(courseId);
		for (int i = 0; i < scores.size(); i++) {
			try {
				RankJson j = getRankJson(scores.get(i).get(USER_ID).toString(), courseId);
				if (j.getRank() > rankLimit) {
					return result;
				}
				result.add(j);
			} catch (Throwable t) {
				log.error(t);
			}
		}
		return result;
	}

	public double getScore(String userId, String courseId) {
		return getRankJson(userId, courseId).getScore();
	}

	public int getNumberOfCheckInInCategory(String userId, String courseId, String category) {
		List<Activity> actsInCate = getActivitiesInCourse(userId, courseId).stream()
				.filter(a -> checkpoints.readByPrimaryKey(a.getCheckpointId())
						.getCategory().equals(category))
				.collect(Collectors.toList());
		Set<String> ids = new HashSet<>();

		actsInCate.forEach(a -> {
			ids.add(a.getCheckpointId());
		});
		return ids.size();
	}

	public List<Activity> getNewCheckinActivitiesOrderById(TasksTable tasksTable, String courseId,
			long readId) {
		List<Activity> result = getNewActivitiesOrderById(
				courseId, readId).stream().filter(
						a -> {
							Task t = tasksTable.getTask(a.getTaskId());
							if (t == null) {
								return false;
							}
							return t.getContentObject().isCheckin();
						})
						.sorted((a1, a2) -> Long.compare(a1.getId(), a2.getId()))
						.collect(Collectors.toList());
		return result;
	}

}
