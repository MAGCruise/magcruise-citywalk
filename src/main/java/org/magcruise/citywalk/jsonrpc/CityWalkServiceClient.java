package org.magcruise.citywalk.jsonrpc;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;

import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
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
	public boolean login(String userId, String groupId) {
		return citywalkService.login(userId, groupId);
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
	public String uploadImage(String userId, String base64EncodedImage) {
		return citywalkService.uploadImage(userId, base64EncodedImage);
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
	public void addMovements(List<Map<String, Object>> movements) {
		citywalkService.addMovements(movements);
	}

	@Override
	public BadgeJson[] getBadges(String userId) {
		return citywalkService.getBadges(userId);
	}

	@Override
	public RankingJson getRanking(String userId) {
		return citywalkService.getRanking(userId);
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
	public boolean logout(String userId) {
		// TODO 自動生成されたメソッド・スタブ
		return false;
	}

}
