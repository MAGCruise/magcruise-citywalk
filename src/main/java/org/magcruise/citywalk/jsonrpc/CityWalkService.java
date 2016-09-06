package org.magcruise.citywalk.jsonrpc;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.model.conv.CheckpointsAndTasksFactory;
import org.magcruise.citywalk.model.conv.InitialDataFactory;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.RankJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.relation.BadgesTable;
import org.magcruise.citywalk.model.relation.SubmittedActivitiesTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Activity;
import org.magcruise.citywalk.model.row.Badge;
import org.magcruise.citywalk.model.row.SubmittedActivity;
import org.magcruise.citywalk.model.row.User;
import org.magcruise.citywalk.model.row.VerifiedActivity;
import org.nkjmlab.util.base64.Base64ImageUtils;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.log4j.ServletLogManager;

import jp.go.nict.langrid.commons.ws.ServletServiceContext;
import jp.go.nict.langrid.servicecontainer.service.AbstractService;

public class CityWalkService extends AbstractService implements CityWalkServiceInterface {
	protected static Logger log = ServletLogManager.getLogger();

	private VerifiedActivitiesTable verifiedActivities = new VerifiedActivitiesTable();
	private SubmittedActivitiesTable submittedActivities = new SubmittedActivitiesTable();
	private UserAccountsTable users = new UserAccountsTable();
	private BadgesTable badges = new BadgesTable();
	private TasksTable tasks = new TasksTable();

	@Override
	public boolean login(String chekipointGroupId, String userId, String groupId) {
		CityWalkSession session = getSession();
		users.merge(new User(userId, groupId));
		if (session.isLogined()) {
			log.debug("already logined as {}", session.getUserId());

			if (!session.getUserId().equals(userId)) {
				log.debug("userId is changed from {} to {}", session.getUserId(), userId);
				session.setUserId(userId);
			}
			if (!session.getGroupId().equals(groupId)) {
				log.debug("groupId is changed from {} to {}", session.getGroupId(), groupId);
				session.setGroupId(groupId);
			}
			return true;
		} else {
			log.debug("create new session for {}", userId);
			session.setMaxInactiveInterval(10 * 60 * 60);
			session.setUserId(userId);
			session.setGroupId(groupId);
			return true;
		}
	}

	@Override
	public RewardJson addActivity(ActivityJson json) {
		SubmittedActivity a = new SubmittedActivity(json);
		submittedActivities.insert(a);

		verifyActivity(a);

		return createRewardJson(a.getUserId());
	}

	private void verifyActivity(Activity a) {
		if (!verifiedActivities.contains(a.getCheckpointGroupId(), a.getUserId(),
				a.getCheckpointId(), a.getTaskId())) {
			VerifiedActivity va = new VerifiedActivity(a);
			verifiedActivities.insert(va);
			log.info("add verified activity={}", va);
		}

	}

	private RewardJson createRewardJson(String userId) {
		int rank = verifiedActivities.getRank(userId);
		List<String> badges = calculateBadges(userId);
		return new RewardJson(rank, badges);
	}

	private List<String> calculateBadges(String userId) {
		List<String> result = new ArrayList<>();
		if (verifiedActivities.getActivities(userId, "cafeteria").size() > 0) {
			String badge = "食堂マスター";
			if (!badges.contains(userId, badge)) {
				result.add(badge);
				badges.insert(new Badge(userId, badge));
			}
		}

		if (verifiedActivities.getActivitiesLike(userId, "%aed%").size() > 1) {
			String badge = "AEDマスター";
			if (!badges.contains(userId, badge)) {
				result.add(badge);
				badges.insert(new Badge(userId, badge));
			}
		}

		if (verifiedActivities.getActivities(userId).size() > 2) {
			String badge = "早稲田マスター";
			if (!badges.contains(userId, badge)) {
				result.add(badge);
				badges.insert(new Badge(userId, badge));
			}
		}

		return result;
	}

	@Override
	public String uploadImage(String userId, String base64EncodedImage) {
		try {
			log.debug(base64EncodedImage);
			String imageId = "citywalk-" + userId + "-" + System.nanoTime();
			Base64ImageUtils.decodeAndWrite(base64EncodedImage, "jpg",
					FileUtils.getTempFile(imageId + ".jpg"));
			return imageId;
		} catch (Exception e) {
			log.error(e, e);
			throw new RuntimeException(e);
		}

	}

	@Override
	public InitialDataJson getInitialData(String checkpointGroupId) {
		return InitialDataFactory.create(checkpointGroupId);
	}

	@Override
	public InitialDataJson getInitialDataFromFile(String checkpointGroupId) {
		InitialDataJson data = JsonUtils.decode(
				new File(getServiceContext()
						.getRealPath("json/initial-data/" + checkpointGroupId + ".json")),
				InitialDataJson.class);
		return data;
	}

	@Override
	public boolean validateCheckpointsAndTasksJson(String json) {
		return CheckpointsAndTasksFactory.validate(json);
	}

	protected CityWalkSession getSession() {
		return new CityWalkSession(
				((ServletServiceContext) getServiceContext()).getRequest());
	}

	@Override
	public void addMovements(List<Map<String, Object>> movements) {
		log.info(movements);
	}

	@Override
	public BadgeJson[] getBadges(String userId) {
		List<BadgeJson> badges = new ArrayList<>();
		badges.add(new BadgeJson("AEDマスター", "img/badge-aed-master.jog"));
		badges.add(new BadgeJson("早稲田マスター", "img/badge-waseda-master.jog"));

		return badges.toArray(new BadgeJson[0]);
	}

	@Override
	public RankingJson getRanking(String userId) {
		RankingJson rankingJson = new RankingJson();
		rankingJson.setGroupRank(new RankJson("StubGroup", 8));
		rankingJson.setRank(new RankJson(userId, 5));

		List<RankJson> ranking = new ArrayList<>();
		ranking.add(new RankJson("Player1", 1));
		ranking.add(new RankJson("Player2", 2));
		ranking.add(new RankJson("Player3", 2));
		ranking.add(new RankJson("Player5", 4));
		ranking.add(new RankJson("Player4", 5));
		rankingJson.setRanking(ranking);
		List<RankJson> groupRanking = new ArrayList<>();
		ranking.add(new RankJson("Group1", 1));
		ranking.add(new RankJson("Group2", 2));
		ranking.add(new RankJson("Group3", 3));
		ranking.add(new RankJson("Group4", 4));
		ranking.add(new RankJson("Group5", 5));
		rankingJson.setGroupRanking(groupRanking);
		return rankingJson;
	}

}