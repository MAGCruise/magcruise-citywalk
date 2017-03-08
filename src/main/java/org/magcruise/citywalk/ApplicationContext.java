package org.magcruise.citywalk;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.conv.CheckpointsAndTasksFactory;
import org.magcruise.citywalk.model.gdata.GoogleSpreadsheetData;
import org.magcruise.citywalk.model.json.db.CheckpointJson;
import org.magcruise.citywalk.model.json.db.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.db.ContentJson;
import org.magcruise.citywalk.model.json.db.TaskJson;
import org.magcruise.citywalk.model.json.init.BadgeDefinitionsJson;
import org.magcruise.citywalk.model.json.init.CategoriesJson;
import org.magcruise.citywalk.model.json.init.CoursesJson;
import org.magcruise.citywalk.model.relation.BadgeDefinitionsTable;
import org.magcruise.citywalk.model.relation.BadgesTable;
import org.magcruise.citywalk.model.relation.CategoriesTable;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.CoursesTable;
import org.magcruise.citywalk.model.relation.EntriesTable;
import org.magcruise.citywalk.model.relation.MovementsTable;
import org.magcruise.citywalk.model.relation.SubmittedActivitiesTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.row.BadgeDefinition;
import org.magcruise.citywalk.model.row.Category;
import org.magcruise.citywalk.model.row.Course;
import org.magcruise.citywalk.model.task.QrCodeTask;
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetService;
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetServiceFactory;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.DbClientFactory;
import org.nkjmlab.util.db.DbConfig;
import org.nkjmlab.util.db.H2ClientWithConnectionPool;
import org.nkjmlab.util.db.H2ConfigFactory;
import org.nkjmlab.util.db.H2Server;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.log4j.LogManager;
import org.nkjmlab.util.slack.SlackMessage;
import org.nkjmlab.util.slack.SlackMessengerService;

public class ApplicationContext implements ServletContextListener {

	protected static Logger log = LogManager.getLogger();

	protected static H2ClientWithConnectionPool dbClient;

	public static final String SLACK_URL = "https://hooks.slack.com/services/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";

	private static SlackMessengerService slackMessengerService = new SlackMessengerService(
			SLACK_URL);

	static {
		H2Server.start();
		//ThymeleafTemplateProcessor.setcacheTTLMs(60 * 1000L);
	}

	public static DbClient getDbClient() {
		return dbClient;
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		File jdbcUrl = FileUtils.getFileInUserDirectory("magcruise-h2/"
				+ event.getServletContext().getContextPath() + "/citywalk");
		{
			DbConfig conf = H2ConfigFactory.create(jdbcUrl);
			log.info(conf);
			if (dbClient == null) {
				dbClient = DbClientFactory.createH2ClientWithConnectionPool(conf);
			}
		}
		initializeDatabase(event);
		log.info("initialized");
	}

	/**
	 * Checkpoints table and tasks table are refreshed befoer initialize.
	 * @param event
	 */
	private void initializeDatabase(ServletContextEvent event) {
		DbClient client = ApplicationContext.getDbClient();
		{
			new CheckpointsTable(client).dropTableIfExists();
			new TasksTable(client).dropTableIfExists();
			new CategoriesTable(client).dropTableIfExists();
			new BadgeDefinitionsTable(client).dropTableIfExists();
			new CoursesTable(client).dropTableIfExists();
		}
		{
			//new EntriesTable(client).dropTableIfExists();
			//new UserAccountsTable(client).dropTableIfExists();
			//new BadgesTable(client).dropTableIfExists();
			//new VerifiedActivitiesTable(client).dropTableIfExists();
			//new SubmittedActivitiesTable(client).dropTableIfExists();
			//new MovementsTable(client).dropTableIfExists();
		}

		new CategoriesTable(client).createTableIfNotExists();
		new BadgeDefinitionsTable(client).createTableIfNotExists();
		new CoursesTable(client).createTableIfNotExists();
		new EntriesTable(client).createTableIfNotExists();
		new CheckpointsTable(client).createTableIfNotExists();
		new TasksTable(client).createTableIfNotExists();
		new UserAccountsTable(client).createTableIfNotExists();
		new BadgesTable(client).createTableIfNotExists();
		new VerifiedActivitiesTable(client).createTableIfNotExists();
		new SubmittedActivitiesTable(client).createTableIfNotExists();
		new MovementsTable(client).createTableIfNotExists();

		File projectsDir = new File(
				event.getServletContext()
						.getRealPath("projects"));

		Arrays.stream(projectsDir.listFiles()).filter(f -> f.isDirectory())
				.forEach(f -> {
					File json = new File(f.getPath() + File.separator + "json" + File.separator
							+ "categories.json");
					if (json.exists()) {
						readCategoriesJson(json);
					}
				});
		Arrays.stream(projectsDir.listFiles()).filter(f -> f.isDirectory())
				.forEach(f -> {
					File json = new File(f.getPath() + File.separator + "json" + File.separator
							+ "badge-definitions.json");
					if (json.exists()) {
						readBadgeConditionsJson(json);
					}
				});
		Arrays.stream(projectsDir.listFiles()).filter(f -> f.isDirectory())
				.forEach(f -> {
					File json = new File(f.getPath() + File.separator + "json" + File.separator
							+ "courses.json");
					if (json.exists()) {
						readCoursesJson(json);
					}
				});

		Arrays.stream(projectsDir.listFiles()).filter(f -> f.isDirectory())
				.forEach(f -> {
					log.info("{} will be scanned.", f);
					File j = new File(f.getPath() + File.separator + "json" + File.separator
							+ "checkpoints-and-tasks/");
					readCheckpointsAndTasksJson(j);
				});

		//importFromGoogleSpreadsheets();
	}

	private void readCategoriesJson(File file) {
		CategoriesJson jsons = JsonUtils.decode(file, CategoriesJson.class);
		CategoriesTable table = new CategoriesTable(getDbClient());
		jsons.getCategories().forEach(
				j -> j.getCourseIds()
						.forEach(c -> table.insert(new Category(c, j.getName(), j.getImgSrc()))));
	}

	private void readBadgeConditionsJson(File file) {
		BadgeDefinitionsJson jsons = JsonUtils.decode(file, BadgeDefinitionsJson.class);
		BadgeDefinitionsTable table = new BadgeDefinitionsTable(getDbClient());
		jsons.getBadgeDefinitions()
				.forEach(j -> {
					j.getCourseIds().forEach(courseId -> table
							.insert(new BadgeDefinition(courseId, j.getName(), j.getImgSrc(),
									j.getType(), j.getValue())));
				});
	}

	private void readCoursesJson(File file) {
		CoursesJson jsons = JsonUtils.decode(file, CoursesJson.class);
		CoursesTable table = new CoursesTable(getDbClient());
		jsons.getCourses()
				.forEach(j -> table
						.insert(new Course(j.getId(), j.getName(), j.getMaxCategoryDepth(),
								j.getDisabled())));
	}

	private void readCheckpointsAndTasksJson(File jsonDir) {
		Arrays.stream(jsonDir
				.listFiles((FilenameFilter) (dir, name) -> {
					return name.endsWith(".json");
				})).forEach(f -> {
					log.info("{} is loaded.", f);
					CheckpointsAndTasksFactory.insertToDb(f.getPath());
				});

	}

	private void importFromGoogleSpreadsheets() {
		try {
			File conf = FileUtils.getFileInUserDirectory("priv/google-api.json");
			if (!conf.exists()) {
				return;
			}
			GoogleSpreadsheetService factory = GoogleSpreadsheetServiceFactory.create(conf);
			String spradsheetName = "MagcruiseCityWalkCheckpoints";
			factory.createSpreadsheetServiceClient().getWorksheetsNames(spradsheetName)
					.forEach(name -> {
						if (name.equalsIgnoreCase("readme")) {
							return;
						}
						log.info(name);
						List<GoogleSpreadsheetData> result = factory
								.createWorksheetServiceClient(spradsheetName, name)
								.rows(GoogleSpreadsheetData.class);
						CheckpointsAndTasksJson json = convert(name, result);
						CheckpointsAndTasksFactory.insertToDb(json);
					});
		} catch (Exception e) {
			log.warn(e.getMessage());
		}
	}

	private CheckpointsAndTasksJson convert(String courseId,
			List<GoogleSpreadsheetData> spreadsheetData) {
		CheckpointsAndTasksJson json = new CheckpointsAndTasksJson();

		spreadsheetData.forEach(d -> {
			if (d.getCheckpointid() == null) {
				return;
			}

			json.addCheckpoint(new CheckpointJson(d.getCheckpointid(), d.getName(), d.getLabel(),
					d.getDescription(), d.getLat(), d.getLon(), Arrays.asList(courseId),
					d.getMarkerColor(), d.getCategory(), d.getSubcategory(), d.getImgsrc(),
					d.getPlace()));
			json.addTask(
					new TaskJson(d.getCheckpointid() + "-qr", Arrays.asList(d.getCheckpointid()),
							new ContentJson(QrCodeTask.class.getName(), true, d.getPoint(),
									d.getDescription(), d.getAnswerqr(), d.getImgsrc())));
		});
		return json;
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		slackMessengerService.shutdown();
		dbClient.dispose();
		log.info("destroyed");
	}

	public static void asyncPostMessageToSlack(String channel, String username, String text) {
		slackMessengerService.asyncPostMessage(new SlackMessage(channel, username, text));
	}

	public static void asyncPostMessageToLogSrvChannel(String category, String text) {
		asyncPostMessageToSlack("log-srv", category, text);
	}

	public static void asyncPostMessageToLogClientChannel(String category, String text) {
		asyncPostMessageToSlack("log-client", category, text);
	}

}
