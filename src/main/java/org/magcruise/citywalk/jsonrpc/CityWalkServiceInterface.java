package org.magcruise.citywalk.jsonrpc;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.EntryJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.UserAccountJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.init.CoursesJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.row.UserAccount;

import jp.go.nict.langrid.commons.rpc.intf.Parameter;

public interface CityWalkServiceInterface {

	boolean exsitsUpdatedInitialData(long timeOfInitialData);

	CoursesJson getCourses();

	InitialDataJson getInitialData(
			@Parameter(sample = "waseda") String courseId, String language);

	InitialDataJson getInitialDataFromFile(
			@Parameter(sample = "waseda") String courseId);

	UserAccount login(@Parameter(sample = "ayaki") String userId, int pin);

	boolean logout();

	RegisterResultJson register(UserAccountJson account, int maxLengthOfUserId);

	boolean join(@Parameter(sample = "ayaki") String userId,
			@Parameter(sample = "waseda") String courseId);

	RewardJson addActivity(
			@Parameter(sample = "{\"userId\": \"ayaki\", " + "\"checkpointId\": \"1\", "
					+ "\"taskId\": \"1\", " + "\"score\": 9.0, " + "\"inputs\": "
					+ "{\"value\":\"1\"}}") ActivityJson json);

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

	ActivityJson[] getCheckinLogs(String checkpointId);

	ActivityJson[] getCheckinLogs(String userId, String courseId);

	boolean validateCheckpointsAndTasksJson(
			@Parameter(sample = "{\"checkpoints\":["
					+ "{\"id\":\"cafeteria\",\"lat\":38.4400,\"lon\":139.11090,\"cource_ids\":[\"waseda\"]}],"
					+ "\"tasks\":[" + "{\"checkpoint_ids\":[\"cafeteria\"],"
					+ "\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.PhotoTask\",\"checkin\":true,"
					+ "\"label\":\"表示されている写真と同じ写真を撮って下さい．\",\"answer\":\"task/ieiri_photo_00.jpg\"}},"
					+ "{\"checkpoint_ids\":[\"aed-1\",\"aed-2\",\"aed-3\",\"aed-4\"],"
					+ "\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.QrCodeTask\",\"checkin\":true,"
					+ "\"label\":\"QRコードを撮って下さい．\",\"answer\":\"task/ieiri_qr_code_02.jpg\"}},"
					+ "{\"checkpoint_ids\":[\"cafeteria\"],\"content\":{\"instanceClass\":\"org.magcruise.citywalk.model.content.SelectionTask\","
					+ "\"label\":\"次のうち、理工の学食が発祥の地であるメニューはどれ？\","
					+ "\"selections\":[\"豚玉丼\",\"チキンおろしだれ\",\"カツカレー\",\"ポーク焼肉\"],\"answerIndex\":3}}]}") String json);

	MovementJson[] getMovements(String userId, String courseId, int incrementSize);

	UserAccountJson[] getUsers();

	EntryJson[] getEntries();

}
