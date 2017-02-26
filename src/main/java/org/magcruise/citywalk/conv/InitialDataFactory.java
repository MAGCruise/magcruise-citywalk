package org.magcruise.citywalk.conv;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.json.init.CategoryJson;
import org.magcruise.citywalk.model.json.init.CheckinJson;
import org.magcruise.citywalk.model.json.init.CheckpointJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.json.init.TaskJson;
import org.magcruise.citywalk.model.relation.CategoriesTable;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
import org.magcruise.citywalk.model.row.Category;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.magcruise.citywalk.model.row.Task;
import org.nkjmlab.util.json.JsonUtils;

public class InitialDataFactory {
	protected static org.apache.logging.log4j.Logger log = org.apache.logging.log4j.LogManager
			.getLogger();

	public static void main(String[] args) {
		CheckpointsAndTasksFactory.refreshCheckpointAtdTaskTable();
		CheckpointsAndTasksFactory
				.insertToDb("src/main/webapp/json/checkpoints-and-tasks/waseda.json");
		JsonUtils.encode(create("waseda"), "src/main/webapp/json/initial-data/waseda.json", true);
	}

	public static final Map<String, InitialDataJson> initialDataJsonCache = new ConcurrentHashMap<>();

	public static InitialDataJson create(String courseId) {
		InitialDataJson json = initialDataJsonCache.get(courseId);
		if (json != null) {
			return json;
		}
		List<Checkpoint> checkpoints = new CheckpointsTable(ApplicationContext.getDbClient())
				.findByCourseId(courseId);
		List<Category> categories = new CategoriesTable(ApplicationContext.getDbClient()).readAll();

		json = create(checkpoints, categories);
		initialDataJsonCache.putIfAbsent(courseId, json);
		return json;
	}

	private static InitialDataJson create(List<Checkpoint> checkpoints, List<Category> categories) {
		List<CheckpointJson> checkpointsJson = checkpoints.stream().map(c -> {
			List<Task> tasks = new TasksTable(ApplicationContext.getDbClient()).getTasks(c.getId());
			List<TaskJson> taskJsons = new ArrayList<>();
			CheckinJson checkin = new CheckinJson();
			int checkinIndex = 0;
			for (int i = 0; i < tasks.size(); i++) {
				Task t = tasks.get(i);
				// チェックインタスクはチェックポイントに必ず一つだけ存在
				if (t.getContentObject().isCheckin()) {
					checkinIndex = i;
					checkin = new CheckinJson(t);
				}
				taskJsons.add(new TaskJson(t));
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
