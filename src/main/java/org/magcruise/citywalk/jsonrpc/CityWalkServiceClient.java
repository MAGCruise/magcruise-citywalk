package org.magcruise.citywalk.jsonrpc;

import java.net.MalformedURLException;
import java.net.URL;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;

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
	public InitialDataJson getInitialData(String checkpointGroupId) {
		return citywalkService.getInitialData(null);
	}

	@Override
	public boolean validateCheckpointsAndTasksJson(String json) {
		return citywalkService.validateCheckpointsAndTasksJson(json);
	}

	@Override
	public InitialDataJson getInitialDataFromFile(String checkpointGroupId) {
		return citywalkService.getInitialDataFromFile(checkpointGroupId);
	}

	@Override
	public void addMovements(MovementJson[] movements) {
		citywalkService.addMovements(movements);
	}

	@Override
	public BadgeJson[] getBadges(String userId, String checkpointGroupId) {
		return citywalkService.getBadges(userId, checkpointGroupId);
	}

	@Override
	public RankingJson getRanking(String userId, String checkpointGroupId) {
		return citywalkService.getRanking(userId, checkpointGroupId);
	}

	@Override
	public VisitedCheckpointJson[] getVisitedCheckpoints(String userId, String checkpointGroupId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public RegisterResultJson register(String userId, String groupId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public boolean logout() {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

	@Override
	public boolean join(String userId, String checkpointGroupId) {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

	@Override
	public RegisterResultJson register(String userId, String groupId, int maxLengthOfUserId) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

	@Override
	public boolean exsitsUpdatedInitialData(long timeOfInitialData) {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

}
