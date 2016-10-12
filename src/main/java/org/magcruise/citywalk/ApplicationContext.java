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
import org.magcruise.citywalk.model.json.db.CheckpointJson;
import org.magcruise.citywalk.model.json.db.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.db.ContentJson;
import org.magcruise.citywalk.model.json.db.TaskJson;
import org.magcruise.citywalk.model.relation.BadgesTable;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.MovementsTable;
import org.magcruise.citywalk.model.relation.SubmittedActivitiesTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.relation.UserAccountsTable;
import org.magcruise.citywalk.model.relation.VerifiedActivitiesTable;
import org.magcruise.citywalk.model.task.QrCodeTask;
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetService;
import org.nkjmlab.gdata.spreadsheet.client.GoogleSpreadsheetServiceFactory;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.DbClientFactory;
import org.nkjmlab.util.db.H2ClientWithConnectionPool;
import org.nkjmlab.util.db.H2ConfigFactory;
import org.nkjmlab.util.db.H2Server;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.log4j.LogManager;

@WebListener
public class ApplicationContext implements ServletContextListener {

	protected Logger log = LogManager.getLogger();

	protected static H2ClientWithConnectionPool client;

	static {
		H2Server.start();
		if (client == null) {
			client = DbClientFactory
					.createH2ClientWithConnectionPool(
							H2ConfigFactory.create(FileUtils.getTempFile("citywalk")));
		}
	}

	public static DbClient getDbClient() {
		return client;
	}

	@Override
	public void contextInitialized(ServletContextEvent event) {
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
		}
		new CheckpointsTable().createTableIfNotExists();
		new TasksTable().createTableIfNotExists();
		new UserAccountsTable().createTableIfNotExists();
		new BadgesTable().createTableIfNotExists();
		new VerifiedActivitiesTable().createTableIfNotExists();
		new SubmittedActivitiesTable().createTableIfNotExists();
		new MovementsTable().createTableIfNotExists();
		Arrays.stream(new File(event.getServletContext().getRealPath("json/checkpoints-and-tasks/"))
				.listFiles((FilenameFilter) (dir, name) -> {
					return name.endsWith(".json");
				})).forEach(f -> CheckpointsAndTasksFactory.insertToDb(f.getPath()));
		//importFromGoogleSpreadsheets();
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

	private CheckpointsAndTasksJson convert(String checkpointGroupId,
			List<GoogleSpreadsheetData> spreadsheetData) {
		CheckpointsAndTasksJson json = new CheckpointsAndTasksJson();

		spreadsheetData.forEach(d -> {
			if (d.getCheckpointid() == null) {
				return;
			}

			json.addCheckpoint(new CheckpointJson(d.getCheckpointid(), d.getName(), d.getLabel(),
					d.getLat(), d.getLon(), Arrays.asList(checkpointGroupId), d.getMarkerColor(),
					d.getCategory(), d.getSubcategory(), d.getImgsrc()));
			json.addTask(
					new TaskJson(d.getCheckpointid() + "-qr", Arrays.asList(d.getCheckpointid()),
							new ContentJson(QrCodeTask.class.getName(), true, d.getPoint(),
									d.getDescription(), d.getAnswerqr(), d.getImgsrc())));
		});
		return json;
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		client.dispose();
		log.info("destroyed");
	}

}
