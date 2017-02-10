package org.magcruise.citywalk;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.conv.CheckpointsAndTasksFactory;
import org.magcruise.citywalk.model.gdata.GoogleSpreadsheetData;
import org.magcruise.citywalk.model.json.db.BadgeConditionsJson;
import org.magcruise.citywalk.model.json.db.CategoriesJson;
import org.magcruise.citywalk.model.json.db.CheckpointJson;
import org.magcruise.citywalk.model.json.db.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.db.ContentJson;
import org.magcruise.citywalk.model.json.db.CoursesJson;
import org.magcruise.citywalk.model.json.db.TaskJson;
import org.magcruise.citywalk.model.relation.BadgeConditionsTable;
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
import org.magcruise.citywalk.model.row.BadgeCondition;
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

@WebListener
public class ApplicationContext implements ServletContextListener {

	protected static Logger log = LogManager.getLogger();

	protected static H2ClientWithConnectionPool dbClient;
	protected static H2ClientWithConnectionPool movementDbClient;

	static {
		H2Server.start();
		//ThymeleafTemplateProcessor.setcacheTTLMs(60 * 1000L);
	}

	public static DbClient getDbClient() {
		return dbClient;
	}

	public static DbClient getMovementDbClient() {
		return movementDbClient;
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
		{
			DbConfig conf = H2ConfigFactory.create(new File(jdbcUrl.getPath() + "-movement"));
			log.info(conf);
			if (movementDbClient == null) {
				movementDbClient = DbClientFactory.createH2ClientWithConnectionPool(conf);
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
		{
			new CheckpointsTable().dropTableIfExists();
			new TasksTable().dropTableIfExists();
			new CategoriesTable().dropTableIfExists();
			new BadgeConditionsTable().dropTableIfExists();
			new CoursesTable().dropTableIfExists();
		}
		{
			new EntriesTable().dropTableIfExists();
			new UserAccountsTable().dropTableIfExists();
			new BadgesTable().dropTableIfExists();
			new VerifiedActivitiesTable().dropTableIfExists();
			new SubmittedActivitiesTable().dropTableIfExists();
			new MovementsTable().dropTableIfExists();
		}

		new CategoriesTable().createTableIfNotExists();
		new BadgeConditionsTable().createTableIfNotExists();
		new CoursesTable().createTableIfNotExists();
		new EntriesTable().createTableIfNotExists();
		new CheckpointsTable().createTableIfNotExists();
		new TasksTable().createTableIfNotExists();
		new UserAccountsTable().createTableIfNotExists();
		new BadgesTable().createTableIfNotExists();
		new VerifiedActivitiesTable().createTableIfNotExists();
		new SubmittedActivitiesTable().createTableIfNotExists();
		new MovementsTable().createTableIfNotExists();

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
							+ "badge-conditions.json");
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
		CategoriesTable table = new CategoriesTable();
		jsons.getCategories().forEach(
				j -> table.insert(new Category(j.getCourseId(), j.getName(), j.getImgSrc())));
	}

	private void readBadgeConditionsJson(File file) {
		BadgeConditionsJson jsons = JsonUtils.decode(file, BadgeConditionsJson.class);
		BadgeConditionsTable table = new BadgeConditionsTable();
		jsons.getBadgeConditions()
				.forEach(j -> table
						.insert(new BadgeCondition(j.getCourseId(), j.getName(), j.getImgSrc(),
								j.getType(), j.getValue())));
	}

	private void readCoursesJson(File file) {
		CoursesJson jsons = JsonUtils.decode(file, CoursesJson.class);
		CoursesTable table = new CoursesTable();
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
		dbClient.dispose();
		log.info("destroyed");
	}

}
