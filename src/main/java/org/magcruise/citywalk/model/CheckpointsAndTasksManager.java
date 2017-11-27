package org.magcruise.citywalk.model;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.CityWalkApplicationContext;
import org.magcruise.citywalk.jsonrpc.CityWalkDataFactory;
import org.magcruise.citywalk.model.json.app.task.TaskContent;
import org.magcruise.citywalk.model.json.file.CheckpointJson;
import org.magcruise.citywalk.model.json.file.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.file.TaskJson;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonObject;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.log4j.LogManager;

import net.arnx.jsonic.JSON;
import net.arnx.jsonic.JSONException;

public class CheckpointsAndTasksManager {
	protected static org.apache.logging.log4j.Logger log = LogManager.getLogger();

	public static void main(String[] args) {
		File f = new File(
				"src/main/webapp/projects/waseda-univ-kyoto-exp-2017/json/checkpoints-and-tasks/waseda-univ-kyoto-exp-2017.json");
		CheckpointsAndTasksJson json = JsonUtils.decode(f, CheckpointsAndTasksJson.class);

		json.getCheckpoints().forEach(c -> {
			c.setId("waseda-univ-kyoto-exp-2017-cp-" + c.getId());
		});

		json.getTasks().forEach(t -> {
			t.setId("waseda-univ-kyoto-exp-2017-cp-" + t.getId());
			t.setCheckpointIds(t.getCheckpointIds().stream()
					.map(s -> "waseda-univ-kyoto-exp-2017-cp-" + s).collect(Collectors.toList()));
		});

		log.info(createCheckpoints(json.getCheckpoints()));
		log.info(createTasks(json.getTasks()));
		JsonUtils.encode(json, f, true);

	}

	private static volatile Date lastUpdateTime;
	private static CheckpointsTable checkpointsTable = new CheckpointsTable(
			CityWalkApplicationContext.getDbClient());

	private synchronized static void updateLastUpdateTime() {
		lastUpdateTime = new Date();
		CityWalkDataFactory.clearCache();
	}

	public static CheckpointsAndTasksJson insertToDb(String file) {
		try {
			log.info("Try to parse and insert to db={}", file);
			CheckpointsAndTasksJson json = JSON.decode(
					FileUtils.newBufferedReader(new File(file).toPath()),
					CheckpointsAndTasksJson.class);
			insertToDb(json);
			return json;
		} catch (JSONException | IOException e) {
			throw new RuntimeException(e);
		}
	}

	public static void insertToDb(Checkpoint checkpoint) {
		checkpointsTable.insert(checkpoint);
		updateLastUpdateTime();
	}

	public static void insertToDb(CheckpointsAndTasksJson json) {
		new CheckpointsTable(CityWalkApplicationContext.getDbClient())
				.insertBatch(createCheckpoints(json.getCheckpoints()).toArray(new Checkpoint[0]));
		new TasksTable(CityWalkApplicationContext.getDbClient())
				.insertBatch(createTasks(json.getTasks()).toArray(new Task[0]));
		updateLastUpdateTime();
	}

	public static void refreshCheckpointAtdTaskTable() {
		new TasksTable(CityWalkApplicationContext.getDbClient()).dropTableIfExists();
		new CheckpointsTable(CityWalkApplicationContext.getDbClient()).dropTableIfExists();
		new TasksTable(CityWalkApplicationContext.getDbClient()).createTableIfNotExists();
		new CheckpointsTable(CityWalkApplicationContext.getDbClient()).createTableIfNotExists();
	}

	public static boolean validate(String json) {
		JSON.decode(json, CheckpointsAndTasksJson.class);
		return true;

	}

	public static List<Checkpoint> createCheckpoints(List<CheckpointJson> checkpointsData) {
		List<Checkpoint> checkpoints = checkpointsData.stream()
				.map(checkpointJson -> checkpointJson.toCheckpoint())
				.collect(Collectors.toList());
		return checkpoints;
	}

	public static List<Task> createTasks(List<TaskJson> json) {
		List<Task> tasks = json.stream().map(task -> {
			Class<? extends TaskContent> clazz;
			try {
				clazz = (Class<? extends TaskContent>) Class
						.forName(task.getContent().getInstanceClass());
			} catch (ClassNotFoundException e) {
				throw new RuntimeException(e);
			}

			TaskContent content = JsonObject.decodeFromJson(clazz,
					JSON.encode(task.getContent()));
			return new Task(task.getId(), task.getCheckpointIds(), content);
		}).collect(Collectors.toList());
		return tasks;

	}

	public static boolean exsitsUpdatedData(long timestamp) {
		return timestamp < lastUpdateTime.getTime();
	}

}
