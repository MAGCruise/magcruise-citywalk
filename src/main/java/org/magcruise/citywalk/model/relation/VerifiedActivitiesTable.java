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

	public RankJson getRankJson(String userId) {
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore();
		for (int i = 0; i < scores.size(); i++) {
			try {
				if (userId.equals(scores.get(i).get(USER_ID))) {
					return new RankJson(scores.get(i).get(USER_ID).toString(), i,
							(double) scores.get(i).get(SUM_OF_SCORE));
				}
			} catch (Throwable t) {
				log.error(t);
			}
		}
		return new RankJson(userId, -1, 0);
	}

	public List<RankJson> getRanksJson() {
		List<RankJson> result = new ArrayList<>();
		List<Map<String, Object>> scores = sumsOfScoreGroupByUserIdOrderByScore();
		for (int i = 0; i < scores.size(); i++) {
			try {
				result.add(new RankJson(scores.get(i).get(USER_ID).toString(), i,
						(double) scores.get(i).get(SUM_OF_SCORE)));
			} catch (Throwable t) {
				log.error(t);
			}
		}
		return result;
	}

}
