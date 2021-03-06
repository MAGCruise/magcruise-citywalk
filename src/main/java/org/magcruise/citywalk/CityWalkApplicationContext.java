package org.magcruise.citywalk;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

import org.magcruise.citywalk.model.CheckpointsAndTasksManager;
import org.magcruise.citywalk.model.gdata.GoogleSpreadsheetData;
import org.magcruise.citywalk.model.json.app.BadgeDefinitionsJson;
import org.magcruise.citywalk.model.json.app.CategoriesJson;
import org.magcruise.citywalk.model.json.app.CoursesJson;
import org.magcruise.citywalk.model.json.app.task.QrCodeTask;
import org.magcruise.citywalk.model.json.file.CheckpointJson;
import org.magcruise.citywalk.model.json.file.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.file.ContentJson;
import org.magcruise.citywalk.model.json.file.TaskJson;
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
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetService;
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetServiceFactory;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.slack.SlackConfigs;
import org.nkjmlab.util.slack.SlackConfigsFactory;
import org.nkjmlab.util.slack.SlackMessage;
import org.nkjmlab.util.slack.SlackMessengerService;
import org.nkjmlab.webui.ApplicationContext;

@WebListener
public class CityWalkApplicationContext extends ApplicationContext {

	static {
		//ThymeleafTemplateProcessor.setcacheTTLMs(60 * 1000L);
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
		ExecutorService exec = Executors.newSingleThreadExecutor();
		exec.submit(() -> {
			try {
				SlackConfigs slackConf = SlackConfigsFactory
						.createFromResource(CityWalkApplicationContext.class, "/slack-conf.json");
				super.contextInitialized(event, "citywalk", slackConf.getWebhookUrl());
				initializeDatabase(event);
				addLoggingMemoryUsageTask(180);
				log.info("{} is initialized", getClass().getSimpleName());
			} catch (Exception e) {
				log.error("Error is occred when initializing. " + e, e);
				throw e;
			}
		});
		exec.shutdown();
	}

	/**
	 * Checkpoints table and tasks table are refreshed befoer initialize.
	 * @param event
	 */
	private void initializeDatabase(ServletContextEvent event) {
		DbClient client = CityWalkApplicationContext.getDbClient();
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

		File projectsDir = new File(event.getServletContext().getRealPath("projects"));

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
		if (jsonDir == null) {
			return;
		}
		File[] files = jsonDir.listFiles((FilenameFilter) (dir, name) -> {
			return name.endsWith(".json");
		});
		if (files == null) {
			return;
		}

		Arrays.stream(files).forEach(f -> {
			log.info("{} is loaded.", f);
			CheckpointsAndTasksManager.insertToDb(f.getPath());
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
						CheckpointsAndTasksManager.insertToDb(json);
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

	public static void asyncPostMessageToLogSrvChannel(String category, String text) {
		SlackMessengerService.asyncPostMessage(getSlackWebhookUrl(),
				new SlackMessage("log-srv", category, "<!channel> " + text));
	}

	public static void asyncPostMessageToLogClientChannel(String category, String text) {
		SlackMessengerService.asyncPostMessage(getSlackWebhookUrl(),
				new SlackMessage("log-client", category, "<!channel> " + text));
	}
}
