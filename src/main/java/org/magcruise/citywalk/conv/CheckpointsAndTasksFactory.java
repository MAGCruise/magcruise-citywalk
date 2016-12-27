package org.magcruise.citywalk.conv;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.json.db.CheckpointJson;
import org.magcruise.citywalk.model.json.db.CheckpointsAndTasksJson;
import org.magcruise.citywalk.model.json.db.TaskJson;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.magcruise.citywalk.model.task.TaskContent;
import org.nkjmlab.util.io.FileUtils;
import org.nkjmlab.util.json.JsonObject;
import org.nkjmlab.util.json.JsonUtils;

import net.arnx.jsonic.JSON;
import net.arnx.jsonic.JSONException;

public class CheckpointsAndTasksFactory {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	public static void main(String[] args) {
		CheckpointsAndTasksJson json = JsonUtils.decode(
				new File(
						"src/main/webapp/projects/wasenavi/json/checkpoints-and-tasks/wasedasai2016.json"),
				CheckpointsAndTasksJson.class);

		json.getTasks().forEach(t -> {
			if (t.getContent().getInstanceClass().contains("Pin")) {
				System.out.println(json.getCheckpoints().stream()
						.filter(c -> c.getId().equals(t.getCheckpointIds().get(0))).findFirst()
						.get().getName() + "\t"
						+ t.getContent().getAnswerTexts().get(0));
			}
		});

		//		json.getTasks().forEach(t -> {
		//			if (t.getContent().getInstanceClass().contains("Pin")) {
		//				List<String> l = new ArrayList<>();
		//				l.add(String.valueOf(new Random().nextInt(9000) + 1000));
		//				t.getContent().setAnswerTexts(l);
		//			}
		//		});
		//		JsonUtils.encode(json, "src/main/webapp/json/checkpoints-and-tasks/wasedasai2016-nkjm.json",
		//				true);

		//refreshCheckpointAtdTaskTable();
		//log.info(createCheckpoints(json.getCheckpoints()));
		//log.info(createTasks(json.getTasks()));
		//log.info(insertToDb("src/main/webapp/json/checkpoints-and-tasks/wasedasai2016.json"));
	}

	public static volatile Date lastUpdateTimes;

	public static CheckpointsAndTasksJson insertToDb(String file) {
		try {
			CheckpointsAndTasksJson json = JSON.decode(FileUtils.getFileReader(file),
					CheckpointsAndTasksJson.class);
			log.info("insertToDb:{}", json);
			insertToDb(json);
			lastUpdateTimes = new Date();
			InitialDataFactory.initialDataJsonCache.clear();
			return json;
		} catch (JSONException | IOException e) {
			throw new RuntimeException(e);
		}

	}

	public static void insertToDb(CheckpointsAndTasksJson json) {
		new CheckpointsTable()
				.insertBatch(createCheckpoints(json.getCheckpoints()).toArray(new Checkpoint[0]));
		new TasksTable().insertBatch(createTasks(json.getTasks()).toArray(new Task[0]));

	}

	public static void refreshCheckpointAtdTaskTable() {
		new TasksTable().dropTableIfExists();
		new CheckpointsTable().dropTableIfExists();
		new TasksTable().createTableIfNotExists();
		new CheckpointsTable().createTableIfNotExists();
	}

	public static boolean validate(String json) {
		JSON.decode(json, CheckpointsAndTasksJson.class);
		return true;

	}

	public static List<Checkpoint> createCheckpoints(List<CheckpointJson> checkpointsData) {
		List<Checkpoint> checkpoints = checkpointsData.stream()
				.map(checkpoint -> new Checkpoint(checkpoint.getId(), checkpoint.getName(),
						checkpoint.getLabel(), checkpoint.getDescription(), checkpoint.getLat(),
						checkpoint.getLon(), checkpoint.getCheckpointGroupIds(),
						checkpoint.getMarkerColor(),
						checkpoint.getCategory(), checkpoint.getSubcategory(),
						checkpoint.getVisibleTimeFrom(), checkpoint.getVisibleTimeTo(),
						checkpoint.getImgSrc(), checkpoint.getPlace()))
				.collect(Collectors.toList());
		return checkpoints;
	}

	public static List<Task> createTasks(List<TaskJson> json) {
		List<Task> tasks = json.stream().map(task -> {
			try {
				@SuppressWarnings("unchecked")
				TaskContent content = JsonObject.decodeFromJson(
						(Class<? extends TaskContent>) Class
								.forName(task.getContent().getInstanceClass()),
						JSON.encode(task.getContent()));
				return new Task(task.getId(), task.getCheckpointIds(), content);
			} catch (ClassNotFoundException e) {
				throw new RuntimeException(e);
			}
		}).collect(Collectors.toList());
		return tasks;

	}

}
