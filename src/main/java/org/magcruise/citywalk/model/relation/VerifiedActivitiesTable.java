package org.magcruise.citywalk.model.relation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.magcruise.citywalk.model.json.RankJson;
import org.magcruise.citywalk.model.row.VerifiedActivity;

public class VerifiedActivitiesTable extends ActivitiesTable<VerifiedActivity> {

	public static final String TABLE_NAME = "VERIFIED_ACTIVITIES";

	public VerifiedActivitiesTable() {
		super(TABLE_NAME);
	}

	public RankJson getRankJson(String userId, String checkpointGroupId) {
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore(checkpointGroupId);
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

	public List<RankJson> getRanksJson(String checkpointGroupId) {
		return getRanksJson(checkpointGroupId, Integer.MAX_VALUE);
	}

	public List<RankJson> getRanksJson(String checkpointGroupId, int rankLimit) {
		List<RankJson> result = new ArrayList<>();
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore(checkpointGroupId);
		for (int i = 0; i < scores.size(); i++) {
			try {
				RankJson j = getRankJson(scores.get(i).get(USER_ID).toString(), checkpointGroupId);
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

}
