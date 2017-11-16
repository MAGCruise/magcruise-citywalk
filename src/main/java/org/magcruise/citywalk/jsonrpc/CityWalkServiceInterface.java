package org.magcruise.citywalk.jsonrpc;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.UserAccountJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.app.CheckpointJson;
import org.magcruise.citywalk.model.json.app.CityWalkDataJson;
import org.magcruise.citywalk.model.json.app.CoursesJson;
import org.magcruise.citywalk.model.row.UserAccount;

import jp.go.nict.langrid.commons.rpc.intf.Parameter;

public interface CityWalkServiceInterface {

	boolean exsitsUpdatedInitialData(long timeOfInitialData);

	CoursesJson getCourses();

	CityWalkDataJson getInitialData(
			@Parameter(sample = "waseda") String courseId, String language);

	CityWalkDataJson getInitialDataFromFile(
			@Parameter(sample = "waseda") String courseId);

	UserAccount login(String userId, String pin);

	boolean logout();

	RegisterResultJson register(UserAccountJson account, int maxLengthOfUserId);

	boolean join(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "waseda") String courseId);

	RewardJson addActivity(ActivityJson json);

	boolean addCheckpoint(String userId, String courseId, CheckpointJson json, String imgData);

	void addMovements(MovementJson[] movements);

	BadgeJson[] getBadges(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "waseda") String courseId);

	RankingJson getRanking(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "waseda") String courseId);

	VisitedCheckpointJson[] getVisitedCheckpoints(
			@Parameter(sample = "sample-at-magcruise.org") String userId,
			@Parameter(sample = "waseda") String courseId);

	String[] getCheckpointIdsOrderedByDistance(double currentLat, double currentLon,
			String courseId, String language, String[] checkpointIds);

	boolean sendLog(String errorLevel, String location, String msg, String options);

	boolean validateCheckpointsAndTasksJson(String json);

	ActivityJson[] getCheckinLogs(String checkpointId);

	String getCheckpointsAndTasksJson(String projectId);

	boolean saveCheckpointsAndTasksJson(String projectId, String json);

	String getCoursesJson(String projectId);

	boolean saveCoursesJson(String projectId, String json);

}
