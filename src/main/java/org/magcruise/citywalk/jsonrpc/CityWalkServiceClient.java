package org.magcruise.citywalk.jsonrpc;

import java.net.MalformedURLException;
import java.net.URL;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.init.CoursesJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.row.Activity;
import org.magcruise.citywalk.model.row.Entry;
import org.magcruise.citywalk.model.row.UserAccount;

import jp.go.nict.langrid.client.jsonrpc.JsonRpcClientFactory;

public class CityWalkServiceClient implements CityWalkServiceInterface {

	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	private String url;

	private CityWalkServiceInterface citywalkService;

	public CityWalkServiceClient(String url) {
		this.url = url;
		this.citywalkService = create(CityWalkServiceInterface.class,
				"CityWalkService");
	}

	@Override
	public boolean login(String userId) {
		return citywalkService.login(userId);
	}

	@Override
	public RewardJson addActivity(ActivityJson activity) {
		return citywalkService.addActivity(activity);
	}

	public <T> T create(Class<T> clazz, String serviceName) {
		try {
			return new JsonRpcClientFactory().create(clazz,
					new URL(url + "/" + serviceName));
		} catch (MalformedURLException e) {
			log.error(e, e);
			return null;
		}
	}

	@Override
	public InitialDataJson getInitialData(String courseId, String language) {
		return citywalkService.getInitialData(null, language);
	}

	@Override
	public boolean validateCheckpointsAndTasksJson(String json) {
		return citywalkService.validateCheckpointsAndTasksJson(json);
	}

	@Override
	public InitialDataJson getInitialDataFromFile(String courseId) {
		return citywalkService.getInitialDataFromFile(courseId);
	}

	@Override
	public void addMovements(MovementJson[] movements) {
		citywalkService.addMovements(movements);
	}

	@Override
	public BadgeJson[] getBadges(String userId, String courseId) {
		return citywalkService.getBadges(userId, courseId);
	}

	@Override
	public RankingJson getRanking(String userId, String courseId) {
		return citywalkService.getRanking(userId, courseId);
	}

	@Override
	public VisitedCheckpointJson[] getVisitedCheckpoints(String userId, String courseId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public boolean logout() {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

	@Override
	public boolean join(String userId, String courseId) {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

	@Override
	public RegisterResultJson register(String userId, String language, int maxLengthOfUserId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public boolean exsitsUpdatedInitialData(long timeOfInitialData) {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

	@Override
	public CoursesJson getCourses() {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public String[] getCheckpointIdsOrderedByDistance(double currentLat, double currentLon,
			String courseId, String language, String[] checkpointIds) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public Activity[] getCheckinLogs(String checkpointId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public MovementJson[] getMovements(String userId, String courseId, int incrementSize) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public UserAccount[] getUsers() {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public Entry[] getEntries() {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

}
