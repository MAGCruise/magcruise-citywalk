package org.magcruise.citywalk.jsonrpc;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.conv.CheckpointsAndTasksFactory;
import org.magcruise.citywalk.conv.InitialDataFactory;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.json.BadgeJson;
import org.magcruise.citywalk.model.json.JsStackTrace;
import org.magcruise.citywalk.model.json.MovementJson;
import org.magcruise.citywalk.model.json.RankJson;
import org.magcruise.citywalk.model.json.RankingJson;
import org.magcruise.citywalk.model.json.RegisterResultJson;
import org.magcruise.citywalk.model.json.RewardJson;
import org.magcruise.citywalk.model.json.UserAccountJson;
import org.magcruise.citywalk.model.json.VisitedCheckpointJson;
import org.magcruise.citywalk.model.json.init.CheckpointJson;
import org.magcruise.citywalk.model.json.init.CourseJson;
import org.magcruise.citywalk.model.json.init.CoursesJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.relation.BadgeDefinitionsTable;
import org.magcruise.citywalk.model.relation.BadgesTable;
import org.magcruise.citywalk.model.relation.CoursesTable;
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
import org.nkjmlab.gis.datum.Basis;
import org.nkjmlab.gis.datum.DistanceUnit;
import org.nkjmlab.gis.datum.LatLon;
import org.nkjmlab.gis.datum.jprect.util.LatLonUtils;
import org.nkjmlab.util.base64.Base64ImageUtils;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.lang.MessageUtils;
import org.nkjmlab.util.log4j.LogManager;
import org.nkjmlab.util.slack.SlackMessageBuilder;
import org.nkjmlab.util.time.DateTimeUtils;
import org.nkjmlab.webui.util.servlet.UserRequest;
import org.nkjmlab.webui.util.servlet.UserSession;

import jp.go.nict.langrid.commons.ws.ServletServiceContext;
import jp.go.nict.langrid.servicecontainer.service.AbstractService;

public class CityWalkService extends AbstractService implements CityWalkServiceInterface {
	protected static Logger log = LogManager.getLogger();

	private VerifiedActivitiesTable verifiedActivities = new VerifiedActivitiesTable(getDbClient());
	private SubmittedActivitiesTable submittedActivities = new SubmittedActivitiesTable(
			getDbClient());
	private UserAccountsTable users = new UserAccountsTable(getDbClient());
	private BadgesTable badges = new BadgesTable(getDbClient());
	private TasksTable tasks = new TasksTable(getDbClient());
	private MovementsTable movementsTable = new MovementsTable(getDbClient());

	private EntriesTable entries = new EntriesTable(getDbClient());
	private BadgeDefinitionsTable badgeDefinitionsTable = new BadgeDefinitionsTable(getDbClient());

	private CoursesTable coursesTable = new CoursesTable(getDbClient());

	private DbClient getDbClient() {
		return ApplicationContext.getDbClient();
	}

	@Override
	public UserAccount login(String userId, int pin) {
		try {
			if (!users.exists(userId)) {
				log.error("{} is not registered yet.", userId);
				return null;
			}

			UserSession session = getSession();
			if (session.isLogined()) {
				log.debug("already logined as {}", session.getUserId());
				if (session.getUserId().equals(userId)) {
					return users.readByPrimaryKey(userId);
				}
				if (users.readByPrimaryKey(userId).validate(pin)) {
					log.debug("userId is changed from {} to {}", session.getUserId(), userId);
					session.setUserId(userId);
					return users.readByPrimaryKey(userId);
				}
				return null;
			} else {
				if (users.readByPrimaryKey(userId).validate(pin)) {
					log.debug("create new session for {}", userId);
					session.setMaxInactiveInterval(10 * 60 * 60);
					session.setUserId(userId);
					return users.readByPrimaryKey(userId);
				}
				return null;
			}
		} catch (Exception e) {
			return null;
		}
	}

	@Override
	public boolean logout() {
		return getSession().logout();
	}

	@Override
	public RegisterResultJson register(UserAccountJson account, int maxLengthOfUserId) {
		if (!users.exists(account.getId())) {
			users.insert(new UserAccount(account));
			login(account.getId(), account.getPin());
			ApplicationContext.asyncPostMessageToLogSrvChannel("Register",
					SlackMessageBuilder.wrapPre(account.toString()));
			return new RegisterResultJson(true, account.getId());
		}
		String recommended = createUnregisterdUserId(account.getId(), maxLengthOfUserId);
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
	public RewardJson addActivity(ActivityJson json) {
		if (tasks.getTask(json.getTaskId()).getContentObject().getInstanceClass()
				.contains("Photo")) {
			File outputFile = uploadImage(json.getUserId(), json.getInputs().get("value"));
			json.getInputs().put("value", outputFile.toString());
		}

		SubmittedActivity a = new SubmittedActivity(json);
		submittedActivities.insert(a);
		verifyActivity(a);

		return createRewardJson(a.getUserId(), a.getCourseId());
	}

	private void verifyActivity(Activity a) {
		synchronized (verifiedActivities) {
			if (verifiedActivities.contains(a.getCourseId(), a.getUserId(), a.getCheckpointId(),
					a.getTaskId())) {
				return;
			}
			VerifiedActivity va = new VerifiedActivity(a);
			verifiedActivities.insert(va);
			log.info("add verified activity={}", va);
			ApplicationContext.asyncPostMessageToLogSrvChannel("addActivity",
					SlackMessageBuilder.wrapPre(MessageUtils.format(
							"createdAt={}, userId={}, checkpointId={}, taskId={}",
							va.getCreatedAt(),
							va.getUserId(), va.getCheckpointId(), va.getTaskId())));
		}

	}

	private RewardJson createRewardJson(String userId, String courseId) {
		int rank = verifiedActivities.getRankJson(userId, courseId).getRank();
		List<String> badges = calculateBadges(userId, courseId);
		return new RewardJson(rank, badges);
	}

	private List<String> calculateBadges(String userId, String courseId) {
		List<String> result = new ArrayList<>();
		List<Badge> alreadyHas = badges.findBy(userId, courseId, badgeDefinitionsTable);

		badgeDefinitionsTable.findByCourseId(courseId).forEach(definition -> {
			for (Badge b : alreadyHas) {
				if (definition.getId() == b.getBadgeDefinitionId()) {
					return;
				}
			}
			if (definition.getType().equals("point")) {
				if (verifiedActivities.getScore(userId, courseId) >= Integer
						.parseInt(definition.getValue())) {
					result.add(definition.getName());
					badges.insert(new Badge(userId, definition.getId()));
					ApplicationContext.asyncPostMessageToLogSrvChannel("Badge",
							SlackMessageBuilder.wrapPre(userId + " get " + definition.getName()));
				}
			} else {
				if (verifiedActivities.getNumberOfCheckInInCategory(userId, courseId,
						definition.getType()) >= Integer.parseInt(definition.getValue())) {
					result.add(definition.getName());
					badges.insert(new Badge(userId, definition.getId()));
					ApplicationContext.asyncPostMessageToLogSrvChannel("Badge",
							SlackMessageBuilder.wrapPre(userId + " get " + definition.getName()));
				}
			}
		});
		return result;
	}

	private File uploadImage(String userId, String base64EncodedImage) {
		try {
			String imageId = userId + "-" + System.nanoTime();
			File outputDir = FileUtils
					.getFileInUserDirectory(new File("magcruise-citywalk", "upload").toString());
			outputDir.mkdirs();
			File outputFile = new File(outputDir, imageId + ".jpg");
			Base64ImageUtils.decodeAndWrite(base64EncodedImage, "jpg", outputFile);
			log.debug(outputFile);
			return outputFile;
		} catch (Exception e) {
			log.error(e, e);
			throw new RuntimeException(e);
		}
	}

	@Override
	public InitialDataJson getInitialData(String courseId, String language) {
		return InitialDataFactory.create(courseId, language);
	}

	@Override
	public boolean exsitsUpdatedInitialData(long timeOfInitialData) {
		boolean b = timeOfInitialData < CheckpointsAndTasksFactory.lastUpdateTimes.getTime();
		return b;
	}

	@Override
	public InitialDataJson getInitialDataFromFile(String courseId) {
		InitialDataJson data = JsonUtils.decode(
				new File(
						getServiceContext().getRealPath("json/initial-data/" + courseId + ".json")),
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

	protected UserRequest getRequest() {
		return UserRequest.of(((ServletServiceContext) getServiceContext()).getRequest());
	}

	@Override
	public void addMovements(MovementJson[] movements) {
		Movement[] mvs = Arrays.stream(movements).map(m -> new Movement(m))
				.collect(Collectors.toList())
				.toArray(new Movement[0]);
		log.info(Arrays.asList(mvs));
		this.movementsTable.insertBatch(mvs);

	}

	@Override
	public BadgeJson[] getBadges(String userId, String courseId) {
		return badges.findBy(userId, courseId, badgeDefinitionsTable).stream()
				.map(b -> badgeDefinitionsTable.readByPrimaryKey(b.getBadgeDefinitionId()))
				.distinct()
				.map(b -> new BadgeJson(b.getName(), b.getImgSrc())).collect(Collectors.toList())
				.toArray(new BadgeJson[0]);
	}

	@Override
	public RankingJson getRanking(String userId, String courseId) {
		RankingJson rankingJson = new RankingJson();
		try {
			rankingJson.setRank(verifiedActivities.getRankJson(userId, courseId));
		} catch (Exception e) {
			rankingJson.setRank(new RankJson(userId, -1, 0));
		}
		rankingJson.setGroupRank(new RankJson("g1", -1, 0));

		try {
			final int rankLimit = 10;
			rankingJson.setRanking(verifiedActivities.getRanksJson(courseId, rankLimit));
		} catch (Exception e) {
			rankingJson.setRanking(new ArrayList<>());
		}

		rankingJson.setGroupRanking(new ArrayList<>());
		return rankingJson;
	}

	@Override
	public VisitedCheckpointJson[] getVisitedCheckpoints(String userId, String courseId) {
		Map<String, VisitedCheckpointJson> result = new HashMap<>();

		verifiedActivities.getActivitiesInCourse(userId, courseId).stream()
				.filter(a -> a.getCourseId().equals(courseId)).forEach(a -> {
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
	public boolean join(String userId, String courseId) {
		try {
			Entry en = new Entry(userId, courseId, new Date());
			entries.insert(en);
			ApplicationContext.asyncPostMessageToLogSrvChannel("Entry",
					SlackMessageBuilder.wrapPre(en.toString()));
		} catch (Throwable e) {
			return false;
		}
		return true;
	}

	@Override
	public CoursesJson getCourses() {
		return new CoursesJson(
				coursesTable.readAll()
						.stream().map(c -> new CourseJson(c.getId(), c.getName(),
								c.getMaxCategoryDepth(), c.getDisabled()))
						.collect(Collectors.toList()));
	}

	@Override
	public String[] getCheckpointIdsOrderedByDistance(double currentLat, double currentLon,
			String courseId, String language, String[] checkpointIds) {
		List<String> ids = Arrays.asList(checkpointIds);

		LatLon fromLatLon = new LatLon(currentLat, currentLon, Basis.DEGREE_WGS);
		return getInitialData(courseId, language).getCheckpoints().stream()
				.filter(cj -> ids.contains(cj.getId()))
				.sorted(Comparator.comparingDouble((CheckpointJson cj) -> {
					LatLon toLatLon = new LatLon(cj.getLat(), cj.getLon(), Basis.DEGREE_WGS);
					return LatLonUtils.toDistance(fromLatLon, toLatLon, DistanceUnit.M);
				})).map(cj -> cj.getId()).collect(Collectors.toList())
				.toArray(new String[0]);
	}

	@Override
	public boolean sendLog(String logLevel, String location, String msg) {
		String mark = SlackMessageBuilder.getMark(logLevel);
		Map<String, Object> msgObj = JsonUtils.decode(msg);
		JsStackTrace st = JsonUtils.decode(location, JsStackTrace.class);
		String loc = st.getFunctionName() + " (" + st.getFileName() + " :" + st.getLineNumber()
				+ ":"
				+ st.getColumnNumber() + ")";

		ApplicationContext.asyncPostMessageToLogClientChannel("JS log", ":iphone:  ["
				+ DateTimeUtils.toTimestamp(LocalDateTime.now()) + " " + mark + " \n"
				+ loc + " " + SlackMessageBuilder.wrapPre(JsonUtils.encode(msgObj, true)));
		return false;
	}

	@Override
	public ActivityJson[] getCheckinLogs(String checkpointId) {
		ActivityJson[] result = verifiedActivities.getActivitiesAtCheckpoint(checkpointId).stream()
				.filter(
						va -> tasks.readByPrimaryKey(va.getTaskId()).getContentObject().isCheckin())
				.map(va -> new ActivityJson(va, tasks.readByPrimaryKey(va.getTaskId())))
				.collect(Collectors.toList()).toArray(new ActivityJson[0]);
		return result;
	}

}
