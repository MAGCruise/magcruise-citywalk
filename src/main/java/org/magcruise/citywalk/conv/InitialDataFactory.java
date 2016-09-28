package org.magcruise.citywalk.conv;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.json.init.CheckinJson;
import org.magcruise.citywalk.model.json.init.CheckpointJson;
import org.magcruise.citywalk.model.json.init.InitialDataJson;
import org.magcruise.citywalk.model.json.init.TaskJson;
import org.magcruise.citywalk.model.relation.CheckpointsTable;
import org.magcruise.citywalk.model.relation.TasksTable;
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
		JsonUtils.encode(create("waseda"),
				"src/main/webapp/json/initial-data/waseda.json", true);
	}

	public static InitialDataJson create(String checkpointGroupId) {
		List<Checkpoint> checkpoints = new CheckpointsTable()
				.findByCheckpointGroupId(checkpointGroupId);
		return create(checkpoints);

	}

	private static InitialDataJson create(List<Checkpoint> checkpoints) {
		List<CheckpointJson> result = checkpoints.stream()
				.map(c -> {
					List<Task> tasks = new TasksTable().getTasks(c.getId());
					List<TaskJson> taskJsons = new ArrayList<>();
					CheckinJson checkin = new CheckinJson();
					int checkinIndex = 0;
					for (int i = 0; i < tasks.size(); i++) {
						Task t = tasks.get(i);
						//  チェックインタスクはチェックポイントに必ず一つだけ存在
						if (t.getContentObject().isCheckin()) {
							checkinIndex = i;
							checkin = new CheckinJson(t);
						}
						taskJsons.add(new TaskJson(t));
					}
					// チェックインタスクを先頭に持ってくる
					TaskJson checkinTaskJson = taskJsons.get(checkinIndex);
					taskJsons.remove(checkinIndex);
					taskJsons.add(0, checkinTaskJson);
					
					return new CheckpointJson(c.getId(), c.getName(), c.getLabel(), c.getLat(),
							c.getLon(), checkin, taskJsons, c.getMarkerColor());
				}).collect(Collectors.toList());
		return new InitialDataJson(result);

	}

}
