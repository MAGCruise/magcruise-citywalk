package org.magcruise.citywalk.conv;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.magcruise.citywalk.CityWalkApplicationContext;
import org.magcruise.citywalk.model.json.app.CategoryJson;
import org.magcruise.citywalk.model.json.app.CheckpointJson;
import org.magcruise.citywalk.model.json.app.InitialDataJson;
import org.magcruise.citywalk.model.json.app.TaskJson;
import org.magcruise.citywalk.model.json.app.task.SelectionTask;
import org.magcruise.citywalk.model.relation.CategoriesTable;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Category;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.nkjmlab.util.json.JsonUtils;
import org.nkjmlab.util.log4j.LogManager;

public class InitialDataFactory {
	protected static Logger log = LogManager.getLogger();

	public static void main(String[] args) {
		CheckpointsAndTasksFactory.refreshCheckpointAtdTaskTable();
		CheckpointsAndTasksFactory
				.insertToDb("src/main/webapp/json/checkpoints-and-tasks/waseda.json");
		JsonUtils.encode(create("waseda", "ja"),
				"src/main/webapp/json/initial-data/waseda.json", true);
	}

	public static final Map<String, InitialDataJson> initialDataJsonCache = new ConcurrentHashMap<>();

	public static InitialDataJson create(String courseId, String language) {
		InitialDataJson json = initialDataJsonCache.get(courseId + language);
		if (json != null) {
			return json;
		}

		List<Checkpoint> jaCheckpoints = new CheckpointsTable(
				CityWalkApplicationContext.getDbClient())
						.findByCourseId(courseId).stream().filter(c -> !c.getId().startsWith("en-"))
						.collect(Collectors.toList());

		List<Category> categories = new CategoriesTable(CityWalkApplicationContext.getDbClient())
				.readAll();

		json = create(jaCheckpoints, categories);
		if (language.equals("en")) {
			replaceMsg(json, courseId);
		}

		initialDataJsonCache.putIfAbsent(courseId + language, json);
		return json;
	}

	private static void replaceMsg(InitialDataJson json, String courseId) {
		TasksTable tasksTable = new TasksTable(CityWalkApplicationContext.getDbClient());

		Map<String, Checkpoint> enCheckpoints = new CheckpointsTable(
				CityWalkApplicationContext.getDbClient()).findByCourseId(courseId).stream()
						.filter(c -> c.getId().startsWith("en-"))
						.collect(Collectors.toMap(c -> c.getId().replaceFirst("en-", ""), c -> c));

		json.getCheckpoints().stream().forEach(c -> {
			Checkpoint ec = enCheckpoints.get(c.getId());
			if (ec == null) {
				log.error(c.getId());
				return;
			}
			c.setName(ec.getName());
			c.setLabel(ec.getLabel());
			c.setCategory(ec.getCategory());
			c.setDescription(ec.getDescription());
			c.getTasks().forEach(t -> {
				Task et = tasksTable.readByPrimaryKey("en-" + t.getId());
				if (et == null) {
					log.error(t.getId());
					return;
				}
				t.setLabel(et.getContentObject().getLabel());
				if (et.getContentObject() instanceof SelectionTask) {
					t.setSelections(((SelectionTask) et.getContentObject()).getSelections());
				}
			});
		});

	}

	private static InitialDataJson create(List<Checkpoint> checkpoints, List<Category> categories) {
		List<CheckpointJson> checkpointsJson = checkpoints.stream().map(c -> {
			List<Task> tasks = new TasksTable(CityWalkApplicationContext.getDbClient())
					.getTasks(c.getId());
			List<TaskJson> taskJsons = new ArrayList<>();
			TaskJson checkin = new TaskJson();
			int checkinIndex = 0;
			for (int i = 0; i < tasks.size(); i++) {
				Task t = tasks.get(i);
				// チェックインタスクはチェックポイントに必ず一つだけ存在
				if (t.getContentObject().isCheckin()) {
					checkinIndex = i;
					checkin = t.toTaskJson();
				}
				taskJsons.add(t.toTaskJson());
			}

			if (taskJsons.size() == 0) {
				throw new RuntimeException(
						"At least one task is assigned to checkpoint. " + c.toString());
			}

			// チェックインタスクを先頭に持ってくる
			TaskJson checkinTaskJson = taskJsons.get(checkinIndex);
			taskJsons.remove(checkinIndex);
			taskJsons.add(0, checkinTaskJson);

			return new CheckpointJson(c.getId(), c.getName(), c.getLabel(), c.getDescription(),
					c.getLat(), c.getLon(), checkin, taskJsons, c.getMarkerColor(), c.getCategory(),
					c.getSubcategory(), c.getVisibleTimeFrom(), c.getVisibleTimeTo(),
					c.getImgSrc(), c.getPlace());
		}).collect(Collectors.toList());

		List<CategoryJson> categoriesJson = categories.stream()
				.map(c -> new CategoryJson(c.getCourseId(), c.getName(), c.getImgSrc()))
				.collect(Collectors.toList());
		return new InitialDataJson(checkpointsJson, categoriesJson);

	}

}
