package org.magcruise.citywalk.jsonrpc;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.conv.CheckpointsAndTasksFactory;
import org.magcruise.citywalk.conv.InitialDataFactory;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.relation.BadgeConditionsTable;
import org.magcruise.citywalk.model.relation.BadgesTable;
import org.magcruise.citywalk.model.relation.EntriesTable;
import org.magcruise.citywalk.model.relation.MovementsTable;
import org.magcruise.citywalk.model.relation.SubmittedActivitiesTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.Activity;
import org.magcruise.citywalk.model.row.Badge;
import org.magcruise.citywalk.model.row.Entry;
import org.magcruise.citywalk.model.row.Movement;
import org.magcruise.citywalk.model.row.SubmittedActivity;
import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.row.UserAccount;
import org.magcruise.citywalk.model.row.VerifiedActivity;
import org.nkjmlab.util.base64.Base64ImageUtils;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.log4j.LogManager;
import org.nkjmlab.webui.common.user.model.UserSession;

import jp.go.nict.langrid.commons.ws.ServletServiceContext;
import jp.go.nict.langrid.servicecontainer.service.AbstractService;

public class CityWalkService extends AbstractService implements CityWalkServiceInterface {
	protected static Logger log = LogManager.getLogger();

	private VerifiedActivitiesTable verifiedActivities = new VerifiedActivitiesTable();
	private SubmittedActivitiesTable submittedActivities = new SubmittedActivitiesTable();
	private UserAccountsTable users = new UserAccountsTable();
	private BadgesTable badges = new BadgesTable();
	private TasksTable tasks = new TasksTable();
	private MovementsTable movements = new MovementsTable();
	private EntriesTable entries = new EntriesTable();

	@Override
	public boolean login(String userId) {
		if (!users.exists(userId)) {
			log.error("{} is not registered yet.", userId);
			return false;
		}

		UserSession session = getSession();
		if (session.isLogined()) {
			log.debug("already logined as {}", session.getUserId());

			if (!session.getUserId().equals(userId)) {
				log.debug("userId is changed from {} to {}", session.getUserId(), userId);
				session.setUserId(userId);
			}
			return true;
		} else {
			log.debug("create new session for {}", userId);
			session.setMaxInactiveInterval(10 * 60 * 60);
			session.setUserId(userId);
			return true;
		}
	}

	@Override
	public boolean logout() {
		return getSession().logout();
	}

	@Override
	public RegisterResultJson register(String userId, String groupId) {
		return register(userId, groupId, Integer.MAX_VALUE);
	}

	@Override
	public RegisterResultJson register(String userId, String groupId, int maxLengthOfUserId) {
		if (!users.exists(userId)) {
			users.insert(new UserAccount(userId, groupId));
			login(userId);
			return new RegisterResultJson(true, userId);
		}
		String recommended = createUnregisterdUserId(userId, maxLengthOfUserId);
		return new RegisterResultJson(false, recommended);
	}

	private String createUnregisterdUserId(String userId, int maxLengthOfUserId) {
		String recommended = createUnregisterdUserId(userId);
		if (recommended.length() <= maxLengthOfUserId) {
			return recommended;
		} else {
			return createUnregisterdUserId(userId.substring(0, userId.length() - 1),
					maxLengthOfUserId);
		}
	}

	private String createUnregisterdUserId(String userId) {
		int i = 0;
		while (true) {
			String recommended = userId + i;
			if (!users.exists(recommended)) {
				return recommended;
			}
			i++;
		}
	}

	@Override
	public synchronized RewardJson addActivity(ActivityJson json) {
		SubmittedActivity a = new SubmittedActivity(json);
		submittedActivities.insert(a);
		verifyActivity(a);

		return createRewardJson(a.getUserId(), a.getCheckpointGroupId());
	}

	private void verifyActivity(Activity a) {
		if (!verifiedActivities.contains(a.getCheckpointGroupId(), a.getUserId(),
				a.getCheckpointId(), a.getTaskId())) {
			VerifiedActivity va = new VerifiedActivity(a);
			verifiedActivities.insert(va);
			log.info("add verified activity={}", va);
		}

	}

	private RewardJson createRewardJson(String userId, String checkpointGroupId) {
		int rank = verifiedActivities.getRankJson(userId, checkpointGroupId).getRank();
		List<String> badges = calculateBadges(userId, checkpointGroupId);
		return new RewardJson(rank, badges);
	}

	private BadgeConditionsTable conditionsTable = new BadgeConditionsTable();

	private List<String> calculateBadges(String userId, String checkpointGroupId) {
		List<String> result = new ArrayList<>();
		List<Badge> alreadyHas = badges.readOf(userId);

		conditionsTable.readAll().forEach(cond -> {
			for (Badge b : alreadyHas) {
				if (cond.getName().equals(b.getBadge())) {
					return;
				}
			}
			if (cond.getType().equals("point")) {
				if (verifiedActivities.getScore(userId, checkpointGroupId) >= Integer
						.parseInt(cond.getValue())) {
					result.add(cond.getName());
					badges.insert(new Badge(userId, cond.getName()));
				}
			} else {
				if (verifiedActivities.getNumberOfCheckInInCategory(userId,
						cond.getType()) >= Integer.parseInt(cond.getValue())) {
					result.add(cond.getName());
					badges.insert(new Badge(userId, cond.getName()));
				}
			}
		});
		return result;
	}

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
	public boolean exsitsUpdatedInitialData(long timeOfInitialData) {
		boolean b = timeOfInitialData < CheckpointsAndTasksFactory.lastUpdateTimes.getTime();
		return b;
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

	protected UserSession getSession() {
		return UserSession.of(
				((ServletServiceContext) getServiceContext()).getRequest());
	}

	@Override
	public void addMovements(MovementJson[] movements) {
		this.movements.insertBatch(
				Arrays.stream(movements).map(m -> new Movement(m)).collect(Collectors.toList())
						.toArray(new Movement[0]));
	}

	@Override
	public BadgeJson[] getBadges(String userId, String checkpointGroupId) {
		List<BadgeJson> badges = new ArrayList<>();
		//		badges.add(new BadgeJson("AEDマスター", "img/badge-aed-master.jog"));
		//		badges.add(new BadgeJson("早稲田マスター", "img/badge-waseda-master.jog"));

		return badges.toArray(new BadgeJson[0]);
	}

	@Override
	public RankingJson getRanking(String userId, String checkpointGroupId) {
		RankingJson rankingJson = new RankingJson();
		try {
			rankingJson.setRank(verifiedActivities.getRankJson(userId, checkpointGroupId));
		} catch (Exception e) {
			rankingJson.setRank(new RankJson(userId, -1, 0));
		}
		rankingJson.setGroupRank(new RankJson("g1", -1, 0));

		try {
			final int rankLimit = 10;
			rankingJson.setRanking(verifiedActivities.getRanksJson(checkpointGroupId, rankLimit));
		} catch (Exception e) {
			rankingJson.setRanking(new ArrayList<>());
		}

		rankingJson.setGroupRanking(new ArrayList<>());
		return rankingJson;
	}

	@Override
	public VisitedCheckpointJson[] getVisitedCheckpoints(String userId, String checkpointGroupId) {
		Map<String, VisitedCheckpointJson> result = new HashMap<>();

		verifiedActivities.getActivities(userId).stream()
				.filter(a -> a.getCheckpointGroupId().equals(checkpointGroupId)).forEach(a -> {
					try {
						result.putIfAbsent(a.getCheckpointId(),
								new VisitedCheckpointJson(a.getCheckpointId()));
						Task t = tasks.getTask(a.getTaskId());
						if (t == null) {
							log.error("{} is not valid.", a.getTaskId());
							return;
						}
						VisitedCheckpointJson j = result.get(a.getCheckpointId());
						j.addScore(a.getScore());
						j.addPoint(t.getContentObject().getPoint());
					} catch (Throwable e) {
						log.warn(e, e);
					}
				});
		return result.values().toArray(new VisitedCheckpointJson[0]);
	}

	@Override
	public boolean join(String userId, String checkpointGroupId) {
		try {
			entries.insert(new Entry(userId, checkpointGroupId));
		} catch (Throwable e) {
			return false;
		}
		return true;
	}

}
